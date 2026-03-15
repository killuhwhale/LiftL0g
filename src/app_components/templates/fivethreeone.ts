import {
  useBulkCreateTemplatesMutation, // new RTK-Q mutation
} from "@/src/redux/api/apiSlice";
import { useMaxes } from "@/hooks/useMaxes";
import {
  CalcWorkoutStats,
  fillTemplateWorkoutItems,
  TEMPLATE_NAMES,
} from "../shared";
import {
  AnyWorkoutItem,
  WorkoutItemProps,
  WorkoutNameProps,
} from "../Cards/types";

// const NUM_WEEKS = 1;
const NUM_WEEKS = 4;

const WEEK_SCHEMES: Record<number, [number, number, number][]> = {
  1: [
    [1, 5, 0.65],
    [1, 5, 0.75],
    [1, 5, 0.85],
  ],
  2: [
    [1, 3, 0.7],
    [1, 3, 0.8],
    [1, 3, 0.9],
  ],
  3: [
    [3, 5, 0.75],
    [1, 3, 0.85],
    [1, 1, 0.95],
  ],
  4: [
    [1, 5, 0.4],
    [1, 5, 0.5],
    [1, 5, 0.6],
  ],
};
const ACCESSORY_CYCLE_PCTS: Record<number, number> = {
  1: 0.5,
  2: 0.6,
  3: 0.7,
};
const SCHEDULE: Record<string, any> = {
  Monday: [
    "Squat Day",
    "Squat",
    [
      ["Leg Press", 5, 15],
      ["Hamstring Curl", 5, 12],
      ["Plank", 5, { duration: 60 }],
      ["Chest Supported Rows", 5, 12],
    ],
  ],
  Tuesday: [
    "Bench Day",
    "Bench Press",
    [
      ["DB Bench Press", 5, 15],
      ["DB Bent Over Row", 5, 10],
      ["Side Plank", 3, { duration: 30 }],
      ["Russian Twist", 3, 20],
    ],
  ],
  Wednesday: ["Conditioning Day A", null, [["Hill Sprints", 3, { reps: 10 }]]],
  Thursday: [
    "Deadlift Day",
    "Deadlift",
    [
      ["Good Morning", 5, 12],
      ["Hanging Leg Raises", 5, 15],
      ["Crunch", 3, 20],
      ["Leg Extension", 5, 12],
    ],
  ],
  Friday: [
    "Shoulder Press Day",
    "Shoulder Press",
    [
      ["Dips", 5, 15],
      ["Chin-Up", 5, 10],
      ["Side Plank", 3, { duration: 30 }],
      ["DB Curl", 3, 20],
    ],
  ],
  Saturday: ["Conditioning Day B", null, [["Hill Sprints", 3, { reps: 10 }]]],
  Sunday: ["Active Rest Day", null, []],
};

export function useGenerate531Template() {
  const [bulkCreateTemplates, { isLoading, error }] =
    useBulkCreateTemplatesMutation();

  const {
    userId: ownerId,
    workoutItemMaxesMap,
    workoutNamesByNameMap,
    getMaxValueWithUnitByName,
  } = useMaxes();

  const mainLifts = ["Squat", "Bench Press", "Shoulder Press", "Deadlift"];
  const workingMaxes = Object.fromEntries(
    mainLifts.map((lift) => {
      const { maxValue, maxUnit } = getMaxValueWithUnitByName(lift);
      return [lift, Math.round((maxValue || 300) * 0.9)];
    })
  ) as Record<string, number>;

  async function five_3_1() {
    const templatePayload: any[] = [];

    for (let week = 1; week <= NUM_WEEKS; week++) {
      const scheme = WEEK_SCHEMES[week];
      const accessoryPct = ACCESSORY_CYCLE_PCTS[week];

      let dayIndex = 1;
      for (const [dayName, mainLift, accessories] of Object.values(SCHEDULE)) {
        // build the group object
        const forDate = new Date();
        forDate.setDate(forDate.getDate() + week * dayIndex);

        const groupObj = {
          owner_id: ownerId,
          owned_by_class: false,
          title: `Week ${week} - ${dayName}`,
          for_date: forDate.toISOString(),
          caption: `${dayName} - Week ${week}`,
          is_template: true,
          template_name: TEMPLATE_NAMES[0],
        };

        // build the workout object
        const workoutObj = {
          title: mainLift ?? dayName,
          desc: mainLift
            ? `${mainLift} strength program week ${week}`
            : dayName,
          scheme_type: 0,
        };

        // build all items for this workout
        const items: any[] = [];
        let order = 0;

        if (mainLift) {
          const wm = workingMaxes[mainLift];
          const nameId = workoutNamesByNameMap.get(mainLift);
          for (const [sets, reps, pct] of scheme) {
            const { maxUnit } = getMaxValueWithUnitByName(mainLift);
            items.push({
              name: nameId,
              sets,
              reps: JSON.stringify([reps]),
              weights: JSON.stringify([Math.round(wm * pct)]),
              weight_unit: maxUnit,
              order: order++,
            });
          }
        }

        // inside your generateTemplates() loop, replace the "accessories" section with:

        let accOrder = order;
        for (const [name, sets, repsOr] of accessories as any[]) {
          const { maxValue } = getMaxValueWithUnitByName(name);
          const baseMax = maxValue || 0;

          console.log(`Base max for ${name}: ${baseMax}`);
          const weights = baseMax
            ? JSON.stringify([Math.round(baseMax * accessoryPct)])
            : JSON.stringify([]);
          const nameId = workoutNamesByNameMap.get(name)!;

          // default payload
          const item: any = {
            name: nameId,
            sets,
            weights,
            weight_unit: "lb",
            order: accOrder++,
          };

          if (typeof repsOr === "object") {
            // object could be { reps }, { duration }, or { distance }
            if ("duration" in repsOr) {
              item.reps = [0];
              item.duration = [repsOr.duration];
              item.duration_unit = 0;
            } else if ("distance" in repsOr) {
              item.reps = [0];
              item.distance = [repsOr.distance];
              item.distance_unit = 0;
            } else if ("reps" in repsOr) {
              item.reps = [repsOr.reps];
              item.duration = [0];
              item.distance = [0];
              item.duration_unit = 0;
              item.distance_unit = 0;
            } else {
              throw new Error(
                `Accessory entry for "${name}" has unknown object keys`
              );
            }
          } else {
            // plain number = reps
            item.reps = [repsOr as number];
            item.duration = [0];
            item.distance = [0];
            item.duration_unit = 0;
            item.distance_unit = 0;
          }

          // These to to be json stringified...
          item.reps = JSON.stringify(item.reps);
          item.duration = JSON.stringify(item.duration);
          item.distance = JSON.stringify(item.distance);

          items.push(item);
        }

        const filledItems = fillTemplateWorkoutItems(items);
        // calculate stats
        const calc = new CalcWorkoutStats(workoutItemMaxesMap);
        calc.setWorkoutParams("", 0, filledItems);
        calc.calc();
        const [tags, names] = calc.getStats();
        console.log("Template calc stats: ", tags);
        // push this group+workout+items block
        templatePayload.push({
          group: groupObj,
          workouts: [
            {
              workout: workoutObj,
              items: filledItems,
              names,
              tags,
            },
          ],
        });

        dayIndex++;
      }
    }

    // finally: send one big request
    console.log("Sending buld template: ", templatePayload);
    await bulkCreateTemplates({
      template: templatePayload,
      user_id: ownerId,
    }).unwrap();
  }

  return { five_3_1, isLoading, error };
}
