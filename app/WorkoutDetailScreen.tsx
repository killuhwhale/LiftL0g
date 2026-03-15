import React, { FunctionComponent } from "react";
import styled from "styled-components/native";
import {
  CalcWorkoutStats,
  Container,
  displayJList,
  formatLongDate,
  WORKOUT_TYPES,
  WORKOUTITEM_HEIGHT,
  WORKOUTITEM_WIDTH,
} from "../src/app_components/shared";
import {
  TSCaptionText,
  TSParagrapghText,
  TSTitleText,
  TSDateText,
  TSSnippetText,
} from "../src/app_components/Text/Text";

import { ActivityIndicator, ScrollView, View } from "react-native";
import { StatsPanel } from "../src/app_components/Stats/StatsPanel";
import BannerAddMembership from "../src/app_components/ads/BannerAd";
import { useLocalSearchParams } from "expo-router";
import {
  useGetUserWorkoutMaxesQuery,
  useGetWorkoutByIDQuery,
} from "@/src/redux/api/apiSlice";
import WorkoutItemPreviewHorizontalList from "@/src/app_components/Cards/WorkoutItemPreviewHorizontalList";
import { useTheme } from "styled-components/native";
import { WorkoutMaxProps } from "./WorkoutItemMaxes";
import { ItemStringDisplayList } from "@/src/app_components/WorkoutItems/ItemStringDisplayList";

const ScreenContainer = styled(Container)`
  background-color: ${(props) => props.theme.palette.backgroundColor};
  justify-content: space-between;
  width: 100%;
  padding: 16px;
`;

/**
 *
 * @param schemeRounds
 * @param schemeType
 * @param items
 * @returns
 *
 * [{name: {primary: "lower"},...}, {},....]
 *
 * TAGS = {
 *  "lower": {
 *      totalReps: 10,
        totalLbs: 10,
        totalKgs: 10,
 *  },
 * }
 *
 *
 */

/**
 *  totalReps: 0,
    totalLbs: 0,
    totalKgs: 0,

    // Total duration seconds
    totalTime: 0,
    totalKgSec: 0,
    totalLbSec: 0,

    // Total Distance Meters
    totalDistanceM: 0,
    totalKgM: 0,
    totalLbM: 0,
*/

const WorkoutDetailScreen: FunctionComponent = () => {
  const params = useLocalSearchParams(); // returns string or string array, cannot serialize much....
  const theme = useTheme();
  // TODO() Build or find query from APISlice to get workout items for this workout....

  // Thank goodness for type safety...
  const {
    id,
    title: _title,
    desc: _desc,
    scheme_rounds: _scheme_rounds,
    scheme_type: _scheme_type,
    instruction: _instruction,
    for_date: _for_date,
    ownedByClass: _ownedByClass,
  } = params || {};

  const title = _title as string;
  const desc = _desc as string;
  const scheme_rounds = _scheme_rounds as string;
  const scheme_type = parseInt(_scheme_type as string);
  const instruction = _instruction as string;

  const for_date = _for_date as string;
  const ownedByClass = parseInt(_ownedByClass as string);

  const {
    data: workout,
    isLoading,
    isSuccess,
    isError,
    error: errorWorkoutByID,
  } = useGetWorkoutByIDQuery(id);

  const tags = workout?.stats?.tags ? workout.stats.tags : {};
  const names = workout?.stats?.items ? workout.stats.items : {};

  return (
    <ScreenContainer>
      <BannerAddMembership />

      <View
        style={{
          justifyContent: "flex-end",
          width: "100%",
          flexDirection: "row",
          marginVertical: 2,
        }}
      >
        <TSSnippetText textStyles={{ color: theme.palette.accent }}>
          {isSuccess && !isLoading
            ? `Exercises (${workout.workout_items.length})`
            : "no items"}
        </TSSnippetText>
      </View>

      <View style={{ marginVertical: 6, width: "100%" }}>
        <TSTitleText>
          {title.length < 1 ? "Title here... (you didnt give a title)" : title}
        </TSTitleText>

        <TSCaptionText textStyles={{ padding: 6 }}>
          {desc.length < 1
            ? "Description here... (you didnt give a description)"
            : desc}
        </TSCaptionText>

        <TSDateText textStyles={{ padding: 6 }}>
          {for_date
            ? formatLongDate(new Date(for_date))
            : "Unsure which date this is for..."}
        </TSDateText>
      </View>

      <View style={{ marginVertical: 12, width: "100%" }}>
        <StatsPanel tags={tags} names={names} />
      </View>

      <View
        style={{
          justifyContent: "center",
          width: "100%",
          marginVertical: 12,
        }}
      >
        <View style={{ marginTop: 8, padding: 6 }}>
          <TSParagrapghText>
            Type: {WORKOUT_TYPES[scheme_type]}{" "}
            {scheme_rounds.length > 0 &&
            scheme_rounds.indexOf("undefined") == -1
              ? displayJList(scheme_rounds)
              : ""}
          </TSParagrapghText>
        </View>

        {!isLoading && isSuccess ? (
          // <WorkoutItemPreviewHorizontalList
          //   testID={""}
          //   data={workout.workout_items}
          //   schemeType={scheme_type}
          //   itemWidth={WORKOUTITEM_WIDTH}
          //   itemHeight={WORKOUTITEM_HEIGHT}
          //   ownedByClass={ownedByClass == 1 ? true : false}
          // />
          <View>
            {instruction && instruction !== "undefined" ? (
              <TSSnippetText textStyles={{ padding: 6 }}>
                {instruction}
              </TSSnippetText>
            ) : (
              <></>
            )}
            <ItemStringDisplayList
              items={workout.workout_items}
              schemeType={scheme_type}
            />
          </View>
        ) : (
          <></>
        )}
      </View>
    </ScreenContainer>
  );
};

export default WorkoutDetailScreen;
