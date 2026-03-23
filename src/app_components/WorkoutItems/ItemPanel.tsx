import React, { FunctionComponent, useState } from "react";
import { router } from "expo-router";
import { TouchableHighlight, View } from "react-native";
import { useTheme } from "styled-components/native";

import { AnyWorkoutItem } from "../Cards/types";
import {
  displayJList,
  DISTANCE_UNITS,
  DURATION_UNITS,
} from "../shared";
import { TSCaptionText } from "../Text/Text";
import Icon from "react-native-vector-icons/Ionicons";

import PenaltyDisplayModal from "../modals/PenaltyDisplayModal";
import { COLORSPALETTE } from "@/src/utils/algos";

export const isDual = (item: any) => {
  return item.penalty !== undefined;
};

const recordedTextColor = "#f0abfc";

// Displays the rest period for an item, using recorded values when applicable.
const WorkoutItemRest: FunctionComponent<{
  item: AnyWorkoutItem;
  ownedByClass: boolean;
}> = ({ item, ownedByClass }) => {
  const restDuration =
    (ownedByClass ? item.rest_duration : item["r_rest_duration"]) ??
    item.rest_duration;
  const restDurationUnit =
    (ownedByClass ? item.rest_duration_unit : item["r_rest_duration_unit"]) ??
    item.rest_duration_unit;

  return restDuration > 0 ? (
    <TSCaptionText textStyles={{ alignSelf: "center", fontSize: 9, opacity: 0.7 }}>
      {`Rest: ${restDuration} ${DURATION_UNITS[restDurationUnit]}`}
    </TSCaptionText>
  ) : null;
};

// Renders planned metric + weight on one line, recorded counterpart in purple below.
// Sets prefix ("3 ×") is merged into the metric line for STANDARD scheme.
const CombinedMetricRow: FunctionComponent<{
  item: AnyWorkoutItem;
  ownedByClass: boolean;
  schemeType: number;
}> = ({ item, ownedByClass, schemeType }) => {
  const theme = useTheme();
  const showRecorded = isDual(item) && !ownedByClass;
  const setsPrefix =
    schemeType === 0 && item.sets > 1 ? `${item.sets} × ` : "";

  let metricText = "";
  let recordedMetricText = "";

  if (item.reps !== "[0]") {
    metricText = `${setsPrefix}${displayJList(item.reps)} Reps`;
    if (showRecorded && item.r_reps && item.r_reps !== "[0]") {
      recordedMetricText = `(${displayJList(item.r_reps)}) Reps`;
    }
  } else if (item.distance !== "[0]") {
    metricText = `${setsPrefix}${displayJList(item.distance)} ${DISTANCE_UNITS[item.distance_unit]}`;
    if (showRecorded && item.r_distance && item.r_distance !== "[0]") {
      recordedMetricText = `(${displayJList(item.r_distance)}) ${
        DISTANCE_UNITS[item.r_distance_unit ?? item.distance_unit]
      }`;
    }
  } else if (item.duration !== "[0]") {
    metricText = `${setsPrefix}${displayJList(item.duration)} ${DURATION_UNITS[item.duration_unit]}`;
    if (showRecorded && item.r_duration && item.r_duration !== "[0]") {
      recordedMetricText = `(${displayJList(item.r_duration)}) ${
        DURATION_UNITS[item.r_duration_unit ?? item.duration_unit]
      }`;
    }
  }

  if (item.constant && metricText) metricText += " /round";

  const w = displayJList(item.weights);
  const hasPlannedWeight =
    w && item.weights !== "[]" && item.weights !== "[0]";
  const plannedWeightStr = hasPlannedWeight
    ? item.weight_unit === "%"
      ? ` @ ${w}% of ${item.percent_of}`
      : ` @ ${w}${item.weight_unit}`
    : "";

  const rw = displayJList(item.r_weights ?? "[]");
  const hasRecordedWeight =
    showRecorded &&
    rw &&
    item.r_weights !== "[]" &&
    item.r_weights !== "[0]" &&
    item.r_weight_unit;
  const recordedWeightStr = hasRecordedWeight
    ? item.r_weight_unit === "%"
      ? ` @ ${rw}% of ${item.r_percent_of}`
      : ` @ ${rw}${item.r_weight_unit}`
    : "";

  if (!metricText && !recordedMetricText) return null;

  return (
    <View style={{ width: "100%", alignItems: "center" }}>
      <TSCaptionText textStyles={{ textAlign: "center", fontSize: 11, fontWeight: "600" }}>
        {metricText}
      </TSCaptionText>
      {plannedWeightStr ? (
        <TSCaptionText
          textStyles={{ fontSize: 9, color: theme.palette.text, textAlign: "center", opacity: 0.65 }}
        >
          {plannedWeightStr}
        </TSCaptionText>
      ) : null}
      {recordedMetricText ? (
        <TSCaptionText
          textStyles={{ color: recordedTextColor, textAlign: "center" }}
        >
          {recordedMetricText}
        </TSCaptionText>
      ) : null}
      {recordedWeightStr ? (
        <TSCaptionText
          textStyles={{ color: recordedTextColor, fontSize: 9, textAlign: "center" }}
        >
          {recordedWeightStr}
        </TSCaptionText>
      ) : null}
    </View>
  );
};

const WorkoutItemPanel: FunctionComponent<{
  item: AnyWorkoutItem;
  schemeType: number;
  itemWidth: number;
  itemHeight: number;
  ownedByClass: boolean;
  maxValue: number;
  maxUnit: string;
  idx: number;
}> = ({
  item,
  schemeType,
  itemWidth,
  itemHeight,
  idx,
  ownedByClass,
  maxValue,
  maxUnit,
}) => {
  const theme = useTheme();
  const [currentPenalty, setCurrentPenalty] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  const hasPenalty =
    isDual(item) && item.penalty != null && item.penalty.length > 0;
  const isSuperset = schemeType === 0 && item.ssid >= 0;
  const ssColor = isSuperset ? COLORSPALETTE[item.ssid] : undefined;
  const accentColor = ssColor ?? theme.palette.AWE_Green;

  const navToWorkoutNameDetail = () => {
    router.push({
      pathname: "/WorkoutNameDetailScreen",
      params: {
        categories: [],
        date: "",
        desc: item.name.desc,
        media_ids: item.name.media_ids,
        id: item.name.id,
        name: item.name.name,
        primary: item.name.primary.title,
        secondary: item.name.secondary.title,
      },
    });
  };

  return (
    <View style={{ marginRight: 8 }}>
      {/* ── Top accent bar ── */}
      <View
        style={{
          width: itemWidth,
          height: 3,
          backgroundColor: accentColor,
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
        }}
      />

      {/* ── Card body ── */}
      <View
        style={{
          width: itemWidth,
          height: itemHeight - 3,
          backgroundColor: theme.palette.backgroundColor,
          borderBottomLeftRadius: 10,
          borderBottomRightRadius: 10,
          borderWidth: 1,
          borderTopWidth: 0,
          borderColor: `${accentColor}22`,
          padding: 8,
        }}
      >
        {/* Index row */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 4,
          }}
        >
          {/* Index bubble */}
          <View
            style={{
              width: 17,
              height: 17,
              borderRadius: 9,
              backgroundColor: `${accentColor}22`,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TSCaptionText
              textStyles={{ fontSize: 8, color: accentColor, fontWeight: "700" }}
            >
              {idx}
            </TSCaptionText>
          </View>
          {isSuperset && (
            <TSCaptionText
              textStyles={{ fontSize: 7, color: ssColor, marginLeft: 4, fontWeight: "700" }}
            >
              SS
            </TSCaptionText>
          )}

          <View style={{ flex: 1 }} />

          {/* Right slot: penalty icon or personal max */}
          {hasPenalty ? (
            <TouchableHighlight
              onPress={() => {
                setCurrentPenalty(item.penalty!);
                setShowAlert(true);
              }}
              underlayColor="transparent"
              activeOpacity={0.8}
            >
              <Icon
                name="alert-circle-outline"
                color={theme.palette.AWE_Red}
                style={{ fontSize: 13 }}
              />
            </TouchableHighlight>
          ) : maxValue ? (
            <TSCaptionText
              textStyles={{ fontSize: 8, color: theme.palette.AWE_Green, fontWeight: "600" }}
            >
              {maxValue}
              {maxUnit}
            </TSCaptionText>
          ) : null}
        </View>

        {/* Exercise name — tappable to detail */}
        <TouchableHighlight
          onPress={navToWorkoutNameDetail}
          underlayColor={`${accentColor}14`}
          activeOpacity={0.85}
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 6,
            marginBottom: 4,
          }}
        >
          <TSCaptionText
            textStyles={{
              textAlign: "center",
              fontWeight: "700",
              fontSize: 11,
              lineHeight: 15,
            }}
            numberOfLines={3}
          >
            {item.name.name}
          </TSCaptionText>
        </TouchableHighlight>

        {/* Metrics + rest */}
        <View style={{ alignItems: "center" }}>
          {item.pause_duration > 0 && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 2,
              }}
            >
              <Icon
                name="time-outline"
                color={theme.palette.text}
                style={{ fontSize: 10 }}
              />
              <TSCaptionText textStyles={{ fontSize: 8, marginLeft: 2 }}>
                {item.pause_duration}s hold
              </TSCaptionText>
            </View>
          )}
          <CombinedMetricRow
            item={item}
            ownedByClass={ownedByClass}
            schemeType={schemeType}
          />
          <WorkoutItemRest item={item} ownedByClass={ownedByClass} />
        </View>
      </View>

      <PenaltyDisplayModal
        closeText="Close"
        bodyText={currentPenalty}
        modalVisible={showAlert}
        onRequestClose={() => setShowAlert(false)}
      />
    </View>
  );
};

export default WorkoutItemPanel;
