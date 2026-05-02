import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { ActivityIndicator, TextInput, TouchableOpacity, View } from "react-native";
import { useTheme } from "styled-components/native";
import { useFocusEffect } from "expo-router";
import {
  WorkoutGroupCardProps,
  WorkoutGroupProps,
} from "@/src/app_components/Cards/types";

import { WorkoutGroupSquares } from "@/src/app_components/Grids/WorkoutGroups/WorkoutGroupSquares";
import {
  useGetProfileViewQuery,
  useGetProfileWorkoutGroupsQuery,
  useSearchWorkoutGroupsQuery,
} from "@/src/redux/api/apiSlice";
import {
  TSParagrapghText,
  TSCaptionText,
  TSButtonText,
  TSInputTextSm,
} from "@/src/app_components/Text/Text";

import Icon from "react-native-vector-icons/Ionicons";
import BannerAddMembership from "@/src/app_components/ads/BannerAd";
import { router } from "expo-router";
import { TestIDs } from "@/src/utils/constants";
import { debounce } from "@/src/utils/algos";
import { useGenerate531Template } from "@/src/app_components/templates/fivethreeone";

function workoutGroupsEqual(
  group1: WorkoutGroupCardProps[] | undefined,
  group2: WorkoutGroupCardProps[] | undefined
): boolean {
  if (!Array.isArray(group1) || !Array.isArray(group2)) return group1 === group2;
  if (group1.length !== group2.length) return false;
  const idMap = new Map<number | string, boolean>();
  for (const w of group1) idMap.set(w.id, true);
  for (const w of group2) if (!idMap.has(w.id)) return false;
  return true;
}

const PAGE_SIZE = 20;

// ─── Action Pill Button ───────────────────────────────────────────────────────

const ActionPill: FunctionComponent<{
  label: string;
  icon: string;
  onPress: () => void;
  color?: string;
  testID?: string;
}> = ({ label, icon, onPress, color, testID }) => {
  const theme = useTheme();
  const bg = color ?? theme.palette.AWE_Green;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      testID={testID}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        backgroundColor: bg,
        marginLeft: 8,
      }}
    >
      <Icon
        name={icon}
        color={theme.palette.backgroundColor}
        style={{ fontSize: 15, marginRight: 5 }}
      />
      <TSInputTextSm
        textStyles={{
          color: theme.palette.backgroundColor,
          fontWeight: "700",
          fontSize: 13,
        }}
      >
        {label}
      </TSInputTextSm>
    </TouchableOpacity>
  );
};

// ─── Screen ───────────────────────────────────────────────────────────────────

const UserWorkoutsScreen: FunctionComponent = () => {
  const theme = useTheme();

  const [page, setPage] = useState(1);
  const {
    data: dataWG,
    isLoading: isLoadingWG,
    refetch: refetchWorkoutGroups,
  } = useGetProfileWorkoutGroupsQuery(page);

  const { five_3_1, isLoading: isTemplateLoading } = useGenerate531Template();
  const [workouts, setWorkouts] = useState<WorkoutGroupProps[]>([]);
  const maxPage = Math.ceil((dataWG?.count ?? 1) / PAGE_SIZE);

  const [isSearching, setIsSearching] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchTextDisplay, setSearchTextDisplay] = useState("");
  const [searchResults, setSearchResults] = useState<WorkoutGroupProps[]>([]);

  const { data, isLoading } = useGetProfileViewQuery("");

  const { data: searchData } = useSearchWorkoutGroupsQuery(
    { query: searchText, userID: data?.user?.id },
    { skip: !isSearching || isLoading || !data?.user?.id }
  );

  const loadMore = () => {
    if (!isLoadingWG && dataWG?.next) {
      setPage(Math.min(maxPage, page + 1));
    }
  };

  const currentWorkoutGroupsRef = useRef<{ [key: number]: number }>({});

  useFocusEffect(
    useCallback(() => {
      currentWorkoutGroupsRef.current = {};
      setPage(1);
      refetchWorkoutGroups();
    }, [refetchWorkoutGroups])
  );

  useEffect(() => {
    if (dataWG?.results?.length > 0) {
      setWorkouts((prev) => {
        const visibleResults = dataWG.results.filter((wg) => !wg.archived);

        if (page === 1) {
          currentWorkoutGroupsRef.current = Object.fromEntries(
            visibleResults.map((wg) => [wg.id, 1])
          );
          return [...visibleResults];
        }

        const incoming = new Map<number, WorkoutGroupProps>();
        for (const wg of visibleResults) {
          incoming.set(wg.id, wg);
        }

        // Update existing items with fresh data, keep items not in this page
        const merged = prev.map((wg) =>
          incoming.has(wg.id) ? incoming.get(wg.id)! : wg
        );

        // Add any genuinely new items
        for (const wg of visibleResults) {
          if (!(wg.id in currentWorkoutGroupsRef.current)) {
            currentWorkoutGroupsRef.current[wg.id] = 1;
            const idx = merged.findIndex((x) => x.for_date < wg.for_date);
            idx === -1 ? merged.push(wg) : merged.splice(idx, 0, wg);
          }
        }
        return merged.filter((wg) => !wg.archived);
      });
    } else {
      currentWorkoutGroupsRef.current = {};
      setWorkouts([]);
    }
  }, [dataWG, page]);

  useEffect(() => {
    if (isSearching && !workoutGroupsEqual(searchData, searchResults)) {
      setSearchResults(searchData);
    }
  }, [searchData]);

  const debouncedSearch = useCallback(
    debounce((text: string) => {
      setSearchText(text);
      if (text.trim()) {
        setIsSearching(true);
      } else {
        setIsSearching(false);
        setSearchResults([]);
      }
    }, 500),
    [searchText]
  );

  const handleSearchChange = useCallback(
    (text: string) => {
      setSearchTextDisplay(text);
      debouncedSearch(text);
    },
    [debouncedSearch]
  );

  const navNewWorkout = () => {
    router.push({
      pathname: "/input_pages/gyms/CreateWorkoutGroupScreen",
      params: { ownedByClass: "false", ownerID: data?.user?.id as string },
    });
  };

  const navTemplates = () => {
    router.push({ pathname: "/TemplateWorkouts" });
  };

  const listToRender = isSearching ? searchResults : workouts;
  const hasWorkouts = workouts.length > 0;
  const isLoadingInitial = isLoadingWG || (dataWG?.count > 0 && !hasWorkouts);

  return (
    <View
      style={{
        flex: 1,
        width: "100%",
        backgroundColor: theme.palette.backgroundColor,
      }}
    >
      <BannerAddMembership />

      {/* ── Header (title + actions + search) ──────────────────── */}
      <View
        style={{
          backgroundColor: theme.palette.darkGray,
          paddingHorizontal: 16,
          paddingTop: 10,
          paddingBottom: 10,
          borderBottomWidth: 1,
          borderBottomColor: `${theme.palette.lightGray}22`,
        }}
      >
        {/* Title row */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 10,
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
              Workouts
            </TSButtonText>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <ActionPill
              label="Templates"
              icon="clipboard-outline"
              onPress={navTemplates}
              color={theme.palette.AWE_Blue}
            />
            <ActionPill
              label="New Workout"
              icon="add"
              onPress={navNewWorkout}
              color={theme.palette.AWE_Green}
              testID={TestIDs.CreateWorkoutGroupScreenBtn.name()}
            />
          </View>
        </View>

        {/* Search row */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            height: 44,
            backgroundColor: theme.palette.backgroundColor,
            borderRadius: 10,
            borderWidth: 2,
            borderLeftColor: theme.palette.AWE_Yellow,
            borderTopColor: theme.palette.AWE_Blue,
            borderRightColor: theme.palette.AWE_Red,
            borderBottomColor: theme.palette.AWE_Green,
            paddingHorizontal: 10,
          }}
        >
          <Icon
            name="search"
            style={{ fontSize: 16, marginRight: 8 }}
            color={theme.palette.lightGray}
          />
          <TextInput
            value={searchTextDisplay}
            onChangeText={handleSearchChange}
            placeholder="Search workouts"
            placeholderTextColor={theme.palette.lightGray}
            style={{
              flex: 1,
              fontSize: 14,
              color: theme.palette.text,
              paddingVertical: 0,
            }}
            autoCapitalize="none"
            returnKeyType="search"
          />
        </View>
      </View>

      {/* ── Content Area ────────────────────────────────────────── */}
      {hasWorkouts ? (
        // Workout list
        <View style={{ flex: 1, paddingHorizontal: 12, paddingTop: 4 }}>
          <WorkoutGroupSquares
            data={listToRender}
            loadMore={!isSearching ? loadMore : undefined}
            extraProps={{}}
          />
        </View>
      ) : isLoadingInitial ? (
        // Loading
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="small" color={theme.palette.AWE_Green} />
        </View>
      ) : (
        // Empty state
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 32,
          }}
        >
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: `${theme.palette.AWE_Green}22`,
              borderWidth: 1.5,
              borderColor: `${theme.palette.AWE_Green}55`,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Icon
              name="barbell-outline"
              color={theme.palette.AWE_Green}
              style={{ fontSize: 26 }}
            />
          </View>

          <TSParagrapghText
            textStyles={{ textAlign: "center", marginBottom: 6 }}
          >
            No workouts yet
          </TSParagrapghText>
          <TSCaptionText
            textStyles={{
              color: theme.palette.lightGray,
              textAlign: "center",
              marginBottom: 28,
              lineHeight: 18,
            }}
          >
            Log your first session or start from a template to hit the ground running.
          </TSCaptionText>

          {data && !isLoading && (
            <View style={{ width: "100%", alignItems: "center" }}>
              {/* Primary CTA */}
              <TouchableOpacity
                onPress={navNewWorkout}
                activeOpacity={0.8}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "80%",
                  paddingVertical: 13,
                  borderRadius: 12,
                  backgroundColor: theme.palette.AWE_Green,
                  marginBottom: 12,
                }}
              >
                <Icon
                  name="add"
                  color={theme.palette.backgroundColor}
                  style={{ fontSize: 20, marginRight: 8 }}
                />
                <TSButtonText
                  textStyles={{ color: theme.palette.backgroundColor, fontSize: 15 }}
                >
                  New Workout
                </TSButtonText>
              </TouchableOpacity>

              {/* Secondary CTA */}
              <TouchableOpacity
                onPress={navTemplates}
                activeOpacity={0.8}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "80%",
                  paddingVertical: 12,
                  borderRadius: 12,
                  borderWidth: 1.5,
                  borderColor: `${theme.palette.lightGray}55`,
                }}
              >
                <Icon
                  name="clipboard-outline"
                  color={theme.palette.lightGray}
                  style={{ fontSize: 18, marginRight: 8 }}
                />
                <TSButtonText
                  textStyles={{ color: theme.palette.lightGray, fontSize: 15 }}
                >
                  Browse Templates
                </TSButtonText>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default UserWorkoutsScreen;
