import React, { FunctionComponent, useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "styled-components/native";
import { router, useFocusEffect } from "expo-router";
import Icon from "react-native-vector-icons/Ionicons";
import {
  TSCaptionText,
  TSInputTextSm,
  TSParagrapghText,
  TSSnippetText,
  TSTitleText,
} from "@/src/app_components/Text/Text";
import {
  buildCoachPrompt,
  CoachProfile,
  getCoachProfile,
  getCoachMemory,
  CoachMemory,
} from "@/src/utils/coachStorage";
import TokenStatusBar from "@/src/app_components/TokenStatusBar";
import { useGetProfileViewQuery } from "@/src/redux/api/apiSlice";
import BannerAddMembership from "@/src/app_components/ads/BannerAd";
import { Container } from "@/src/app_components/shared";
import styled from "styled-components/native";

const PageContainer = styled(Container)`
  background-color: ${(props) => props.theme.palette.backgroundColor};
  justify-content: flex-start;
  width: 100%;
`;

// ── Sub-components ─────────────────────────────────────────────────────────────

const InfoRow: FunctionComponent<{
  icon: string;
  label: string;
  value: string;
}> = ({ icon, label, value }) => {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 16,
        padding: 14,
        backgroundColor: theme.palette.darkGray,
        borderRadius: 12,
      }}
    >
      <Icon
        name={icon}
        size={20}
        color={theme.palette.AWE_Green}
        style={{ marginRight: 12, marginTop: 2 }}
      />
      <View style={{ flex: 1 }}>
        <TSCaptionText textStyles={{ color: theme.palette.gray, marginBottom: 2 }}>
          {label}
        </TSCaptionText>
        <TSInputTextSm textStyles={{ color: theme.palette.text }}>
          {value}
        </TSInputTextSm>
      </View>
    </View>
  );
};

const GoalChip: FunctionComponent<{ label: string }> = ({ label }) => {
  const theme = useTheme();
  return (
    <View
      style={{
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: `${theme.palette.AWE_Green}33`,
        borderWidth: 1,
        borderColor: theme.palette.AWE_Green,
        marginRight: 8,
        marginBottom: 8,
      }}
    >
      <TSCaptionText textStyles={{ color: theme.palette.AWE_Green }}>
        {label}
      </TSCaptionText>
    </View>
  );
};

// ── Main Screen ────────────────────────────────────────────────────────────────

const PersonalCoachScreen: FunctionComponent = () => {
  const theme = useTheme();
  const [profile,   setProfile]   = useState<CoachProfile | null>(null);
  const [memory,    setMemory]    = useState<CoachMemory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { data: userData } = useGetProfileViewQuery("");

  // Reload every time the tab is focused (handles post-onboarding return)
  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      Promise.all([getCoachProfile(), getCoachMemory()]).then(([p, m]) => {
        setProfile(p);
        setMemory(m);
        setIsLoading(false);
      });
    }, [])
  );

  const handleStartOnboarding = () => {
    router.push("/input_pages/coach/CoachOnboardingScreen");
  };

  const handleEditProfile = () => {
    router.push({
      pathname: "/input_pages/coach/CoachOnboardingScreen",
      params: { edit: "true" },
    });
  };

  const handleGenerateWorkout = () => {
    if (!profile) return;
    router.push({
      pathname: "/input_pages/gyms/AIQuickWorkoutScreen",
      params: { initialPrompt: buildCoachPrompt(profile) },
    });
  };

  const handleOpenChat = () => {
    router.push("/input_pages/coach/CoachChatHistoryScreen");
  };

  const handleOpenMemory = () => {
    router.push("/input_pages/coach/CoachMemoryScreen");
  };

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <PageContainer>
        <BannerAddMembership />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator color={theme.palette.AWE_Green} />
        </View>
      </PageContainer>
    );
  }

  // ── No profile — prompt onboarding ──────────────────────────────────────────
  if (!profile?.completedOnboarding) {
    return (
      <PageContainer>
        <BannerAddMembership />
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 32,
          }}
        >
          <Icon
            name="person-circle-outline"
            size={72}
            color={theme.palette.AWE_Green}
            style={{ marginBottom: 20 }}
          />
          <TSTitleText textStyles={{ textAlign: "center", marginBottom: 10 }}>
            Meet Your Personal Coach
          </TSTitleText>
          <TSParagrapghText
            textStyles={{
              textAlign: "center",
              color: theme.palette.gray,
              marginBottom: 32,
              lineHeight: 22,
            }}
          >
            Tell us about your goals and fitness background. We'll pair you with
            the right coach and generate workouts tailored just for you.
          </TSParagrapghText>
          <TouchableOpacity
            onPress={handleStartOnboarding}
            style={{
              backgroundColor: theme.palette.AWE_Green,
              paddingVertical: 14,
              paddingHorizontal: 32,
              borderRadius: 12,
              alignItems: "center",
              width: "100%",
            }}
          >
            <TSParagrapghText
              textStyles={{ color: theme.palette.white, fontWeight: "700" }}
            >
              Set Up My Coach
            </TSParagrapghText>
          </TouchableOpacity>
        </View>
      </PageContainer>
    );
  }

  // ── Onboarded — show profile ─────────────────────────────────────────────────
  return (
    <PageContainer>
      <BannerAddMembership />
      <ScrollView
        style={{ flex: 1, width: "100%" }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 16,
            marginBottom: 20,
          }}
        >
          <TSTitleText>My Coach</TSTitleText>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            {/* Memory button */}
            <TouchableOpacity
              onPress={handleOpenMemory}
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 8,
                borderRadius: 8,
                backgroundColor: theme.palette.darkGray,
              }}
            >
              <Icon
                name="analytics-outline"
                size={16}
                color={memory ? theme.palette.AWE_Green : theme.palette.text}
                style={{ marginRight: 4 }}
              />
              <TSCaptionText
                textStyles={{
                  color: memory ? theme.palette.AWE_Green : theme.palette.text,
                }}
              >
                Memory
              </TSCaptionText>
              {/* Dot indicator when memory exists */}
              {memory && (
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: theme.palette.AWE_Green,
                    marginLeft: 4,
                  }}
                />
              )}
            </TouchableOpacity>

            {/* Edit profile button */}
            <TouchableOpacity
              onPress={handleEditProfile}
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 8,
                borderRadius: 8,
                backgroundColor: theme.palette.darkGray,
              }}
            >
              <Icon
                name="pencil-outline"
                size={16}
                color={theme.palette.text}
                style={{ marginRight: 4 }}
              />
              <TSCaptionText>Edit</TSCaptionText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Coach type */}
        <InfoRow
          icon="person-outline"
          label="Coach Type"
          value={profile.coachType}
        />

        {/* Goals */}
        <View
          style={{
            marginBottom: 16,
            padding: 14,
            backgroundColor: theme.palette.darkGray,
            borderRadius: 12,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
            <Icon
              name="trophy-outline"
              size={20}
              color={theme.palette.AWE_Green}
              style={{ marginRight: 12 }}
            />
            <TSCaptionText textStyles={{ color: theme.palette.gray }}>
              Goals
            </TSCaptionText>
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {profile.goals.map((g) => (
              <GoalChip key={g} label={g} />
            ))}
          </View>
        </View>

        {/* Fitness background */}
        <InfoRow
          icon="barbell-outline"
          label="Fitness Background"
          value={profile.fitnessInfo}
        />

        {/* Excluded exercises */}
        <View
          style={{
            marginBottom: 16,
            padding: 14,
            backgroundColor: theme.palette.darkGray,
            borderRadius: 12,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Icon
                name="ban-outline"
                size={20}
                color={theme.palette.AWE_Red ?? theme.palette.gray}
                style={{ marginRight: 12 }}
              />
              <TSCaptionText textStyles={{ color: theme.palette.gray }}>
                Excluded Exercises
              </TSCaptionText>
            </View>
            <TouchableOpacity onPress={handleEditProfile}>
              <TSCaptionText textStyles={{ color: theme.palette.AWE_Green }}>
                Edit
              </TSCaptionText>
            </TouchableOpacity>
          </View>

          {profile.excludedExercises?.length > 0 ? (
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {profile.excludedExercises.map((ex) => (
                <View
                  key={ex}
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderRadius: 20,
                    backgroundColor: `${theme.palette.AWE_Red ?? "#ff4444"}22`,
                    borderWidth: 1,
                    borderColor: theme.palette.AWE_Red ?? theme.palette.gray,
                    marginRight: 6,
                    marginBottom: 6,
                  }}
                >
                  <TSCaptionText
                    textStyles={{ color: theme.palette.AWE_Red ?? theme.palette.gray }}
                  >
                    {ex}
                  </TSCaptionText>
                </View>
              ))}
            </View>
          ) : (
            <TSCaptionText textStyles={{ color: theme.palette.gray }}>
              None — all exercises are fair game.
            </TSCaptionText>
          )}
        </View>

        {/* Token status */}
        {profile?.completedOnboarding && (
          <TokenStatusBar userId={String(userData?.user?.id ?? "")} />
        )}

        {/* Divider */}
        <View
          style={{
            height: 1,
            backgroundColor: theme.palette.darkGray,
            marginVertical: 20,
          }}
        />

        {/* Generate Workout */}
        <TSSnippetText
          textStyles={{ color: theme.palette.gray, marginBottom: 12 }}
        >
          Your coach will generate a workout based on your profile, recent
          workouts, and current 1RMs.
        </TSSnippetText>

        <TouchableOpacity
          onPress={handleGenerateWorkout}
          style={{
            paddingVertical: 16,
            borderRadius: 12,
            backgroundColor: theme.palette.AWE_Green,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
            marginBottom: 12,
          }}
        >
          <Icon
            name="sparkles-outline"
            size={20}
            color={theme.palette.white}
            style={{ marginRight: 8 }}
          />
          <TSParagrapghText
            textStyles={{ color: theme.palette.white, fontWeight: "700" }}
          >
            Generate My Next Workout
          </TSParagrapghText>
        </TouchableOpacity>

        {/* Chat */}
        <TouchableOpacity
          onPress={handleOpenChat}
          style={{
            paddingVertical: 16,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.palette.AWE_Blue,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <Icon
            name="chatbubble-outline"
            size={20}
            color={theme.palette.AWE_Blue}
            style={{ marginRight: 8 }}
          />
          <TSParagrapghText textStyles={{ color: theme.palette.AWE_Blue }}>
            Chat with Coach
          </TSParagrapghText>
        </TouchableOpacity>
      </ScrollView>
    </PageContainer>
  );
};

export default PersonalCoachScreen;
