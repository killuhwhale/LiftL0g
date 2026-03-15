// hooks/useMaxes.ts
import { useMemo } from "react";
import {
  useGetProfileViewQuery,
  useGetUserWorkoutMaxesQuery,
} from "@/src/redux/api/apiSlice";
import { WorkoutMaxProps } from "@/app/WorkoutItemMaxes";
import { WorkoutNameProps } from "@/src/app_components/Cards/types";

// export interface CurrentMaxProps {
//   id: string;
//   max_value: number;
//   unit: string;
//   last_updated: string;
// }

// export interface WorkoutMaxProps {
//   id: string;
//   name: string;
//   current_max: CurrentMaxProps;
// }

/**
 * Custom hook to fetch and process user workout maxes
 * @param userId Optional user ID (if already known)
 * @returns Object with max data, loading states, and utility functions
 */
export const useMaxes = (userId?: string) => {
  // If userId is provided, use it; otherwise, fetch the profile to get it
  const fetchProfile = !userId;

  const {
    data: profileData,
    isLoading: isUserLoading,
    error: userError,
  } = useGetProfileViewQuery("", {
    skip: !fetchProfile, // Skip if userId was provided
  });

  // Get the actual userId to use
  const effectiveUserId = userId || profileData?.user?.id || "0";

  // Fetch workout maxes with the user ID
  const {
    data: workoutItemMaxes,
    isLoading: isMaxesLoading,
    isFetching,
    error: getMaxesError,
    refetch: refetchMaxes,
  } = useGetUserWorkoutMaxesQuery(effectiveUserId, {
    skip: fetchProfile && !profileData?.user?.id, // Skip if we need profile but don't have it yet
  });

  // Create a Map for more efficient lookups
  const workoutItemMaxesMap = useMemo(() => {
    if (!workoutItemMaxes) return new Map<string, WorkoutMaxProps>();

    return new Map<string, WorkoutMaxProps>(
      workoutItemMaxes.map((max: WorkoutMaxProps) => [max.id.toString(), max])
    );
  }, [workoutItemMaxes]);

  const workoutNamesByNameMap = useMemo(() => {
    if (!workoutItemMaxes) return new Map<string, WorkoutMaxProps>();

    return new Map<string, WorkoutNameProps>(
      workoutItemMaxes.map((max: WorkoutMaxProps) => {
        const { current_max, ...rest } = max;

        return [max.name, rest];
      })
    );
  }, [workoutItemMaxes]);

  const workoutItemMaxesByNameMap = useMemo(() => {
    if (!workoutItemMaxes) return new Map<string, WorkoutMaxProps>();

    return new Map<string, WorkoutMaxProps>(
      workoutItemMaxes.map((max: WorkoutMaxProps) => {
        return [max.name, max];
      })
    );
  }, [workoutItemMaxes]);

  // Helper function to get a max by ID
  const getMaxById = (id: string): WorkoutMaxProps | undefined => {
    return workoutItemMaxesMap.get(id.toString());
  };

  // Helper to check if a workout has a max value set
  const hasMax = (id: string): boolean => {
    const max = workoutItemMaxesMap.get(id.toString());
    return !!(max && max.current_max);
  };

  // Helper to get max value with unit
  const getMaxValueWithUnit = (
    id: string
  ): { maxValue: number; maxUnit: string } => {
    const max = workoutItemMaxesMap.get(id.toString());
    if (max && max.current_max) {
      // return `${max.current_max.max_value} ${max.current_max.unit}`;
      return {
        maxValue: max.current_max.max_value,
        maxUnit: max.current_max.unit,
      };
    }
    return { maxValue: 0, maxUnit: "kg" };
  };

  const getMaxValueWithUnitByName = (
    name: string
  ): { maxValue: number; maxUnit: string } => {
    const max = workoutItemMaxesByNameMap.get(name);

    if (max && max.current_max) {
      // return `${max.current_max.max_value} ${max.current_max.unit}`;
      return {
        maxValue: max.current_max.max_value,
        maxUnit: max.current_max.unit,
      };
    }
    return { maxValue: 0, maxUnit: "kg" };
  };

  // Helper to get just the numeric max value
  const getMaxValue = (id: string): number | null => {
    const max = workoutItemMaxesMap.get(id.toString());
    if (max && max.current_max) {
      return max.current_max.max_value;
    }
    return null;
  };

  return {
    // Data
    userId: effectiveUserId,
    profileData,
    workoutItemMaxes,
    workoutItemMaxesMap,
    workoutNamesByNameMap,

    // Loading states
    isLoading: isUserLoading || isMaxesLoading,
    isFetching,

    // Errors
    error: userError || getMaxesError,

    // Actions
    refetch: refetchMaxes,

    // Helper functions
    getMaxById,
    hasMax,
    getMaxValueWithUnit,
    getMaxValue,
    getMaxValueWithUnitByName,
  };
};
