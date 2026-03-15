import { WorkoutMaxProps } from "@/app/WorkoutItemMaxes";
import {
  WorkoutCardProps,
  WorkoutGroupProps,
} from "@/src/app_components/Cards/types";
import { CalcWorkoutStats } from "@/src/app_components/shared";
import { useMemo } from "react";
import { useMaxes } from "./useMaxes";
import { StatProps } from "@/src/types";

type UseStatsDataProps = {
  workoutGroups: WorkoutGroupProps[];
  workoutItemMaxesMap: Map<string, WorkoutMaxProps>;
};

type UseStatsProps = {
  workoutGroups: WorkoutGroupProps[];
};

const useStatsData = (props: UseStatsDataProps) => {
  const workoutGroups = props.workoutGroups;

  return useMemo(() => {
    if (workoutGroups && workoutGroups.length > 0) {
      let _allWorkouts: WorkoutCardProps[] = [];
      let _workoutTagStats: StatProps[] = [];
      let _workoutNameStats: StatProps[] = [];
      let calc = new CalcWorkoutStats(props.workoutItemMaxesMap);

      workoutGroups.forEach((workoutGroup: WorkoutGroupProps) => {
        const workouts: WorkoutCardProps[] =
          (workoutGroup.completed_workouts
            ? workoutGroup.completed_workouts
            : workoutGroup.workouts) ?? [];

        _allWorkouts.push(...workouts); // Collect all workouts for bar data

        calc.calcMulti(workouts);
        // calc.calcMultiJSON(workouts);
        const [tags, names] = calc.getStats();

        _workoutTagStats.push({ ...tags, date: workoutGroup.for_date });
        _workoutNameStats.push({ ...names, date: workoutGroup.for_date });
        calc.reset();
      });

      calc = new CalcWorkoutStats(props.workoutItemMaxesMap);
      calc.calcMulti(_allWorkouts);
      const [totalTags, totalNames] = calc.getStats();

      return [_workoutTagStats, _workoutNameStats, totalTags, totalNames];
    }
    return [[], [], {}, {}];
  }, [workoutGroups]);
};

export const useStats = (props: UseStatsProps) => {
  const {
    userId,
    workoutItemMaxesMap,
    isLoading: isUserMaxesLoading,
    error: userMaxesError,
  } = useMaxes();

  const [_workoutTagStats, _workoutNameStats, _totalTags, _totalNames] =
    useStatsData({
      workoutGroups: props ? props.workoutGroups : [],
      workoutItemMaxesMap,
    });

  const workoutTagStats = _workoutTagStats as StatProps[];
  const workoutNameStats = _workoutNameStats as StatProps[];
  const totalTags = _totalTags as StatProps;
  const totalNames = _totalNames as StatProps;

  return {
    isUserMaxesLoading,
    workoutTagStats,
    workoutNameStats,
    totalTags,
    totalNames,
  };
};
