import { useBulkCreateTemplatesMutation } from "@/src/redux/api/apiSlice";
import { useMaxes } from "@/hooks/useMaxes";
import {
  CalcWorkoutStats,
  fillTemplateWorkoutItems,
  TEMPLATE_NAMES,
} from "../shared";
import { dateFormat } from "@/src/utils/algos";

const NUM_WEEKS = 12;

export function useTexasMethodTemplate() {
  const [bulkCreateTemplates, { isLoading, error }] =
    useBulkCreateTemplatesMutation();

  const {
    userId: ownerId,
    workoutItemMaxesMap,
    workoutNamesByNameMap,
    getMaxValueWithUnitByName,
  } = useMaxes();

  async function generateTexasMethod() {
    const payload: any[] = [];

    const makeItem = (
      name: string,
      sets: number,
      reps: number,
      pct: number | null,
      order: number
    ) => {
      const { maxValue, maxUnit } = getMaxValueWithUnitByName(name);
      const workingMax = Math.round((maxValue || 300) * 0.9);
      const weights =
        pct !== null
          ? JSON.stringify([Math.round(workingMax * pct)])
          : JSON.stringify([]);
      return {
        workout: 0,
        name: workoutNamesByNameMap.get(name)!,
        sets,
        reps: JSON.stringify([reps]),
        weights,
        weight_unit: pct !== null ? maxUnit : "lb",
        order,
        duration: JSON.stringify([0]),
        distance: JSON.stringify([0]),
        duration_unit: 0,
        distance_unit: 0,
      };
    };

    for (let week = 1; week <= NUM_WEEKS; week++) {
      const volPct = 0.85 + (week - 1) * 0.01;
      const intPct = 0.92 + (week - 1) * 0.01;
      const recPct = volPct - 0.15;
      const isOdd = week % 2 === 1;

      const buildDay = (
        dayName: string,
        dayOffset: number,
        items: any[]
      ) => {
        const forDate = new Date();
        forDate.setDate(forDate.getDate() + (week - 1) * 7 + dayOffset);

        const group = {
          owner_id: ownerId,
          owned_by_class: false,
          title: `Week ${week} - ${dayName}`,
          for_date: dateFormat(forDate),
          caption: `${dayName} · Week ${week}`,
          is_template: true,
          template_name: TEMPLATE_NAMES[5],
        };

        const workout = {
          title: dayName,
          desc: `Texas Method ${dayName} · Week ${week}`,
          scheme_type: 0,
        };

        const filled = fillTemplateWorkoutItems(items);
        const calc = new CalcWorkoutStats(workoutItemMaxesMap);
        calc.setWorkoutParams("", 0, filled);
        calc.calc();
        const [tags, names] = calc.getStats();

        payload.push({
          group,
          workouts: [{ workout, items: filled, names, tags }],
        });
      };

      // Volume Day (offset 1)
      // Odd weeks: Bench Press; Even weeks: Shoulder Press
      const pressVol = isOdd ? "Bench Press" : "Shoulder Press";
      buildDay("Volume Day", 1, [
        makeItem("Squat",   5, 5, volPct,        0),
        makeItem(pressVol,  5, 5, volPct,        1),
        makeItem("BB Row",  5, 5, volPct - 0.05, 2),
      ]);

      // Recovery Day (offset 3)
      // Odd weeks: Shoulder Press; Even weeks: Bench Press
      const pressRec = isOdd ? "Shoulder Press" : "Bench Press";
      buildDay("Recovery Day", 3, [
        makeItem("Squat",   2, 5, recPct,        0),
        makeItem(pressRec,  3, 5, recPct + 0.05, 1),
        makeItem("Pull Up", 3, 8, null,           2),
      ]);

      // Intensity Day (offset 5)
      // Odd weeks: Bench Press; Even weeks: Shoulder Press
      const pressInt = isOdd ? "Bench Press" : "Shoulder Press";
      buildDay("Intensity Day", 5, [
        makeItem("Squat",    1, 5, intPct, 0),
        makeItem(pressInt,   1, 5, intPct, 1),
        makeItem("Deadlift", 1, 3, intPct, 2),
      ]);
    }

    await bulkCreateTemplates({
      template: payload,
      user_id: ownerId,
    }).unwrap();
  }

  return { generateTexasMethod, isLoading, error };
}
