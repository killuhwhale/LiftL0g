import React, { FunctionComponent, useEffect, useState } from "react";
import { TSParagrapghText, TSCaptionText, TSSnippetText } from "../Text/Text";

import { Modal, ScrollView, View } from "react-native";

import { useTheme } from "styled-components/native";
import { RegularButton } from "../Buttons/buttons";

import { jList, jsonCopy, lightenHexColor, mdFontSize } from "../shared";
import { centeredViewStyle, modalViewStyle } from "./modalStyles";
import {
  WorkoutCardProps,
  WorkoutDualItemProps,
  WorkoutGroupProps,
} from "../Cards/types";
import ItemString from "../WorkoutItems/ItemString";

import {
  useFinishWorkoutGroupMutation,
  useRecordWorkoutDualItemsMutation,
} from "@/src/redux/api/apiSlice";
import EditWorkoutDualItem from "@/app/input_pages/gyms/workoutScreen/EditWorkoutDualItem";

// If these keys are not empty, we need to show them to the user to fill in, witht he correct fields for each unit, i.e. distance -> distance_unit field
const itemDescKeys = [
  "reps",
  "pause_duration",
  "duration",
  "distance",
  // 'weights', // we will render weight no matter what since its possible somone added weights to their workout.
  "rest_duration",
];

const isItemFieldEmpty = (key: string, value: any) => {
  switch (key) {
    case "reps":
    case "duration":
    case "distance":
      return JSON.parse(value)[0] == 0;
    case "pause_duration":
    case "rest_duration":
      // return value == 0; // we will skip this for now...
      return true;
    case "percent_of":
      return value == "";
  }
};

const isRecordedItemFieldEmpty = (key: string, value: any) => {
  switch (key) {
    case "r_reps":
    case "r_duration":
    case "r_distance":
      console.log("isRecordedItemFieldEmpty", key, JSON.parse(value)[0]);
      return JSON.parse(value)[0] == 0;
    case "r_pause_duration":
    case "r_rest_duration":
      return value == 0;
    case "r_percent_of":
      return value == "";
  }
};

const hasFieldToRecord = (item: WorkoutDualItemProps) => {
  // if we have an item with a firled that isnt empty we should give to to EditDualItem
  return itemDescKeys
    .map((key) => {
      return !isItemFieldEmpty(key, item[key]);
    })
    .includes(true);
};

const DualItemUpdateFields: FunctionComponent<{
  item: WorkoutDualItemProps;
  workoutIdx: number;
  itemIdx: number;
  schemeType: number;

  editDualItem(
    workoutIdx: number,
    itemIdx: number,
    key: string,
    value: string | number
  ): { success: boolean; errorType: number; errorMsg: string };
}> = ({ item, workoutIdx, itemIdx, schemeType, editDualItem }) => {
  const _hasFieldToRecord = hasFieldToRecord(item);
  console.log("_hasFieldToRecord: ", _hasFieldToRecord);
  return (
    <View style={{ flex: 1 }}>
      {_hasFieldToRecord ? (
        <EditWorkoutDualItem
          editDualItem={editDualItem}
          itemIdx={itemIdx}
          workoutIdx={workoutIdx}
          schemeType={schemeType}
          workoutItem={item}
          key={`${item.id}_${item.order}_editdualitem`}
        />
      ) : (
        <TSCaptionText>tststs</TSCaptionText>
      )}
    </View>
  );
};

const FinishDualWorkoutItems: FunctionComponent<{
  modalVisible: boolean;
  onRequestClose(): void;
  closeText: string;
  bodyText: string;
  workoutGroup: WorkoutGroupProps;
  setShowFinishWorkoutGroupModal(show: boolean): void;
}> = ({
  modalVisible,
  onRequestClose,
  closeText,
  bodyText,
  workoutGroup,
  setShowFinishWorkoutGroupModal,
}) => {
  const theme = useTheme();
  let initGroup = jsonCopy(workoutGroup) as WorkoutGroupProps;

  const [editedWorkoutGroup, setEditedWorkoutGroup] =
    useState<WorkoutGroupProps>(initGroup);

  const [recordWorkout, isUpdateLoading] = useRecordWorkoutDualItemsMutation();

  useEffect(() => {
    // Our copy of initGroup does not have data on first render since we are fetching from API. onces its ready, fill it
    // if (
    //   (Object.keys(editedWorkoutGroup).length === 0 &&
    //     Object.keys(workoutGroup).length !== 0) ||
    //   editedWorkoutGroup.workouts?.length != initGroup.workouts?.length
    // ) {
    // }
    setEditedWorkoutGroup(jsonCopy(workoutGroup));
  }, [workoutGroup]);

  const editDualItem = (
    workoutIdx,
    itemIdx,
    key,
    value
  ): { success: boolean; errorType: number; errorMsg: string } => {
    const newWorkoutGroup = jsonCopy(editedWorkoutGroup) as WorkoutGroupProps;
    if (
      !newWorkoutGroup.workouts ||
      workoutIdx >= newWorkoutGroup.workouts.length
    ) {
      console.log("Err dualitem: ", "Workouts not found");
      return { success: false, errorType: 11, errorMsg: "Workouts not found" };
    }

    const workout = newWorkoutGroup.workouts[workoutIdx];
    if (!workout.workout_items || itemIdx >= workout.workout_items.length) {
      console.log("Err dualitem: ", "Workout items not found");
      return {
        success: false,
        errorType: 10,
        errorMsg: "Workout items not found",
      };
    }

    const item = workout.workout_items[itemIdx];
    console.log("Settings key", `r_${key}`, value, item);
    if (
      [
        "sets",
        "weight_unit",
        "percent_of",
        "duration_unit",
        "distance_unit",
      ].indexOf(key) >= 0
    ) {
      item[`r_${key}`] = value;
    } else {
      item[`r_${key}`] = jList(value);
    }

    setEditedWorkoutGroup(jsonCopy(newWorkoutGroup));

    return {
      success: true,
      errorType: -1,
      errorMsg: "",
    };
  };

  const [finishWorkoutGroup, isLoading] = useFinishWorkoutGroupMutation();
  const submitFinalWorkoutDualItems = () => {
    const promises: Promise<any>[] =
      editedWorkoutGroup.workouts
        ?.filter((workout: WorkoutCardProps) => {
          return workout.scheme_type > 2;
        })
        .map((workout: WorkoutCardProps) => {
          const data = new FormData();
          data.append("workout", workout.id);
          // If the user just submits the form without updating the values, we need to push the default values from reps, duration, distance to r_reps, etc...
          const updatedItems = workout.workout_items?.map(
            (_item: WorkoutDualItemProps, idx: number) => {
              const item = { ..._item };
              console.log("Pre item: ", item);

              // keys that have values fields provided by the workout, reps, weights, etc
              const keys = itemDescKeys.filter((key: string) => {
                return !isItemFieldEmpty(key, item[key]);
              });
              console.log("Item has these fields to fill out: ", keys);

              keys.forEach((key: string) => {
                const rKey = `r_${key}`;
                if (isRecordedItemFieldEmpty(rKey, item[rKey])) {
                  item[rKey] = item[key]; // when recorded field is empty, update it with the instructed field aka default
                }
              });
              console.log("Post item: ", item);
              return item;
            }
          );
          data.append("items", JSON.stringify(updatedItems));

          // console.log('Updating: ', updatedItems);
          return recordWorkout(data);
        }) ?? [];

    Promise.all(promises)
      .then((results) => {
        results.forEach(async (res) => {
          // console.log('Update res: ', res);
          if (res.data) {
            // console.log('Update success: ', res);
            // Send Finish Workout request

            try {
              const data = new FormData();
              data.append("group", editedWorkoutGroup.id);
              const res = await finishWorkoutGroup(data).unwrap();
              console.log("res finsih", res);

              // Close Modal
              onRequestClose();
              // Close Modal
              setShowFinishWorkoutGroupModal(false);
            } catch (err) {
              console.log("Error finishing workout", err);
            }
          } else if (res.err_type > 0 || res.detail) {
            console.log("Err with update: ", res);
          }
        });
      })
      .catch((err) => {});
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={onRequestClose}
    >
      <View style={centeredViewStyle.centeredView}>
        <View
          style={{
            ...modalViewStyle.modalView,
            backgroundColor: theme.palette.darkGray,
            height: "90%",
            zIndex: 100,
          }}
        >
          <View
            style={{ height: "100%", flex: 1, justifyContent: "space-between" }}
          >
            <View style={{ marginTop: 35, marginBottom: 42 }}>
              <TSParagrapghText>
                Creative workouts prescribe (Rx'd) a certain amount of work, the
                amount work completed in these workouts vary.{" "}
              </TSParagrapghText>
              <TSSnippetText
                textStyles={{
                  textAlign: "center",
                  marginTop: 8,
                  fontSize: 18,
                  color: lightenHexColor(theme.palette.primary.main, 1.95),
                }}
              >
                How many reps did you finish?
              </TSSnippetText>
            </View>
            <ScrollView style={{ flex: 1, width: "100%" }}>
              {editedWorkoutGroup.workouts?.map(
                (workout: WorkoutCardProps, workoutIdx: number) => {
                  const containsDualItems = workout.scheme_type > 2;
                  return (
                    <View key={`${workout.id}_${workout.title}_recordWorkout`}>
                      {containsDualItems ? (
                        <>
                          <TSSnippetText
                            textStyles={{ color: theme.palette.AWE_Green }}
                          >
                            Workout Title:{" "}
                            <TSCaptionText>{workout.title}</TSCaptionText>
                          </TSSnippetText>
                          <TSSnippetText
                            textStyles={{ color: theme.palette.AWE_Blue }}
                          >
                            Instructions:{" "}
                            <TSCaptionText>{workout.instruction}</TSCaptionText>
                          </TSSnippetText>
                          {workout.workout_items?.map((item, itemIdx) => {
                            return (
                              <View
                                key={`${item.id}_${item.order}_itemToUpdate`}
                                style={{
                                  borderWidth: 1,
                                  borderColor: theme.palette.AWE_Yellow,
                                  borderRadius: 8,
                                  marginVertical: 6,
                                }}
                              >
                                <View style={{ padding: 4 }}>
                                  <ItemString
                                    item={item}
                                    schemeType={workout.scheme_type}
                                    key={`${item.id}_dualitemfinish`}
                                    prefix="Rx'd: "
                                    inclPenalty={false}
                                  />
                                </View>

                                <DualItemUpdateFields
                                  item={item}
                                  itemIdx={itemIdx}
                                  schemeType={workout.scheme_type}
                                  workoutIdx={workoutIdx}
                                  editDualItem={editDualItem}
                                  key={`${item.id}_dualitemedits`}
                                />
                              </View>
                            );
                          })}
                        </>
                      ) : (
                        // <TSCaptionText>Not a dually - {workout.title}</TSCaptionText>
                        <></>
                      )}
                    </View>
                  );
                }
              )}
            </ScrollView>
            <View
              style={{ flexDirection: "row", justifyContent: "space-around" }}
            >
              <RegularButton
                onPress={() => {
                  onRequestClose();
                }}
                btnStyles={{
                  backgroundColor: theme.palette.AWE_Red,
                  paddingVertical: 6,
                  paddingHorizontal: 24,
                  width: "33%",
                }}
                text="Close"
              />
              <RegularButton
                onPress={() => {
                  submitFinalWorkoutDualItems();
                  // onRequestClose();
                }}
                btnStyles={{
                  backgroundColor: theme.palette.AWE_Green,
                  paddingVertical: 6,
                  paddingHorizontal: 24,
                  width: "33%",
                }}
                text="Finish"
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default FinishDualWorkoutItems;
