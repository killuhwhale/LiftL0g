import React, {
  FunctionComponent,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { StyleProp, View, ViewStyle, Pressable } from "react-native";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useTheme } from "styled-components/native";
import { TSSnippetText, TSCaptionText } from "../Text/Text";
import { lightenHexColor } from "../shared";
import Icon from "react-native-vector-icons/Ionicons";

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
  const sheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["32%"], []);

  React.useEffect(() => {
    if (props.modalVisible) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
    }
  }, [props.modalVisible]);

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
      onDismiss={props.onRequestClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: theme.palette.darkGray }}
      handleIndicatorStyle={{
        backgroundColor: lightenHexColor(theme.palette.lightGray, 0.3),
        width: 40,
      }}
    >
      <BottomSheetView style={{ flex: 1, paddingHorizontal: 20, paddingTop: 16 }}>
        {/* Message */}
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 8,
          }}
        >
          <TSSnippetText textStyles={{ textAlign: "center" }}>
            {props.modalText}
          </TSSnippetText>
        </View>

        {/* Buttons */}
        <View
          style={{
            flexDirection: "row",
            gap: 12,
            paddingTop: 16,
            paddingBottom: 28,
          }}
        >
          {/* Cancel */}
          <Pressable
            onPress={props.onRequestClose}
            style={({ pressed }) => ({
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: lightenHexColor(theme.palette.AWE_Red, 0.12),
              borderRadius: 12,
              paddingVertical: 13,
              opacity: pressed ? 0.75 : 1,
            })}
          >
            <Icon
              name="close-circle-outline"
              color={theme.palette.AWE_Red}
              style={{ fontSize: 16, marginRight: 6 }}
            />
            <TSCaptionText textStyles={{ color: theme.palette.AWE_Red, fontWeight: "700" }}>
              {props.closeText}
            </TSCaptionText>
          </Pressable>

          {/* Action */}
          <Pressable
            onPress={props.onAction}
            style={({ pressed }) => ({
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: lightenHexColor(theme.palette.primary.main, 0.14),
              borderRadius: 12,
              paddingVertical: 13,
              opacity: pressed ? 0.75 : 1,
            })}
          >
            <Icon
              name="checkmark-circle-outline"
              color={theme.palette.primary.main}
              style={{ fontSize: 16, marginRight: 6 }}
            />
            <TSCaptionText
              textStyles={{ color: theme.palette.primary.main, fontWeight: "700" }}
            >
              {props.actionText}
            </TSCaptionText>
          </Pressable>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
};

export default ActionCancelModal;
