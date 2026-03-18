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

import LinearGradient from "react-native-linear-gradient";
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
    <TSCaptionText textStyles={{ alignSelf: "center", fontSize: 9 }}>
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

  // --- Planned metric text ---
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

  // --- Planned weight ---
  const w = displayJList(item.weights);
  const hasPlannedWeight =
    w && item.weights !== "[]" && item.weights !== "[0]";
  const plannedWeightStr = hasPlannedWeight
    ? item.weight_unit === "%"
      ? ` @ ${w}% of ${item.percent_of}`
      : ` @ ${w}${item.weight_unit}`
    : "";

  // --- Recorded weight ---
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
      {/* Planned: metric stacked above weight */}
      <TSCaptionText textStyles={{ textAlign: "center" }}>
        {metricText}
      </TSCaptionText>
      {plannedWeightStr ? (
        <TSCaptionText
          textStyles={{ fontSize: 9, color: theme.palette.text, textAlign: "center" }}
        >
          {plannedWeightStr}
        </TSCaptionText>
      ) : null}

      {/* Recorded: metric stacked above weight, in purple */}
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
    <View style={{ position: "relative", marginRight: 8 }}>
      {/* Colored left border for superset grouping */}
      {isSuperset && (
        <View
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 3,
            backgroundColor: ssColor,
            borderTopLeftRadius: 8,
            borderBottomLeftRadius: 8,
            zIndex: 2,
          }}
        />
      )}

      <LinearGradient
        colors={["#00000000", theme.palette.AWE_Green]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{
          width: itemWidth,
          minWidth: itemWidth,
          height: itemHeight,
          borderRadius: 8,
          padding: 6,
          paddingLeft: isSuperset ? 10 : 6,
          justifyContent: "flex-start",
          alignItems: "center",
        }}
      >
        {/* ── Name row: [idx] [Name] [penalty icon | max value] ── */}
        <View
          style={{
            width: "100%",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Index + optional SS badge */}
          <View style={{ alignItems: "center", minWidth: 16 }}>
            <TSCaptionText textStyles={{ fontSize: 8 }}>{idx}</TSCaptionText>
            {isSuperset && (
              <TSCaptionText textStyles={{ fontSize: 7, color: ssColor }}>
                SS
              </TSCaptionText>
            )}
          </View>

          {/* Exercise name — always tappable to detail screen */}
          <TouchableHighlight
            onPress={navToWorkoutNameDetail}
            underlayColor={theme.palette.transparent}
            activeOpacity={0.9}
            style={{ flex: 1, alignItems: "center", paddingHorizontal: 4 }}
          >
            <TSCaptionText textStyles={{ textAlign: "center" }}>
              {item.name.name}
            </TSCaptionText>
          </TouchableHighlight>

          {/* Right slot: penalty warning OR max value */}
          <View style={{ minWidth: 28, alignItems: "flex-end" }}>
            {hasPenalty ? (
              <TouchableHighlight
                onPress={() => {
                  setCurrentPenalty(item.penalty!);
                  setShowAlert(true);
                }}
                underlayColor={theme.palette.transparent}
                activeOpacity={0.9}
              >
                <Icon
                  name="alert-circle-outline"
                  color={theme.palette.text}
                  style={{ fontSize: 14 }}
                />
              </TouchableHighlight>
            ) : maxValue ? (
              <TSCaptionText
                textStyles={{ fontSize: 8, color: theme.palette.AWE_Green }}
              >
                {maxValue}
                {maxUnit}
              </TSCaptionText>
            ) : null}
          </View>
        </View>

        {/* ── Remaining content: distributed evenly in leftover space ── */}
        <View
          style={{
            flex: 1,
            width: "100%",
            justifyContent: "space-evenly",
            alignItems: "center",
          }}
        >
          {/* Pause duration with clock icon */}
          {item.pause_duration > 0 && (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Icon
                name="time-outline"
                color={theme.palette.text}
                style={{ fontSize: 11 }}
              />
              <TSCaptionText textStyles={{ fontSize: 9, marginLeft: 3 }}>
                {item.pause_duration}s hold
              </TSCaptionText>
            </View>
          )}

          {/* Metric + weight (planned above, recorded below in purple) */}
          <CombinedMetricRow
            item={item}
            ownedByClass={ownedByClass}
            schemeType={schemeType}
          />

          {/* Rest period */}
          <WorkoutItemRest item={item} ownedByClass={ownedByClass} />
        </View>
      </LinearGradient>

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
