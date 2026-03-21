import React, { FunctionComponent, memo, useCallback } from "react";
import { useTheme } from "styled-components/native";
import {
  TSCaptionText,
  TSSnippetText,
  XSmallText,
} from "@/src/app_components/Text/Text";
import { router } from "expo-router";
import { WorkoutGroupCardProps } from "@/src/app_components/Cards/types";
import { TouchableHighlight, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

import { dateFormatDayOfWeek } from "@/src/utils/algos";

const SOURCE_META = {
  manual: { label: "Custom" },
  template: { label: "Template" },
  ai: { label: "AI Coach" },
} as const;

const WorkoutGroupGridItem: FunctionComponent<{
  card: WorkoutGroupCardProps;
  editable: boolean;
}> = (props) => {
  const theme = useTheme();
  const isCompleted = !!props.card.finished;
  const sourceKey = props.card.creation_source ?? "manual";
  const sourceMeta = SOURCE_META[sourceKey] ?? SOURCE_META.manual;

  // Color is driven by creation_source — gives each workout type a visual identity
  const accentColor =
    sourceKey === "template"
      ? theme.palette.AWE_Yellow
      : sourceKey === "ai"
      ? theme.palette.AWE_Blue
      : theme.palette.AWE_Green;

  const handlePress = useCallback(() => {
    router.push({
      pathname: "/WorkoutScreen",
      params: { id: props.card.id },
    });
  }, [props.card.id]);

  return (
    <TouchableHighlight
      onPress={handlePress}
      underlayColor={`${accentColor}18`}
      style={{ borderRadius: 12, marginHorizontal: 4, marginVertical: 5 }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "stretch",
          backgroundColor: theme.palette.darkGray,
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        {/* Left accent bar */}
        <View
          style={{
            width: 4,
            backgroundColor: accentColor,
            borderTopLeftRadius: 12,
            borderBottomLeftRadius: 12,
          }}
        />

        {/* Main content */}
        <View
          style={{
            flex: 1,
            paddingVertical: 14,
            paddingHorizontal: 14,
          }}
        >
          {/* Title */}
          <TSSnippetText
            numberOfLines={1}
            textStyles={{ fontWeight: "700", fontSize: 15, marginBottom: 6 }}
          >
            {props.card.title}
          </TSSnippetText>

          {/* Source chip + date */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View
              style={{
                paddingHorizontal: 7,
                paddingVertical: 2,
                borderRadius: 999,
                backgroundColor: `${accentColor}1A`,
                borderWidth: 1,
                borderColor: `${accentColor}44`,
              }}
            >
              <XSmallText
                textStyles={{ color: accentColor, fontWeight: "700", fontSize: 10 }}
              >
                {sourceMeta.label}
              </XSmallText>
            </View>

            <TSCaptionText
              textStyles={{ color: theme.palette.gray, fontSize: 12 }}
            >
              {dateFormatDayOfWeek(props.card.for_date)}
            </TSCaptionText>
          </View>
        </View>

        {/* Completion indicator */}
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            paddingRight: 16,
            paddingLeft: 8,
          }}
        >
          {isCompleted ? (
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: `${theme.palette.AWE_Green}22`,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Icon
                name="checkmark"
                size={16}
                color={theme.palette.AWE_Green}
              />
            </View>
          ) : (
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                borderWidth: 1.5,
                borderColor: `${theme.palette.lightGray}44`,
              }}
            />
          )}
        </View>
      </View>
    </TouchableHighlight>
  );
};

export default memo(WorkoutGroupGridItem);
