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

const PUSH_HEAVY: ExSpec[] = [
  ["Bench Press",           4, 5,  0.85],
  ["Shoulder Press",        3, 6,  0.80],
  ["Incline Dumbbell Press",3, 8,  0.70],
  ["DB Lateral Raise",      4, 12, null],
  ["Tricep Extension",      3, 10, null],
  ["Dips",                  3, 10, null],
];

const PULL_HEAVY: ExSpec[] = [
  ["Deadlift",      4, 4,  0.87],
  ["BB Row",        4, 5,  0.82],
  ["Pull Up",       4, 6,  null],
  ["DB Curl",       3, 10, null],
  ["Hammer Curl",   3, 10, null],
  ["Cable Face Pull",3,15, null],
];

const LEGS_HEAVY: ExSpec[] = [
  ["Squat",             4, 5,  0.85],
  ["Romanian Deadlift", 3, 8,  0.70],
  ["Leg Press",         4, 10, null],
  ["Leg Curl",          3, 10, null],
  ["Leg Extension",     3, 12, null],
  ["Seated Calf Raise", 4, 12, null],
];

const PUSH_VOLUME: ExSpec[] = [
  ["Bench Press",           3, 10, 0.70],
  ["Shoulder Press",        3, 10, 0.65],
  ["Incline Dumbbell Press",3, 12, 0.60],
  ["DB Lateral Raise",      4, 15, null],
  ["Tricep Extension",      3, 15, null],
  ["Dips",                  3, 15, null],
];

const PULL_VOLUME: ExSpec[] = [
  ["BB Row",         4, 10, 0.70],
  ["Chin-Up",        4, 10, null],
  ["DB Row",         3, 12, null],
  ["DB Curl",        3, 15, null],
  ["Hammer Curl",    3, 15, null],
  ["Cable Face Pull",3, 20, null],
];

const LEGS_VOLUME: ExSpec[] = [
  ["Squat",             3, 10, 0.70],
  ["Romanian Deadlift", 3, 12, 0.60],
  ["Leg Press",         4, 15, null],
  ["Leg Curl",          3, 15, null],
  ["Leg Extension",     3, 15, null],
  ["Seated Calf Raise", 4, 20, null],
];

const DAYS: [string, number, ExSpec[]][] = [
  ["Push Heavy",  1, PUSH_HEAVY],
  ["Pull Heavy",  2, PULL_HEAVY],
  ["Legs Heavy",  3, LEGS_HEAVY],
  ["Push Volume", 4, PUSH_VOLUME],
  ["Pull Volume", 5, PULL_VOLUME],
  ["Legs Volume", 6, LEGS_VOLUME],
];

export function usePPLTemplate() {
  const [bulkCreateTemplates, { isLoading, error }] =
    useBulkCreateTemplatesMutation();

  const {
    userId: ownerId,
    workoutItemMaxesMap,
    workoutNamesByNameMap,
    getMaxValueWithUnitByName,
  } = useMaxes();

  async function generatePPL() {
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
          template_name: TEMPLATE_NAMES[4],
        };

        const workout = {
          title: dayName,
          desc: `PPL ${dayName} · Week ${week}`,
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

  return { generatePPL, isLoading, error };
}
