import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import { MediumText } from "../Text/Text";

import { Keyboard, Modal, TouchableWithoutFeedback, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useTheme } from "styled-components/native";
import { RegularButton } from "../Buttons/buttons";
import Input, { AutoCaptilizeEnum } from "../Input/input";
import { mdFontSize, SCREEN_HEIGHT } from "../shared";
import { centeredViewStyle, modalViewStyle } from "./modalStyles";

const TextFieldModal: FunctionComponent<{
  modalVisible: boolean;
  onRequestClose(): void;
  closeText: string;
  bodyText: string;
  initText: string;
  multiline?: boolean;

  onAction(penalty: string): void;
}> = ({
  modalVisible,
  onRequestClose,
  closeText,
  bodyText,
  initText,
  multiline = false,

  onAction,
}) => {
  const theme = useTheme();
  const [text, setText] = useState(initText);
  const initRef = useRef(false);

  useEffect(() => {
    if ((text === "" && !initRef.current) || text != initText) {
      initRef.current = true;
      setText(initText);
    }
  }, [initText]);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={onRequestClose}
    >
      <View
        style={{
          justifyContent: "flex-start",
          alignItems: "center",
          marginTop: 100,
          height: SCREEN_HEIGHT * 0.85,
        }}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            Keyboard.dismiss();
          }}
          style={[
            centeredViewStyle.centeredView,
            { width: "100%", height: "80%" },
          ]}
        >
          <View
            style={{
              ...modalViewStyle.modalView,
              backgroundColor: theme.palette.darkGray,
              height: "40%",
            }}
          >
            <View style={{ height: "100%", justifyContent: "space-between" }}>
              <View style={{ marginTop: 20, flex: 2 }}>
                <MediumText>{bodyText}</MediumText>
              </View>

              <View style={{ marginBottom: 50, flex: 2 }}>
                <Input
                  placeholder=""
                  onChangeText={setText}
                  value={text}
                  label=""
                  autoCapitalize={AutoCaptilizeEnum.Sent}
                  multiline={multiline}
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

              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  justifyContent: "space-around",
                }}
              >
                <RegularButton
                  onPress={() => {
                    setText(initText);
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
                    onAction(text);
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

export default TextFieldModal;
