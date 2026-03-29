import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Pressable, ActivityIndicator } from "react-native";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { useTheme } from "styled-components/native";
import Icon from "react-native-vector-icons/Ionicons";
import {
  useCreateWorkoutPromptMutation,
  useGetLastXWorkoutGroupsQuery,
} from "@/src/redux/api/apiSlice";
import {
  TSCaptionText,
  TSInputTextSm,
  TSSnippetText,
  TSTitleText,
} from "../Text/Text";
import { lightenHexColor } from "../shared";
import { AnyWorkoutItem } from "../Cards/types";
import { useMaxes } from "@/hooks/useMaxes";
import { useRouter } from "expo-router";

type ChatPromptModalProps = {
  visible: boolean;
  userID: string;
  schemeTypeText: string;
  setAIItems: React.Dispatch<React.SetStateAction<ToolResultProps | null>>;
  onClose: () => void;
};

export type ToolResultProps = {
  goal: string;
  items: AnyWorkoutItem[];
  scheme_rounds: string;
  workouts_type: string;
};

const CreateWorkoutPrompt: React.FC<ChatPromptModalProps> = ({
  visible,
  userID,
  setAIItems,
  schemeTypeText,
  onClose,
}) => {
  const theme = useTheme();
  const sheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["85%"], []);
  const [text, setText] = useState("");
  const [showBecomeMember, setShowBecomeMember] = useState(false);

  const [submitPrompt, { isLoading }] = useCreateWorkoutPromptMutation();

  const {
    userId,
    profileData,
    workoutItemMaxes,
    isLoading: isMaxesLoading,
  } = useMaxes();

  const { data: lastWorkoutGroups } = useGetLastXWorkoutGroupsQuery(userId, {
    skip: isMaxesLoading,
  });

  const router = useRouter();

  useEffect(() => {
    if (visible) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
    }
  }, [visible]);

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

  const handleSubmit = async () => {
    if (!text.trim()) return;
    if (!profileData.user) return;
    try {
      const userMaxesNoID = workoutItemMaxes.map(({ id, ...rest }: any) => rest);
      const result = await submitPrompt({
        prompt: text,
        userID,
        userMaxes: userMaxesNoID,
        lastWorkoutGroups,
        schemeTypeText,
      }).unwrap();

      if (result.data) {
        setText("");
        setAIItems(result.data);
      }
      onClose();
    } catch (err) {
      console.error("Submission failed:", err);
    }
  };

  const navHome = () => {
    onClose();
    router.push("/(tabs)/Profile");
  };

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      onDismiss={onClose}
      backdropComponent={renderBackdrop}
      keyboardBehavior="extend"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      backgroundStyle={{ backgroundColor: theme.palette.backgroundColor }}
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
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
            marginTop: 4,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Icon
              name="sparkles-outline"
              color={theme.palette.AWE_Green}
              style={{ fontSize: 22, marginRight: 10 }}
            />
            <TSTitleText textStyles={{ marginVertical: 0, fontWeight: "700" }}>
              AI Workout Builder
            </TSTitleText>
          </View>
          <Pressable onPress={onClose} hitSlop={10}>
            <Icon name="close" size={22} color={lightenHexColor(theme.palette.text, 0.4)} />
          </Pressable>
        </View>

        {/* Subtext */}
        <TSSnippetText
          textStyles={{ color: lightenHexColor(theme.palette.text, 0.5), marginBottom: 6 }}
        >
          What is your goal?
        </TSSnippetText>
        <TSInputTextSm
          textStyles={{ color: theme.palette.AWE_Green, fontWeight: "600", marginBottom: 16 }}
        >
          Your last 10 workouts will be included for context.
        </TSInputTextSm>

        {/* Text input */}
        <BottomSheetTextInput
          placeholder="Describe what you want to work on..."
          placeholderTextColor={lightenHexColor(theme.palette.text, 0.35)}
          value={text}
          multiline
          numberOfLines={5}
          onChangeText={setText}
          style={{
            borderColor: lightenHexColor(theme.palette.lightGray, 0.15),
            borderWidth: 1,
            borderRadius: 12,
            padding: 14,
            color: theme.palette.text,
            backgroundColor: lightenHexColor(theme.palette.darkGray, 0.1),
            fontSize: 14,
            lineHeight: 22,
            marginBottom: 24,
            minHeight: 120,
            textAlignVertical: "top",
          }}
        />

        {/* Submit button */}
        <Pressable
          disabled={isLoading || isMaxesLoading}
          onPress={showBecomeMember ? navHome : handleSubmit}
          style={({ pressed }) => ({
            backgroundColor: showBecomeMember
              ? theme.palette.AWE_Blue
              : theme.palette.AWE_Green,
            paddingVertical: 14,
            borderRadius: 14,
            alignItems: "center",
            justifyContent: "center",
            opacity: pressed || isLoading || isMaxesLoading ? 0.6 : 1,
          })}
        >
          {isLoading ? (
            <ActivityIndicator color={theme.palette.white} />
          ) : showBecomeMember ? (
            <TSSnippetText textStyles={{ color: "white", fontWeight: "700" }}>
              Become a Member
            </TSSnippetText>
          ) : (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Icon
                name="send-outline"
                color="white"
                style={{ fontSize: 16, marginRight: 8 }}
              />
              <TSCaptionText textStyles={{ color: "white", fontWeight: "700" }}>
                Generate Workout
              </TSCaptionText>
            </View>
          )}
        </Pressable>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
};

export default CreateWorkoutPrompt;
