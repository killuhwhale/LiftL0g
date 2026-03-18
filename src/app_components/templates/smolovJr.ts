import { useBulkCreateTemplatesMutation } from "@/src/redux/api/apiSlice";
import { useMaxes } from "@/hooks/useMaxes";
import {
  CalcWorkoutStats,
  fillTemplateWorkoutItems,
  TEMPLATE_NAMES,
} from "../shared";
import { dateFormat } from "@/src/utils/algos";

const NUM_WEEKS = 3;

// [dayName, dayOffset, squatSets, squatReps, squatPct, accessoryType]
// accessoryType: "MW" = Mon/Wed (Bench + Row), "FS" = Fri/Sat (Shoulder Press + Pull Up)
type DayPlan = [string, number, number, number, number, "MW" | "FS"];

const WEEK_PLANS: Record<number, DayPlan[]> = {
  1: [
    ["Monday",    1, 6,  6, 0.70,  "MW"],
    ["Wednesday", 3, 7,  5, 0.75,  "MW"],
    ["Friday",    5, 8,  4, 0.80,  "FS"],
    ["Saturday",  6, 9,  3, 0.85,  "FS"],
  ],
  2: [
    ["Monday",    1, 7,  5, 0.725, "MW"],
    ["Wednesday", 3, 8,  4, 0.775, "MW"],
    ["Friday",    5, 9,  3, 0.825, "FS"],
    ["Saturday",  6, 10, 2, 0.875, "FS"],
  ],
  3: [
    ["Monday",    1, 10, 3, 0.75,  "MW"],
    ["Wednesday", 3, 6,  3, 0.80,  "MW"],
    ["Friday",    5, 6,  3, 0.85,  "FS"],
    ["Saturday",  6, 3,  3, 0.90,  "FS"],
  ],
};

export function useSmolovJrTemplate() {
  const [bulkCreateTemplates, { isLoading, error }] =
    useBulkCreateTemplatesMutation();

  const {
    userId: ownerId,
    workoutItemMaxesMap,
    workoutNamesByNameMap,
    getMaxValueWithUnitByName,
  } = useMaxes();

  async function generateSmolovJr() {
    const payload: any[] = [];

    for (let week = 1; week <= NUM_WEEKS; week++) {
      const plans = WEEK_PLANS[week];

      for (const [dayName, dayOffset, squatSets, squatReps, squatPct, accType] of plans) {
        const forDate = new Date();
        forDate.setDate(forDate.getDate() + (week - 1) * 7 + dayOffset);

        const group = {
          owner_id: ownerId,
          owned_by_class: false,
          title: `Week ${week} - ${dayName}`,
          for_date: dateFormat(forDate),
          caption: `${dayName} · Week ${week}`,
          is_template: true,
          template_name: TEMPLATE_NAMES[6],
        };

        const workout = {
          title: `Squat Peaking - ${dayName}`,
          desc: `Smolov Jr ${dayName} · Week ${week}`,
          scheme_type: 0,
        };

        const items: any[] = [];
        let order = 0;

        // — Squat (main movement) —
        const sqEntry = getMaxValueWithUnitByName("Squat");
        const sqMax = Math.round((sqEntry.maxValue || 300) * 0.9);
        items.push({
          workout: 0,
          name: workoutNamesByNameMap.get("Squat")!,
          sets: squatSets,
          reps: JSON.stringify([squatReps]),
          weights: JSON.stringify([Math.round(sqMax * squatPct)]),
          weight_unit: sqEntry.maxUnit,
          order: order++,
          duration: JSON.stringify([0]),
          distance: JSON.stringify([0]),
          duration_unit: 0,
          distance_unit: 0,
        });

        if (accType === "MW") {
          // Mon/Wed: Bench Press 3x8 @65%, BB Row 3x8 @60%
          const bpEntry = getMaxValueWithUnitByName("Bench Press");
          const bpMax = Math.round((bpEntry.maxValue || 300) * 0.9);
          items.push({
            workout: 0,
            name: workoutNamesByNameMap.get("Bench Press")!,
            sets: 3,
            reps: JSON.stringify([8]),
            weights: JSON.stringify([Math.round(bpMax * 0.65)]),
            weight_unit: bpEntry.maxUnit,
            order: order++,
            duration: JSON.stringify([0]),
            distance: JSON.stringify([0]),
            duration_unit: 0,
            distance_unit: 0,
          });

          const rowEntry = getMaxValueWithUnitByName("BB Row");
          const rowMax = Math.round((rowEntry.maxValue || 300) * 0.9);
          items.push({
            workout: 0,
            name: workoutNamesByNameMap.get("BB Row")!,
            sets: 3,
            reps: JSON.stringify([8]),
            weights: JSON.stringify([Math.round(rowMax * 0.60)]),
            weight_unit: rowEntry.maxUnit,
            order: order++,
            duration: JSON.stringify([0]),
            distance: JSON.stringify([0]),
            duration_unit: 0,
            distance_unit: 0,
          });
        } else {
          // Fri/Sat: Shoulder Press 3x8 @65%, Pull Up 3x8 (weights=[])
          const spEntry = getMaxValueWithUnitByName("Shoulder Press");
          const spMax = Math.round((spEntry.maxValue || 300) * 0.9);
          items.push({
            workout: 0,
            name: workoutNamesByNameMap.get("Shoulder Press")!,
            sets: 3,
            reps: JSON.stringify([8]),
            weights: JSON.stringify([Math.round(spMax * 0.65)]),
            weight_unit: spEntry.maxUnit,
            order: order++,
            duration: JSON.stringify([0]),
            distance: JSON.stringify([0]),
            duration_unit: 0,
            distance_unit: 0,
          });

          items.push({
            workout: 0,
            name: workoutNamesByNameMap.get("Pull Up")!,
            sets: 3,
            reps: JSON.stringify([8]),
            weights: JSON.stringify([]),
            weight_unit: "lb",
            order: order++,
            duration: JSON.stringify([0]),
            distance: JSON.stringify([0]),
            duration_unit: 0,
            distance_unit: 0,
          });
        }

        const filled = fillTemplateWorkoutItems(items);
        const calc = new CalcWorkoutStats(workoutItemMaxesMap);
        calc.setWorkoutParams("", 0, filled);
        calc.calc();
        const [tags, names] = calc.getStats();

        payload.push({
          group,
          workouts: [{ workout, items: filled, names, tags }],
        });
      }
    }

    await bulkCreateTemplates({
      template: payload,
      user_id: ownerId,
    }).unwrap();
  }

  return { generateSmolovJr, isLoading, error };
}
