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
  TSCaptionText,
  TSInputTextSm,
  TSParagrapghText,
  TSTitleText,
} from "@/src/app_components/Text/Text";
import {
  COACH_TYPES,
  FITNESS_GOALS,
  FITNESS_PROFILES,
  CoachProfile,
  getCoachProfile,
  saveCoachProfile,
} from "@/src/utils/coachStorage";
import { Container } from "@/src/app_components/shared";
import { useGetWorkoutNamesQuery } from "@/src/redux/api/apiSlice";
import { WorkoutNameProps } from "@/src/app_components/Cards/types";
import styled from "styled-components/native";

const PageContainer = styled(Container)`
  background-color: ${(props) => props.theme.palette.backgroundColor};
  justify-content: flex-start;
  width: 100%;
`;

const MAX_GOALS = 3;

const STEPS = [
  { title: "Choose Your Coach",       subtitle: "What type of coach do you want?",                  icon: "person-outline"   },
  { title: "Your Goals",              subtitle: "Pick up to 3 goals you're working toward.",         icon: "trophy-outline"   },
  { title: "Your Fitness Background", subtitle: "Pick the profile that best describes you.",         icon: "barbell-outline"  },
  { title: "Exclude Exercises",       subtitle: "Pick anything you dislike or don't have gear for.", icon: "ban-outline"      },
];

// ── Selection card ─────────────────────────────────────────────────────────────
const SelectionCard: FunctionComponent<{
  label: string;
  selected: boolean;
  onPress: () => void;
  multi?: boolean;
}> = ({ label, selected, onPress, multi }) => {
  const theme = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 16,
        marginBottom: 10,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: selected ? theme.palette.AWE_Green : theme.palette.gray,
        backgroundColor: selected
          ? `${theme.palette.AWE_Green}22`
          : theme.palette.darkGray,
      }}
    >
      <Icon
        name={
          multi
            ? selected ? "checkbox-outline" : "square-outline"
            : selected ? "radio-button-on-outline" : "radio-button-off-outline"
        }
        size={20}
        color={selected ? theme.palette.AWE_Green : theme.palette.gray}
        style={{ marginRight: 12 }}
      />
      <TSInputTextSm textStyles={{ flex: 1, color: theme.palette.text }}>
        {label}
      </TSInputTextSm>
    </TouchableOpacity>
  );
};

// ── Main screen ────────────────────────────────────────────────────────────────
const CoachOnboardingScreen: FunctionComponent = () => {
  const theme = useTheme();
  const params = useLocalSearchParams();
  const isEditing = params.edit === "true";

  const [step, setStep] = useState(0);
  const [coachType, setCoachType] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [fitnessInfo, setFitnessInfo] = useState("");
  const [excludedExercises, setExcludedExercises] = useState<string[]>([]);
  const [exerciseSearch, setExerciseSearch] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditing);

  const { data: _workoutNames, isLoading: isWNLoading } =
    useGetWorkoutNamesQuery("");
  const allExercises: string[] = ((_workoutNames as WorkoutNameProps[]) ?? []).map(
    (wn) => wn.name
  );

  const filteredExercises = exerciseSearch.trim()
    ? allExercises.filter((name) =>
        name.toLowerCase().includes(exerciseSearch.toLowerCase())
      )
    : allExercises;

  // Pre-fill when editing
  useEffect(() => {
    if (isEditing) {
      getCoachProfile().then((profile) => {
        if (profile) {
          setCoachType(profile.coachType);
          setGoals(profile.goals);
          setFitnessInfo(profile.fitnessInfo);
          setExcludedExercises(profile.excludedExercises ?? []);
        }
        setIsLoading(false);
      });
    }
  }, [isEditing]);

  const toggleGoal = (goal: string) => {
    setGoals((prev) => {
      if (prev.includes(goal)) return prev.filter((g) => g !== goal);
      if (prev.length >= MAX_GOALS) return prev;
      return [...prev, goal];
    });
  };

  const toggleExercise = (name: string) => {
    setExcludedExercises((prev) =>
      prev.includes(name) ? prev.filter((e) => e !== name) : [...prev, name]
    );
  };

  const canAdvance = () => {
    if (step === 0) return !!coachType;
    if (step === 1) return goals.length > 0;
    if (step === 2) return !!fitnessInfo;
    if (step === 3) return true; // exclusions are optional
    return false;
  };

  const handleFinish = async () => {
    setIsSaving(true);
    const profile: CoachProfile = {
      coachType,
      goals,
      fitnessInfo,
      excludedExercises,
      completedOnboarding: true,
    };
    await saveCoachProfile(profile);
    setIsSaving(false);
    router.replace("/(tabs)/PersonalCoach");
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else handleFinish();
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
    else router.back();
  };

  if (isLoading) {
    return (
      <PageContainer>
        <ActivityIndicator
          color={theme.palette.AWE_Green}
          style={{ marginTop: 40 }}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 8,
        }}
      >
        <TouchableOpacity onPress={handleBack} style={{ marginRight: 12 }}>
          <Icon name="chevron-back" size={26} color={theme.palette.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <TSTitleText textStyles={{ fontSize: 18 }}>
            {STEPS[step].title}
          </TSTitleText>
          <TSCaptionText textStyles={{ color: theme.palette.gray }}>
            {STEPS[step].subtitle}
          </TSCaptionText>
        </View>
        <TSCaptionText textStyles={{ color: theme.palette.gray }}>
          {step + 1} / {STEPS.length}
        </TSCaptionText>
      </View>

      {/* Progress bar */}
      <View
        style={{
          flexDirection: "row",
          height: 4,
          marginHorizontal: 16,
          marginBottom: 16,
          borderRadius: 4,
          overflow: "hidden",
          backgroundColor: theme.palette.darkGray,
        }}
      >
        {STEPS.map((_, i) => (
          <View
            key={i}
            style={{
              flex: 1,
              backgroundColor: i <= step ? theme.palette.AWE_Green : "transparent",
              marginHorizontal: 2,
              borderRadius: 4,
            }}
          />
        ))}
      </View>

      {/* Step content */}
      <ScrollView
        style={{ flex: 1, width: "100%" }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Step 0 — Coach type */}
        {step === 0 &&
          COACH_TYPES.map((type) => (
            <SelectionCard
              key={type}
              label={type}
              selected={coachType === type}
              onPress={() => setCoachType(type)}
            />
          ))}

        {/* Step 1 — Goals */}
        {step === 1 && (
          <>
            <TSCaptionText
              textStyles={{ color: theme.palette.AWE_Green, marginBottom: 12 }}
            >
              {goals.length}/{MAX_GOALS} selected
            </TSCaptionText>
            {FITNESS_GOALS.map((goal) => (
              <SelectionCard
                key={goal}
                label={goal}
                selected={goals.includes(goal)}
                onPress={() => toggleGoal(goal)}
                multi
              />
            ))}
          </>
        )}

        {/* Step 2 — Fitness profile */}
        {step === 2 &&
          FITNESS_PROFILES.map((profile) => (
            <SelectionCard
              key={profile}
              label={profile}
              selected={fitnessInfo === profile}
              onPress={() => setFitnessInfo(profile)}
            />
          ))}

        {/* Step 3 — Excluded exercises */}
        {step === 3 && (
          <>
            {/* Search */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: theme.palette.darkGray,
                borderRadius: 10,
                paddingHorizontal: 12,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: theme.palette.gray,
              }}
            >
              <Icon name="search" size={16} color={theme.palette.gray} style={{ marginRight: 8 }} />
              <TextInput
                placeholder="Search exercises..."
                placeholderTextColor={theme.palette.gray}
                value={exerciseSearch}
                onChangeText={setExerciseSearch}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  color: theme.palette.text,
                  fontSize: 14,
                }}
              />
              {exerciseSearch.length > 0 && (
                <TouchableOpacity onPress={() => setExerciseSearch("")}>
                  <Icon name="close-circle" size={16} color={theme.palette.gray} />
                </TouchableOpacity>
              )}
            </View>

            {/* Count badge */}
            <TSCaptionText
              textStyles={{ color: theme.palette.AWE_Red ?? theme.palette.gray, marginBottom: 12 }}
            >
              {excludedExercises.length > 0
                ? `${excludedExercises.length} excluded`
                : "None excluded — tap to exclude"}
            </TSCaptionText>

            {isWNLoading ? (
              <ActivityIndicator color={theme.palette.AWE_Green} style={{ marginTop: 20 }} />
            ) : (
              filteredExercises.map((name) => (
                <SelectionCard
                  key={name}
                  label={name}
                  selected={excludedExercises.includes(name)}
                  onPress={() => toggleExercise(name)}
                  multi
                />
              ))
            )}
          </>
        )}
      </ScrollView>

      {/* Footer CTA — fixed at bottom, big tap target */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 24,
          borderTopWidth: 1,
          borderTopColor: theme.palette.darkGray,
        }}
      >
        <TouchableOpacity
          onPress={handleNext}
          disabled={!canAdvance() || isSaving}
          style={{
            paddingVertical: 18,
            paddingHorizontal: 24,
            borderRadius: 14,
            backgroundColor:
              canAdvance() && !isSaving
                ? theme.palette.AWE_Green
                : theme.palette.gray,
            alignItems: "center",
            justifyContent: "center",
            minHeight: 56,
          }}
        >
          {isSaving ? (
            <ActivityIndicator color={theme.palette.white} />
          ) : (
            <TSParagrapghText
              textStyles={{
                color: theme.palette.white,
                fontWeight: "700",
                fontSize: 16,
              }}
            >
              {step < STEPS.length - 1
                ? "Next →"
                : isEditing
                ? "Save Changes"
                : "Let's Go 💪"}
            </TSParagrapghText>
          )}
        </TouchableOpacity>
      </View>
    </PageContainer>
  );
};

export default CoachOnboardingScreen;
