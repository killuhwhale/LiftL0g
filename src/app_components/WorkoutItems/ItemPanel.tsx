import React, { FunctionComponent, useState } from "react";
import { router, useNavigation } from "expo-router";
import { TouchableHighlight, View } from "react-native";
import { useTheme } from "styled-components/native";

import {
  AnyWorkoutItem,
  WorkoutDualItemProps,
  WorkoutItemProps,
} from "../Cards/types";
import {
  displayJList,
  DISTANCE_UNITS,
  DURATION_UNITS,
  SCREEN_HEIGHT,
  shuffle,
} from "../shared";
import { TSCaptionText, TSInputTextSm } from "../Text/Text";
import Icon from "react-native-vector-icons/Ionicons";

import LinearGradient from "react-native-linear-gradient";
import PenaltyDisplayModal from "../modals/PenaltyDisplayModal";
import { COLORSPALETTE } from "@/src/utils/algos";

export const isDual = (item: any) => {
  return item.penalty !== undefined;
};

function recordedInfo(
  key: string,
  item: AnyWorkoutItem,
  ownedByClass: boolean
): string {
  if (key === "duration") {
    return isDual(item) && !ownedByClass
      ? `(${displayJList(item[`r_${key}`])} ${
          DURATION_UNITS[item[`r_duration_unit`]]
        })`
      : "";
  } else if (key === "distance") {
    return isDual(item) && !ownedByClass
      ? `(${displayJList(item[`r_${key}`])} ${
          DISTANCE_UNITS[item[`r_distance_unit`]]
        })`
      : "";
  }
  return isDual(item) && !ownedByClass
    ? `(${displayJList(item[`r_${key}`])}) Reps`
    : "";
}

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

  return (
    <TSCaptionText textStyles={{ alignSelf: "center" }}>
      {restDuration > 0
        ? `Rest: ${restDuration} ${DURATION_UNITS[restDurationUnit]}`
        : ""}
    </TSCaptionText>
  );
};

const recordedTextColor = "#f0abfc";

const WorkoutItemWeights: FunctionComponent<{
  item: AnyWorkoutItem;
}> = ({ item }) => {
  const weights = item.weights;
  const rWeights = item.r_weights ?? "[]";

  const weightUnit = item.weight_unit;
  const rWeightUnit = item.r_weight_unit;

  const percentOf = item.percent_of;
  const rPercentOf = item.r_percent_of;

  // console.log(
  //   "WorkoutItemWeights:  ",
  //   item.name.name,
  //   typeof rWeights,
  //   rWeightUnit,
  //   rPercentOf
  // );

  const theme = useTheme();
  const w = displayJList(weights);
  const rw = displayJList(rWeights);
  const has_record = [item.r_reps, item.r_distance, item.r_duration].indexOf(
    "[0]"
  );
  return (
    <View
      style={{
        flex: 1,
        flexDirection: "row",
        width: "100%",
        justifyContent: "center",
      }}
    >
      <TSCaptionText
        textStyles={{
          color: theme.palette.text,
          fontSize: 9,
        }}
      >
        {w ? (
          ` @ ${w}${
            weightUnit === "%"
              ? ` % of ${percentOf}`
              : weights != "[]"
              ? `${weightUnit}`
              : ""
          } `
        ) : (
          <></>
        )}

        {/* {weightUnit === "%" ? percentOf : ""} */}
      </TSCaptionText>

      <TSCaptionText
        textStyles={{
          color: recordedTextColor,
          fontSize: 9,
        }}
      >
        {rw && rPercentOf && rWeightUnit ? (
          ` @ ${rw}${
            rWeightUnit === "%"
              ? ` % of ${rPercentOf}`
              : rWeights != "[]"
              ? `${rWeightUnit}`
              : ""
          } `
        ) : has_record ? (
          <></>
        ) : (
          <View
            style={{
              flex: 1,
              flexDirection: "column",
              justifyContent: "flex-start",
            }}
          >
            <TSInputTextSm textStyles={{ fontSize: 6 }}>No </TSInputTextSm>
            <TSInputTextSm textStyles={{ fontSize: 6 }}>Weight</TSInputTextSm>
          </View>
        )}
      </TSCaptionText>
    </View>
  );
};

const WORKOUT_NAME_ICONS = [
  "american-football-outline",
  "barbell-outline",
  "baseball-sharp",
  "basketball-sharp",
  "bicycle-sharp",
  "flask-outline",
  "football-outline",
  "game-controller-outline",
  "globe-outline",
  "nutrition-outline",
  "paw-outline",
  "pizza",
  "pulse-outline",
];
shuffle(WORKOUT_NAME_ICONS);
const WorkoutItemRepsDurDistance: FunctionComponent<{
  item: AnyWorkoutItem;
  ownedByClass: boolean;
  schemeType: number;
}> = ({ item, ownedByClass, schemeType }) => {
  // if (item.name.name === "Hill Sprints") {
  //   console.log("Displaying item: ", schemeType, item, item.distance !== "[0]");
  // }

  return (
    <View
      style={{
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        width: "100%",
      }}
    >
      {item.reps !== "[0]" ? (
        <>
          <TSCaptionText>{displayJList(item.reps)} Reps </TSCaptionText>

          <TSCaptionText textStyles={{ color: recordedTextColor }}>
            {recordedInfo("reps", item, ownedByClass)}
          </TSCaptionText>
        </>
      ) : item.distance !== "[0]" ? (
        <>
          <TSCaptionText>
            {displayJList(item.distance)} {DISTANCE_UNITS[item.distance_unit]}{" "}
          </TSCaptionText>

          <TSCaptionText textStyles={{ color: recordedTextColor }}>
            {recordedInfo("distance", item, ownedByClass)}
          </TSCaptionText>
        </>
      ) : item.duration !== "[0]" ? (
        <>
          <TSCaptionText>
            {displayJList(item.duration)} {` `}
            {DURATION_UNITS[item.duration_unit]}
            {` `}
          </TSCaptionText>
          <TSCaptionText textStyles={{ color: recordedTextColor }}>
            {recordedInfo("duration", item, ownedByClass)}
          </TSCaptionText>
        </>
      ) : (
        ""
      )}

      {item.constant ? <TSCaptionText> per round</TSCaptionText> : <></>}
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

  let _item;
  if (isDual(item)) {
    _item = item as WorkoutItemProps;
  } else {
    _item = item as WorkoutDualItemProps;
  }

  const navToWorkoutNameDetail = () => {
    console.log("Navigating with props:", item);
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
  const itemMax = `(${maxValue}${maxUnit})`;
  return (
    <LinearGradient
      // colors={["#00000000", "#4682B4"]} // Steel BLUE
      //   colors={['#00000000', '#87CEEB']} // Sky Blue
      //   colors={['#00000000', '#87CEFA']} // Baby BLUE
      //   colors={['#00000000', '#B0E0E6']} // Powder BlLue
      //   colors={['#00000000', '#7DF9FFAA']} // Electric Blue
      // colors={["#00000000", "#40E0D0"]} // Turquoise
      colors={["#00000000", theme.palette.AWE_Green]} //
      // colors={['#00000000', '#F0F8FF']} // Alice BLUE
      // colors={['#00000000', '#6495ED']} // Cornflower BLUE
      // colors={['#00000000', '#000080']} // navy BLUE
      // colors={['#00000000', '#4169E1']} // royal BLUE
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={{
        width: itemWidth,
        minWidth: itemWidth,
        height: itemHeight,
        borderRadius: 8,
        padding: 6,
        marginRight: 8,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <View style={{ position: "absolute", top: 6, left: 6, flex: 1 }}>
        <TSCaptionText>{idx}</TSCaptionText>
      </View>
      <View style={{ flex: 4, width: "100%" }}>
        {isDual(_item) && _item.penalty.length > 0 ? (
          <TouchableHighlight
            onPress={() => {
              setCurrentPenalty(_item.penalty);
              setShowAlert(true);
            }}
            style={{ width: "100%", height: "100%" }}
            underlayColor={theme.palette.transparent}
            activeOpacity={0.9}
          >
            <View
              style={{
                flexDirection: "row",
                width: "100%",
                justifyContent: "center",
              }}
            >
              <TSCaptionText textStyles={{ textAlign: "center" }}>
                {_item.name.name}
              </TSCaptionText>
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  alignContent: "center",
                  height: "100%",
                  marginLeft: 6,
                }}
              >
                <Icon
                  name="alert-circle-outline"
                  color={theme.palette.text}
                  style={{ fontSize: 12 }}
                />
              </View>
            </View>
          </TouchableHighlight>
        ) : (
          <View style={{ flexDirection: "row", justifyContent: "center" }}>
            <TSCaptionText textStyles={{ textAlign: "center" }}>
              {_item.name.name}
            </TSCaptionText>
            <TSCaptionText
              textStyles={{
                textAlign: "center",
                fontSize: 9,
                color: theme.palette.AWE_Green,
              }}
            >
              {" "}
              {itemMax}
            </TSCaptionText>
          </View>
        )}

        {item.pause_duration > 0 ? (
          <TSCaptionText textStyles={{ textAlign: "center" }}>
            for: {item.pause_duration} s
          </TSCaptionText>
        ) : (
          <></>
        )}
      </View>

      <View
        style={{
          flex: 6,
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <TouchableHighlight
          onPress={() => navToWorkoutNameDetail()}
          style={{ width: "100%", height: "100%" }}
          underlayColor={theme.palette.transparent}
          activeOpacity={0.9}
        >
          <View
            style={{
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
              alignContent: "center",
              height: "100%",
            }}
          >
            <Icon
              // name="reader"
              name={WORKOUT_NAME_ICONS[(idx - 1) % WORKOUT_NAME_ICONS.length]}
              onPress={navToWorkoutNameDetail}
              color={
                schemeType == 0 && item.ssid >= 0
                  ? COLORSPALETTE[item.ssid]
                  : theme.palette.text
              }
              style={{ fontSize: 35 }}
            />

            {schemeType == 0 && item.ssid >= 0 ? (
              <TSCaptionText
                textStyles={{
                  color: COLORSPALETTE[item.ssid],
                  textAlign: "center",
                  marginBottom: 6,
                }}
              >
                SS
              </TSCaptionText>
            ) : (
              <></>
            )}
          </View>
        </TouchableHighlight>
      </View>

      {item.sets > 1 ? (
        <View
          style={{
            alignSelf: "center",
            flex: 2,
            width: "100%",
            justifyContent: "center",
            alignContent: "center",
            alignItems: "center",
          }}
        >
          <TSCaptionText textStyles={{ textAlign: "center" }}>
            {schemeType === 0 ? `${item.sets} x ` : ""}
          </TSCaptionText>
        </View>
      ) : (
        <></>
      )}

      <View
        style={{
          alignSelf: "center",
          flex: 2,
          width: "100%",
          justifyContent: "center",
          alignContent: "center",
          alignItems: "center",
        }}
      >
        <WorkoutItemRepsDurDistance
          item={item}
          ownedByClass={ownedByClass}
          schemeType={schemeType}
        />
      </View>

      <View
        style={{
          alignItems: "center",
          justifyContent: "space-evenly",
          flex: 4,
          width: "100%",
          flexDirection: "column",
        }}
      >
        <WorkoutItemWeights
          item={item}
          ownedByClass={false}
          showRecorded={false}
        />
        {/* <WorkoutItemWeights
          item={item}
          ownedByClass={false}
          showRecorded={true}
        /> */}
        <View style={{ flex: 1 }}>
          <WorkoutItemRest item={item} ownedByClass={false} />
        </View>
      </View>

      <PenaltyDisplayModal
        closeText="Close"
        bodyText={currentPenalty}
        modalVisible={showAlert}
        onRequestClose={() => setShowAlert(false)}
      />
    </LinearGradient>
  );
};

export default WorkoutItemPanel;
