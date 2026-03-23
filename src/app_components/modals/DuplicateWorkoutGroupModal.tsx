import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { View, Pressable, StyleProp, ViewStyle, TouchableHighlight } from "react-native";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { useTheme } from "styled-components/native";
import { TSCaptionText, TSSnippetText, TSTitleText } from "../Text/Text";
import {
  formatLongDate,
  lightenHexColor,
  limitTextLength,
  mdFontSize,
  WorkoutGroupDescLimit,
  WorkoutGroupTitleLimit,
} from "../shared";
import Icon from "react-native-vector-icons/Ionicons";
import DatePicker from "react-native-date-picker";
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
  const sheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["68%"], []);

  const [dupError, setDupError] = useState("");
  const [title, setTitle] = useState("");
  const [forDate, setForDate] = useState<Date>(new Date());
  const [caption, setCaption] = useState("");
  const [titleError, setTitleError] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [duplicateWorkoutGroupMutation, { isLoading }] =
    useDuplicateWorkoutGroupMutation();

  useEffect(() => {
    if (props.modalVisible) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
    }
  }, [props.modalVisible]);

  useEffect(() => {
    setDupError("");
    setTitle("");
    setCaption("");
    setTitleError("");
    setShowDatePicker(false);
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

  const duplicateWorkoutGroup = async () => {
    const group_data = new FormData();
    group_data.append("title", title);
    group_data.append("for_date", dateFormat(forDate));
    group_data.append("caption", caption);
    group_data.append("owned_by_class", "f");
    group_data.append("owner_id", props.owner_id);
    group_data.append("workouts", JSON.stringify(props.workouts));

    try {
      const res = await duplicateWorkoutGroupMutation(group_data).unwrap();
      if ("id" in res) {
        props.onDuplicateGroup(res.id);
        props.onRequestClose();
      }
      if ("detail" in res) {
        setDupError("Error duplicating: daily workout creation limit reached.");
      }
    } catch (err) {
      console.log("Error duplicating workout: ", err);
    }
  };

  const inputBg = lightenHexColor(theme.palette.backgroundColor, 0.2);

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      onDismiss={props.onRequestClose}
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
      <BottomSheetScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <TSTitleText textStyles={{ textAlign: "center", marginBottom: 4, marginTop: 4 }}>
          {props.modalText}
        </TSTitleText>

        {dupError ? (
          <View
            style={{
              backgroundColor: lightenHexColor(theme.palette.AWE_Red, 0.1),
              borderRadius: 8,
              padding: 10,
              marginBottom: 14,
            }}
          >
            <TSCaptionText textStyles={{ color: theme.palette.AWE_Red, textAlign: "center" }}>
              {dupError}
            </TSCaptionText>
          </View>
        ) : null}

        {/* Title input */}
        <TSCaptionText
          textStyles={{ marginBottom: 6, color: lightenHexColor(theme.palette.text, 0.6) }}
        >
          New Title
        </TSCaptionText>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: inputBg,
            borderRadius: 10,
            paddingHorizontal: 12,
            height: 48,
            marginBottom: 14,
            borderWidth: titleError ? 1 : 0,
            borderColor: theme.palette.AWE_Red,
          }}
        >
          <Icon
            name="information-circle-outline"
            color={lightenHexColor(theme.palette.text, 0.4)}
            style={{ fontSize: mdFontSize, marginRight: 8 }}
          />
          <BottomSheetTextInput
            value={title}
            onChangeText={(t) => {
              setTitle(limitTextLength(t, WorkoutGroupTitleLimit));
              setTitleError("");
            }}
            placeholder="New Title"
            placeholderTextColor={lightenHexColor(theme.palette.text, 0.35)}
            style={{ flex: 1, color: theme.palette.text, fontSize: 14 }}
          />
        </View>

        {/* Caption input */}
        <TSCaptionText
          textStyles={{ marginBottom: 6, color: lightenHexColor(theme.palette.text, 0.6) }}
        >
          Caption
        </TSCaptionText>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: inputBg,
            borderRadius: 10,
            paddingHorizontal: 12,
            height: 48,
            marginBottom: 14,
          }}
        >
          <Icon
            name="document-text-outline"
            color={lightenHexColor(theme.palette.text, 0.4)}
            style={{ fontSize: mdFontSize, marginRight: 8 }}
          />
          <BottomSheetTextInput
            value={caption}
            onChangeText={(t) => setCaption(limitTextLength(t, WorkoutGroupDescLimit))}
            placeholder="New Caption"
            placeholderTextColor={lightenHexColor(theme.palette.text, 0.35)}
            style={{ flex: 1, color: theme.palette.text, fontSize: 14 }}
          />
        </View>

        {/* Date picker row */}
        <TSCaptionText
          textStyles={{ marginBottom: 6, color: lightenHexColor(theme.palette.text, 0.6) }}
        >
          For Date
        </TSCaptionText>
        <TouchableHighlight
          onPress={() => setShowDatePicker(true)}
          underlayColor={lightenHexColor(theme.palette.primary.main, 0.08)}
          style={{ borderRadius: 10, marginBottom: 24 }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: inputBg,
              borderRadius: 10,
              paddingHorizontal: 12,
              height: 48,
            }}
          >
            <Icon
              name="calendar-outline"
              color={theme.palette.primary.main}
              style={{ fontSize: mdFontSize, marginRight: 8 }}
            />
            <TSSnippetText textStyles={{ color: theme.palette.text }}>
              {formatLongDate(forDate)}
            </TSSnippetText>
          </View>
        </TouchableHighlight>

        <DatePicker
          date={forDate}
          mode="date"
          locale="en"
          theme="dark"
          modal={true}
          open={showDatePicker}
          onCancel={() => setShowDatePicker(false)}
          onConfirm={(date) => {
            setForDate(date);
            setShowDatePicker(false);
          }}
          buttonColor={theme.palette.text}
          title="For Date"
        />

        {/* Buttons */}
        <View style={{ flexDirection: "row", gap: 12 }}>
          <Pressable
            onPress={props.onRequestClose}
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
              {props.closeText}
            </TSCaptionText>
          </Pressable>

          <Pressable
            onPress={duplicateWorkoutGroup}
            disabled={isLoading}
            style={({ pressed }) => ({
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: lightenHexColor(theme.palette.primary.main, 0.14),
              borderRadius: 12,
              paddingVertical: 13,
              opacity: pressed || isLoading ? 0.65 : 1,
            })}
          >
            <TSCaptionText
              textStyles={{ color: theme.palette.primary.main, fontWeight: "700" }}
            >
              {props.actionText}
            </TSCaptionText>
          </Pressable>
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
};

export default DuplicateWorkoutGroupModal;
