import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "styled-components/native";
import Icon from "react-native-vector-icons/Ionicons";
import {
  useCreateWorkoutPromptMutation,
  useGetLastXWorkoutGroupsQuery,
  useGetProfileWorkoutGroupsQuery,
} from "@/src/redux/api/apiSlice"; // <-- Replace with your actual mutation
import {
  TSCaptionText,
  TSInputText,
  TSInputTextSm,
  TSSnippetText,
  TSTitleText,
} from "../Text/Text";
import { isDateInFuture, SCREEN_HEIGHT } from "../shared";
import { AnyWorkoutItem } from "../Cards/types";
import { useMaxes } from "@/hooks/useMaxes";
import FullScreenSpinner from "../Spinner";
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
  const [text, setText] = useState("");

  const [submitPrompt, { isLoading }] = useCreateWorkoutPromptMutation();
  // Get last 10 workouts, should already be fetched from home page...

  const {
    userId,
    profileData,
    workoutItemMaxes,
    workoutItemMaxesMap,
    isLoading: isMaxesLoading,
    error,
  } = useMaxes();

  const {
    data: lastWorkoutGroups,
    isLoading: isLoadingWG,
    isSuccess: isSuccessWG,
    isError: isErrorWG,
    error: errorWG,
  } = useGetLastXWorkoutGroupsQuery(userId, { skip: isMaxesLoading });

  const [showBecomeMember, setShowBecomeMember] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    console.log("profileData.user: ", profileData.user);
    if (!profileData.user) return;
    if (!isDateInFuture(profileData.user)) {
      setShowBecomeMember(true);
      return;
    }

    try {
      const userMaxesNoID = workoutItemMaxes.map(
        ({ id, ...rest }: any) => rest
      ); // Save on some input tokens, remove id

      const result = await submitPrompt({
        prompt: text,
        userID,
        userMaxes: userMaxesNoID,
        lastWorkoutGroups: lastWorkoutGroups,
        schemeTypeText,
      }).unwrap();
      console.log("Prompt result: ", result);

      if (result.data) {
        setText("");
        setAIItems(result.data);
      }
      onClose();
    } catch (err) {
      console.error("Submission failed:", err);
    }
  };
  const router = useRouter();

  const navHome = () => {
    onClose();
    router.push("/(tabs)/Profile");
  };

  if (isLoading || isMaxesLoading) {
    return <FullScreenSpinner></FullScreenSpinner>;
  }

  console.log("lastWorkoutGroup s: ", lastWorkoutGroups);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: theme.palette.transparent,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <TouchableOpacity
          onPress={() => onClose()}
          style={{
            width: "100%",
            height: SCREEN_HEIGHT * 0.8,
            backgroundColor: theme.palette.backgroundColor,
            borderRadius: 16,
            padding: 20,
            elevation: 6,
          }}
        >
          <View
            style={{
              width: "100%",
              backgroundColor: theme.palette.backgroundColor,
              borderRadius: 16,
              padding: 20,
              elevation: 6,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <TSTitleText
                textStyles={{
                  color: theme.palette.text,
                  fontWeight: "600",
                }}
              >
                Create a wokout
              </TSTitleText>

              <TouchableOpacity onPress={onClose}>
                <Icon name="close" size={24} color={theme.palette.text} />
              </TouchableOpacity>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <TSInputText
                textStyles={{
                  color: theme.palette.text,
                  fontWeight: "300",
                }}
              >
                What is your goal?
              </TSInputText>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <TSInputTextSm
                textStyles={{
                  color: theme.palette.AWE_Green,
                  fontWeight: "600",
                }}
              >
                Note: The last 10 workouts will be included.
              </TSInputTextSm>
            </View>

            <View
              style={{
                width: "100%",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
                maxHeight: SCREEN_HEIGHT * 0.42,
              }}
            >
              <TextInput
                placeholder="Type your prompt..."
                placeholderTextColor={theme.palette.gray}
                value={text}
                multiline
                numberOfLines={4}
                onChangeText={setText}
                style={{
                  borderColor: theme.palette.gray,
                  borderWidth: 1,
                  borderRadius: 8,
                  padding: 12,
                  color: theme.palette.text,
                  backgroundColor: theme.palette.IP_TextInput_bg,
                  fontSize: 14,
                  marginBottom: 16,
                  width: "100%",
                }}
              />
            </View>
            <TouchableOpacity
              disabled={isLoading}
              onPress={showBecomeMember ? navHome : handleSubmit}
              style={{
                backgroundColor: showBecomeMember
                  ? theme.palette.AWE_Blue
                  : theme.palette.AWE_Green,
                paddingVertical: 12,
                borderRadius: 12,
                justifyContent: "center",
                alignItems: "center",
                opacity: isLoading ? 0.5 : 1,
              }}
            >
              {isLoading ? (
                <ActivityIndicator color={theme.palette.white} />
              ) : showBecomeMember ? (
                <View>
                  <TSSnippetText>Become a member!</TSSnippetText>
                </View>
              ) : (
                <Text style={{ color: theme.palette.white, fontWeight: "600" }}>
                  Submit
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default CreateWorkoutPrompt;
