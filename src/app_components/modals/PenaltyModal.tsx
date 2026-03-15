import React, { FunctionComponent } from "react";
import { MediumText } from "../Text/Text";

import { Keyboard, Modal, TouchableWithoutFeedback, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useTheme } from "styled-components/native";
import { RegularButton } from "../Buttons/buttons";
import Input, { AutoCaptilizeEnum } from "../Input/input";
import { mdFontSize } from "../shared";
import { centeredViewStyle, modalViewStyle } from "./modalStyles";

const PenaltyModal: FunctionComponent<{
  modalVisible: boolean;
  onRequestClose(): void;
  closeText: string;
  bodyText: string;
  text: string;
  curItem: number;
  onAction(penalty: string, selectedIdx: number): void;
  setText(text: string): void;
}> = ({
  modalVisible,
  onRequestClose,
  closeText,
  bodyText,
  curItem,
  onAction,
  setText,
  text,
}) => {
  const theme = useTheme();

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={onRequestClose}
    >
      <View style={centeredViewStyle.centeredView}>
        <TouchableWithoutFeedback
          onPress={() => {
            Keyboard.dismiss();
          }}
          style={[
            centeredViewStyle.centeredView,
            { width: "100%", height: "100%" },
          ]}
        >
          <View
            style={{
              ...modalViewStyle.modalView,
              backgroundColor: theme.palette.darkGray,
              height: "90%",
            }}
          >
            <View style={{ height: "100%", justifyContent: "space-between" }}>
              <View style={{ marginTop: 20, flex: 2 }}>
                <MediumText>{bodyText}</MediumText>
              </View>

              <View style={{ marginBottom: 50, flex: 9 }}>
                <View style={{ height: 60 }}>
                  <Input
                    placeholder="Penalty"
                    onChangeText={setText}
                    value={text}
                    label="Penalty"
                    autoCapitalize={AutoCaptilizeEnum.Sent}
                    multiline
                    containerStyle={{
                      width: "100%",
                      backgroundColor: theme.palette.backgroundColor,
                      borderRadius: 8,
                      paddingHorizontal: 8,
                    }}
                    onSubmitEditing={() => Keyboard.dismiss()}
                    leading={
                      <Icon
                        name="flame"
                        color={theme.palette.text}
                        style={{ fontSize: mdFontSize }}
                      />
                    }
                  />
                </View>
              </View>

              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  justifyContent: "space-around",
                }}
              >
                <RegularButton
                  onPress={() => {
                    setText("");
                    onRequestClose();
                  }}
                  btnStyles={{
                    backgroundColor: theme.palette.AWE_Red,
                    justifyContent: "center",
                    paddingHorizontal: 24,
                  }}
                  text={closeText}
                />
                <RegularButton
                  onPress={() => {
                    onAction(text, curItem);
                    setText("");
                    onRequestClose();
                  }}
                  btnStyles={{
                    backgroundColor: theme.palette.AWE_Green,
                    justifyContent: "center",
                    paddingHorizontal: 24,
                  }}
                  text="Submit"
                />
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </Modal>
  );
};

export default PenaltyModal;
