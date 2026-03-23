import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { TSCaptionText, TSSnippetText } from "../Text/Text";
import { View, Pressable } from "react-native";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useTheme } from "styled-components/native";
import { jList, jsonCopy, lightenHexColor, mdFontSize } from "../shared";
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
import Icon from "react-native-vector-icons/Ionicons";

const itemDescKeys = [
  "reps",
  "pause_duration",
  "duration",
  "distance",
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
      return JSON.parse(value)[0] == 0;
    case "r_pause_duration":
    case "r_rest_duration":
      return value == 0;
    case "r_percent_of":
      return value == "";
  }
};

const hasFieldToRecord = (item: WorkoutDualItemProps) => {
  return itemDescKeys
    .map((key) => !isItemFieldEmpty(key, item[key]))
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
  const sheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["92%"], []);

  let initGroup = jsonCopy(workoutGroup) as WorkoutGroupProps;
  const [editedWorkoutGroup, setEditedWorkoutGroup] =
    useState<WorkoutGroupProps>(initGroup);

  const [recordWorkout] = useRecordWorkoutDualItemsMutation();
  const [finishWorkoutGroup] = useFinishWorkoutGroupMutation();

  useEffect(() => {
    if (modalVisible) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
    }
  }, [modalVisible]);

  useEffect(() => {
    setEditedWorkoutGroup(jsonCopy(workoutGroup));
  }, [workoutGroup]);

  const renderBackdrop = useCallback(
    (backdropProps: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...backdropProps}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.55}
        pressBehavior="close"
      />
    ),
    []
  );

  const editDualItem = (
    workoutIdx: number,
    itemIdx: number,
    key: string,
    value: string | number
  ): { success: boolean; errorType: number; errorMsg: string } => {
    const newWorkoutGroup = jsonCopy(editedWorkoutGroup) as WorkoutGroupProps;
    if (
      !newWorkoutGroup.workouts ||
      workoutIdx >= newWorkoutGroup.workouts.length
    ) {
      return { success: false, errorType: 11, errorMsg: "Workouts not found" };
    }

    const workout = newWorkoutGroup.workouts[workoutIdx];
    if (!workout.workout_items || itemIdx >= workout.workout_items.length) {
      return {
        success: false,
        errorType: 10,
        errorMsg: "Workout items not found",
      };
    }

    const item = workout.workout_items[itemIdx];
    if (
      ["sets", "weight_unit", "percent_of", "duration_unit", "distance_unit"].indexOf(
        key
      ) >= 0
    ) {
      item[`r_${key}`] = value;
    } else {
      item[`r_${key}`] = jList(value);
    }

    setEditedWorkoutGroup(jsonCopy(newWorkoutGroup));
    return { success: true, errorType: -1, errorMsg: "" };
  };

  const submitFinalWorkoutDualItems = () => {
    const promises: Promise<any>[] =
      editedWorkoutGroup.workouts
        ?.filter((workout: WorkoutCardProps) => workout.scheme_type > 2)
        .map((workout: WorkoutCardProps) => {
          const data = new FormData();
          data.append("workout", workout.id);
          const updatedItems = workout.workout_items?.map(
            (_item: WorkoutDualItemProps) => {
              const item = { ..._item };
              const keys = itemDescKeys.filter(
                (key: string) => !isItemFieldEmpty(key, item[key])
              );
              keys.forEach((key: string) => {
                const rKey = `r_${key}`;
                if (isRecordedItemFieldEmpty(rKey, item[rKey])) {
                  item[rKey] = item[key];
                }
              });
              return item;
            }
          );
          data.append("items", JSON.stringify(updatedItems));
          return recordWorkout(data);
        }) ?? [];

    Promise.all(promises)
      .then((results) => {
        results.forEach(async (res) => {
          if (res.data) {
            try {
              const data = new FormData();
              data.append("group", editedWorkoutGroup.id);
              await finishWorkoutGroup(data).unwrap();
              onRequestClose();
              setShowFinishWorkoutGroupModal(false);
            } catch (err) {
              console.log("Error finishing workout", err);
            }
          }
        });
      })
      .catch((err) => {});
  };

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      onDismiss={onRequestClose}
      backdropComponent={renderBackdrop}
      keyboardBehavior="extend"
      keyboardBlurBehavior="restore"
      backgroundStyle={{ backgroundColor: theme.palette.darkGray }}
      handleIndicatorStyle={{
        backgroundColor: lightenHexColor(theme.palette.lightGray, 0.3),
        width: 40,
      }}
    >
      {/* Fixed header */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
        <View
          style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}
        >
          <Icon
            name="fitness-outline"
            color={theme.palette.AWE_Green}
            style={{ fontSize: 20, marginRight: 8 }}
          />
          <TSSnippetText
            textStyles={{ color: theme.palette.AWE_Green, fontWeight: "700" }}
          >
            Record Your Results
          </TSSnippetText>
        </View>
        <TSCaptionText
          textStyles={{ color: lightenHexColor(theme.palette.text, 0.55), lineHeight: 18 }}
        >
          Creative workouts prescribe a target amount. Enter how much you
          actually completed.
        </TSCaptionText>

        {/* Divider */}
        <View
          style={{
            height: 1,
            backgroundColor: lightenHexColor(theme.palette.lightGray, 0.1),
            marginTop: 12,
          }}
        />
      </View>

      {/* Scrollable workout list */}
      <BottomSheetScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 16 }}
        keyboardShouldPersistTaps="handled"
        style={{ flex: 1 }}
      >
        {editedWorkoutGroup.workouts?.map(
          (workout: WorkoutCardProps, workoutIdx: number) => {
            const containsDualItems = workout.scheme_type > 2;
            return (
              <View key={`${workout.id}_${workout.title}_recordWorkout`}>
                {containsDualItems ? (
                  <View style={{ marginBottom: 16 }}>
                    {/* Workout header */}
                    <View
                      style={{
                        backgroundColor: lightenHexColor(
                          theme.palette.AWE_Green,
                          0.08
                        ),
                        borderRadius: 8,
                        padding: 10,
                        marginBottom: 8,
                      }}
                    >
                      <TSSnippetText
                        textStyles={{ color: theme.palette.AWE_Green, fontWeight: "700" }}
                      >
                        {workout.title}
                      </TSSnippetText>
                      {workout.instruction ? (
                        <TSCaptionText
                          textStyles={{
                            color: lightenHexColor(theme.palette.text, 0.55),
                            marginTop: 2,
                          }}
                        >
                          {workout.instruction}
                        </TSCaptionText>
                      ) : null}
                    </View>

                    {workout.workout_items?.map((item, itemIdx) => (
                      <View
                        key={`${item.id}_${item.order}_itemToUpdate`}
                        style={{
                          borderWidth: 1,
                          borderColor: lightenHexColor(
                            theme.palette.AWE_Yellow,
                            0.3
                          ),
                          borderRadius: 10,
                          marginBottom: 8,
                          overflow: "hidden",
                        }}
                      >
                        <View
                          style={{
                            backgroundColor: lightenHexColor(
                              theme.palette.AWE_Yellow,
                              0.06
                            ),
                            padding: 10,
                          }}
                        >
                          <TSCaptionText
                            textStyles={{
                              color: lightenHexColor(theme.palette.text, 0.5),
                              fontSize: 9,
                              fontWeight: "700",
                              textTransform: "uppercase",
                              letterSpacing: 0.5,
                              marginBottom: 2,
                            }}
                          >
                            Rx'd
                          </TSCaptionText>
                          <ItemString
                            item={item}
                            schemeType={workout.scheme_type}
                            key={`${item.id}_dualitemfinish`}
                            prefix=""
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
                    ))}
                  </View>
                ) : null}
              </View>
            );
          }
        )}
      </BottomSheetScrollView>

      {/* Fixed footer buttons */}
      <View
        style={{
          flexDirection: "row",
          gap: 12,
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 28,
          borderTopWidth: 1,
          borderTopColor: lightenHexColor(theme.palette.lightGray, 0.08),
        }}
      >
        <Pressable
          onPress={onRequestClose}
          style={({ pressed }) => ({
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: lightenHexColor(theme.palette.AWE_Red, 0.12),
            borderRadius: 12,
            paddingVertical: 13,
            opacity: pressed ? 0.75 : 1,
          })}
        >
          <TSCaptionText
            textStyles={{ color: theme.palette.AWE_Red, fontWeight: "700" }}
          >
            Cancel
          </TSCaptionText>
        </Pressable>

        <Pressable
          onPress={submitFinalWorkoutDualItems}
          style={({ pressed }) => ({
            flex: 2,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme.palette.AWE_Green,
            borderRadius: 12,
            paddingVertical: 13,
            opacity: pressed ? 0.75 : 1,
          })}
        >
          <Icon
            name="checkmark-circle-outline"
            color="white"
            style={{ fontSize: 16, marginRight: 6 }}
          />
          <TSCaptionText textStyles={{ color: "white", fontWeight: "700" }}>
            Finish Workout
          </TSCaptionText>
        </Pressable>
      </View>
    </BottomSheetModal>
  );
};

export default FinishDualWorkoutItems;
