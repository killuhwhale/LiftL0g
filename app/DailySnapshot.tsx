import React, { FunctionComponent, useMemo, useState } from "react";
import { Image, View } from "react-native";
import { useTheme } from "styled-components";
import {
  WorkoutCardProps,
  WorkoutGroupProps,
  WorkoutItemProps,
} from "@/src/app_components/Cards/types";
import noDailyWorkout from "@/src/../assets/bgs/nodailyworkout.png";
import { useGetDailySnapshotQuery } from "@/src/redux/api/apiSlice";
import {
  TSCaptionText,
  TSListTitleText,
  TSSnippetText,
} from "@/src/app_components/Text/Text";

import BannerAddMembership from "@/src/app_components/ads/BannerAd";
import ItemString from "@/src/app_components/WorkoutItems/ItemString";
import { CalcWorkoutStats, formatLongDate } from "../src/app_components/shared";
import { StatsPanel } from "@/src/app_components/Stats/StatsPanel";
import { ScrollView } from "react-native-gesture-handler";

import EmojiScore from "@/src/app_components/snapshots/emojiScore";

const DailySnapshotScreen: FunctionComponent = () => {
  const theme = useTheme();

  const {
    data: workoutGroups,
    isLoading: isLoadingWG,
    isSuccess: isSuccessWG,
    isError: isErrorWG,
    error: errorWG,
  } = useGetDailySnapshotQuery("");

  console.log("Daily Snapshot: ", workoutGroups);
  const [score, setScore] = useState(500);
  const [tags, names] = useMemo(() => {
    const calc = new CalcWorkoutStats(); // Deprecated Screen here all code out of date...

    // Extract workouts from Group
    const workoutsFromGroup = workoutGroups?.map(
      (workoutGroup: WorkoutGroupProps) => {
        const _workouts: WorkoutCardProps[] =
          (workoutGroup.completed_workouts
            ? workoutGroup.completed_workouts
            : workoutGroup.workouts) ?? [];

        //   workouts.push(..._workouts);
        return _workouts;
      }
    );

    let workouts = [] as WorkoutCardProps[];
    if (workoutsFromGroup && workoutsFromGroup.length > 0) {
      workouts = workoutsFromGroup.reduce(
        (accWorkouts: WorkoutCardProps[], workouts: WorkoutCardProps[]) => {
          return accWorkouts.concat(workouts);
        }
      );
    }

    console.log("Workouts flattened: ", workouts);

    if (!workouts) return [{}, {}];

    calc.calcMulti(workouts, false);
    setScore(1000);
    return calc.getStats();
  }, [workoutGroups]);

  console.log("tags: ", tags);

  return (
    <View
      style={{
        width: "100%",
        height: "100%",
        flex: 1,
        backgroundColor: theme.palette.backgroundColor,
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <BannerAddMembership />

      {isLoadingWG ? (
        <TSCaptionText>Loading...</TSCaptionText>
      ) : workoutGroups && workoutGroups.length > 0 ? (
        <View style={{ flex: 1, flexDirection: "column" }}>
          <View
            style={{
              borderRadius: 8,
              flex: 1,
              flexDirection: "row",
              justifyContent: "center",
              alignContent: "center",
            }}
          >
            {/* <EmojiScore score={score} /> */}
            <View style={{ flex: 1, justifyContent: "center" }}>
              <TSSnippetText textStyles={{ textAlign: "center" }}>
                Completed
              </TSSnippetText>
            </View>
            <View style={{ flex: 1, justifyContent: "center" }}>
              <TSCaptionText textStyles={{ textAlign: "center" }}>
                {formatLongDate(new Date(workoutGroups[0].for_date))}
              </TSCaptionText>
            </View>
          </View>

          <View
            style={{
              backgroundColor: theme.palette.darkGray,

              padding: 4,
              borderRadius: 8,
              flex: 8,
              justifyContent: "center",
              alignContent: "center",
              height: "100%",
            }}
          >
            <ScrollView style={{ flex: 1, width: "100%" }}>
              <View style={{ flex: 1, height: "100%" }}>
                {workoutGroups.map((workoutGroup: WorkoutGroupProps) => {
                  const workouts: WorkoutCardProps[] =
                    (workoutGroup.completed_workouts
                      ? workoutGroup.completed_workouts
                      : workoutGroup.workouts) ?? [];

                  return (
                    <View style={{}} key={`${workoutGroup.id}_wgdsidkey`}>
                      <TSListTitleText
                        textStyles={{
                          borderBottomColor: theme.palette.primary.main,
                          borderBottomWidth: 1,
                          borderRadius: 8,
                          padding: 2,
                          paddingLeft: 8,
                          textAlign: "center",
                        }}
                      >
                        {workoutGroup.title}
                      </TSListTitleText>
                      {workouts &&
                        workouts.map((workout: WorkoutCardProps) => {
                          return (
                            <View key={`${workout.id}_wdsidkey`}>
                              <TSSnippetText
                                textStyles={{
                                  marginLeft: 6,
                                  color: theme.palette.accent,
                                }}
                              >
                                {workout.title}
                              </TSSnippetText>

                              {workout.workout_items &&
                                workout.workout_items.map(
                                  (workout_item: WorkoutItemProps) => {
                                    return (
                                      <View
                                        style={{ marginLeft: 12 }}
                                        key={`${workout_item.id}_widsidkey`}
                                      >
                                        <ItemString
                                          item={workout_item}
                                          prefix=""
                                          schemeType={workout.scheme_type}
                                        />
                                      </View>
                                    );
                                  }
                                )}
                            </View>
                          );
                        })}
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          </View>

          <View
            style={{
              backgroundColor: theme.palette.darkGray,
              marginTop: 16,
              padding: 4,
              borderRadius: 8,
              flex: 5,
              marginBottom: 12,
            }}
          >
            <TSListTitleText
              textStyles={{
                backgroundColor: theme.palette.accent,
                borderRadius: 8,
                padding: 2,
                paddingLeft: 8,
                textAlign: "center",
              }}
            >
              Stats
            </TSListTitleText>
            <ScrollView style={{ width: "100%" }}>
              <StatsPanel tags={tags} names={names} />
            </ScrollView>
          </View>
        </View>
      ) : (
        <View
          style={{
            backgroundColor: theme.palette.darkGray,

            flex: 1,
            justifyContent: "center",
            alignContent: "center",
            width: "100%",
          }}
        >
          <Image
            style={{ width: "100%", height: "100%" }}
            source={noDailyWorkout}
          />
        </View>
      )}
    </View>
  );
};

export default DailySnapshotScreen;
