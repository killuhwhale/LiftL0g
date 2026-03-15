import React, { FunctionComponent, useState, useRef, useEffect } from "react";
import { View } from "react-native";
import { useTheme } from "styled-components/native";

import { TSCaptionText, TSInputTextSm } from "@/src/app_components/Text/Text";
import {
  Container,
  SCREEN_WIDTH,
  DURATION_UNITS,
  DISTANCE_UNITS,
  SCREEN_HEIGHT,
  WEIGHT_UNITS,
  WORKOUT_TYPES,
  STANDARD_W,
  ROUNDS_W,
  CREATIVE_W,
  REPS_W,
  nanOrNah,
  numFilter,
  numFilterWithSpaces,
  AddItemFontsize,
  lightenHexColor,
  tsInputSm,
} from "@/src/app_components/shared";
import { useGetWorkoutNamesQuery } from "@/src/redux/api/apiSlice";

import {
  WorkoutDualItemProps,
  WorkoutItemProps,
  WorkoutNameProps,
} from "@/src/app_components/Cards/types";

import Input from "@/src/app_components/Input/input";
import VerticalPicker from "@/src/app_components/Pickers/VerticalPicker";
import { RegularButton } from "@/src/app_components/Buttons/buttons";
import { TestIDs } from "@/src/utils/constants";
import FilterItemsModal from "@/src/app_components/modals/filterItemsModal";
import PickerFilterListView from "@/src/app_components/modals/pickerFilterListView";
import { numberInputStyle } from "@/src/utils/algos";
import AlertModal from "@/src/app_components/modals/AlertModal";
import LinearGradient from "react-native-linear-gradient";

interface AddWorkoutItemProps {
  success: boolean;
  errorType: number;
  errorMsg: string;
}

const isArrayStringEmpty = (s: string) => {
  return stripArrStr(s) === "0";
};

const stripArrStr = (s: string) => {
  return s.substring(1, s.length - 1).replaceAll(",", " ");
};

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
  // Need to have blank values, empty strings in the field instead of a default 0

  const initWorkoutName = 0; // index for Workout name from data query
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

  // TODO() Need to update vertical item picker to change its position with a useEffect.... weight_unit
  // TODO() Need to update horizontal item picker to change its position with a useEffect.... quanitity Type, distance_unit, duration_unit, rest_unit
  //  Need to change the Slider to display the correct unit type and also the underlying data variable that stores the value (already set with useEffect)...
  useEffect(() => {
    if (!props.itemToUpdate || !workoutNamesMap) return resetDefaultItem();

    const updateRowOne = async () => {
      console.log("AddItem useEffect: ", props.itemToUpdate);
      if (!props.itemToUpdate) return resetDefaultItem();

      setWorkoutName(workoutNamesMap.get(props.itemToUpdate.name.name) ?? 0); // get index from list props.itemToUpdate

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
      console.log(
        "Update distance unit to : ",
        props.itemToUpdate?.distance_unit
      );
      // Row 2
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

      // Row 3
      setRestDuration(props.itemToUpdate.rest_duration.toString());
      console.log(
        "Setting restDuration unit: ",
        props.itemToUpdate.rest_duration_unit
      );
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

  const pickerRef = useRef<any>();
  const [itemPenalty, setItemPenalty] = useState(""); // preserve item penalty when updating item

  const [currentItemUUID, setCurrentItemUUID] = useState("");
  const [workoutName, setWorkoutName] = useState(initWorkoutName);

  const [weight, setWeight] = useState(initWeight); // Json string list of numbers.
  const [weightUnit, setWeightUnit] = useState(initWeightUnit); // Json string list of numbers.
  const [weightError, setWeightError] = useState("");
  const [showWeightAlertModal, setShowWeightAlertModal] = useState(false);

  const [percentOfWeightUnit, setPercentOfWeightUnit] = useState(
    initPercentOfWeightUnit
  ); // Json string list of numbers.

  const [sets, setSets] = useState(initSets); // Need this for Standard workouts.
  // With schemeType Rounds, allow user to enter space delimited list of numbers that must match number of rounds...
  const [reps, setReps] = useState(initReps);
  const [distance, setDistance] = useState(initDistance);
  const [pauseDuration, setPauseDuration] = useState(initPauseDuration);
  const [distanceUnit, setDistanceUnit] = useState(initDistanceUnit);

  const [duration, setDuration] = useState(initDuration);
  const [durationUnit, setDurationUnit] = useState(initDurationUnit);

  // Rest should be an item. I can implement something to ensure rest is entered when the WorkoutItem is Rest...
  const [restDuration, setRestDuration] = useState(initRestDuration);
  const [restDurationUnit, setRestDurationUnit] =
    useState(initRestDurationUnit);
  const [showQuantity, setShowQuantity] = useState(0);
  const QuantityLabels = ["Reps", "Duration", "Distance"];

  const [repsSchemeRoundsError, setRepsSchemeRoundsError] = useState(false);
  const [repSchemeRoundsErrorText, setRepsSchemeRoundsErrorText] = useState("");

  const [showWorkoutNamesModal, setShowWorkoutNamesModal] = useState(false);

  // This NumberInput should vary depedning on the Scheme Type
  // For standard, this will be a single number,
  // For the other types, it should be a single number or match the length of scheme_rounds list
  // Example SchemeType Reps: 21,15,9
  // item Squat weights 200lbs, 100lbs, 50lbs,  ==> this means we do 200 lbs on the first round, 100 on the seocnd, etc...

  const onNameSelect = (_workoutName: WorkoutNameProps) => {
    const name = workoutNamesMap.get(_workoutName.name);
    if (name != undefined) {
      setWorkoutName(name);
      setShowWorkoutNamesModal(false);
    }
  };

  const resetDefaultItem = () => {
    console.log("Resetting item");

    setWeight(initWeight);
    setDistance(initDistance);
    setPercentOfWeightUnit(initPercentOfWeightUnit);
    setSets(initSets);
    setReps(initReps);
    setPauseDuration(initPauseDuration);
    setDuration(initDuration);
    setRestDuration(initRestDuration);
    setItemPenalty("");
    // setRestDurationUnit(initRestDurationUnit);
  };

  const _addItem = (updateItem: boolean = false) => {
    if (!workoutNames || workoutNames.length <= 0) {
      console.log("Error, no workout names to add to item.");
      return;
    }

    let setsItem = nanOrNah(sets);
    let repsItem = reps;
    let durationItem = duration;
    let distanceItem = distance;

    // sets: nanOrNah(sets),
    // reps: reps.length == 0 ? '0' : reps,
    // duration: distance.length == 0 ? '0' : distance,
    // distance: distance.length == 0 ? '0' : distance,

    // Enforce default values per workout type.
    if (setsItem === 0) {
      setsItem = 1; // ensure there is at least 1 set.
    }
    if (repsItem.length === 0 || parseInt(repsItem) === 0) {
      repsItem = "0";
    }
    if (durationItem.length === 0 || parseInt(durationItem) === 0) {
      durationItem = "0";
    }
    if (distanceItem.length === 0 || parseInt(distanceItem) === 0) {
      distanceItem = "0";
    }

    if (QuantityLabels[showQuantity] == "Reps" && parseInt(repsItem) === 0) {
      repsItem = "1";
    } else if (
      QuantityLabels[showQuantity] == "Duration" &&
      parseInt(durationItem) === 0
    ) {
      durationItem = "1";
    } else if (
      QuantityLabels[showQuantity] == "Distance" &&
      parseInt(distanceItem) === 0
    ) {
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
    console.log("Adding item: ", item);

    // // Checks if reps and weights match the repScheme
    const { success, errorType, errorMsg } = props.addWorkoutItem(
      item,
      updateItem
    );

    if (success) {
      resetDefaultItem();
    } else if (errorType == 0) {
      // Missing Reps in Scheme, parent should highlight SchemeRounds Input
      console.log("Add item error: ", errorMsg);
    } else if (errorType == 1) {
      // Item reps do not match Reps in Scheme
      console.log("Add item error: ", errorMsg);
      setRepsSchemeRoundsError(true);
      setRepsSchemeRoundsErrorText(errorMsg);
    } else if (errorType == 3) {
      // Invalid Weights
      setWeightError(errorMsg);
      setShowWeightAlertModal(true);
    }
  };

  const isPausedItem =
    workoutNames && workoutNames.length > 0
      ? workoutNames[workoutName].name.match(/pause*/i)
      : false;

  return (
    <View style={{ height: SCREEN_HEIGHT * 0.2412 }}>
      <View
        style={{
          flex: 1,
          borderColor: "white",
          borderWidth: 1.5,
          padding: 2,
        }}
      >
        {/* Row 1 */}
        <View style={{ flex: 1, flexDirection: "row" }}>
          {workoutNames ? (
            <View
              style={{ justifyContent: "flex-start", flex: 4, height: "100%" }}
            >
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                }}
              >
                <View style={{ flex: 4 }}>
                  <TSCaptionText
                    textStyles={{
                      textAlign: "center",
                      backgroundColor: theme.palette.IP_Label_bg,
                    }}
                  >
                    Workout Items
                  </TSCaptionText>
                  <View
                    style={{ flex: 1, width: "100%", justifyContent: "center" }}
                  >
                    {!showWorkoutNamesModal ? (
                      <RegularButton
                        text={
                          workoutNames[workoutName]?.name ??
                          "No workout name found"
                        }
                        btnStyles={{
                          backgroundColor: theme.palette.IP_Clickable_bg,
                        }}
                        testID={TestIDs.AddItemChooseWorkoutNameField.name()}
                        onPress={() => setShowWorkoutNamesModal(true)}
                      />
                    ) : (
                      <FilterItemsModal
                        key={"FilterWorkoutNames"}
                        modalVisible={showWorkoutNamesModal}
                        onRequestClose={() => {
                          setShowWorkoutNamesModal(!showWorkoutNamesModal);
                        }}
                        items={workoutNames}
                        searchTextPlaceHolder="Search"
                        extraProps={{
                          onSelect: onNameSelect,
                        }}
                        uiView={PickerFilterListView}
                      />
                    )}
                  </View>
                </View>

                {isPausedItem ? (
                  <View style={{ flex: 1 }}>
                    <TSCaptionText
                      textStyles={{
                        textAlign: "center",
                        backgroundColor: theme.palette.IP_Label_bg,
                      }}
                    >
                      Paused
                    </TSCaptionText>
                    <View
                      style={{
                        flex: 1,
                        backgroundColor: theme.palette.backgroundColor,
                      }}
                    >
                      <Input
                        containerStyle={[
                          numberInputStyle.containerStyle,
                          {
                            alignItems: "center",
                            borderRightWidth: 1,
                            borderColor: theme.palette.text,
                          },
                        ]}
                        testID={TestIDs.AddItemPauseDurField.name()}
                        label=""
                        placeholder="time"
                        centerInput
                        keyboardType="decimal-pad"
                        fontSize={tsInputSm}
                        value={pauseDuration}
                        inputStyles={{ textAlign: "center" }}
                        isError={repsSchemeRoundsError}
                        helperText={repSchemeRoundsErrorText}
                        onChangeText={(text: string) => {
                          setPauseDuration(numFilter(text));
                        }}
                      />
                    </View>
                  </View>
                ) : (
                  <></>
                )}
              </View>
            </View>
          ) : (
            <></>
          )}

          <View style={{ flex: 2 }}>
            <TSCaptionText
              textStyles={{
                textAlign: "center",
                backgroundColor: theme.palette.IP_Label_bg,
              }}
            >
              Quantity type
            </TSCaptionText>
            <View
              style={{
                flex: 1,
                width: "100%",
              }}
            >
              {/* // TODO  Update Vertical Picker to update itself programmatically  */}

              <VerticalPicker
                key={"qty"}
                itemDisplayIndex={showQuantity}
                data={QuantityLabels}
                testID={TestIDs.VerticalPickerGestureHandlerQtyType.name()}
                onChange={(itemIndex) => {
                  const itemValue = QuantityLabels[itemIndex];
                  // setDistance(initDistance);
                  // setDuration(initDuration);
                  // setReps(initReps);
                  // updateItem('distance', nanOrNah(initDistance))
                  // updateItem('duration', nanOrNah(initDuration))
                  // updateItem('reps', nanOrNah(initReps))
                  setShowQuantity(itemIndex);
                }}
              />
            </View>
          </View>
        </View>

        {/* Row 2 */}
        <View style={{ flexDirection: "row", flex: 1 }}>
          {props.schemeType == 0 ? (
            <View style={{ flex: 1 }}>
              <TSCaptionText
                textStyles={{
                  textAlign: "center",
                  backgroundColor: theme.palette.IP_Label_bg,
                }}
              >
                Sets
              </TSCaptionText>
              <Input
                keyboardType="decimal-pad"
                containerStyle={[
                  numberInputStyle.containerStyle,
                  {
                    backgroundColor: theme.palette.IP_TextInput_bg,
                    borderRightWidth: 1,
                    borderColor: theme.palette.text,
                  },
                ]}
                label=""
                testID={TestIDs.AddItemSetsField.name()}
                placeholder="Sets"
                centerInput={true}
                fontSize={tsInputSm}
                value={sets}
                inputStyles={{ textAlign: "center" }}
                onChangeText={(text: string) => {
                  setSets(numFilter(text));
                }}
              />
            </View>
          ) : (
            <></>
          )}

          <View style={{ alignContent: "center", flex: 3 }}>
            {showQuantity == 0 ? (
              <View style={{ flex: 1 }}>
                <TSCaptionText
                  textStyles={{
                    textAlign: "center",
                    backgroundColor: theme.palette.IP_Label_bg,
                  }}
                >
                  Reps
                </TSCaptionText>
                <Input
                  keyboardType="decimal-pad"
                  containerStyle={[
                    numberInputStyle.containerStyle,
                    {
                      backgroundColor: theme.palette.IP_TextInput_bg,
                      alignItems: "center",
                      borderRightWidth: 1,
                      borderColor: theme.palette.text,
                    },
                  ]}
                  label=""
                  testID={TestIDs.AddItemRepsField?.name()}
                  placeholder="Reps"
                  centerInput
                  fontSize={tsInputSm}
                  value={reps}
                  inputStyles={{ textAlign: "center" }}
                  isError={repsSchemeRoundsError}
                  helperText={repSchemeRoundsErrorText}
                  onChangeText={(text: string) => {
                    if (repsSchemeRoundsError) {
                      setRepsSchemeRoundsError(false);
                      setRepsSchemeRoundsErrorText("");
                    }

                    // When we update this field, reps,
                    // We should also reset duration and distance...
                    if (
                      WORKOUT_TYPES[props.schemeType] == STANDARD_W ||
                      WORKOUT_TYPES[props.schemeType] == REPS_W ||
                      WORKOUT_TYPES[props.schemeType] == CREATIVE_W
                    ) {
                      setReps(numFilter(text));
                      setDistance(numFilter("0"));
                      setDuration(numFilter("0"));
                    } else {
                      setReps(numFilterWithSpaces(text));
                      setDistance(numFilterWithSpaces("0"));
                      setDuration(numFilterWithSpaces("0"));
                    }
                  }}
                />
              </View>
            ) : showQuantity == 1 ? (
              <View style={{ flex: 1 }}>
                <TSCaptionText
                  textStyles={{
                    textAlign: "center",
                    backgroundColor: theme.palette.IP_Label_bg,
                  }}
                >
                  Duration
                </TSCaptionText>
                <View style={{ flexDirection: "row", width: "100%", flex: 1 }}>
                  <View style={{ flex: 1 }}>
                    <Input
                      keyboardType="decimal-pad"
                      containerStyle={[
                        numberInputStyle.containerStyle,
                        {
                          backgroundColor: theme.palette.IP_TextInput_bg,
                        },
                      ]}
                      label=""
                      placeholder="Duration"
                      testID={TestIDs.AddItemDurationField.name()}
                      centerInput={true}
                      fontSize={tsInputSm}
                      value={duration}
                      inputStyles={{ textAlign: "center" }}
                      onChangeText={(t) => {
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
                  </View>
                  <View style={{ flex: 1 }}>
                    <View
                      style={{
                        flex: 1,
                        width: "100%",
                      }}
                    >
                      <VerticalPicker
                        itemDisplayIndex={durationUnit}
                        key={"dur"}
                        data={DURATION_UNITS}
                        testID={TestIDs.VerticalPickerGestureHandlerDuration.name()}
                        onChange={(itemIndex) => {
                          const itemValue = DURATION_UNITS[itemIndex];
                          setDurationUnit(itemIndex);
                        }}
                      />
                    </View>
                  </View>
                </View>
              </View>
            ) : (
              <View style={{ flex: 1 }}>
                <TSCaptionText
                  textStyles={{
                    textAlign: "center",
                    backgroundColor: theme.palette.IP_Label_bg,
                  }}
                >
                  Distance
                </TSCaptionText>
                <View style={{ flexDirection: "row", width: "100%", flex: 1 }}>
                  <View style={{ flex: 1 }}>
                    <Input
                      keyboardType="decimal-pad"
                      containerStyle={[
                        numberInputStyle.containerStyle,
                        {
                          backgroundColor: theme.palette.IP_TextInput_bg,
                        },
                      ]}
                      label=""
                      placeholder="Distance"
                      testID={TestIDs.AddItemDistanceField.name()}
                      centerInput={true}
                      fontSize={tsInputSm}
                      value={distance}
                      inputStyles={{ textAlign: "center" }}
                      onChangeText={(t: string) => {
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
                  </View>
                  <View style={{ flex: 1 }}>
                    <View
                      style={{
                        flex: 1,
                        width: "100%",
                      }}
                    >
                      <VerticalPicker
                        key={"dist"}
                        itemDisplayIndex={distanceUnit}
                        data={DISTANCE_UNITS}
                        testID={TestIDs.VerticalPickerGestureHandlerDistance.name()}
                        onChange={(itemIndex) => {
                          const itemValue = DISTANCE_UNITS[itemIndex];
                          setPercentOfWeightUnit(initPercentOfWeightUnit);
                          setDistanceUnit(itemIndex);
                        }}
                      />
                    </View>
                  </View>
                </View>
              </View>
            )}
          </View>

          <View
            style={{
              flex: 3,
            }}
          >
            <TSCaptionText
              textStyles={{
                textAlign: "center",
                backgroundColor: theme.palette.IP_Label_bg,
              }}
            >
              Weights {weightUnit}
            </TSCaptionText>

            <View
              style={{
                flexDirection: "row",
                flex: 1,
              }}
            >
              <View style={{ flex: 3 }}>
                <Input
                  keyboardType="decimal-pad"
                  containerStyle={[
                    numberInputStyle.containerStyle,
                    {
                      backgroundColor: theme.palette.IP_TextInput_bg,
                    },
                  ]}
                  label=""
                  placeholder="Weight(s)"
                  testID={TestIDs.AddItemWeightField.name()}
                  centerInput={true}
                  fontSize={tsInputSm}
                  value={weight}
                  // isError={weightError.length > 0}
                  helperText={weightError}
                  inputStyles={{ textAlign: "center" }}
                  onChangeText={(t) => {
                    if (
                      WORKOUT_TYPES[props.schemeType] == STANDARD_W ||
                      WORKOUT_TYPES[props.schemeType] == REPS_W ||
                      WORKOUT_TYPES[props.schemeType] == ROUNDS_W
                    ) {
                      if (weightError.length > 0) {
                        setWeightError("");
                      }
                      setWeight(numFilterWithSpaces(t));
                    } else {
                      setWeight(numFilter(t));
                    }
                  }}
                />
              </View>

              <View
                style={{
                  flex: 1,
                }}
              >
                <VerticalPicker
                  key={"wts"}
                  itemDisplayIndex={WEIGHT_UNITS.indexOf(weightUnit)}
                  data={WEIGHT_UNITS}
                  testID={TestIDs.VerticalPickerGestureHandlerWtUnit.name()}
                  onChange={(itemIndex) => {
                    const itemValue = WEIGHT_UNITS[itemIndex];
                    setPercentOfWeightUnit(initPercentOfWeightUnit);
                    setWeightUnit(itemValue);
                  }}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Row 3 */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            flex: 1,
          }}
        >
          {weightUnit === "%" ? (
            <View style={{ flex: 1 }}>
              <TSCaptionText
                textStyles={{
                  textAlign: "center",
                  backgroundColor: theme.palette.IP_Label_bg,
                }}
              >
                % of
              </TSCaptionText>
              <Input
                containerStyle={[
                  numberInputStyle.containerStyle,
                  {
                    backgroundColor: theme.palette.IP_TextInput_bg,
                    borderRightWidth: 1,
                    borderColor: theme.palette.text,
                  },
                ]}
                label=""
                placeholder="% of"
                testID={TestIDs.AddItemPercentOfField.name()}
                centerInput={true}
                fontSize={tsInputSm}
                value={percentOfWeightUnit}
                inputStyles={{ textAlign: "center" }}
                onChangeText={(t) => {
                  setPercentOfWeightUnit(t);
                }}
              />
            </View>
          ) : (
            <></>
          )}
          <View style={{ flex: 1 }}>
            <TSCaptionText
              textStyles={{
                textAlign: "center",
                backgroundColor: theme.palette.IP_Label_bg,
              }}
            >
              Rest
            </TSCaptionText>
            <View style={{ flex: 1, flexDirection: "row" }}>
              <View style={{ flex: 1 }}>
                <Input
                  keyboardType="decimal-pad"
                  containerStyle={[
                    numberInputStyle.containerStyle,
                    {
                      backgroundColor: theme.palette.IP_TextInput_bg,
                    },
                  ]}
                  label=""
                  placeholder="Rest"
                  testID={TestIDs.AddItemRestField.name()}
                  centerInput={true}
                  fontSize={tsInputSm}
                  value={restDuration}
                  inputStyles={{ textAlign: "center" }}
                  onChangeText={(t) => {
                    setRestDuration(numFilter(t));
                  }}
                />
              </View>
              <View
                style={{
                  flex: weightUnit === "%" ? 2 : 1,
                }}
              >
                <VerticalPicker
                  key={"rest"}
                  itemDisplayIndex={restDurationUnit}
                  data={DURATION_UNITS}
                  testID={TestIDs.VerticalPickerGestureHandlerRestUnit.name()}
                  onChange={(itemIndex) => {
                    const itemValue = DURATION_UNITS[itemIndex];
                    setRestDurationUnit(itemIndex);
                  }}
                />
              </View>
            </View>
          </View>
        </View>

        <View style={{ flex: 1, width: "100%", justifyContent: "center" }}>
          {props.itemToUpdate ? (
            <View
              style={{
                flexDirection: "row",
                height: "100%",
              }}
            >
              <View style={{ flex: 1, justifyContent: "center" }}>
                <RegularButton
                  onPress={() => props.requestUpdate(null)}
                  testID={TestIDs.CreateWorkoutAddItemBtn.name()}
                  btnStyles={{
                    backgroundColor: theme.palette.darkGray,
                  }}
                  text="Clear"
                />
              </View>

              <View style={{ flex: 1, justifyContent: "center" }}>
                <RegularButton
                  onPress={() => {
                    _addItem(true);
                    props.requestUpdate(null);
                  }}
                  testID={TestIDs.CreateWorkoutAddItemBtn.name()}
                  btnStyles={{
                    backgroundColor: theme.palette.darkGray,
                  }}
                  text="Update"
                />
              </View>
            </View>
          ) : (
            <LinearGradient
              colors={[
                theme.palette.AWE_Green,
                theme.palette.primary.main,
                theme.palette.AWE_Green,
              ]} // Bright on ends, dark in the middle
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              locations={[0, 0.5, 1]} // Middle color at 50% of the gradient
              style={{ borderRadius: 8 }}
            >
              <RegularButton
                onPress={() => _addItem()}
                testID={TestIDs.CreateWorkoutAddItemBtn.name()}
                btnStyles={{
                  backgroundColor: theme.palette.transparent,
                  borderColor: "#ffffff",
                  borderWidth: 1,
                }}
                text="Add Item"
              />
            </LinearGradient>
          )}
        </View>
      </View>
      <AlertModal
        bodyText={weightError}
        modalVisible={showWeightAlertModal}
        onRequestClose={() => setShowWeightAlertModal(false)}
        closeText="Close"
        key={`AlertWeightErrorModal`}
      />
    </View>
  );
};

export default AddItem;
