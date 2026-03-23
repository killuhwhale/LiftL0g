import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { View, Pressable } from "react-native";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetTextInput,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useTheme } from "styled-components/native";
import { TSCaptionText, TSSnippetText } from "../Text/Text";
import { lightenHexColor } from "../shared";
import { AutoCaptilizeEnum } from "../Input/input";
import Icon from "react-native-vector-icons/Ionicons";

const TextFieldModal: FunctionComponent<{
  modalVisible: boolean;
  onRequestClose(): void;
  closeText: string;
  bodyText: string;
  initText: string;
  multiline?: boolean;
  onAction(text: string): void;
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
  const sheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["48%"], []);
  const [text, setText] = useState(initText);
  const initRef = useRef(false);

  useEffect(() => {
    if ((text === "" && !initRef.current) || text !== initText) {
      initRef.current = true;
      setText(initText);
    }
  }, [initText]);

  useEffect(() => {
    if (modalVisible) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
    }
  }, [modalVisible]);

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

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      onDismiss={onRequestClose}
      backdropComponent={renderBackdrop}
      keyboardBehavior="extend"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      backgroundStyle={{ backgroundColor: theme.palette.darkGray }}
      handleIndicatorStyle={{
        backgroundColor: lightenHexColor(theme.palette.lightGray, 0.3),
        width: 40,
      }}
    >
      <BottomSheetView style={{ flex: 1, paddingHorizontal: 20, paddingTop: 8 }}>
        {/* Title */}
        <TSSnippetText textStyles={{ marginBottom: 16, fontWeight: "600" }}>
          {bodyText}
        </TSSnippetText>

        {/* Input */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: lightenHexColor(theme.palette.backgroundColor, 0.2),
            borderRadius: 10,
            paddingHorizontal: 12,
            marginBottom: 20,
            minHeight: multiline ? 90 : 48,
          }}
        >
          <Icon
            name="create-outline"
            color={lightenHexColor(theme.palette.text, 0.4)}
            style={{ fontSize: 18, marginRight: 8 }}
          />
          <BottomSheetTextInput
            value={text}
            onChangeText={setText}
            autoCapitalize={AutoCaptilizeEnum.Sent}
            multiline={multiline}
            style={{
              flex: 1,
              color: theme.palette.text,
              fontSize: 14,
              paddingVertical: multiline ? 12 : 0,
            }}
            placeholderTextColor={lightenHexColor(theme.palette.text, 0.35)}
          />
        </View>

        {/* Buttons */}
        <View style={{ flexDirection: "row", gap: 12, paddingBottom: 24 }}>
          <Pressable
            onPress={() => {
              setText(initText);
              onRequestClose();
            }}
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
              {closeText}
            </TSCaptionText>
          </Pressable>

          <Pressable
            onPress={() => {
              onAction(text);
              setText("");
              onRequestClose();
            }}
            style={({ pressed }) => ({
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: lightenHexColor(theme.palette.AWE_Green, 0.14),
              borderRadius: 12,
              paddingVertical: 13,
              opacity: pressed ? 0.75 : 1,
            })}
          >
            <TSCaptionText
              textStyles={{ color: theme.palette.AWE_Green, fontWeight: "700" }}
            >
              Submit
            </TSCaptionText>
          </Pressable>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
};

export default TextFieldModal;
