import React, { FunctionComponent, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "styled-components/native";
import { router, useLocalSearchParams } from "expo-router";
import Icon from "react-native-vector-icons/Ionicons";

import {
  useCreateWorkoutGroupMutation,
  useCreateWorkoutItemsMutation,
  useCreateWorkoutDualItemsMutation,
  useCreateWorkoutMutation,
  useCreateWorkoutPromptMutation,
  useGetLastXWorkoutGroupsQuery,
  useGetProfileViewQuery,
  useGetWorkoutNamesQuery,
} from "@/src/redux/api/apiSlice";
import {
  TSCaptionText,
  TSInputTextSm,
  TSTitleText,
} from "@/src/app_components/Text/Text";
import Input from "@/src/app_components/Input/input";
import {
  CalcWorkoutStats,
  Container,
  formatLongDate,
  jList,
  limitTextLength,
  WorkoutGroupDescLimit,
  WorkoutGroupTitleLimit,
  WORKOUT_TYPES,
} from "@/src/app_components/shared";
import { dateFormat } from "@/src/utils/algos";
import {
  buildCoachPrompt,
  buildMemoryContext,
  getCoachMemory,
  getCoachProfile,
} from "@/src/utils/coachStorage";
import { handleGenerateWorkoutItemsResponse } from "./CreateWorkoutScreen";
import { WorkoutNameProps } from "@/src/app_components/Cards/types";
import { useMaxes } from "@/hooks/useMaxes";
import styled from "styled-components/native";
import BannerAddMembership from "@/src/app_components/ads/BannerAd";
import AlertModal from "@/src/app_components/modals/AlertModal";
import DatePicker from "react-native-date-picker";

const PageContainer = styled(Container)`
  background-color: ${(props) => props.theme.palette.backgroundColor};
  justify-content: flex-start;
  width: 100%;
`;

const parseWorkoutDateParam = (value?: string | string[]): Date => {
  const dateValue = Array.isArray(value) ? value[0] : value;
  if (!dateValue) return new Date();

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateValue);
  if (match) {
    const [, year, month, day] = match;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const parsed = new Date(dateValue);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

const AIQuickWorkoutScreen: FunctionComponent = () => {
  const theme = useTheme();

  // ── Form state ──────────────────────────────────────────────────────────────
  const params = useLocalSearchParams();

  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [prompt, setPrompt] = useState("");
  const [forDate, setForDate] = useState<Date>(
    parseWorkoutDateParam(params.initialForDate)
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    setForDate(parseWorkoutDateParam(params.initialForDate));
  }, [params.initialForDate]);

  // ── UI state ─────────────────────────────────────────────────────────────────
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [alertMsg, setAlertMsg] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  // ── Data ─────────────────────────────────────────────────────────────────────
  const { data: profileData, isLoading: isProfileLoading } =
    useGetProfileViewQuery("");

  const {
    userId,
    workoutItemMaxes,
    workoutItemMaxesMap,
    isLoading: isMaxesLoading,
  } = useMaxes();

  const { data: lastWorkoutGroups, isLoading: isLoadingLastWGs } =
    useGetLastXWorkoutGroupsQuery(userId, {
      skip: isMaxesLoading || !userId,
    });

  const { data: _workoutNames, isLoading: isWNLoading } =
    useGetWorkoutNamesQuery("");

  // ── Mutations ─────────────────────────────────────────────────────────────────
  const [submitPrompt] = useCreateWorkoutPromptMutation();
  const [createWorkoutGroup] = useCreateWorkoutGroupMutation();
  const [createWorkout] = useCreateWorkoutMutation();
  const [createWorkoutItems] = useCreateWorkoutItemsMutation();
  const [createWorkoutDualItems] = useCreateWorkoutDualItemsMutation();

  const isReady =
    !isProfileLoading && !isMaxesLoading && !isWNLoading && !isLoadingLastWGs;

  // ── Generate ──────────────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setAlertMsg("Please enter a prompt describing the workout you want.");
      setShowAlert(true);
      return;
    }

    if (!profileData?.user) {
      setAlertMsg("Could not load your profile. Please try again.");
      setShowAlert(true);
      return;
    }

    setIsGenerating(true);

    try {
      // ── Step 1: Generate workout via AI ───────────────────────────────────
      setStatusText("Generating workout...");

      const userMaxesNoID = (workoutItemMaxes ?? []).map(
        ({ id, ...rest }: any) => rest
      );

      // Build hidden coach context from stored profile + memory
      const [coachProfile, coachMemory] = await Promise.all([
        getCoachProfile(),
        getCoachMemory(),
      ]);
      const coachContext = coachProfile?.completedOnboarding
        ? [buildCoachPrompt(coachProfile), buildMemoryContext(coachMemory)]
            .filter(Boolean)
            .join("\n")
        : "";
      const fullPrompt = coachContext
        ? `${coachContext}\n\n${prompt.trim()}`
        : prompt.trim();

      const aiResult = await submitPrompt({
        prompt: fullPrompt,
        userID: profileData.user.id,
        userMaxes: userMaxesNoID,
        lastWorkoutGroups: (lastWorkoutGroups ?? []).slice(0, 3),
        schemeTypeText: "",
      }).unwrap();

      if (aiResult?.error) {
        throw new Error(aiResult.error);
      }

      if (!aiResult?.data || Object.keys(aiResult.data).length === 0) {
        throw new Error("AI returned no workout data.");
      }

      const aiData = aiResult.data; // { goal, workout_type, scheme_rounds, items }

      // ── Step 2: Create WorkoutGroup ───────────────────────────────────────
      setStatusText("Creating workout group...");

      const groupTitle = title.trim() || aiData.title || aiData.goal || "AI Workout";
      const groupCaption = caption.trim() || aiData.description || "";
      const groupFormData = new FormData();
      groupFormData.append("owner_id", String(profileData.user.id));
      groupFormData.append("owned_by_class", "False");
      groupFormData.append("title",   limitTextLength(groupTitle,   WorkoutGroupTitleLimit));
      groupFormData.append("caption", limitTextLength(groupCaption, WorkoutGroupDescLimit));
      groupFormData.append("for_date", dateFormat(forDate));
      groupFormData.append("creation_source", "ai");

      const workoutGroup = await createWorkoutGroup(groupFormData).unwrap();

      if (!workoutGroup?.id) {
        if (workoutGroup?.err_type === 1) {
          throw new Error("Daily workout limit reached. Upgrade your membership to create more workouts.");
        }
        if (workoutGroup?.err_type === 0) {
          throw new Error(`"${limitTextLength(groupTitle, WorkoutGroupTitleLimit)}" already exists. Please choose a different title.`);
        }
        if (workoutGroup?.error) {
          throw new Error(`Could not create workout: ${workoutGroup.error}`);
        }
        throw new Error("Failed to create workout group.");
      }

      // ── Step 3: Determine scheme type ─────────────────────────────────────
      const schemeType = WORKOUT_TYPES.indexOf(aiData.workout_type ?? "STANDARD");
      const safeSchemeType = schemeType === -1 ? 0 : schemeType;
      const schemeRounds = aiData.scheme_rounds ?? "";

      // ── Step 4: Create Workout ────────────────────────────────────────────
      setStatusText("Creating workout...");

      const workoutFormData = new FormData();
      workoutFormData.append("group", String(workoutGroup.id));
      workoutFormData.append("title", limitTextLength(aiData.title || aiData.goal || groupTitle, 50));
      workoutFormData.append("desc", caption.trim());
      workoutFormData.append("instruction", safeSchemeType >= 3 ? schemeRounds : "");
      workoutFormData.append("scheme_type", String(safeSchemeType));
      workoutFormData.append("scheme_rounds", schemeRounds);

      const createdWorkout = await createWorkout(workoutFormData).unwrap();

      if (!createdWorkout?.id) {
        throw new Error("Failed to create workout.");
      }

      // ── Step 5: Map AI items to WorkoutItems ──────────────────────────────
      setStatusText("Adding exercises...");

      const workoutNamesMap: Map<string, WorkoutNameProps> = new Map(
        (_workoutNames as WorkoutNameProps[]).map((wn) => [wn.name, wn])
      );

      const mappedItems = handleGenerateWorkoutItemsResponse(aiData, workoutNamesMap);

      if (mappedItems.length === 0) {
        throw new Error("AI generated no workout items.");
      }

      // Assign workout ID and process fields exactly as CreateWorkoutScreen does
      const finalItems = mappedItems.map((item, idx) => {
        const _item = { ...item };
        _item.order = idx;
        _item.workout = createdWorkout.id;
        delete (_item as any)["uuid"];

        if (safeSchemeType <= 2 && "penalty" in _item) {
          delete (_item as any)["penalty"];
        }

        _item.weights = jList(_item.weights as string);
        _item.reps    = jList(_item.reps as string);
        _item.duration = jList(_item.duration as string);
        _item.distance = jList(_item.distance as string);

        return _item;
      });

      // ── Step 6: Calculate stats/tags ──────────────────────────────────────
      const calc = new CalcWorkoutStats(workoutItemMaxesMap);
      calc.setWorkoutParams(schemeRounds, safeSchemeType, finalItems as any);
      calc.calc();
      const [tags, names] = calc.getStats();

      // ── Step 7: Create WorkoutItems ───────────────────────────────────────
      const itemsFormData = new FormData();
      itemsFormData.append("items", JSON.stringify(finalItems));
      itemsFormData.append("names", JSON.stringify(names));
      itemsFormData.append("tags", JSON.stringify(tags));
      itemsFormData.append("workout", String(createdWorkout.id));
      itemsFormData.append("workout_group", String(workoutGroup.id));

      if (safeSchemeType <= 2) {
        await createWorkoutItems(itemsFormData).unwrap();
      } else {
        await createWorkoutDualItems(itemsFormData).unwrap();
      }

      // ── Done ──────────────────────────────────────────────────────────────
      router.replace("/");
    } catch (err: any) {
      console.error("AIQuickWorkout error:", err);
      setAlertMsg(err?.message ?? "Something went wrong. Please try again.");
      setShowAlert(true);
    } finally {
      setIsGenerating(false);
      setStatusText("");
    }
  };

  return (
    <PageContainer>
      <ScrollView
        style={{ flex: 1, width: "100%" }}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <BannerAddMembership />

        <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
          <TSTitleText textStyles={{ textAlign: "center", marginBottom: 4 }}>
            AI Quick Workout
          </TSTitleText>
          <TSCaptionText
            textStyles={{
              textAlign: "center",
              color: theme.palette.gray,
              marginBottom: 24,
            }}
          >
            Describe what you want — we'll build the whole workout.
          </TSCaptionText>

          {/* Title (optional) */}
          <View style={{ marginBottom: 14 }}>
            <Input
              placeholder="Title (optional)"
              onChangeText={(t) => setTitle(limitTextLength(t, WorkoutGroupTitleLimit))}
              value={title}
              label="Title"
              containerStyle={{
                width: "100%",
                backgroundColor: theme.palette.darkGray,
                borderRadius: 8,
                paddingHorizontal: 8,
              }}
              leading={
                <Icon
                  name="barbell-outline"
                  color={theme.palette.text}
                  style={{ fontSize: 18 }}
                />
              }
            />
          </View>

          {/* Caption (optional) */}
          <View style={{ marginBottom: 14 }}>
            <Input
              placeholder="Caption (optional)"
              onChangeText={(t) => setCaption(limitTextLength(t, 120))}
              value={caption}
              label="Caption"
              containerStyle={{
                width: "100%",
                backgroundColor: theme.palette.darkGray,
                borderRadius: 8,
                paddingHorizontal: 8,
              }}
              leading={
                <Icon
                  name="chatbubble-outline"
                  color={theme.palette.text}
                  style={{ fontSize: 18 }}
                />
              }
            />
          </View>

          {/* Prompt (required) */}
          <View style={{ marginBottom: 8 }}>
            <TSInputTextSm
              textStyles={{ color: theme.palette.text, marginBottom: 6 }}
            >
              Workout Prompt *
            </TSInputTextSm>
            <TextInput
              placeholder="e.g. Upper body strength push day focused on chest and shoulders..."
              placeholderTextColor={theme.palette.gray}
              value={prompt}
              multiline
              numberOfLines={5}
              onChangeText={setPrompt}
              style={{
                borderColor: theme.palette.gray,
                borderWidth: 1,
                borderRadius: 8,
                padding: 12,
                color: theme.palette.text,
                backgroundColor: theme.palette.darkGray,
                fontSize: 14,
                minHeight: 120,
                textAlignVertical: "top",
              }}
            />
            <TSCaptionText
              textStyles={{ color: theme.palette.AWE_Green, marginTop: 4 }}
            >
              Your last workouts and 1RMs will be included automatically.
            </TSCaptionText>
          </View>

          <View style={{ marginTop: 10 }}>
            <TSInputTextSm
              textStyles={{ color: theme.palette.text, marginBottom: 6 }}
            >
              Workout Date
            </TSInputTextSm>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.8}
              style={{
                borderColor: theme.palette.gray,
                borderWidth: 1,
                borderRadius: 8,
                padding: 12,
                backgroundColor: theme.palette.darkGray,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <TSInputTextSm textStyles={{ color: theme.palette.text }}>
                {formatLongDate(forDate)}
              </TSInputTextSm>
              <Icon
                name="calendar-outline"
                color={theme.palette.text}
                style={{ fontSize: 18 }}
              />
            </TouchableOpacity>

            <DatePicker
              date={forDate}
              mode="date"
              locale="en"
              theme="dark"
              modal
              open={showDatePicker}
              onCancel={() => setShowDatePicker(false)}
              onConfirm={(date) => {
                setForDate(date);
                setShowDatePicker(false);
              }}
              buttonColor={theme.palette.text}
              title="Workout Date"
            />
          </View>

          {/* Generate button */}
          <TouchableOpacity
            onPress={handleGenerate}
            disabled={isGenerating || !isReady}
            style={{
              marginTop: 24,
              paddingVertical: 14,
              borderRadius: 12,
              backgroundColor:
                isGenerating || !isReady
                  ? theme.palette.gray
                  : theme.palette.AWE_Green,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isGenerating ? (
              <View style={{ alignItems: "center" }}>
                <ActivityIndicator color={theme.palette.white} />
                <TSInputTextSm
                  textStyles={{ color: theme.palette.white, marginTop: 6 }}
                >
                  {statusText}
                </TSInputTextSm>
              </View>
            ) : (
              <TSInputTextSm textStyles={{ color: theme.palette.white, fontWeight: "700" }}>
                Generate Workout
              </TSInputTextSm>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <AlertModal
        closeText="Close"
        bodyText={alertMsg}
        modalVisible={showAlert}
        onRequestClose={() => setShowAlert(false)}
      />
    </PageContainer>
  );
};

export default AIQuickWorkoutScreen;
