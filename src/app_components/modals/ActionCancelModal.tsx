import React, { FunctionComponent } from "react";

import {
  Modal,
  StyleProp,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

import { LargeButton } from "../Buttons/buttons";
import { TSSnippetText } from "../Text/Text";
import { centeredViewStyle, modalViewStyle } from "./modalStyles";
import { useTheme } from "styled-components";

const ActionCancelModal: FunctionComponent<{
  modalVisible: boolean;
  onRequestClose(): void;
  closeText: string;
  actionText: string;
  modalText: string;
  onAction(): void;
  containerStyle?: StyleProp<ViewStyle>;
}> = (props) => {
  const theme = useTheme();

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={props.modalVisible}
      onRequestClose={() => props.onRequestClose()}
    >
      <View
        style={[
          centeredViewStyle.centeredView,
          { backgroundColor: "#000000DD" },
        ]}
      >
        <TouchableOpacity
          style={[
            centeredViewStyle.centeredView,
            { width: "100%", height: "100%" },
          ]}
          onPress={() => props.onRequestClose()}
        >
          <View
            style={[
              modalViewStyle.modalView,
              {
                backgroundColor: theme.palette.darkGray,
                width: "80%",
                height: "35%",
              },
              props.containerStyle,
            ]}
          >
            <View style={{ flex: 1, width: "100%", height: "100%" }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 6,
                  marginBottom: 12,
                  flex: 4,
                  width: "100%",
                }}
              >
                <TSSnippetText textStyles={{ textAlign: "center" }}>
                  {props.modalText}
                </TSSnippetText>
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
                  }}
                  text={props.closeText}
                />

                <LargeButton
                  onPress={props.onAction}
                  btnStyles={{
                    backgroundColor: theme.palette.primary.main,
                  }}
                  text={props.actionText}
                />
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default ActionCancelModal;
