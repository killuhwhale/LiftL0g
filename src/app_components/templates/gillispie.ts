import { useBulkCreateTemplatesMutation } from "@/src/redux/api/apiSlice";
import { useMaxes } from "@/hooks/useMaxes";
import {
  CalcWorkoutStats,
  fillTemplateWorkoutItems,
  TEMPLATE_NAMES,
} from "../shared";
import { AnyWorkoutItem, WorkoutNameProps } from "../Cards/types";
import { dateFormat } from "@/src/utils/algos";

// ——— 8-week scheme for main lifts ———
const ADV_WEEK_SCHEMES: Record<number, [number, number, number][]> = {
  1: [
    [1, 5, 0.76],
    [1, 4, 0.79],
    [1, 3, 0.81],
    [1, 8, 0.7],
    [1, 5, 0.7],
  ], // x5 @76%, x4 @79%, x3 @81%, x8 @70%, FSL x5 @70%
  2: [
    [1, 5, 0.78],
    [1, 4, 0.81],
    [1, 3, 0.83],
    [1, 8, 0.72],
    [1, 5, 0.72],
  ],
  3: [
    [1, 3, 0.84],
    [2, 2, 0.87],
    [1, 1, 0.91],
    [2, 6, 0.76],
    [1, 5, 0.76],
  ],
  4: [
    [1, 4, 0.82],
    [1, 3, 0.85],
    [1, 2, 0.89],
    [1, 1, 0.93],
    [1, 6, 0.78],
  ],
  5: [
    [1, 3, 0.85],
    [2, 2, 0.89],
    [1, 1, 0.93],
    [2, 4, 0.82],
    [1, 5, 0.82],
  ],
  6: [
    [1, 3, 0.87],
    [1, 2, 0.91],
    [1, 1, 0.95],
    [1, 1, 0.97],
  ],
  7: [
    [1, 4, 0.66],
    [1, 3, 0.75],
    [1, 2, 0.83],
    [1, 1, 0.89],
    [1, 1, 0.94],
    [1, 1, 0.98],
    [1, 1, 1.02],
  ],
  8: [], // “Test New Max” week — no main sets
};

// ——— accessory percentages by week (repeat or vary as you like) ———
const ADV_ACCESSORY_PCTS: Record<number, number> = {
  1: 0.5,
  2: 0.6,
  3: 0.7,
  4: 0.5,
  5: 0.6,
  6: 0.7,
  7: 0.5,
  8: 0.6,
};

// ——— Monday → Sunday schedule with fresh accessories + extra core moves ———
const ADV_SCHEDULE: Record<
  string,
  [
    string,
    string | null,
    (
      | string
      | number
      | { reps?: number; duration?: number; distance?: number }
    )[][]
  ]
> = {
  Monday: [
    "Squat Day",
    "Squat",
    [
      ["Bulgarian Split Squat", 4, { reps: 12 }],
      ["Back Extension", 4, { reps: 15 }],
      ["Hanging Leg Raises", 4, { reps: 12 }],
      ["Russian Twist", 4, { reps: 20 }],
      ["Deadbugs", 3, { reps: 15 }],
    ],
  ],
  Tuesday: [
    "Bench Day",
    "Bench Press",
    [
      //   ["Incline DB Press", 4, { reps: 12 }],
      //   ["Seated Cable Row", 4, { reps: 10 }],
      ["Side Plank", 3, { duration: 45 }],
      //   ["Pallof Press", 3, { reps: 15 }],
      ["Deadbugs", 3, { reps: 15 }],
    ],
  ],
  Wednesday: [
    "Conditioning A",
    null,
    [
      ["Sled Push", 4, { distance: 20 }],
      ["Plank", 3, { duration: 60 }],
      //   ["Bird Dog", 3, { reps: 12 }],
    ],
  ],
  Thursday: [
    "Deadlift Day",
    "Deadlift",
    [
      ["Romanian Deadlift", 4, { reps: 10 }],
      ["Glute Bridge", 4, { reps: 15 }],
      //   ["Cable Woodchopper", 3, { reps: 12 }],
      ["Windshield Wiper", 3, { reps: 10 }],
      ["Plank", 3, { duration: 60 }],
    ],
  ],
  Friday: [
    "Shoulder Press Day",
    "Shoulder Press",
    [
      ["DB Lateral Raise", 4, { reps: 12 }],
      ["Chin-Up", 4, { reps: 8 }],
      ["Deadbugs", 3, { reps: 12 }],
      ["Russian Twist", 3, { reps: 20 }],
      ["Plank", 3, { duration: 60 }],
    ],
  ],
  Saturday: [
    "Conditioning B",
    null,
    [
      ["Farmers Walk", 4, { distance: 40 }],
      ["Side Plank", 3, { duration: 45 }],
      //   ["Bird Dog", 3, { reps: 12 }],
    ],
  ],
  Sunday: [
    "Active Rest Day",
    null,
    [
      //   ["Pallof Press", 3, { reps: 15 }],
      ["Plank", 3, { duration: 60 }],
      ["Deadbugs", 3, { reps: 15 }],
    ],
  ],
};

export function useGillispieTemplate() {
  const [bulkCreateTemplates, { isLoading, error }] =
    useBulkCreateTemplatesMutation();

  const {
    userId: ownerId,
    workoutItemMaxesMap,
    workoutNamesByNameMap,
    getMaxValueWithUnitByName,
  } = useMaxes();

  async function generateGillispieTemplate() {
    const payload: any[] = [];

    for (let week = 1; week <= 8; week++) {
      const scheme = ADV_WEEK_SCHEMES[week];
      const accPct = ADV_ACCESSORY_PCTS[week];
      let dayIndex = 1;

      for (const [dayName, mainLift, accessories] of Object.values(
        ADV_SCHEDULE
      )) {
        // — build group metadata —
        const forDate = new Date();
        forDate.setDate(forDate.getDate() + week * dayIndex);

        const group = {
          owner_id: ownerId,
          owned_by_class: false,
          title: `Week ${week} - ${dayName}`,
          for_date: dateFormat(forDate),
          caption: `${dayName} • Week ${week}`,
          is_template: true,
          template_name: TEMPLATE_NAMES[1],
        };

        // — build workout meta —
        const workout = {
          title: mainLift ?? dayName,
          desc: mainLift ? `${mainLift} program • Week ${week}` : dayName,
          scheme_type: 0,
        };

        // — assemble items array —
        const items: any[] = [];
        let order = 0;

        // 1) main lift sets
        if (mainLift && scheme) {
          const wmEntry = getMaxValueWithUnitByName(mainLift);
          const workingMax = Math.round((wmEntry.maxValue || 300) * 0.9);
          const nameId = workoutNamesByNameMap.get(mainLift)!;

          for (const [sets, reps, pct] of scheme) {
            items.push({
              workout: 0, // filled in server
              name: nameId,
              sets,
              reps: JSON.stringify([reps]),
              weights: JSON.stringify([Math.round(workingMax * pct)]),
              weight_unit: wmEntry.maxUnit,
              order: order++,
            });
          }
        }

        // 2) accessories + extra core
        let accOrder = order;
        for (const [_name, sets, detail] of accessories) {
          const name = _name as string;
          const maxEntry = getMaxValueWithUnitByName(name);
          const baseMax = maxEntry.maxValue || 0;
          const weights = baseMax
            ? JSON.stringify([Math.round(baseMax * accPct)])
            : JSON.stringify([]);

          const item: any = {
            workout: 0,
            name: workoutNamesByNameMap.get(name)!,
            sets,
            weights,
            weight_unit: maxEntry.maxUnit,
            order: accOrder++,
            reps: JSON.stringify([0]),
            duration: JSON.stringify([0]),
            distance: JSON.stringify([0]),
            duration_unit: 0,
            distance_unit: 0,
          };

          if (typeof detail === "object") {
            if ("reps" in detail) {
              item.reps = JSON.stringify([detail.reps]);
            } else if ("duration" in detail) {
              item.duration = JSON.stringify([detail.duration]);
            } else if ("distance" in detail) {
              item.distance = JSON.stringify([detail.distance]);
            }
          }

          items.push(item);
        }

        // — fill in the AnyWorkoutItem shape & calculate stats —
        const filled = fillTemplateWorkoutItems(items);
        const calc = new CalcWorkoutStats(workoutItemMaxesMap);
        calc.setWorkoutParams("", 0, filled);
        calc.calc();
        const [tags, names] = calc.getStats();

        payload.push({
          group,
          workouts: [{ workout, items: filled, names, tags }],
        });

        dayIndex++;
      }
    }

    // — send bulk create —
    await bulkCreateTemplates({
      template: payload,
      user_id: ownerId,
    }).unwrap();
  }

  return { generateGillispieTemplate, isLoading, error };
}
