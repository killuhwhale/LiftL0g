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

const GoalChip: FunctionComponent<{ label: string }> = ({ label }) => {
  const theme = useTheme();
  return (
    <View
      style={{
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        backgroundColor: `${theme.palette.AWE_Green}33`,
        borderWidth: 1,
        borderColor: theme.palette.AWE_Green,
        marginRight: 6,
        marginBottom: 6,
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
    router.push("/input_pages/gyms/AIQuickWorkoutScreen");
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
        {/* Page title */}
        <TSTitleText textStyles={{ marginTop: 16, marginBottom: 12 }}>
          My Coach
        </TSTitleText>

        {/* ── Zone 1: Coach Identity Hero Card ─────────────────────────────── */}
        <View
          style={{
            padding: 16,
            backgroundColor: theme.palette.darkGray,
            borderRadius: 16,
            marginBottom: 12,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
            {/* Avatar bubble */}
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                backgroundColor: `${theme.palette.AWE_Green}22`,
                justifyContent: "center",
                alignItems: "center",
                marginRight: 12,
              }}
            >
              <Icon
                name="person-circle-outline"
                size={30}
                color={theme.palette.AWE_Green}
              />
            </View>

            {/* Coach type + goals */}
            <View style={{ flex: 1 }}>
              <TSCaptionText
                textStyles={{ color: theme.palette.gray, marginBottom: 2 }}
              >
                Coach Type
              </TSCaptionText>
              <TSInputTextSm
                textStyles={{ color: theme.palette.text, marginBottom: 8 }}
              >
                {profile.coachType}
              </TSInputTextSm>
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {profile.goals.map((g) => (
                  <GoalChip key={g} label={g} />
                ))}
              </View>
            </View>

            {/* Edit button — inlined in hero card */}
            <TouchableOpacity
              onPress={handleEditProfile}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 8,
                backgroundColor: theme.palette.backgroundColor,
              }}
            >
              <Icon
                name="pencil-outline"
                size={13}
                color={theme.palette.text}
                style={{ marginRight: 4 }}
              />
              <TSCaptionText textStyles={{ color: theme.palette.text }}>
                Edit
              </TSCaptionText>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Zone 2: Primary CTAs ─────────────────────────────────────────── */}
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 12 }}>
          {/* Generate Workout */}
          <TouchableOpacity
            onPress={handleGenerateWorkout}
            style={{
              flex: 1,
              paddingVertical: 18,
              borderRadius: 14,
              backgroundColor: theme.palette.AWE_Green,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon
              name="sparkles-outline"
              size={22}
              color={theme.palette.white}
              style={{ marginBottom: 6 }}
            />
            <TSCaptionText
              textStyles={{
                color: theme.palette.white,
                fontWeight: "700",
                textAlign: "center",
              }}
            >
              {"Generate\nWorkout"}
            </TSCaptionText>
          </TouchableOpacity>

          {/* Chat with Coach */}
          <TouchableOpacity
            onPress={handleOpenChat}
            style={{
              flex: 1,
              paddingVertical: 18,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: theme.palette.AWE_Blue,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon
              name="chatbubble-outline"
              size={22}
              color={theme.palette.AWE_Blue}
              style={{ marginBottom: 6 }}
            />
            <TSCaptionText
              textStyles={{
                color: theme.palette.AWE_Blue,
                textAlign: "center",
              }}
            >
              {"Chat with\nCoach"}
            </TSCaptionText>
          </TouchableOpacity>
        </View>

        {/* ── Zone 3: Compact Profile Details ──────────────────────────────── */}
        <View
          style={{
            backgroundColor: theme.palette.darkGray,
            borderRadius: 16,
            marginBottom: 12,
            overflow: "hidden",
          }}
        >
          {/* Fitness Background row */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              padding: 14,
            }}
          >
            <Icon
              name="barbell-outline"
              size={18}
              color={theme.palette.AWE_Green}
              style={{ marginRight: 10, marginTop: 2 }}
            />
            <View style={{ flex: 1 }}>
              <TSCaptionText
                textStyles={{ color: theme.palette.gray, marginBottom: 2 }}
              >
                Background
              </TSCaptionText>
              <TSInputTextSm textStyles={{ color: theme.palette.text }}>
                {profile.fitnessInfo}
              </TSInputTextSm>
            </View>
          </View>

          {/* Intra-card separator */}
          <View
            style={{
              height: 1,
              backgroundColor: theme.palette.backgroundColor,
              marginHorizontal: 14,
            }}
          />

          {/* Excluded Exercises row */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              padding: 14,
            }}
          >
            <Icon
              name="ban-outline"
              size={18}
              color={theme.palette.AWE_Red ?? theme.palette.gray}
              style={{ marginRight: 10, marginTop: 2 }}
            />
            <View style={{ flex: 1 }}>
              <TSCaptionText
                textStyles={{ color: theme.palette.gray, marginBottom: 6 }}
              >
                Excluded Exercises
              </TSCaptionText>
              {profile.excludedExercises?.length > 0 ? (
                <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                  {profile.excludedExercises.map((ex) => (
                    <View
                      key={ex}
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 20,
                        backgroundColor: `${theme.palette.AWE_Red ?? "#ff4444"}22`,
                        borderWidth: 1,
                        borderColor: theme.palette.AWE_Red ?? theme.palette.gray,
                        marginRight: 6,
                        marginBottom: 6,
                      }}
                    >
                      <TSCaptionText
                        textStyles={{
                          color: theme.palette.AWE_Red ?? theme.palette.gray,
                        }}
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
          </View>
        </View>

        {/* ── Zone 4: Memory + Token Status ────────────────────────────────── */}
        {profile?.completedOnboarding && (
          <View style={{ flexDirection: "row", gap: 10 }}>
            {/* Memory card */}
            <TouchableOpacity
              onPress={handleOpenMemory}
              style={{
                flex: 1,
                padding: 14,
                borderRadius: 16,
                backgroundColor: theme.palette.darkGray,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon
                name="chevron-forward"
                size={11}
                color={theme.palette.gray}
                style={{ position: "absolute", top: 8, right: 8 }}
              />
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 4,
                }}
              >
                <Icon
                  name="analytics-outline"
                  size={20}
                  color={memory ? theme.palette.AWE_Green : theme.palette.text}
                  style={{ marginRight: memory ? 4 : 0 }}
                />
                {memory && (
                  <View
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: theme.palette.AWE_Green,
                    }}
                  />
                )}
              </View>
              <TSCaptionText
                textStyles={{
                  color: memory ? theme.palette.AWE_Green : theme.palette.text,
                  textAlign: "center",
                  marginBottom: 2,
                }}
              >
                Memory
              </TSCaptionText>
              <TSCaptionText
                textStyles={{ color: theme.palette.gray, textAlign: "center" }}
              >
                {memory ? "Active" : "No data yet"}
              </TSCaptionText>
            </TouchableOpacity>

            {/* Token status card */}
            <View
              style={{
                flex: 2,
                padding: 14,
                borderRadius: 16,
                backgroundColor: theme.palette.darkGray,
                justifyContent: "center",
              }}
            >
              <Icon
                name="chevron-forward"
                size={11}
                color={theme.palette.gray}
                style={{ position: "absolute", top: 8, right: 8 }}
              />
              <TokenStatusBar userId={String(userData?.user?.id ?? "")} />
            </View>
          </View>
        )}
      </ScrollView>
    </PageContainer>
  );
};

export default PersonalCoachScreen;
