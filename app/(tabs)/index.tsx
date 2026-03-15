import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import { useTheme } from "styled-components/native";
import {
  WorkoutGroupCardProps,
  WorkoutGroupProps,
} from "@/src/app_components/Cards/types";

import FilterGrid from "@/src/app_components/Grids/FilterGrid";
import { WorkoutGroupSquares } from "@/src/app_components/Grids/WorkoutGroups/WorkoutGroupSquares";
import {
  useGetProfileViewQuery,
  useGetProfileWorkoutGroupsQuery,
  useSearchWorkoutGroupsQuery,
} from "@/src/redux/api/apiSlice";
import {
  TSParagrapghText,
  TSCaptionText,
  TSInputTextSm,
} from "@/src/app_components/Text/Text";
import { RegularButton } from "@/src/app_components/Buttons/buttons";

import Icon from "react-native-vector-icons/Ionicons";
import BannerAddMembership from "@/src/app_components/ads/BannerAd";
import { router } from "expo-router";
import twrnc from "twrnc";
import { TestIDs } from "@/src/utils/constants";
import Input from "@/src/app_components/Input/input";
import { debounce } from "@/src/utils/algos";
import { useGenerate531Template } from "@/src/app_components/templates/fivethreeone";

/** Must match backend!!!
 *
 * class WorkoutGroupPagination(PageNumberPagination):
    page_size = 1

 */

function workoutGroupsEqual(
  group1: WorkoutGroupCardProps[],
  group2: WorkoutGroupCardProps[]
): boolean {
  if (group1.length !== group2.length) {
    return false;
  }

  const idMap1 = new Map<number | string, boolean>();
  for (const workout of group1) {
    idMap1.set(workout.id, true);
  }

  for (const workout of group2) {
    if (!idMap1.has(workout.id)) {
      return false;
    }
  }

  return true;
}

const PAGE_SIZE = 20;

const UserWorkoutsScreen: FunctionComponent = (props) => {
  const theme = useTheme();

  const [page, setPage] = useState(1);
  const {
    data: dataWG,
    isLoading: isLoadingWG,
    isSuccess: isSuccessWG,
    isError: isErrorWG,
    error: errorWG,
  } = useGetProfileWorkoutGroupsQuery(page);
  const { five_3_1, isLoading: isTemplateLoading } = useGenerate531Template();
  const [workouts, setWorkouts] = useState<WorkoutGroupProps[]>([]); // Recent works list
  const maxPage = Math.ceil((dataWG?.count ? dataWG?.count : 1) / PAGE_SIZE);

  const [isSearching, setIsSearching] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchTextDisplay, setSearchTextDisplay] = useState("");
  const [searchResults, setSearchResults] = useState<WorkoutGroupProps[]>([]); // Search resutls

  const {
    data: profileData,
    isLoading: isUserLoading,
    error: userError,
  } = useGetProfileViewQuery("");

  const {
    data: searchData,
    isFetching: isFetchingSearch,
    refetch: refetchSearch,
  } = useSearchWorkoutGroupsQuery(
    { query: searchText, userID: profileData?.user?.id },
    { skip: !isSearching || isUserLoading }
  );

  const loadMore = () => {
    if (!isLoadingWG && dataWG?.next) {
      console.log("Loading more: maxPage: ", maxPage, dataWG?.count, PAGE_SIZE);
      setPage(Math.min(maxPage, page + 1));
    }
  };

  const currentWorkoutGroupsRef = useRef<{ [key: number]: number }>({});
  useEffect(() => {
    if (dataWG && dataWG?.results && dataWG?.results.length > 0) {
      setWorkouts((prevWorkouts) => {
        const newWorkouts: WorkoutGroupProps[] = [];

        [...dataWG?.results].map((wgRes: WorkoutGroupProps) => {
          if (!(wgRes.id in currentWorkoutGroupsRef.current)) {
            newWorkouts.push(wgRes);
            currentWorkoutGroupsRef.current[wgRes.id] = 1;
          }

          return wgRes;
        });

        return [...prevWorkouts, ...newWorkouts].sort((a, b) =>
          a.for_date > b.for_date ? -1 : 1
        );
      });
    } else {
      setWorkouts([]);
    }
  }, [dataWG]);

  const { data, isLoading, isSuccess, isError, error } =
    useGetProfileViewQuery("");

  const handleNavCreateWorkoutGroupScreen = () => {
    console.log("Navigating to CreateWorkoutGroupScreen");
    router.push({
      pathname: "/input_pages/gyms/CreateWorkoutGroupScreen",
      params: {
        ownedByClass: "false",
        ownerID: data.user.id as string,
      },
    });
  };
  const handleNavViewTemplateWorkoutScreen = () => {
    console.log("Navigating to handleNavViewTemplateWorkoutScreen");
    router.push({
      pathname: "/TemplateWorkouts",
    });
  };

  useEffect(() => {
    if (isSearching && !workoutGroupsEqual(searchData, searchResults)) {
      setSearchResults(searchData);
    }
  }, [searchData]);

  const listToRender = isSearching ? searchResults : workouts;
  // console.log("listToRender: ", listToRender);

  // Create a debounced filter function
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

  // Handle search input change
  const handleSearchChange = useCallback(
    (text: string) => {
      setSearchTextDisplay(text);
      debouncedSearch(text);
    },
    [debouncedSearch]
  );

  return (
    <View
      style={{
        width: "100%",
        height: "100%",
        flex: 1,
        backgroundColor: theme.palette.backgroundColor,
      }}
    >
      <BannerAddMembership />
      <View
        style={{
          width: "100%",
          flexDirection: "row",
          justifyContent: "flex-end",
          paddingLeft: 8,
          paddingTop: 8,
          paddingRight: 8,
        }}
      >
        <TouchableOpacity
          activeOpacity={0.69}
          onPress={handleNavCreateWorkoutGroupScreen}
          style={{
            padding: 4,
          }}
        >
          <View style={{ alignItems: "center" }}>
            <View
              style={{
                borderRadius: 8,
                backgroundColor: theme.palette.AWE_Green,
                padding: 4,
              }}
            >
              <Icon
                name="add"
                testID={TestIDs.CreateWorkoutGroupScreenBtn.name()}
                color={theme.palette.text}
                style={{
                  fontSize: 24,
                }}
              />
            </View>
            <TSInputTextSm textStyles={{ textAlign: "center" }}>
              New Workout
            </TSInputTextSm>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.69}
          onPress={handleNavViewTemplateWorkoutScreen}
          style={{
            padding: 4,
            borderRadius: 12,
          }}
        >
          <View style={{ alignItems: "center" }}>
            <View
              style={{
                borderRadius: 8,
                backgroundColor: theme.palette.AWE_Green,
                padding: 4,
              }}
            >
              <Icon
                name="clipboard-outline"
                testID={TestIDs.CreateWorkoutGroupScreenBtn.name()}
                color={theme.palette.text}
                style={{
                  fontSize: 24,
                }}
              />
            </View>
            <TSInputTextSm textStyles={{ textAlign: "center" }}>
              Templates
            </TSInputTextSm>
          </View>
        </TouchableOpacity>
      </View>

      {workouts.length ? (
        <View style={{ padding: 12, height: "100%", width: "100%" }}>
          <View style={{ flex: 15 }}>
            <View style={{ flex: 1 }}>
              <Input
                onChangeText={handleSearchChange}
                value={searchTextDisplay}
                inputStyles={{ fontSize: 14 }}
                focus={false}
                containerStyle={{
                  width: "100%",
                  backgroundColor: theme.palette.backgroundColor,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderLeftColor: theme.palette.AWE_Yellow,
                  borderTopColor: theme.palette.AWE_Blue,
                  borderRightColor: theme.palette.AWE_Red,
                  borderBottomColor: theme.palette.AWE_Green,
                }}
                leading={
                  <Icon
                    name="search"
                    style={{ fontSize: 16 }}
                    color={theme.palette.text}
                  />
                }
                label=""
                placeholder="Search workouts..."
              />
            </View>

            <View style={{ flex: 10, marginBottom: 12 }}>
              <WorkoutGroupSquares
                data={listToRender}
                loadMore={!isSearching ? loadMore : undefined}
                extraProps={{}}
              />
            </View>
          </View>
        </View>
      ) : isLoadingWG || dataWG?.count > 0 ? (
        <View
          style={{
            flex: 10,
            height: "100%",
            width: "100%",
            justifyContent: "center",
          }}
        >
          <ActivityIndicator size="small" color={theme.palette.text} />
        </View>
      ) : (
        <View
          style={{
            flex: 60,
            height: "100%",
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <TSCaptionText textStyles={{ textAlign: "center", marginBottom: 22 }}>
            No workouts!
          </TSCaptionText>

          {data && !isLoading ? (
            <View style={{ width: "50%", alignSelf: "center" }}>
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
                  router.push({
                    pathname: "/input_pages/gyms/CreateWorkoutGroupScreen",
                    params: {
                      ownedByClass: "false",
                      ownerID: data.user.id,
                    },
                  });
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
                  <TSParagrapghText>New workout</TSParagrapghText>
                </View>
              </RegularButton>
            </View>
          ) : (
            <></>
          )}
        </View>
      )}
    </View>
  );
};

export default UserWorkoutsScreen;
