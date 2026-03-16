import React, { FunctionComponent, memo, useCallback } from "react";
import { useTheme } from "styled-components/native";
import {
  TSCaptionText,
  TSDateText,
  TSParagrapghText,
  TSSnippetText,
  XSmallText,
} from "@/src/app_components/Text/Text";
import { router } from "expo-router";
import { WorkoutGroupCardProps } from "@/src/app_components/Cards/types";
import { Image, TouchableHighlight, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/Ionicons";
import twrnc from "twrnc";
import moc from "@/assets/bgs/moc.png";

import { green } from "@/src/app_components/shared";
import { dateFormatDayOfWeek } from "@/src/utils/algos";

const startColor = twrnc.color("bg-stone-900");
const endColor = twrnc.color("bg-teal-900");
const textColor = twrnc.color("bg-teal-50");

const WorkoutGroupGridItem: FunctionComponent<{
  card: WorkoutGroupCardProps;
  editable: boolean;
}> = (props) => {
  const theme = useTheme();

  const handlePress = useCallback(() => {
    router.push({
      pathname: "/WorkoutScreen",
      params: {
        id: props.card.id,
      },
    });
  }, [props.card.id]);

  return (
    <View
      style={{
        flexDirection: "column",
        margin: 8,
      }}
    >
      <TouchableHighlight
        style={{ borderRadius: 16 }}
        underlayColor="transparent"
        onPress={handlePress}
      >
        <LinearGradient
          colors={[startColor!, theme.palette.AWE_Green]} // Turquoise
          start={{ x: 0.0, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={{ flex: 1, borderRadius: 16 }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View
              style={{
                backgroundColor: theme.palette.backgroundColor,
                borderRadius: 16,
                padding: 16,
                margin: 8,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 6,
                elevation: 4,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Image
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 16,
                  marginRight: 12,
                }}
                source={moc}
              />
              <View style={{ flex: 1 }}>
                <TSSnippetText
                  numberOfLines={1}
                  textStyles={{ fontWeight: "bold", fontSize: 16 }}
                >
                  {props.card.title}
                </TSSnippetText>
                <TSDateText
                  numberOfLines={1}
                  textStyles={{
                    fontSize: 12,
                    color: theme.palette.gray,
                    marginTop: 2,
                  }}
                >
                  {dateFormatDayOfWeek(new Date(props.card.for_date))}
                </TSDateText>
              </View>

              {props.card.finished ? (
                <Icon
                  name="checkmark-circle-sharp"
                  size={24}
                  color={theme.palette.AWE_Green}
                />
              ) : (
                <Icon
                  name="ellipse-outline"
                  size={24}
                  color={theme.palette.AWE_Green}
                />
              )}
            </View>
          </View>
        </LinearGradient>
      </TouchableHighlight>
    </View>
  );
};

export default memo(WorkoutGroupGridItem);
