import { useBulkCreateTemplatesMutation } from "@/src/redux/api/apiSlice";
import { useMaxes } from "@/hooks/useMaxes";
import {
  CalcWorkoutStats,
  fillTemplateWorkoutItems,
  TEMPLATE_NAMES,
} from "../shared";
import { dateFormat } from "@/src/utils/algos";

// 12 weeks × 3 sessions/week = 36 total sessions, alternating A/B
const TOTAL_SESSIONS = 36;

// Percentage blocks per tier
// Block 0: weeks 1-4, Block 1: weeks 5-8, Block 2: weeks 9-12
const T1_PCTS = [0.80, 0.85, 0.875];
const T2_PCTS = [0.70, 0.75, 0.80];
const T3_PCTS = [0.60, 0.65, 0.70];

export function useGZCLPTemplate() {
  const [bulkCreateTemplates, { isLoading, error }] =
    useBulkCreateTemplatesMutation();

  const {
    userId: ownerId,
    workoutItemMaxesMap,
    workoutNamesByNameMap,
    getMaxValueWithUnitByName,
  } = useMaxes();

  async function generateGZCLP() {
    const payload: any[] = [];

    for (let si = 0; si < TOTAL_SESSIONS; si++) {
      const weekNum = Math.floor(si / 3) + 1;
      const block = weekNum <= 4 ? 0 : weekNum <= 8 ? 1 : 2;
      const t1Pct = T1_PCTS[block];
      const t2Pct = T2_PCTS[block];
      const t3Pct = T3_PCTS[block];

      const isA = si % 2 === 0;
      const sessionLabel = isA ? "A" : "B";
      const dayOffset = (si % 3) * 2 + 1; // 1, 3, or 5

      const forDate = new Date();
      forDate.setDate(forDate.getDate() + Math.floor(si / 3) * 7 + dayOffset);

      const dayName = `Session ${sessionLabel}`;

      const group = {
        owner_id: ownerId,
        owned_by_class: false,
        title: `Week ${weekNum} - ${dayName}`,
        for_date: dateFormat(forDate),
        caption: `${dayName} · Week ${weekNum}`,
        is_template: true,
        template_name: TEMPLATE_NAMES[3],
      };

      const workout = {
        title: dayName,
        desc: `GZCLP ${dayName} · Week ${weekNum}`,
        scheme_type: 0,
      };

      const items: any[] = [];
      let order = 0;

      const addItem = (
        name: string,
        sets: number,
        reps: number,
        pct: number | null
      ) => {
        const { maxValue, maxUnit } = getMaxValueWithUnitByName(name);
        const workingMax = Math.round((maxValue || 300) * 0.9);
        const weights =
          pct !== null
            ? JSON.stringify([Math.round(workingMax * pct)])
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
      };

      if (isA) {
        // Session A
        addItem("Squat",       5, 3,  t1Pct);
        addItem("Bench Press", 3, 10, t2Pct);
        addItem("BB Row",      2, 15, t3Pct);
        addItem("Chin-Up",     2, 10, null);
      } else {
        // Session B
        addItem("Squat",          5, 3,  t1Pct);
        addItem("Shoulder Press", 3, 10, t2Pct);
        addItem("Deadlift",       1, 5,  t1Pct);
        addItem("Pull Up",        2, 10, null);
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

    await bulkCreateTemplates({
      template: payload,
      user_id: ownerId,
    }).unwrap();
  }

  return { generateGZCLP, isLoading, error };
}
