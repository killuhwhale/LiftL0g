// src/screens/TemplateWorkoutsScreen.tsx

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Animated,
  Platform,
  UIManager,
  LayoutAnimation,
  Pressable,
} from "react-native";
import { useTheme } from "styled-components/native";
import {
  Container,
  TEMPLATE_NAMES,
  isDateInFuture,
} from "@/src/app_components/shared";
import {
  TSCaptionText,
  TSInputText,
  TSParagrapghText,
  TSSnippetText,
} from "@/src/app_components/Text/Text";
import { RegularButton } from "@/src/app_components/Buttons/buttons";
import { WorkoutGroupSquares } from "@/src/app_components/Grids/WorkoutGroups/WorkoutGroupSquares";
import {
  useGetProfileViewQuery,
  useGetTemplateWorkoutGroupsQuery,
  useResetTemplatesMutation,
} from "@/src/redux/api/apiSlice";
import { useGenerate531Template } from "@/src/app_components/templates/fivethreeone";
import Icon from "react-native-vector-icons/Ionicons";
import { useGillispieTemplate } from "@/src/app_components/templates/gillispie";
import { useRouter } from "expo-router";
import ActionCancelModal from "@/src/app_components/modals/ActionCancelModal";

const TEMPLATE_NAMES_DISPLAY = {
  [TEMPLATE_NAMES[0]]: "Wendler",
  [TEMPLATE_NAMES[1]]: "Gillispie",
};

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export function CollapsibleDescription({
  selected,
  getTemplateDescription,
}: {
  selected: string | null;
  getTemplateDescription: (name: string) => string;
}) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  // whenever we toggle, animate the next layout change
  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((v) => !v);
  };

  // reset open or not when we pick a new template
  useEffect(() => {
    setExpanded(expanded);
  }, [selected]);

  if (!selected) return null;

  return (
    <View
      style={{
        marginHorizontal: 16,
        marginBottom: 12,
      }}
    >
      <TouchableOpacity
        onPress={toggle}
        style={{
          paddingVertical: 8,
        }}
      >
        <TSCaptionText
          textStyles={{
            color: theme.palette.AWE_Green,
            fontSize: 16,
          }}
        >
          {expanded ? "Hide description ▼" : "Show description ▲"}
        </TSCaptionText>
      </TouchableOpacity>

      {expanded && (
        <View
          style={[
            styles.descriptionCard,
            { backgroundColor: theme.palette.AWE_Green },
          ]}
        >
          <TSParagrapghText textStyles={{ color: theme.palette.text }}>
            {getTemplateDescription(selected)}
          </TSParagrapghText>
        </View>
      )}
    </View>
  );
}

export default function TemplateWorkoutsScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [selected, setSelected] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showNeedMembership, setShowNeedMembership] = useState(false);

  const {
    data: profileData,
    isLoading: isUserLoading,
    error: userError,
  } = useGetProfileViewQuery("", {});

  const {
    data: groups,
    isLoading: loading,
    isFetching: fetchingMore,
    refetch,
  } = useGetTemplateWorkoutGroupsQuery(selected ?? "", {
    skip: !selected || isUserLoading,
  });

  const [_resetTemplate, {}] = useResetTemplatesMutation();
  const [showResetTemplateModal, setShowResetTemplateModal] = useState(false);
  const resetTemplate = async () => {
    console.log("Removing template: ");
    const templateData = {
      user_id: profileData.user.id,
      template_name: selected,
    };
    const res = await _resetTemplate(templateData).unwrap();
    setShowResetTemplateModal(false);
    if (res.data) {
      refetch();
    }
  };

  const loadMore = () => console.log("Not paginated...");
  const { five_3_1, isLoading: isTemplateLoading } = useGenerate531Template();
  const { generateGillispieTemplate } = useGillispieTemplate();

  const handleGenerateTemplate = async () => {
    if (
      (!profileData && !profileData.user) ||
      !isDateInFuture(profileData.user)
    ) {
      console.log("Prompt non-user to get membership")!;
      setShowNeedMembership(true);
      return;
    }

    if (selected == TEMPLATE_NAMES[0]) {
      console.log("Generating template for: ", TEMPLATE_NAMES[0]);
      await five_3_1();
      refetch();
    } else if (selected == TEMPLATE_NAMES[1]) {
      console.log("Generating template for: ", TEMPLATE_NAMES[1]);
      setIsCreating(true);
      await generateGillispieTemplate();
      setIsCreating(false);
      refetch();
    }
  };

  const navToProfile = () => {
    router.push({
      pathname: "/(tabs)/Profile",
      params: {},
    });
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.palette.backgroundColor }}
    >
      {/* Header */}
      <View style={{}}>
        <TSCaptionText
          textStyles={{
            color: theme.palette.text,
            marginVertical: 12,
            fontSize: 18,
            textAlign: "center",
          }}
        >
          Select a Template
        </TSCaptionText>
      </View>

      <View style={{}}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillScroll}
        >
          {TEMPLATE_NAMES.map((name) => {
            const isActive = name === selected;
            return (
              <TouchableOpacity
                key={name}
                onPress={() => setSelected(name)}
                style={[
                  styles.pill,
                  {
                    backgroundColor: isActive
                      ? theme.palette.secondary.main
                      : theme.palette.primary.main,
                  },
                ]}
              >
                <TSCaptionText
                  textStyles={{
                    color: isActive
                      ? theme.palette.primary.contrastText
                      : theme.palette.secondary.contrastText,
                  }}
                >
                  {TEMPLATE_NAMES_DISPLAY[name]}
                </TSCaptionText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={{}}>
        {!loading && groups && groups.length > 0 ? (
          <Pressable onPress={() => setShowResetTemplateModal(true)}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginLeft: 12,
                marginTop: 8,
              }}
            >
              <TSInputText>Reset</TSInputText>
              <Icon
                name="refresh"
                color={theme.palette.text}
                style={{ fontSize: 16, marginLeft: 8 }}
              />
            </View>
            <ActionCancelModal
              actionText="Reset"
              closeText="Cancel"
              modalText={`Reset ${
                TEMPLATE_NAMES_DISPLAY[selected ?? ""]
              } template?`}
              onAction={() => {
                resetTemplate();
              }}
              modalVisible={showResetTemplateModal}
              onRequestClose={() => setShowResetTemplateModal(false)}
            />
          </Pressable>
        ) : (
          <></>
        )}
      </View>

      <View style={{}}>
        {selected && (
          <CollapsibleDescription
            getTemplateDescription={getTemplateDescription}
            selected={selected}
          />
        )}
      </View>

      <View style={{ flex: 1 }}>
        {/* Workout groups grid */}
        {selected &&
          (loading || isCreating || fetchingMore || isUserLoading ? (
            <ActivityIndicator
              size="large"
              color={theme.palette.primary.main}
              style={{ marginTop: 32 }}
            />
          ) : !loading && groups && groups.length > 0 ? (
            <WorkoutGroupSquares
              data={groups ?? []}
              loadMore={loadMore}
              extraProps={{}}
            />
          ) : (
            <View style={{}}>
              {showNeedMembership ? (
                <View style={{ padding: 24 }}>
                  <TSSnippetText
                    textStyles={{ marginVertical: 6, textAlign: "center" }}
                  >
                    Sign up for a membership to create templates!
                  </TSSnippetText>
                  <RegularButton
                    underlayColor="#cacaca30"
                    btnStyles={{
                      backgroundColor: "#cacaca00",
                      borderTopColor: "#cacaca92",
                      borderBottomColor: "#cacaca92",
                      borderWidth: 2,
                      width: "100%",
                      marginVertical: 8,
                    }}
                    onPress={() => {
                      navToProfile();
                    }}
                  >
                    <TSSnippetText
                      textStyles={{
                        padding: 6,
                        color: theme.palette.AWE_Blue,
                      }}
                    >
                      Become a Member
                    </TSSnippetText>
                  </RegularButton>
                </View>
              ) : (
                <></>
              )}

              {!showNeedMembership ? (
                <RegularButton
                  underlayColor="#cacaca30"
                  btnStyles={{
                    backgroundColor: "#cacaca00",
                    borderTopColor: "#cacaca92",
                    borderBottomColor: "#cacaca92",
                    borderWidth: 2,
                    width: "100%",
                  }}
                  onPress={() => {
                    handleGenerateTemplate();
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <Icon
                      name="add"
                      color={theme.palette.text}
                      style={{ fontSize: 32, marginRight: 16 }}
                    />
                    <TSSnippetText>
                      Generate{" "}
                      <TSParagrapghText
                        textStyles={{ color: theme.palette.AWE_Green }}
                      >
                        {TEMPLATE_NAMES_DISPLAY[selected]}
                      </TSParagrapghText>{" "}
                      Template
                    </TSSnippetText>
                  </View>
                </RegularButton>
              ) : (
                <></>
              )}
            </View>
          ))}
      </View>
    </SafeAreaView>
  );
}

// you can replace this with real descriptions fetched from your API
function getTemplateDescription(name: string): string {
  switch (name) {
    case TEMPLATE_NAMES[0]:
      return "A four-week cycle built around one main lift per session (squat, bench, deadlift, press) using percentage rep schemes of 65%/75%/85%, 70%/80%/90%, and 75%/85%/95% of your training max, with the final set taken to an AMRAP to drive intensity. Simple assistance templates (like “Boring But Big”) provide volume and hypertrophy without overcomplicating programming. Progression is linear and conservative—add 5 lb to upper-body lifts and 10 lb to lower-body lifts each cycle—emphasizing slow, sustainable strength gains and solid technique.";
    case TEMPLATE_NAMES[1]:
      return "The Gillespie Strength Program revolves around three weekly bench sessions—one heavy top-set day for maximal load, one high-volume day paired with accessory movements for triceps, shoulders, back, and core, and one technique day using paused reps and speed work to solidify pressing mechanics. Each bench variation is complemented by targeted assistance lifts that shore up weak points and promote balanced muscular development and shoulder health. Progression is systematic, with weekly increases in load or volume and planned lighter “recovery” weeks to optimize adaptation and long‐term strength gains.";

    default:
      return "";
  }
}

const styles = StyleSheet.create({
  pillScroll: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 6,
    height: 32,
  },
  descriptionCard: {
    borderRadius: 12,
    padding: 12,
    marginVertical: 16,
  },
  toggle: { padding: 8, fontWeight: "600" },
});
