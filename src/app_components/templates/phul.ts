import { useBulkCreateTemplatesMutation } from "@/src/redux/api/apiSlice";
import { useMaxes } from "@/hooks/useMaxes";
import {
  CalcWorkoutStats,
  fillTemplateWorkoutItems,
  TEMPLATE_NAMES,
} from "../shared";
import { dateFormat } from "@/src/utils/algos";

const NUM_WEEKS = 12;

// [name, sets, reps, pct | null]  (null → weights=[])
type ExSpec = [string, number, number, number | null];

const UPPER_POWER: ExSpec[] = [
  ["Bench Press",           4, 3,  0.85],
  ["Incline Dumbbell Press",4, 8,  0.65],
  ["BB Row",                4, 3,  0.80],
  ["Lat Pulldown",          4, 8,  0.60],
  ["Shoulder Press",        3, 6,  0.75],
  ["BB Curl",               3, 8,  0.60],
  ["Tricep Extension",      3, 8,  null],
];

const LOWER_POWER: ExSpec[] = [
  ["Squat",    4, 3,  0.85],
  ["Deadlift", 4, 3,  0.85],
  ["Leg Press",4, 12, null],
  ["Leg Curl", 4, 8,  null],
];

const UPPER_HYP: ExSpec[] = [
  ["Incline Bench Press",             4, 10, 0.65],
  ["DB Chest Fly",                    4, 12, null],
  ["Chest Supported Rows",            4, 10, 0.65],
  ["DB Row",                          4, 10, 0.65],
  ["DB Lateral Raise",                4, 12, null],
  ["DB Curl",                         3, 12, null],
  ["Cable Overhead Tricep Extension", 3, 12, null],
];

const LOWER_HYP: ExSpec[] = [
  ["Front Squat",      4, 10, 0.65],
  ["BB Lunge",         4, 10, 0.55],
  ["Leg Extension",    4, 12, null],
  ["Leg Curl",         4, 12, null],
  ["Seated Calf Raise",4, 10, null],
];

const DAYS: [string, number, ExSpec[]][] = [
  ["Upper Power",       1, UPPER_POWER],
  ["Lower Power",       2, LOWER_POWER],
  ["Upper Hypertrophy", 4, UPPER_HYP],
  ["Lower Hypertrophy", 5, LOWER_HYP],
];

export function usePHULTemplate() {
  const [bulkCreateTemplates, { isLoading, error }] =
    useBulkCreateTemplatesMutation();

  const {
    userId: ownerId,
    workoutItemMaxesMap,
    workoutNamesByNameMap,
    getMaxValueWithUnitByName,
  } = useMaxes();

  async function generatePHUL() {
    const payload: any[] = [];

    for (let week = 1; week <= NUM_WEEKS; week++) {
      const block = week <= 4 ? 0 : week <= 8 ? 1 : 2;
      const intensityAdd = [0, 0.05, 0.10][block];

      for (const [dayName, dayOffset, exercises] of DAYS) {
        const forDate = new Date();
        forDate.setDate(forDate.getDate() + (week - 1) * 7 + dayOffset);

        const group = {
          owner_id: ownerId,
          owned_by_class: false,
          title: `Week ${week} - ${dayName}`,
          for_date: dateFormat(forDate),
          caption: `${dayName} · Week ${week}`,
          is_template: true,
          template_name: TEMPLATE_NAMES[2],
        };

        const workout = {
          title: dayName,
          desc: `PHUL ${dayName} · Week ${week}`,
          scheme_type: 0,
        };

        const items: any[] = [];
        let order = 0;

        for (const [name, sets, reps, pct] of exercises) {
          const { maxValue, maxUnit } = getMaxValueWithUnitByName(name);
          const workingMax = Math.round((maxValue || 300) * 0.9);
          const weights =
            pct !== null
              ? JSON.stringify([Math.round(workingMax * (pct + intensityAdd))])
              : JSON.stringify([]);

          items.push({
            workout: 0,
            name: workoutNamesByNameMap.get(name)!,
            sets,
            reps: JSON.stringify([reps]),
            weights,
            weight_unit: pct !== null ? maxUnit : "lb",
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

  return { generatePHUL, isLoading, error };
}
