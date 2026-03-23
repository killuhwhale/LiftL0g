import React, { FunctionComponent } from "react";
import { useTheme } from "styled-components/native";
import {
  TSCaptionText,
  TSParagrapghText,
} from "@/src/app_components/Text/Text";
import {
  displayJList,
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
import { router } from "expo-router";
import WorkoutItemPreviewHorizontalList from "./WorkoutItemPreviewHorizontalList";

// Scheme type → accent color index matches WorkoutScreen type chip order:
// 0=Standard(Blue), 1=Reps(Red), 2=Rounds(Amber), 3=Creative(Green)
const useTypeColor = (schemeType: number) => {
  const theme = useTheme();
  const colors = [
    theme.palette.AWE_Blue,
    theme.palette.AWE_Red,
    theme.palette.AWE_Yellow,
    theme.palette.AWE_Green,
  ];
  return colors[schemeType] ?? theme.palette.lightGray;
};

const WorkoutCard: FunctionComponent<WorkoutCardProps> = (props) => {
  const theme = useTheme();
  const typeColor = useTypeColor(props.scheme_type);

  const [deleteWorkout] = useDeleteWorkoutMutation();
  const [deleteCompletedWorkout] = useDeleteCompletedWorkoutMutation();

  const isOGWorkout = props.workout_items ? true : false;
  const items = props.workout_items
    ? props.workout_items
    : props.completed_workout_items
    ? props.completed_workout_items
    : [];

  const navToWorkoutDetail = () => {
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
    props.scheme_type <= 3 ? WORKOUT_TYPE_LABELS[props.scheme_type] : "";

  let subtitle = "";
  if (displaySchemeRounds && displaySchemeRounds !== "undefined") {
    subtitle += displaySchemeRounds + " ";
  }
  if (
    instruction &&
    instruction !== "undefined" &&
    displaySchemeRounds !== instruction
  ) {
    subtitle += instruction + " ";
  }

  const actionIcon = props.editable
    ? "trash-outline"
    : props.group?.finished
    ? "eye-outline"
    : "pencil-outline";

  return (
    <View
      testID={props.testID}
      style={{
        width: "100%",
        marginBottom: 16,
        paddingHorizontal: 12,
      }}
    >
      <View
        style={{
          backgroundColor: theme.palette.darkGray,
          borderRadius: 16,
          overflow: "hidden",
          // Subtle red glow border when in delete mode
          borderWidth: props.editable ? 2 : 0,
          borderColor: props.editable ? theme.palette.AWE_Red : "transparent",
        }}
      >
        {/* Scheme-type accent bar */}
        <View style={{ height: 3, backgroundColor: typeColor }} />

        {/* Horizontal workout items */}
        {/* Height = itemHeight (150) + contentContainer vertical padding (15+15) + paddingTop (8) */}
        <View style={{ paddingTop: 8, paddingLeft: 4, height: WORKOUTITEM_HEIGHT + 38 }}>
          <WorkoutItemPreviewHorizontalList
            testID={props.testID}
            data={items}
            schemeType={props.scheme_type}
            itemWidth={WORKOUTITEM_WIDTH}
            itemHeight={WORKOUTITEM_HEIGHT}
            ownedByClass={props.ownedByClass}
          />
        </View>

        {/* Divider */}
        <View
          style={{
            height: 1,
            backgroundColor: `${theme.palette.lightGray}1A`,
            marginHorizontal: 14,
          }}
        />

        {/* Action row — tappable to edit / view / delete */}
        <AnimatedButton
          onFinish={onFinish}
          title="del workout"
          active={props.editable}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 14,
              paddingVertical: 12,
            }}
          >
            {/* Scheme type badge */}
            <View
              style={{
                backgroundColor: `${typeColor}1E`,
                borderRadius: 6,
                paddingHorizontal: 8,
                paddingVertical: 3,
                marginRight: 10,
                borderWidth: 1,
                borderColor: `${typeColor}33`,
              }}
            >
              <TSCaptionText
                textStyles={{
                  color: typeColor,
                  fontSize: 10,
                  fontWeight: "700",
                  letterSpacing: 0.4,
                }}
              >
                {displaySchemeType || "Custom"}
              </TSCaptionText>
            </View>

            {/* Workout title */}
            <TSParagrapghText
              textStyles={{ flex: 1, fontWeight: "600" }}
              numberOfLines={1}
            >
              {props.title}
            </TSParagrapghText>

            {/* Subtitle (rounds / instruction) */}
            {subtitle.trim() ? (
              <TSCaptionText
                textStyles={{
                  color: `${theme.palette.text}55`,
                  marginRight: 8,
                  maxWidth: 90,
                }}
                numberOfLines={1}
              >
                {subtitle.trim()}
              </TSCaptionText>
            ) : null}

            {/* Action icon */}
            <Icon
              name={actionIcon}
              color={
                props.editable
                  ? theme.palette.AWE_Red
                  : `${theme.palette.lightGray}99`
              }
              style={{ fontSize: 17 }}
            />
          </View>
        </AnimatedButton>
      </View>
    </View>
  );
};

export default WorkoutCard;
