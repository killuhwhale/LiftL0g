import React, { FunctionComponent } from "react";
import styled from "styled-components/native";
import { useTheme } from "styled-components/native";
import {
  TSCaptionText,
  TSParagrapghText,
} from "@/src/app_components/Text/Text";
// import { useNavigation } from "@react-navigation/native";
import {
  displayJList,
  SCREEN_WIDTH,
  WORKOUT_TYPE_LABELS,
  WORKOUTITEM_HEIGHT,
  WORKOUTITEM_WIDTH,
} from "@/src/app_components/shared";
import { WorkoutCardProps } from "./types";
import { View } from "react-native";

import { AnimatedButton } from "@/src/app_components/Buttons/buttons";
import Icon from "react-native-vector-icons/Ionicons";
import {
  useDeleteCompletedWorkoutMutation,
  useDeleteWorkoutMutation,
} from "@/src/redux/api/apiSlice";

import { router, useNavigation } from "expo-router";
import WorkoutItemPreviewHorizontalList from "./WorkoutItemPreviewHorizontalList";

const CardRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;

const WorkoutCard: FunctionComponent<WorkoutCardProps> = (props) => {
  const theme = useTheme();
  // const navigation = useNavigation<GymClassScreenProps["navigation"]>();

  const [deleteWorkout, { isLoading }] = useDeleteWorkoutMutation();
  const [
    deleteCompletedWorkout,
    { isLoading: deleteCompletedWorkoutIsLoading },
  ] = useDeleteCompletedWorkoutMutation();
  // console.log("Workout card props: ", props)
  const isOGWorkout = props.workout_items ? true : false;
  const items = props.workout_items
    ? props.workout_items
    : props.completed_workout_items
    ? props.completed_workout_items
    : [];

  const itemsPerCol = 1;
  const numItems = items.length - 1;
  const numCols = Math.max(1, Math.ceil(items.length / itemsPerCol));

  const navToWorkoutDetail = () => {
    console.log("Navigating to WorkoutDetailScreen w/ props: ", props);
    router.push({
      pathname: "/WorkoutDetailScreen",
      params: {
        id: props.id,
        title: props.title,
        desc: props.desc,
        scheme_rounds: props.scheme_rounds,
        scheme_type: props.scheme_type,
        instruction: props.instruction,
        for_date: props.for_date,
        ownedByClass: 0,
      },
    });
  };

  const _deleteWorkout = () => {
    if (isOGWorkout) {
      const data = new FormData();
      data.append("group", props.group?.id);
      data.append("id", props.id);
      deleteWorkout(data);
    } else {
      deleteCompletedWorkout(props.id);
    }
  };

  const onFinish = () => {
    console.log(
      "On Animate Finish, group finished? ",
      props.group,
      props.group?.finished
    );

    if (props.editable) {
      _deleteWorkout();
    } else if (props.group?.finished) {
      navToWorkoutDetail();
    } else {
      props.navToWorkoutScreenWithItems();
    }
  };

  const displaySchemeRounds = displayJList(props.scheme_rounds);
  const instruction = props.instruction;
  const displaySchemeType =
    props.scheme_type <= 2 ? WORKOUT_TYPE_LABELS[props.scheme_type] : "";

  let subtitle = ``;
  if (displaySchemeRounds && displaySchemeRounds !== "undefined") {
    subtitle += displaySchemeRounds + " ";
  }
  if (
    instruction &&
    instruction !== "undefined" &&
    displaySchemeRounds != instruction
  ) {
    subtitle += instruction + " ";
  }
  if (displaySchemeType) {
    subtitle += displaySchemeType;
  }

  console.log(
    "WorkoutCard info: ",
    displaySchemeRounds,
    instruction,
    displaySchemeType
  );
  return (
    <View
      testID={props.testID}
      style={{
        width: SCREEN_WIDTH * 1.0,
        borderRadius: 25,
        marginBottom: 24,
        paddingBottom: 12,
      }}
    >
      <View style={{ width: "100%", paddingLeft: 8, paddingTop: 8, flex: 1 }}>
        <WorkoutItemPreviewHorizontalList
          testID={props.testID}
          data={items}
          schemeType={props.scheme_type}
          itemWidth={WORKOUTITEM_WIDTH}
          itemHeight={WORKOUTITEM_HEIGHT}
          ownedByClass={props.ownedByClass}
        />
      </View>
      <View
        style={{
          borderColor: theme.palette.text,
          borderWidth: props.editable ? 5 : 0,
          borderRadius: 25,
          backgroundColor: theme.palette.transparent,
          flex: 2,
        }}
      >
        <AnimatedButton
          onFinish={() => onFinish()}
          title="del workout"
          active={props.editable}
        >
          <CardRow style={{ height: "100%" }}>
            <View
              style={{
                flexDirection: "row",
                paddingLeft: 16,
                justifyContent: "space-between",
                alignContent: "space-between",
                alignItems: "center",
                flex: 1,
                paddingVertical: 8,
                paddingHorizontal: 8,
              }}
            >
              <TSParagrapghText
                textStyles={{
                  color: theme.palette.primary.main,
                  fontWeight: "500",
                }}
              >
                {props.title}{" "}
              </TSParagrapghText>
              <TSCaptionText>
                {subtitle}
                {/* {displayJList(props.scheme_rounds)}{" "}
                {props.instruction ? props.instruction : ""}{" "}
                {props.scheme_type <= 2
                  ? WORKOUT_TYPE_LABELS[props.scheme_type]
                  : ""} */}
              </TSCaptionText>

              <Icon
                name="chevron-forward-outline"
                color={theme.palette.text}
                style={{ fontSize: 24 }}
              />
            </View>
          </CardRow>
        </AnimatedButton>
      </View>
    </View>
  );
};

export default WorkoutCard;
