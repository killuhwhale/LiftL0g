import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  UIManager,
  LayoutAnimation,
} from "react-native";
import { useTheme } from "styled-components/native";
import { TEMPLATE_NAMES, isDateInFuture } from "@/src/app_components/shared";
import {
  TSButtonText,
  TSCaptionText,
  TSParagrapghText,
  TSSnippetText,
  TSInputText,
} from "@/src/app_components/Text/Text";
import { WorkoutGroupSquares } from "@/src/app_components/Grids/WorkoutGroups/WorkoutGroupSquares";
import {
  useGetProfileViewQuery,
  useGetTemplateWorkoutGroupsQuery,
  useResetTemplatesMutation,
} from "@/src/redux/api/apiSlice";
import { useGenerate531Template } from "@/src/app_components/templates/fivethreeone";
import Icon from "react-native-vector-icons/Ionicons";
import { useGillispieTemplate } from "@/src/app_components/templates/gillispie";
import { usePHULTemplate } from "@/src/app_components/templates/phul";
import { useGZCLPTemplate } from "@/src/app_components/templates/gzclp";
import { usePPLTemplate } from "@/src/app_components/templates/ppl";
import { useTexasMethodTemplate } from "@/src/app_components/templates/texasMethod";
import { useSmolovJrTemplate } from "@/src/app_components/templates/smolovJr";
import { useRouter } from "expo-router";
import ActionCancelModal from "@/src/app_components/modals/ActionCancelModal";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Template Metadata ────────────────────────────────────────────────────────

type AccentKey = "AWE_Blue" | "AWE_Green" | "AWE_Yellow" | "AWE_Red";

interface TemplateMeta {
  displayName: string;
  tagline: string;
  icon: string;
  tags: string[];
  accentKey: AccentKey;
  description: string;
}

const TEMPLATE_META: Record<string, TemplateMeta> = {
  [TEMPLATE_NAMES[0]]: {
    displayName: "Wendler 5/3/1",
    tagline: "Classic powerlifting cycle",
    icon: "barbell-outline",
    tags: ["4 weeks", "4 days/wk", "Strength", "Intermediate"],
    accentKey: "AWE_Blue",
    description:
      "A four-week cycle built around one main lift per session -- squat, bench, deadlift, press -- using percentage rep schemes across three weeks of increasing intensity, with the final set taken to AMRAP to drive adaptation. Progression is conservative and sustainable: +5 lb upper body, +10 lb lower body each cycle. Simple assistance templates like \"Boring But Big\" add volume without complicating programming.",
  },
  [TEMPLATE_NAMES[1]]: {
    displayName: "Gillespie",
    tagline: "Bench specialization program",
    icon: "fitness-outline",
    tags: ["3 days/wk", "Bench focus", "Hypertrophy", "Advanced"],
    accentKey: "AWE_Green",
    description:
      "Three weekly bench sessions: one heavy top-set day for maximal load, one high-volume day paired with accessory work for triceps, shoulders, back and core, and one technique day using paused reps and speed work to lock in pressing mechanics. Progression is systematic with weekly load/volume increases and planned lighter recovery weeks to optimize long-term strength gains.",
  },
  [TEMPLATE_NAMES[2]]: {
    displayName: "PHUL",
    tagline: "Power + hypertrophy, upper/lower split",
    icon: "body-outline",
    tags: ["12 weeks", "4 days/wk", "Strength + Size", "Intermediate"],
    accentKey: "AWE_Blue",
    description:
      "Power Hypertrophy Upper Lower trains each muscle twice per week across four sessions -- two power days (3-5 rep ranges, heavy compounds) and two hypertrophy days (8-12 rep ranges, higher volume). The result is simultaneous strength and size gain. Intensity increases every 4-week block, making it a great long-term intermediate program.",
  },
  [TEMPLATE_NAMES[3]]: {
    displayName: "GZCLP",
    tagline: "Linear progression for beginners",
    icon: "trending-up-outline",
    tags: ["12 weeks", "3 days/wk", "Strength", "Beginner"],
    accentKey: "AWE_Yellow",
    description:
      "GZCLP is a structured beginner barbell program based on three tiers: T1 heavy sets of 5x3+, T2 moderate sets of 3x10, and T3 lighter accessory work. Sessions alternate between squat/bench/row (Day A) and squat/press/deadlift (Day B). Progression is built in across three 4-week blocks, making it ideal for anyone starting their strength journey.",
  },
  [TEMPLATE_NAMES[4]]: {
    displayName: "Push Pull Legs",
    tagline: "High-volume hypertrophy split",
    icon: "git-branch-outline",
    tags: ["12 weeks", "6 days/wk", "Hypertrophy", "Intermediate"],
    accentKey: "AWE_Green",
    description:
      "Push Pull Legs hits every muscle group twice per week across six sessions: three heavy days (lower reps, higher intensity) and three volume days (higher reps, moderate intensity). Push days target chest, shoulders, and triceps; Pull days target back and biceps; Leg days target quads, hamstrings, and calves. Intensity progresses every four weeks.",
  },
  [TEMPLATE_NAMES[5]]: {
    displayName: "Texas Method",
    tagline: "Volume, recovery, and intensity waves",
    icon: "flag-outline",
    tags: ["12 weeks", "3 days/wk", "Strength", "Intermediate"],
    accentKey: "AWE_Red",
    description:
      "The Texas Method structures each week around three distinct stimuli: Monday is a high-volume day (5x5 at ~85%), Wednesday is a light recovery day to promote adaptation without fatigue, and Friday is a heavy intensity day chasing a new 5-rep max. Bench and press alternate weekly. Over 12 weeks, the volume and intensity percentages increase systematically, building toward significant strength PRs.",
  },
  [TEMPLATE_NAMES[6]]: {
    displayName: "Smolov Jr.",
    tagline: "Brutal 3-week squat peaking block",
    icon: "flash-outline",
    tags: ["3 weeks", "4 days/wk", "Squat Peak", "Advanced"],
    accentKey: "AWE_Red",
    description:
      "Smolov Jr. is a three-week squat specialization block designed to rapidly increase your squat max. Four squat sessions per week progress from 6x6 to 9x3 in week one, building volume and intensity through week two, then peaks with heavy triples in week three. Light upper body accessories are included to maintain pressing strength. Not for the faint of heart -- expect soreness.",
  },
};

// ─── Template Card ────────────────────────────────────────────────────────────

function TemplateCard({
  name,
  isActive,
  onPress,
}: {
  name: string;
  isActive: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  const meta = TEMPLATE_META[name];
  const color = theme.palette[meta.accentKey];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        width: 168,
        marginRight: 12,
        borderRadius: 16,
        backgroundColor: isActive ? `${color}18` : theme.palette.darkGray,
        borderWidth: isActive ? 2 : 1,
        borderColor: isActive ? color : `${theme.palette.lightGray}28`,
        padding: 14,
      }}
    >
      {/* Icon badge */}
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: `${color}28`,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 12,
        }}
      >
        <Icon name={meta.icon} color={color} style={{ fontSize: 22 }} />
      </View>

      <TSButtonText
        textStyles={{ fontSize: 14, marginBottom: 2 }}
      >
        {meta.displayName}
      </TSButtonText>
      <TSCaptionText
        textStyles={{
          color: theme.palette.lightGray,
          fontSize: 11,
          marginBottom: 10,
        }}
      >
        {meta.tagline}
      </TSCaptionText>

      {/* Tag chips */}
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {meta.tags.slice(0, 2).map((tag) => (
          <View
            key={tag}
            style={{
              backgroundColor: `${color}22`,
              borderRadius: 4,
              paddingHorizontal: 6,
              paddingVertical: 2,
              marginRight: 4,
              marginBottom: 4,
            }}
          >
            <TSCaptionText
              textStyles={{ fontSize: 9, color }}
            >
              {tag}
            </TSCaptionText>
          </View>
        ))}
      </View>

      {/* Active checkmark */}
      {isActive && (
        <View style={{ position: "absolute", top: 12, right: 12 }}>
          <Icon name="checkmark-circle" color={color} style={{ fontSize: 18 }} />
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─── Detail Card ──────────────────────────────────────────────────────────────

function TemplateDetailCard({ name }: { name: string }) {
  const theme = useTheme();
  const meta = TEMPLATE_META[name];
  const color = theme.palette[meta.accentKey];

  return (
    <View
      style={{
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 16,
        backgroundColor: theme.palette.darkGray,
        borderWidth: 1,
        borderColor: `${color}44`,
        overflow: "hidden",
      }}
    >
      {/* Coloured top strip */}
      <View style={{ height: 3, backgroundColor: color }} />

      <View style={{ padding: 16 }}>
        {/* Title + tags */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <View style={{ flex: 1, marginRight: 12 }}>
            <TSButtonText textStyles={{ fontSize: 17, marginBottom: 3 }}>
              {meta.displayName}
            </TSButtonText>
            <TSCaptionText
              textStyles={{ color: theme.palette.lightGray, fontSize: 12 }}
            >
              {meta.tagline}
            </TSCaptionText>
          </View>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              backgroundColor: `${color}22`,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name={meta.icon} color={color} style={{ fontSize: 24 }} />
          </View>
        </View>

        {/* All tag chips */}
        <View
          style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 14 }}
        >
          {meta.tags.map((tag) => (
            <View
              key={tag}
              style={{
                backgroundColor: `${color}22`,
                borderRadius: 6,
                paddingHorizontal: 8,
                paddingVertical: 3,
                marginRight: 6,
                marginBottom: 6,
                borderWidth: 1,
                borderColor: `${color}44`,
              }}
            >
              <TSCaptionText textStyles={{ fontSize: 10, color }}>
                {tag}
              </TSCaptionText>
            </View>
          ))}
        </View>

        {/* Divider */}
        <View
          style={{
            height: 1,
            backgroundColor: `${theme.palette.lightGray}22`,
            marginBottom: 12,
          }}
        />

        {/* Description */}
        <TSCaptionText
          textStyles={{
            color: theme.palette.lightGray,
            lineHeight: 19,
            fontSize: 12,
          }}
        >
          {meta.description}
        </TSCaptionText>
      </View>
    </View>
  );
}

// ─── Generate Button ──────────────────────────────────────────────────────────

function GenerateButton({
  name,
  onPress,
  loading,
}: {
  name: string;
  onPress: () => void;
  loading: boolean;
}) {
  const theme = useTheme();
  const meta = TEMPLATE_META[name];
  const color = theme.palette[meta.accentKey];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      disabled={loading}
      style={{
        marginHorizontal: 16,
        marginBottom: 24,
        borderRadius: 14,
        backgroundColor: loading ? `${color}66` : color,
        paddingVertical: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={theme.palette.backgroundColor}
          style={{ marginRight: 10 }}
        />
      ) : (
        <Icon
          name="flash"
          color={theme.palette.backgroundColor}
          style={{ fontSize: 20, marginRight: 10 }}
        />
      )}
      <TSButtonText
        textStyles={{ color: theme.palette.backgroundColor, fontSize: 16 }}
      >
        {loading ? "Generating..." : `Generate ${meta.displayName}`}
      </TSButtonText>
    </TouchableOpacity>
  );
}

// ─── Membership Gate ──────────────────────────────────────────────────────────

function MembershipGate({ onNav }: { onNav: () => void }) {
  const theme = useTheme();
  return (
    <View
      style={{
        marginHorizontal: 16,
        marginBottom: 24,
        borderRadius: 16,
        backgroundColor: theme.palette.darkGray,
        borderWidth: 1,
        borderColor: `${theme.palette.AWE_Yellow}44`,
        padding: 20,
        alignItems: "center",
      }}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: `${theme.palette.AWE_Yellow}22`,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 12,
        }}
      >
        <Icon
          name="lock-closed-outline"
          color={theme.palette.AWE_Yellow}
          style={{ fontSize: 22 }}
        />
      </View>
      <TSButtonText textStyles={{ marginBottom: 6, textAlign: "center" }}>
        Membership Required
      </TSButtonText>
      <TSCaptionText
        textStyles={{
          color: theme.palette.lightGray,
          textAlign: "center",
          marginBottom: 16,
          lineHeight: 18,
        }}
      >
        Templates are a member-only feature. Upgrade to unlock all programs.
      </TSCaptionText>
      <TouchableOpacity
        onPress={onNav}
        activeOpacity={0.8}
        style={{
          backgroundColor: theme.palette.AWE_Yellow,
          borderRadius: 10,
          paddingVertical: 11,
          paddingHorizontal: 24,
        }}
      >
        <TSButtonText
          textStyles={{ color: theme.palette.backgroundColor, fontSize: 14 }}
        >
          Become a Member
        </TSButtonText>
      </TouchableOpacity>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function TemplateWorkoutsScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [selected, setSelected] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showNeedMembership, setShowNeedMembership] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: profileData, isLoading: isUserLoading } =
    useGetProfileViewQuery("", {});

  const {
    data: groups,
    isLoading: groupsLoading,
    isFetching: groupsFetching,
    refetch,
  } = useGetTemplateWorkoutGroupsQuery(selected ?? "", {
    skip: !selected || isUserLoading,
  });

  const [_resetTemplate] = useResetTemplatesMutation();
  const { five_3_1 } = useGenerate531Template();
  const { generateGillispieTemplate } = useGillispieTemplate();
  const { generatePHUL } = usePHULTemplate();
  const { generateGZCLP } = useGZCLPTemplate();
  const { generatePPL } = usePPLTemplate();
  const { generateTexasMethod } = useTexasMethodTemplate();
  const { generateSmolovJr } = useSmolovJrTemplate();

  const handleSelect = (name: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelected((prev) => (prev === name ? null : name));
    setShowNeedMembership(false);
  };

  const handleGenerate = async () => {
    if (!profileData?.user || !isDateInFuture(profileData.user)) {
      setShowNeedMembership(true);
      return;
    }
    setIsCreating(true);
    try {
      if (selected === TEMPLATE_NAMES[0]) {
        await five_3_1();
      } else if (selected === TEMPLATE_NAMES[1]) {
        await generateGillispieTemplate();
      } else if (selected === TEMPLATE_NAMES[2]) {
        await generatePHUL();
      } else if (selected === TEMPLATE_NAMES[3]) {
        await generateGZCLP();
      } else if (selected === TEMPLATE_NAMES[4]) {
        await generatePPL();
      } else if (selected === TEMPLATE_NAMES[5]) {
        await generateTexasMethod();
      } else if (selected === TEMPLATE_NAMES[6]) {
        await generateSmolovJr();
      }
    } finally {
      setIsCreating(false);
      refetch();
    }
  };

  const handleReset = async () => {
    if (!profileData?.user || !selected) return;
    await _resetTemplate({
      user_id: profileData.user.id,
      template_name: selected,
    }).unwrap();
    setShowResetModal(false);
    refetch();
  };

  const filteredTemplates = TEMPLATE_NAMES.filter((name) => {
    const meta = TEMPLATE_META[name];
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      meta.displayName.toLowerCase().includes(q) ||
      meta.tagline.toLowerCase().includes(q) ||
      meta.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  const hasGroups = !groupsLoading && groups && groups.length > 0;
  const isBusy = groupsLoading || isCreating || groupsFetching || isUserLoading;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.palette.backgroundColor }}
    >
      {/* ── Header ────────────────────────────────────────────── */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: theme.palette.darkGray,
          borderBottomWidth: 1,
          borderBottomColor: `${theme.palette.lightGray}22`,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              width: 3,
              height: 18,
              borderRadius: 2,
              backgroundColor: theme.palette.AWE_Green,
              marginRight: 10,
            }}
          />
          <TSButtonText textStyles={{ fontSize: 16, letterSpacing: 0.5 }}>
            Templates
          </TSButtonText>
        </View>

        {/* Reset button -- only when a generated template is selected */}
        {selected && hasGroups && (
          <TouchableOpacity
            onPress={() => setShowResetModal(true)}
            activeOpacity={0.75}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: `${theme.palette.AWE_Red}55`,
            }}
          >
            <Icon
              name="refresh-outline"
              color={theme.palette.AWE_Red}
              style={{ fontSize: 14, marginRight: 5 }}
            />
            <TSCaptionText
              textStyles={{ color: theme.palette.AWE_Red, fontSize: 12 }}
            >
              Reset
            </TSCaptionText>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Search ────────────────────────────────────────────── */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 10,
          backgroundColor: theme.palette.darkGray,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            height: 40,
            backgroundColor: theme.palette.backgroundColor,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: `${theme.palette.lightGray}44`,
            paddingHorizontal: 10,
          }}
        >
          <Icon
            name="search"
            color={theme.palette.lightGray}
            style={{ fontSize: 15, marginRight: 8 }}
          />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search templates"
            placeholderTextColor={theme.palette.lightGray}
            style={{
              flex: 1,
              fontSize: 13,
              color: theme.palette.text,
              paddingVertical: 0,
            }}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Icon
                name="close-circle"
                color={theme.palette.lightGray}
                style={{ fontSize: 16 }}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Template Cards Row ────────────────────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
        style={{ flexGrow: 0 }}
      >
        {filteredTemplates.length > 0 ? (
          filteredTemplates.map((name) => (
            <TemplateCard
              key={name}
              name={name}
              isActive={name === selected}
              onPress={() => handleSelect(name)}
            />
          ))
        ) : (
          <View style={{ paddingVertical: 16, paddingHorizontal: 4 }}>
            <TSCaptionText textStyles={{ color: theme.palette.lightGray }}>
              No templates match "{searchQuery}"
            </TSCaptionText>
          </View>
        )}
      </ScrollView>

      {/* ── Content Area ──────────────────────────────────────── */}
      {!selected ? (
        // No selection prompt
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}
        >
          <Icon
            name="albums-outline"
            color={`${theme.palette.lightGray}66`}
            style={{ fontSize: 48, marginBottom: 16 }}
          />
          <TSCaptionText
            textStyles={{
              color: theme.palette.lightGray,
              textAlign: "center",
              lineHeight: 20,
            }}
          >
            Select a template above to preview it and generate your program.
          </TSCaptionText>
        </View>
      ) : isBusy ? (
        // Loading
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={theme.palette[TEMPLATE_META[selected].accentKey]} />
          <TSCaptionText
            textStyles={{ color: theme.palette.lightGray, marginTop: 12 }}
          >
            {isCreating ? "Building your program..." : "Loading..."}
          </TSCaptionText>
        </View>
      ) : hasGroups ? (
        // Existing workouts grid
        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingBottom: 8,
            }}
          >
            <TSCaptionText
              textStyles={{ color: theme.palette.lightGray, fontSize: 11 }}
            >
              {groups.length} workout{groups.length !== 1 ? "s" : ""} · {TEMPLATE_META[selected].displayName}
            </TSCaptionText>
          </View>
          <WorkoutGroupSquares
            data={groups ?? []}
            loadMore={() => {}}
            extraProps={{}}
          />
        </View>
      ) : (
        // Detail + generate (not yet generated)
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingTop: 4, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          <TemplateDetailCard name={selected} />

          {showNeedMembership ? (
            <MembershipGate
              onNav={() =>
                router.push({ pathname: "/(tabs)/Profile", params: {} })
              }
            />
          ) : (
            <GenerateButton
              name={selected}
              onPress={handleGenerate}
              loading={isCreating}
            />
          )}
        </ScrollView>
      )}

      {/* ── Reset Confirmation Modal ───────────────────────────── */}
      <ActionCancelModal
        actionText="Reset"
        closeText="Cancel"
        modalText={`Reset ${
          selected ? TEMPLATE_META[selected].displayName : ""
        } and remove all generated workouts?`}
        onAction={handleReset}
        modalVisible={showResetModal}
        onRequestClose={() => setShowResetModal(false)}
      />
    </SafeAreaView>
  );
}

function getTemplateDescription(name: string): string {
  return TEMPLATE_META[name]?.description ?? "";
}
