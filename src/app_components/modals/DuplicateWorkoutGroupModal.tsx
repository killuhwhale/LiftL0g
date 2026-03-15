import React, { FunctionComponent, useEffect, useState } from "react";

import {
  Keyboard,
  Modal,
  Platform,
  StyleProp,
  TouchableHighlight,
  View,
  ViewStyle,
} from "react-native";

import { LargeButton } from "../Buttons/buttons";
import { TSCaptionText, TSSnippetText, TSTitleText } from "../Text/Text";
import { centeredViewStyle, modalViewStyle } from "./modalStyles";
import { useTheme } from "styled-components";
import DatePicker from "react-native-date-picker";
import {
  formatLongDate,
  limitTextLength,
  mdFontSize,
  WorkoutGroupDescLimit,
  WorkoutGroupTitleLimit,
} from "../shared";
import Input from "../Input/input";
import Icon from "react-native-vector-icons/Ionicons";
import { useDuplicateWorkoutGroupMutation } from "@/src/redux/api/apiSlice";
import { WorkoutCardProps } from "../Cards/types";
import { dateFormat } from "../charts/lineChart";

const DuplicateWorkoutGroupModal: FunctionComponent<{
  owner_id: string;
  modalVisible: boolean;
  onRequestClose(): void;
  closeText: string;
  actionText: string;
  modalText: string;
  containerStyle?: StyleProp<ViewStyle>;
  workouts: WorkoutCardProps[];
  onDuplicateGroup: (groupID: number) => void;
}> = (props) => {
  const theme = useTheme();

  const [dupError, setDupError] = useState("");
  const [title, setTitle] = useState("");
  const [forDate, setForDate] = useState<Date>(new Date());
  const [caption, setCaption] = useState("");
  const [titleError, setTitleError] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [duplicateWorkoutGroupMutation, { isLoading }] =
    useDuplicateWorkoutGroupMutation();
  // Get workouts w/ their items
  // Send all data to server and let it create everything

  const duplicateWorkoutGroup = async () => {
    const group_data = new FormData();

    group_data.append("title", title);
    group_data.append("for_date", dateFormat(forDate));
    group_data.append("caption", caption);
    group_data.append("owned_by_class", "f");
    group_data.append("owner_id", props.owner_id);
    console.log("Duplciate props.workouts: ", props.workouts);
    group_data.append("workouts", JSON.stringify(props.workouts));

    try {
      const res = await duplicateWorkoutGroupMutation(group_data).unwrap();
      console.log("Group duplicate res: ", res);

      if ("id" in res) {
        props.onDuplicateGroup(res.id);
        props.onRequestClose();
      }
      if ("detail" in res) {
        console.log("Alert, group not duplicated!");
        setDupError("Error duplicating: daily workout creation limit reached.");
      }
    } catch (err) {
      console.log("Error duplicating workout: ", err);
    }
  };

  useEffect(() => {
    setDupError("");
    setTitle("");
    setCaption("");
    setTitleError("");
    setShowDatePicker(false);
  }, [props.modalVisible]);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={props.modalVisible}
      onRequestClose={() => props.onRequestClose()}
    >
      <View
        style={[
          {
            flex: 1,
            justifyContent: "flex-start",
            alignItems: "center",
            marginTop: 100,
            backgroundColor: "#000000DD",
          },
        ]}
        onTouchStart={() => {
          Keyboard.dismiss();
        }}
      >
        <View
          style={[
            modalViewStyle.modalView,
            {
              backgroundColor: theme.palette.darkGray,
              width: "80%",
              height: "55%",
            },
            props.containerStyle,
          ]}
          onTouchStart={() => {
            Keyboard.dismiss();
          }}
        >
          <View
            style={{ flex: 1, width: "100%", height: "100%" }}
            onTouchStart={() => {
              Keyboard.dismiss();
            }}
          >
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 6,
                marginBottom: 12,
                flex: 4,
                width: "100%",
              }}
            >
              {dupError ? (
                <TSSnippetText
                  textStyles={{
                    textAlign: "center",
                    marginBottom: 8,
                    color: theme.palette.accent,
                  }}
                >
                  {dupError}
                </TSSnippetText>
              ) : (
                <></>
              )}
              <TSTitleText textStyles={{ textAlign: "center" }}>
                {props.modalText}
              </TSTitleText>
            </View>

            <View style={{ flex: 5 }}>
              <View style={{ marginBottom: 15, height: 40 }}>
                <Input
                  placeholder="New Title"
                  onChangeText={(t) => {
                    setTitle(limitTextLength(t, WorkoutGroupTitleLimit));
                    setTitleError("");
                  }}
                  value={title || ""}
                  label="New Title"
                  isError={titleError.length > 0}
                  helperText={titleError}
                  containerStyle={{
                    width: "100%",
                    backgroundColor: theme.palette.darkGray,
                    borderRadius: 8,
                    paddingHorizontal: 8,
                    borderWidth: 1,
                    borderColor: theme.palette.text,
                  }}
                  leading={
                    <Icon
                      name="information-circle-outline"
                      color={theme.palette.text}
                      style={{ fontSize: mdFontSize }}
                    />
                  }
                />
              </View>
              <View style={{ marginBottom: 15, height: 40 }}>
                <Input
                  placeholder="New Caption"
                  onChangeText={(t) =>
                    setCaption(limitTextLength(t, WorkoutGroupDescLimit))
                  }
                  value={caption || ""}
                  label="New Caption"
                  containerStyle={{
                    width: "100%",
                    backgroundColor: theme.palette.darkGray,
                    borderRadius: 8,
                    paddingHorizontal: 8,
                    borderWidth: 1,
                    borderColor: theme.palette.text,
                  }}
                  leading={
                    <Icon
                      name="information-circle-outline"
                      color={theme.palette.text}
                      style={{ fontSize: mdFontSize }}
                    />
                  }
                />
              </View>

              <View
                style={{
                  flexDirection: "row",
                  height: 35,
                  width: "100%",
                  backgroundColor: theme.palette.darkGray,
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: theme.palette.text,
                }}
              >
                <TouchableHighlight
                  style={{
                    height: "100%",
                    width: "100%",
                    justifyContent: "center",
                  }}
                  onPress={() => setShowDatePicker(!showDatePicker)}
                >
                  <>
                    <TSCaptionText
                      textStyles={{ textAlign: "left", paddingLeft: 16 }}
                    >
                      For: {formatLongDate(forDate)}
                    </TSCaptionText>
                    <DatePicker
                      date={forDate}
                      mode="date"
                      locale="en"
                      theme="dark"
                      modal={true}
                      open={showDatePicker}
                      onCancel={() => setShowDatePicker(false)}
                      onConfirm={(date) => setForDate(date)}
                      buttonColor={theme.palette.text}
                      title={"For Date"}
                    />
                  </>
                </TouchableHighlight>
              </View>
            </View>

            <View
              style={{
                flex: 2,
                flexDirection: "row",
                width: "100%",
                justifyContent: "space-around",
                alignContent: "center",
                alignItems: "center",
                paddingVertical: 12,
              }}
            >
              <LargeButton
                onPress={props.onRequestClose}
                btnStyles={{
                  backgroundColor: "#DB4437",

                  paddingVertical: 8,
                }}
                text={props.closeText}
              />

              <LargeButton
                onPress={() => duplicateWorkoutGroup()}
                btnStyles={{
                  backgroundColor: theme.palette.primary.main,

                  paddingVertical: 8,
                }}
                text={props.actionText}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default DuplicateWorkoutGroupModal;
