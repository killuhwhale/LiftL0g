import React, { FunctionComponent, useState, useEffect } from "react";
import { View, TouchableOpacity } from "react-native";
import { useTheme } from "styled-components/native";

import { TSCaptionText, TSInputTextSm, XSmallText } from "@/src/app_components/Text/Text";
import {
  DURATION_UNITS,
  DISTANCE_UNITS,
  WEIGHT_UNITS,
  WORKOUT_TYPES,
  STANDARD_W,
  ROUNDS_W,
  CREATIVE_W,
  REPS_W,
  nanOrNah,
  numFilter,
  numFilterWithSpaces,
  tsInputSm,
} from "@/src/app_components/shared";

import {
  WorkoutDualItemProps,
  WorkoutItemProps,
  WorkoutNameProps,
} from "@/src/app_components/Cards/types";

import Input from "@/src/app_components/Input/input";
import VerticalPicker from "@/src/app_components/Pickers/VerticalPicker";
import { TestIDs } from "@/src/utils/constants";
import FilterItemsModal from "@/src/app_components/modals/filterItemsModal";
import { numberInputStyle } from "@/src/utils/algos";
import AlertModal from "@/src/app_components/modals/AlertModal";
import Icon from "react-native-vector-icons/Ionicons";

interface AddWorkoutItemProps {
  success: boolean;
  errorType: number;
  errorMsg: string;
}

const isArrayStringEmpty = (s: string) => stripArrStr(s) === "0";
const stripArrStr = (s: string) =>
  s.substring(1, s.length - 1).replaceAll(",", " ");

// ─── Sub-components ───────────────────────────────────────────────────────────

const FieldLabel: FunctionComponent<{ children: string }> = ({ children }) => (
  <TSCaptionText
    textStyles={{ fontSize: 10, opacity: 0.65, marginBottom: 3, marginLeft: 2 }}
  >
    {children}
  </TSCaptionText>
);

const NumericField: FunctionComponent<{
  label: string;
  value: string;
  placeholder: string;
  testID?: string;
  isError?: boolean;
  helperText?: string;
  onChange(t: string): void;
}> = ({ label, value, placeholder, testID, isError, helperText, onChange }) => {
  const theme = useTheme();
  return (
    <View style={{ flex: 1 }}>
      <FieldLabel>{label}</FieldLabel>
      <Input
        keyboardType="decimal-pad"
        containerStyle={[
          numberInputStyle.containerStyle,
          {
            backgroundColor: theme.palette.IP_TextInput_bg,
            borderRadius: 10,
            height: 44,
          },
        ]}
        label=""
        placeholder={placeholder}
        testID={testID}
        centerInput
        fontSize={tsInputSm}
        value={value}
        inputStyles={{ textAlign: "center" }}
        isError={isError}
        helperText={helperText}
        onChangeText={onChange}
      />
    </View>
  );
};

// Horizontal swipe unit picker with ‹ › visual affordance
const SwipeUnit: FunctionComponent<{
  label: string;
  data: string[];
  displayIndex: number;
  onChange(idx: number): void;
  testID?: string;
  flex?: number;
}> = ({ label, data, displayIndex, onChange, testID, flex = 1 }) => {
  const theme = useTheme();
  return (
    <View style={{ flex }}>
      <FieldLabel>{label}</FieldLabel>
      <View style={{ height: 44, position: "relative" }}>
        <VerticalPicker
          key={testID}
          itemDisplayIndex={displayIndex}
          data={data}
          testID={testID}
          onChange={onChange}
        />
        {/* Swipe affordance arrows — non-interactive overlay */}
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: 4,
            top: 0,
            bottom: 0,
            justifyContent: "center",
          }}
        >
          <Icon
            name="chevron-back-outline"
            size={11}
            color={`${theme.palette.lightGray}66`}
          />
        </View>
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            right: 4,
            top: 0,
            bottom: 0,
            justifyContent: "center",
          }}
        >
          <Icon
            name="chevron-forward-outline"
            size={11}
            color={`${theme.palette.lightGray}66`}
          />
        </View>
      </View>
    </View>
  );
};

// Segmented control for Reps / Duration / Distance
const SegControl: FunctionComponent<{
  options: string[];
  selectedIdx: number;
  onSelect(i: number): void;
  accentColor: string;
}> = ({ options, selectedIdx, onSelect, accentColor }) => {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: "row", gap: 6, marginBottom: 14 }}>
      {options.map((opt, i) => {
        const active = selectedIdx === i;
        return (
          <TouchableOpacity
            key={opt}
            onPress={() => onSelect(i)}
            activeOpacity={0.75}
            style={{
              flex: 1,
              paddingVertical: 8,
              borderRadius: 10,
              backgroundColor: active ? accentColor : theme.palette.backgroundColor,
              borderWidth: 1.5,
              borderColor: active ? accentColor : `${theme.palette.lightGray}28`,
              alignItems: "center",
            }}
          >
            <TSInputTextSm
              textStyles={{
                color: active
                  ? theme.palette.backgroundColor
                  : theme.palette.gray,
                fontWeight: active ? "700" : "400",
                fontSize: 12,
              }}
            >
              {opt}
            </TSInputTextSm>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const AddItem: FunctionComponent<{
  addWorkoutItem(
    item: WorkoutItemProps,
    shouldUpdateItem: boolean
  ): AddWorkoutItemProps;
  itemToUpdate: WorkoutDualItemProps | WorkoutItemProps | null;
  schemeType: number;
  workoutNames: WorkoutNameProps[];
  toggleUpdateHack: boolean;
  requestUpdate: (item: WorkoutItemProps | WorkoutDualItemProps | null) => void;
}> = (props) => {
  const initWorkoutName = 0;
  const initWeight = "";
  const initWeightUnit = "kg";
  const initPercentOfWeightUnit = "";
  const initSets = "";
  const initReps = "";
  const initPauseDuration = "";
  const initDistance = "";
  const initDistanceUnit = 0;
  const initDuration = "";
  const initDurationUnit = 0;
  const initRestDuration = "";
  const initRestDurationUnit = 0;

  useEffect(() => {
    if (!props.itemToUpdate || !workoutNamesMap) return resetDefaultItem();

    const updateRowOne = async () => {
      if (!props.itemToUpdate) return resetDefaultItem();
      setWorkoutName(workoutNamesMap.get(props.itemToUpdate.name.name) ?? 0);

      if (!isArrayStringEmpty(props.itemToUpdate.reps)) {
        setShowQuantity(() => 0);
      } else if (!isArrayStringEmpty(props.itemToUpdate.duration)) {
        setShowQuantity(() => 1);
      } else if (!isArrayStringEmpty(props.itemToUpdate.distance)) {
        setShowQuantity(() => 2);
      }
      setPauseDuration(props.itemToUpdate.pause_duration.toString());
    };

    const updateRowTwo = async () => {
      if (!props.itemToUpdate) return resetDefaultItem();
      setSets(props.itemToUpdate.sets.toString());
      setReps(stripArrStr(props.itemToUpdate.reps));
      setDistance(stripArrStr(props.itemToUpdate.distance));
      setDistanceUnit(props.itemToUpdate?.distance_unit ?? 0);
      setDuration(stripArrStr(props.itemToUpdate.duration));
      setDurationUnit(() => props.itemToUpdate?.duration_unit ?? 0);
      setWeight(stripArrStr(props.itemToUpdate.weights));
      setWeightUnit(props.itemToUpdate.weight_unit);
    };

    const updateRowThree = async () => {
      if (!props.itemToUpdate) return resetDefaultItem();
      setRestDuration(props.itemToUpdate.rest_duration.toString());
      setRestDurationUnit(props.itemToUpdate?.rest_duration_unit ?? 0);
      setPercentOfWeightUnit(props.itemToUpdate.percent_of);
      setCurrentItemUUID(props.itemToUpdate.uuid ?? "");
    };

    (async () => {
      await updateRowOne();
      setTimeout(async () => {
        await updateRowTwo();
        setTimeout(async () => {
          await updateRowThree();
        }, 1);
      }, 1);
    })()
      .then(() => console.log("Done init update item"))
      .catch((err) => console.log("error::: ", err));

    if ("penalty" in props.itemToUpdate) {
      setItemPenalty(props.itemToUpdate.penalty ?? "");
    }
  }, [props.itemToUpdate, props.toggleUpdateHack]);

  const theme = useTheme();
  const workoutNames = props.workoutNames as WorkoutNameProps[];

  const workoutNamesMap: Map<string, number> = workoutNames
    ? new Map<string, number>(
        workoutNames.map((workoutName, idx) => [workoutName.name, idx])
      )
    : new Map<string, number>();

  const [itemPenalty, setItemPenalty] = useState("");
  const [currentItemUUID, setCurrentItemUUID] = useState("");
  const [workoutName, setWorkoutName] = useState(initWorkoutName);

  const [weight, setWeight] = useState(initWeight);
  const [weightUnit, setWeightUnit] = useState(initWeightUnit);
  const [weightError, setWeightError] = useState("");
  const [showWeightAlertModal, setShowWeightAlertModal] = useState(false);

  const [percentOfWeightUnit, setPercentOfWeightUnit] = useState(
    initPercentOfWeightUnit
  );

  const [sets, setSets] = useState(initSets);
  const [reps, setReps] = useState(initReps);
  const [distance, setDistance] = useState(initDistance);
  const [pauseDuration, setPauseDuration] = useState(initPauseDuration);
  const [distanceUnit, setDistanceUnit] = useState(initDistanceUnit);

  const [duration, setDuration] = useState(initDuration);
  const [durationUnit, setDurationUnit] = useState(initDurationUnit);

  const [restDuration, setRestDuration] = useState(initRestDuration);
  const [restDurationUnit, setRestDurationUnit] = useState(initRestDurationUnit);
  const [showQuantity, setShowQuantity] = useState(0);
  const QuantityLabels = ["Reps", "Duration", "Distance"];

  const [repsSchemeRoundsError, setRepsSchemeRoundsError] = useState(false);
  const [repSchemeRoundsErrorText, setRepsSchemeRoundsErrorText] = useState("");

  const [showWorkoutNamesModal, setShowWorkoutNamesModal] = useState(false);

  const onNameSelect = (_workoutName: WorkoutNameProps) => {
    const name = workoutNamesMap.get(_workoutName.name);
    if (name != undefined) {
      setWorkoutName(name);
      setShowWorkoutNamesModal(false);
    }
  };

  const resetDefaultItem = () => {
    setWeight(initWeight);
    setDistance(initDistance);
    setPercentOfWeightUnit(initPercentOfWeightUnit);
    setSets(initSets);
    setReps(initReps);
    setPauseDuration(initPauseDuration);
    setDuration(initDuration);
    setRestDuration(initRestDuration);
    setItemPenalty("");
  };

  const _addItem = (updateItem: boolean = false) => {
    if (!workoutNames || workoutNames.length <= 0) return;

    let setsItem = nanOrNah(sets);
    let repsItem = reps;
    let durationItem = duration;
    let distanceItem = distance;

    if (setsItem === 0) setsItem = 1;
    if (repsItem.length === 0 || parseInt(repsItem) === 0) repsItem = "0";
    if (durationItem.length === 0 || parseInt(durationItem) === 0) durationItem = "0";
    if (distanceItem.length === 0 || parseInt(distanceItem) === 0) distanceItem = "0";

    if (QuantityLabels[showQuantity] == "Reps" && parseInt(repsItem) === 0) {
      repsItem = "1";
    } else if (QuantityLabels[showQuantity] == "Duration" && parseInt(durationItem) === 0) {
      durationItem = "1";
    } else if (QuantityLabels[showQuantity] == "Distance" && parseInt(distanceItem) === 0) {
      distanceItem = "1";
    }

    const item = {
      workout: props.itemToUpdate ? props.itemToUpdate.workout : 0,
      name: workoutNames[workoutName] as WorkoutNameProps,
      ssid: props.itemToUpdate ? props.itemToUpdate.ssid : -1,
      constant: props.itemToUpdate ? props.itemToUpdate.constant : false,
      pause_duration: nanOrNah(pauseDuration),
      sets: setsItem,
      reps: repsItem,
      duration: durationItem,
      distance: distanceItem,
      duration_unit: durationUnit,
      distance_unit: distanceUnit,
      weights: weight,
      weight_unit: weightUnit,
      rest_duration: nanOrNah(restDuration),
      rest_duration_unit: restDurationUnit,
      percent_of: percentOfWeightUnit,
      order: props.itemToUpdate ? props.itemToUpdate.order : -1,
      date: props.itemToUpdate ? props.itemToUpdate.date : "",
      id: props.itemToUpdate ? props.itemToUpdate.id : 0,
      uuid: currentItemUUID,
      penalty: itemPenalty,
    };

    const { success, errorType, errorMsg } = props.addWorkoutItem(item, updateItem);

    if (success) {
      resetDefaultItem();
    } else if (errorType == 0) {
      console.log("Add item error: ", errorMsg);
    } else if (errorType == 1) {
      setRepsSchemeRoundsError(true);
      setRepsSchemeRoundsErrorText(errorMsg);
    } else if (errorType == 3) {
      setWeightError(errorMsg);
      setShowWeightAlertModal(true);
    }
  };

  const isPausedItem =
    workoutNames && workoutNames.length > 0
      ? workoutNames[workoutName].name.match(/pause*/i)
      : false;

  const isEditing = !!props.itemToUpdate;
  const accentColor = isEditing ? theme.palette.AWE_Yellow : theme.palette.AWE_Green;
  const isStandard = WORKOUT_TYPES[props.schemeType] == STANDARD_W;

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <View
      style={{
        backgroundColor: theme.palette.darkGray,
        borderRadius: 16,
        padding: 14,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: isEditing
          ? `${theme.palette.AWE_Yellow}44`
          : `${theme.palette.lightGray}18`,
      }}
    >
      {/* ── Edit mode banner ──────────────────────────────────────────────── */}
      {isEditing && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: `${theme.palette.AWE_Yellow}18`,
            borderRadius: 8,
            paddingHorizontal: 10,
            paddingVertical: 6,
            marginBottom: 12,
          }}
        >
          <Icon
            name="create-outline"
            size={14}
            color={theme.palette.AWE_Yellow}
            style={{ marginRight: 6 }}
          />
          <XSmallText
            textStyles={{ color: theme.palette.AWE_Yellow, fontWeight: "700", fontSize: 11 }}
          >
            Editing: {props.itemToUpdate?.name?.name ?? "item"}
          </XSmallText>
        </View>
      )}

      {/* ── Exercise name selector ────────────────────────────────────────── */}
      <FieldLabel>Exercise</FieldLabel>
      {!showWorkoutNamesModal ? (
        <TouchableOpacity
          testID={TestIDs.AddItemChooseWorkoutNameField.name()}
          onPress={() => setShowWorkoutNamesModal(true)}
          activeOpacity={0.75}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: theme.palette.backgroundColor,
            borderRadius: 10,
            paddingHorizontal: 14,
            paddingVertical: 12,
            marginBottom: 14,
            borderWidth: 1.5,
            borderColor: `${accentColor}55`,
          }}
        >
          <TSInputTextSm
            textStyles={{ fontWeight: "700", fontSize: 14, flex: 1 }}
            numberOfLines={1}
          >
            {workoutNames?.[workoutName]?.name ?? "Select exercise…"}
          </TSInputTextSm>
          <Icon
            name="chevron-down"
            size={16}
            color={theme.palette.lightGray}
          />
        </TouchableOpacity>
      ) : (
        <FilterItemsModal
          key={"FilterWorkoutNames"}
          modalVisible={showWorkoutNamesModal}
          onRequestClose={() => setShowWorkoutNamesModal(false)}
          items={workoutNames}
          searchTextPlaceHolder="Search exercises"
          extraProps={{ onSelect: onNameSelect }}
        />
      )}

      {/* ── Quantity type segmented control ───────────────────────────────── */}
      <FieldLabel>Quantity type</FieldLabel>
      <SegControl
        options={QuantityLabels}
        selectedIdx={showQuantity}
        onSelect={(i) => setShowQuantity(i)}
        accentColor={accentColor}
      />

      {/* ── Metrics row ───────────────────────────────────────────────────── */}
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}>
        {/* Sets — only for STANDARD_W */}
        {isStandard && (
          <NumericField
            label="Sets"
            value={sets}
            placeholder="3"
            testID={TestIDs.AddItemSetsField.name()}
            onChange={(t) => setSets(numFilter(t))}
          />
        )}

        {/* Quantity value */}
        {showQuantity === 0 && (
          <NumericField
            label="Reps"
            value={reps}
            placeholder="10"
            testID={TestIDs.AddItemRepsField?.name()}
            isError={repsSchemeRoundsError}
            helperText={repSchemeRoundsErrorText}
            onChange={(t) => {
              if (repsSchemeRoundsError) {
                setRepsSchemeRoundsError(false);
                setRepsSchemeRoundsErrorText("");
              }
              if (
                WORKOUT_TYPES[props.schemeType] == STANDARD_W ||
                WORKOUT_TYPES[props.schemeType] == REPS_W ||
                WORKOUT_TYPES[props.schemeType] == CREATIVE_W
              ) {
                setReps(numFilter(t));
                setDistance(numFilter("0"));
                setDuration(numFilter("0"));
              } else {
                setReps(numFilterWithSpaces(t));
                setDistance(numFilterWithSpaces("0"));
                setDuration(numFilterWithSpaces("0"));
              }
            }}
          />
        )}

        {showQuantity === 1 && (
          <>
            <NumericField
              label="Duration"
              value={duration}
              placeholder="60"
              testID={TestIDs.AddItemDurationField.name()}
              onChange={(t) => {
                if (
                  WORKOUT_TYPES[props.schemeType] == STANDARD_W ||
                  WORKOUT_TYPES[props.schemeType] == REPS_W ||
                  WORKOUT_TYPES[props.schemeType] == CREATIVE_W
                ) {
                  setDuration(numFilter(t));
                  setReps(numFilter("0"));
                  setDistance(numFilter("0"));
                } else {
                  setDuration(numFilterWithSpaces(t));
                  setReps(numFilterWithSpaces("0"));
                  setDistance(numFilterWithSpaces("0"));
                }
              }}
            />
            <SwipeUnit
              label="Time unit"
              data={DURATION_UNITS}
              displayIndex={durationUnit}
              testID={TestIDs.VerticalPickerGestureHandlerDuration.name()}
              onChange={(i) => setDurationUnit(i)}
              flex={1}
            />
          </>
        )}

        {showQuantity === 2 && (
          <>
            <NumericField
              label="Distance"
              value={distance}
              placeholder="5"
              testID={TestIDs.AddItemDistanceField.name()}
              onChange={(t) => {
                if (
                  WORKOUT_TYPES[props.schemeType] == STANDARD_W ||
                  WORKOUT_TYPES[props.schemeType] == REPS_W ||
                  WORKOUT_TYPES[props.schemeType] == CREATIVE_W
                ) {
                  setDistance(numFilter(t));
                  setReps(numFilter("0"));
                  setDuration(numFilter("0"));
                } else {
                  setDistance(numFilterWithSpaces(t));
                  setReps(numFilterWithSpaces("0"));
                  setDuration(numFilterWithSpaces("0"));
                }
              }}
            />
            <SwipeUnit
              label="Distance unit"
              data={DISTANCE_UNITS}
              displayIndex={distanceUnit}
              testID={TestIDs.VerticalPickerGestureHandlerDistance.name()}
              onChange={(i) => {
                setPercentOfWeightUnit(initPercentOfWeightUnit);
                setDistanceUnit(i);
              }}
              flex={1}
            />
          </>
        )}
      </View>

      {/* ── Weight row ────────────────────────────────────────────────────── */}
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}>
        <NumericField
          label={`Weight (${weightUnit})`}
          value={weight}
          placeholder="100"
          testID={TestIDs.AddItemWeightField.name()}
          helperText={weightError}
          onChange={(t) => {
            if (weightError.length > 0) setWeightError("");
            if (
              WORKOUT_TYPES[props.schemeType] == STANDARD_W ||
              WORKOUT_TYPES[props.schemeType] == REPS_W ||
              WORKOUT_TYPES[props.schemeType] == ROUNDS_W
            ) {
              setWeight(numFilterWithSpaces(t));
            } else {
              setWeight(numFilter(t));
            }
          }}
        />
        <SwipeUnit
          label="Weight unit"
          data={WEIGHT_UNITS}
          displayIndex={WEIGHT_UNITS.indexOf(weightUnit)}
          testID={TestIDs.VerticalPickerGestureHandlerWtUnit.name()}
          onChange={(i) => {
            setPercentOfWeightUnit(initPercentOfWeightUnit);
            setWeightUnit(WEIGHT_UNITS[i]);
          }}
          flex={1}
        />

        {/* Pause field — only for pause-type exercises */}
        {isPausedItem && (
          <NumericField
            label="Pause (s)"
            value={pauseDuration}
            placeholder="3"
            testID={TestIDs.AddItemPauseDurField.name()}
            isError={repsSchemeRoundsError}
            helperText={repSchemeRoundsErrorText}
            onChange={(t) => setPauseDuration(numFilter(t))}
          />
        )}
      </View>

      {/* ── Rest row ──────────────────────────────────────────────────────── */}
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
        <NumericField
          label="Rest"
          value={restDuration}
          placeholder="60"
          testID={TestIDs.AddItemRestField.name()}
          onChange={(t) => setRestDuration(numFilter(t))}
        />
        <SwipeUnit
          label="Rest unit"
          data={DURATION_UNITS}
          displayIndex={restDurationUnit}
          testID={TestIDs.VerticalPickerGestureHandlerRestUnit.name()}
          onChange={(i) => setRestDurationUnit(i)}
          flex={1}
        />

        {/* % of field — only shown when weight unit is % */}
        {weightUnit === "%" && (
          <NumericField
            label="% of"
            value={percentOfWeightUnit}
            placeholder="1RM"
            testID={TestIDs.AddItemPercentOfField.name()}
            onChange={(t) => setPercentOfWeightUnit(t)}
          />
        )}
      </View>

      {/* ── Action buttons ────────────────────────────────────────────────── */}
      {isEditing ? (
        <View style={{ flexDirection: "row", gap: 10 }}>
          <TouchableOpacity
            onPress={() => props.requestUpdate(null)}
            activeOpacity={0.75}
            style={{
              flex: 1,
              paddingVertical: 13,
              borderRadius: 12,
              borderWidth: 1.5,
              borderColor: `${theme.palette.lightGray}40`,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
            }}
          >
            <Icon
              name="close-outline"
              size={16}
              color={theme.palette.gray}
              style={{ marginRight: 5 }}
            />
            <TSInputTextSm textStyles={{ color: theme.palette.gray, fontSize: 13 }}>
              Cancel
            </TSInputTextSm>
          </TouchableOpacity>

          <TouchableOpacity
            testID={TestIDs.CreateWorkoutAddItemBtn.name()}
            onPress={() => {
              _addItem(true);
              props.requestUpdate(null);
            }}
            activeOpacity={0.8}
            style={{
              flex: 2,
              paddingVertical: 13,
              borderRadius: 12,
              backgroundColor: theme.palette.AWE_Yellow,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
            }}
          >
            <Icon
              name="checkmark-outline"
              size={16}
              color={theme.palette.backgroundColor}
              style={{ marginRight: 5 }}
            />
            <TSInputTextSm
              textStyles={{
                color: theme.palette.backgroundColor,
                fontWeight: "700",
                fontSize: 13,
              }}
            >
              Update Item
            </TSInputTextSm>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          testID={TestIDs.CreateWorkoutAddItemBtn.name()}
          onPress={() => _addItem()}
          activeOpacity={0.8}
          style={{
            paddingVertical: 14,
            borderRadius: 12,
            backgroundColor: theme.palette.AWE_Green,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
          }}
        >
          <Icon
            name="add"
            size={18}
            color={theme.palette.backgroundColor}
            style={{ marginRight: 5 }}
          />
          <TSInputTextSm
            textStyles={{
              color: theme.palette.backgroundColor,
              fontWeight: "700",
              fontSize: 14,
            }}
          >
            Add Item
          </TSInputTextSm>
        </TouchableOpacity>
      )}

      <AlertModal
        bodyText={weightError}
        modalVisible={showWeightAlertModal}
        onRequestClose={() => setShowWeightAlertModal(false)}
        closeText="Close"
        key="AlertWeightErrorModal"
      />
    </View>
  );
};

export default AddItem;
