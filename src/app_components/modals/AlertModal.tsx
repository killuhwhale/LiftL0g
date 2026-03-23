import React, {
  FunctionComponent,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { View, Pressable } from "react-native";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useTheme } from "styled-components/native";
import { TSParagrapghText, TSCaptionText } from "../Text/Text";
import { lightenHexColor } from "../shared";
import Icon from "react-native-vector-icons/Ionicons";

const AlertModal: FunctionComponent<{
  modalVisible: boolean;
  onRequestClose(): void;
  closeText?: string;
  bodyText: string;
}> = ({ modalVisible, onRequestClose, closeText, bodyText }) => {
  const theme = useTheme();
  const sheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["35%"], []);

  React.useEffect(() => {
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
      backgroundStyle={{ backgroundColor: theme.palette.darkGray }}
      handleIndicatorStyle={{
        backgroundColor: lightenHexColor(theme.palette.lightGray, 0.3),
        width: 40,
      }}
    >
      <BottomSheetView style={{ flex: 1, paddingHorizontal: 20, paddingTop: 16 }}>
        {/* Body */}
        <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: 4 }}>
          <TSParagrapghText textStyles={{ textAlign: "center" }}>
            {bodyText}
          </TSParagrapghText>
        </View>

        {/* Close button */}
        <Pressable
          onPress={onRequestClose}
          style={({ pressed }) => ({
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: lightenHexColor(theme.palette.primary.main, 0.14),
            borderRadius: 12,
            paddingVertical: 13,
            marginTop: 16,
            marginBottom: 28,
            opacity: pressed ? 0.75 : 1,
          })}
        >
          <Icon
            name="checkmark-outline"
            color={theme.palette.primary.main}
            style={{ fontSize: 16, marginRight: 6 }}
          />
          <TSCaptionText
            textStyles={{ color: theme.palette.primary.main, fontWeight: "700" }}
          >
            {closeText ?? "Close"}
          </TSCaptionText>
        </Pressable>
      </BottomSheetView>
    </BottomSheetModal>
  );
};

export default AlertModal;
