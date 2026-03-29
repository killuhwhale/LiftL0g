import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styled from "styled-components/native";
import {
  COMPLETED_WORKOUT_MEDIA,
  Container,
  MEDIA_CLASSES,
  WORKOUT_MEDIA,
  CalcWorkoutStats,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  lightRed,
  red,
  lightenHexColor,
} from "../src/app_components/shared";
import {
  TSCaptionText,
  TSParagrapghText,
  LargeText,
  TSTitleText,
} from "../src/app_components/Text/Text";

import { useTheme } from "styled-components/native";
import { WorkoutCardFullList } from "../src/app_components/Cards/cardList";

import {
  WorkoutCardProps,
  WorkoutDualItemProps,
  WorkoutGroupCardProps,
  WorkoutGroupProps,
  WorkoutItemProps,
  WorkoutItems,
} from "../src/app_components/Cards/types";
import { ScrollView } from "react-native-gesture-handler";
import {
  ActivityIndicator,
  Pressable,
  Switch,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import {
  useDeleteCompletedWorkoutGroupMutation,
  useDeleteWorkoutGroupMutation,
  useFinishWorkoutGroupMutation,
  useGetCompletedWorkoutByWorkoutIDQuery,
  useGetCompletedWorkoutQuery,
  useGetUserInfoQuery,
  useGetWorkoutsForGymClassWorkoutGroupQuery,
  useGetWorkoutsForUsersWorkoutGroupQuery,
  useUpdateWorkoutGroupCaptionMutation,
  useUpdateWorkoutGroupForDateMutation,
  useUpdateWorkoutGroupTitleMutation,
} from "../src/redux/api/apiSlice";

import Icon from "react-native-vector-icons/Ionicons";

import { MediaURLSliderClass } from "../src/app_components/MediaSlider/MediaSlider";
import ActionCancelModal from "../src/app_components/modals/ActionCancelModal";
import { StatsPanel } from "../src/app_components/Stats/StatsPanel";
import { TestIDs } from "../src/utils/constants";
import BannerAddMembership from "../src/app_components/ads/BannerAd";
import FinishDualWorkoutItems from "../src/app_components/modals/finishDualWorkoutItems";
import { router, useLocalSearchParams } from "expo-router";
import DuplicateWorkoutGroupModal from "@/src/app_components/modals/DuplicateWorkoutGroupModal";
import {
  dateFormat,
  dateFormatDayOfWeek,
  parseWorkoutDateToPickerDate,
} from "@/src/utils/algos";
import FullScreenSpinner from "@/src/app_components/Spinner";
import DatePicker from "react-native-date-picker";
import TextFieldModal from "@/src/app_components/modals/TextFieldModal";
import { UserProps } from "./types";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
const Row = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;

const hasUnfinsihedDualItems = (workouts: WorkoutCardProps[]) => {
  let found = false;
  workouts.forEach((workout) => {
    if (workout.scheme_type > 2) {
      //  Check dualItems
      workout.workout_items?.forEach((item: WorkoutDualItemProps) => {
        if (!item.finished) {
          found = true;
        }
      });
    }
  });
  return found;
};

type WSHeaderProps = {
  user: UserProps;
  isSuccess: boolean;
  completedIsSuccess: boolean;
  showingOGWorkoutGroup: boolean;
  dataIsLoading: boolean;
  isFinished: boolean;
  personalWorkout: boolean;
  WGOwner: boolean;
  workoutGroup: WorkoutGroupCardProps;
  setShowingOGWorkoutGroup: React.Dispatch<React.SetStateAction<boolean>>;
  updatedCaption: string;
  showUpdateCaption: boolean;
  setShowUpdateCaption: React.Dispatch<React.SetStateAction<boolean>>;
  onUpdateCaption: (text: string) => void;
  updateForDate: Date;
  showUpdateForDate: boolean;
  setShowUpdateForDate: React.Dispatch<React.SetStateAction<boolean>>;
  onUpdateForDate: (date: Date) => void;
};

const WorkoutScreenHeader: FunctionComponent<WSHeaderProps> = ({
  user,
  isSuccess,
  completedIsSuccess,
  showingOGWorkoutGroup,
  dataIsLoading,
  workoutGroup,
  isFinished,
  personalWorkout,
  WGOwner,
  setShowingOGWorkoutGroup,
  updatedCaption,
  showUpdateCaption,
  setShowUpdateCaption,
  onUpdateCaption,
  updateForDate,
  showUpdateForDate,
  setShowUpdateForDate,
  onUpdateForDate,
}) => {
  const theme = useTheme();
  const [updatedTitle, setUpdatedTitle] = useState(workoutGroup.title);
  const [showUpdateTitle, setShowUpdateTitle] = useState(false);
  const [updateTitleMutation] = useUpdateWorkoutGroupTitleMutation();
  const workoutCount = workoutGroup.workouts?.length
    ? workoutGroup.workouts.length
    : workoutGroup.completed_workouts?.length
    ? workoutGroup.completed_workouts.length
    : 0;
  const canEditWorkoutGroup = WGOwner && showingOGWorkoutGroup && !isFinished;
  const canShowCompletedToggle = isSuccess && completedIsSuccess;

  useEffect(() => {
    if (workoutGroup.title != updatedTitle) {
      setUpdatedTitle(workoutGroup.title);
    }
  }, [workoutGroup]);

  const updateTitle = async (title: string) => {
    try {
      await updateTitleMutation({
        id: workoutGroup.id,
        title: title,
        user_id: user.id,
      }).unwrap();
    } catch (err) {
      console.log("Failed to update caption: ", title, err);
    }
  };

  console.log(
    "workoutGroup.title, updatedTitle",
    workoutGroup.title,
    updatedTitle
  );
  return (
    <View style={{ width: "100%", paddingHorizontal: 12, paddingBottom: 10 }}>
      <View
        style={{
          width: "100%",
          borderRadius: 20,
          backgroundColor: lightenHexColor(theme.palette.darkGray, 0.15),
          borderWidth: 1,
          borderColor: lightenHexColor(theme.palette.gray, 0.2),
          padding: 16,
        }}
      >
        {/* Title */}
        <Pressable
          disabled={!canEditWorkoutGroup}
          onPress={() => setShowUpdateTitle(true)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 14,
          }}
        >
          <TSTitleText textStyles={{ marginVertical: 0, flex: 1 }}>
            {updatedTitle}
          </TSTitleText>
          {canEditWorkoutGroup ? (
            <Icon
              name="pencil-outline"
              color={theme.palette.AWE_Yellow}
              style={{ fontSize: 16, marginLeft: 10 }}
            />
          ) : null}
        </Pressable>

        {/* Divider */}
        <View
          style={{
            height: 1,
            backgroundColor: lightenHexColor(theme.palette.gray, 0.15),
            marginBottom: 12,
          }}
        />

        {/* Status pill + workout count + date + OG/Completed toggle */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: isFinished
                ? lightenHexColor(theme.palette.primary.main, 0.15)
                : lightenHexColor(theme.palette.AWE_Green, 0.12),
              borderRadius: 999,
              paddingHorizontal: 10,
              paddingVertical: 5,
              marginRight: 10,
            }}
          >
            <View
              style={{
                width: 7,
                height: 7,
                borderRadius: 4,
                backgroundColor: isFinished
                  ? theme.palette.primary.main
                  : theme.palette.AWE_Green,
                marginRight: 6,
              }}
            />
            <TSCaptionText
              textStyles={{
                fontWeight: "700",
                letterSpacing: 0.6,
                textTransform: "uppercase",
              }}
            >
              {isFinished ? "Completed" : "In Progress"}
            </TSCaptionText>
          </View>

          {workoutCount > 0 ? (
            <TSCaptionText
              textStyles={{
                color: lightenHexColor(theme.palette.text, 0.5),
                fontWeight: "500",
              }}
            >
              {workoutCount === 1 ? "1 workout" : `${workoutCount} workouts`}
            </TSCaptionText>
          ) : null}

          <View style={{ flex: 1 }} />

          {/* Date — tappable, right of status row */}
          <Pressable
            onPress={() => setShowUpdateForDate(true)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginLeft: 10,
            }}
          >
            <Icon
              name="calendar-outline"
              color={theme.palette.primary.main}
              style={{ fontSize: 13, marginRight: 5 }}
            />
            <TSCaptionText
              textStyles={{ color: lightenHexColor(theme.palette.text, 0.7) }}
            >
              {dateFormatDayOfWeek(new Date(updateForDate))}
            </TSCaptionText>
            <DatePicker
              date={updateForDate}
              onDateChange={() => {}}
              mode="date"
              locale="en"
              theme="dark"
              maximumDate={new Date("2100-01-01")}
              onCancel={() => setShowUpdateForDate(false)}
              onConfirm={(date) => {
                onUpdateForDate(date);
                setShowUpdateForDate(false);
              }}
              modal={true}
              open={showUpdateForDate}
              title={"For Date"}
            />
          </Pressable>

          {canShowCompletedToggle ? (
            <Pressable
              onPress={() => setShowingOGWorkoutGroup(!showingOGWorkoutGroup)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: showingOGWorkoutGroup
                  ? lightenHexColor(theme.palette.backgroundColor, 0.2)
                  : lightenHexColor(theme.palette.primary.main, 0.18),
                borderRadius: 12,
                paddingHorizontal: 10,
                paddingVertical: 7,
                marginLeft: 8,
              }}
            >
              <Icon
                name={
                  showingOGWorkoutGroup
                    ? "layers-outline"
                    : "checkmark-done-outline"
                }
                color={
                  showingOGWorkoutGroup
                    ? theme.palette.text
                    : theme.palette.primary.main
                }
                style={{ fontSize: 14, marginRight: 5 }}
              />
              <TSCaptionText
                textStyles={{
                  fontWeight: "700",
                  color: showingOGWorkoutGroup
                    ? theme.palette.text
                    : theme.palette.primary.main,
                }}
              >
                {showingOGWorkoutGroup ? "Original" : "Completed"}
              </TSCaptionText>
            </Pressable>
          ) : null}
        </View>

        {/* Caption — full width */}
        <Pressable
          style={{
            width: "100%",
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: lightenHexColor(theme.palette.backgroundColor, 0.3),
            borderRadius: 10,
            paddingHorizontal: 10,
            paddingVertical: 8,
          }}
          onPress={() => setShowUpdateCaption(true)}
        >
          <Icon
            name="document-text-outline"
            color={lightenHexColor(theme.palette.text, 0.45)}
            style={{ fontSize: 13, marginRight: 7 }}
          />
          <TSCaptionText
            textStyles={{
              color: updatedCaption
                ? theme.palette.text
                : lightenHexColor(theme.palette.text, 0.4),
            }}
          >
            {updatedCaption || "Add notes..."}
          </TSCaptionText>
          <TextFieldModal
            bodyText="Update Group Caption"
            closeText="Close"
            modalVisible={showUpdateCaption}
            onAction={(text: string) => {
              onUpdateCaption(text);
            }}
            onRequestClose={() => setShowUpdateCaption(false)}
            initText={updatedCaption}
            key="updateCaptionModal"
          />
        </Pressable>
      </View>

      <TextFieldModal
        bodyText="Update Group Title"
        closeText="Close"
        modalVisible={showUpdateTitle}
        onAction={(text: string) => {
          console.log("User wants new title to be: ", text);
          setUpdatedTitle(text);
          updateTitle(text)
            .then()
            .catch((err) => console.log(err));
        }}
        onRequestClose={() => setShowUpdateTitle(false)}
        initText={updatedTitle}
        key="updateTitleModal"
      />
    </View>
  );
};

const WorkoutScreen: FunctionComponent = () => {
  const params = useLocalSearchParams();
  const { id } = params || {}; // Workout group

  const theme = useTheme();
  const [showClassIsDeleted, setShowClassIsDeleted] = useState(false);
  const [curGroupID, setCurGroupID] = useState(id);
  const [showFinishDualWorkoutItems, setShowFinishDualWorkoutItems] =
    useState(false);

  const {
    data: userData,
    isLoading: userIsloading,
    isSuccess: userIsSuccess,
    isError: userIsError,
    error: userError,
  } = useGetUserInfoQuery("");

  let mediaClass = -1;
  let isShowingOGWorkoutGroup = true;

  // Data to use for View
  // let data = {} as WorkoutGroupProps;
  // let dataIsLoading = true;
  // let isSuccess = false;
  // let isError = false;
  // let error: any = "";
  // data = data;
  // dataIsLoading = dataIsLoading;
  // isSuccess = isSuccess;
  // isError = isError;
  // error = error;

  const {
    data,
    isLoading: dataIsLoading,
    isSuccess,
    isError,
    error,
  } = useGetWorkoutsForUsersWorkoutGroupQuery(curGroupID);

  const [workoutGroup, setWorkoutGroup] = useState(
    data ?? ({ for_date: dateFormat(new Date()) } as WorkoutGroupProps)
  );

  const [workouts, setWorkouts] = useState(
    workoutGroup.workouts
      ? workoutGroup.workouts
      : workoutGroup.completed_workouts
      ? workoutGroup.completed_workouts
      : []
  );

  useEffect(() => {
    console.log("Workout group data changed, update vars: ", data);
    if (!data) return;

    setWorkoutGroup(data);
    setUpdatedCaption(data.caption);
    setUpdateForDate(parseWorkoutDateToPickerDate(data.for_date));

    setWorkouts(
      data.workouts
        ? data.workouts
        : data.completed_workouts
        ? data.completed_workouts
        : []
    );
  }, [data]);

  let completedData = {} as WorkoutGroupProps;
  let completedIsLoading = true;
  let completedIsSuccess = false;
  let completedIsError = false;
  let completedError: any = "";

  const [finishWorkoutGroup, _isLoading] = useFinishWorkoutGroupMutation();

  // if (owned_by_class == undefined) {
  //   // WE have a completed workout group
  //   // console.log("WE have a completed workout group");
  //   // const { data, isLoading, isSuccess, isError, error } =
  //   //   useGetCompletedWorkoutQuery(id);
  //   // completedData = data;
  //   // completedIsLoading = isLoading;
  //   // completedIsSuccess = isSuccess;
  //   // completedIsError = isError;
  //   // completedError = error;

  //   // if (workout_group) {
  //   //   const { data, isLoading, isSuccess, isError, error } =
  //   //     useGetWorkoutsForGymClassWorkoutGroupQuery(workout_group);
  //   //   data = data;
  //   //   // console.log('Getting OG data...', data);
  //   //   if (data !== undefined) {
  //   //     console.log("Getting OG data...", data);
  //   //     if (data.err_type >= 0 && !showClassIsDeleted) {
  //   //       setShowClassIsDeleted(true);
  //   //       isShowingOGWorkoutGroup = false;
  //   //     }
  //   //   }

  //   //   // WHen OG workout is deleted {"err_type": 0, "error": "Failed get Gym class's workouts."}
  //   //  OG dataIsLoading = isLoading;
  //   //   OGisSuccess = isSuccess;
  //   //   OGisError = isError;
  //   //   OGerror = error;
  //   // }

  //   // Fetch OG Workout by ID
  // } else if (owned_by_class) {
  //   // we have OG workout owneed by class
  //   // console.log('OG workout owneed by class');
  //   // const { data, isLoading, isSuccess, isError, error } =
  //   //   useGetWorkoutsForGymClassWorkoutGroupQuery(id);
  //   // // console.log('Owned by class, data: ', data);
  //   // data = data;
  //   // dataIsLoading = isLoading;
  //   // isSuccess = isSuccess;
  //   // isError = isError;
  //   // error = error;

  //   // // This 'completed' should come from ogData query.
  //   // const {
  //   //   data: dataCompleted,
  //   //   isLoading: isLoadingCompleted,
  //   //   isSuccess: isSuccessCompleted,
  //   //   isError: isErrorCompleted,
  //   //   error: errorCompleted,
  //   // } = useGetCompletedWorkoutByWorkoutIDQuery(id);

  //   // console.log('Completed data: ', dataCompleted);

  //   // if (dataCompleted && dataCompleted.completed_workouts?.length > 0) {
  //   //   completedData = dataCompleted;
  //   //   completedIsLoading = isLoadingCompleted;
  //   //   completedIsSuccess = isSuccessCompleted;
  //   //   completedIsError = isErrorCompleted;
  //   //   completedError = errorCompleted;
  //   // }
  // } else {
  //   // console.log("With this version, we only get owned_by_class == False....");
  //   // const { data, isLoading, isSuccess, isError, error } =
  //   //   useGetWorkoutsForUsersWorkoutGroupQuery(curGroupID);

  // }

  const title = data?.title ?? "";
  const [showingOGWorkoutGroup, setShowingOGWorkoutGroup] = useState(
    isShowingOGWorkoutGroup
  );

  // const workoutGroup: WorkoutGroupProps =
  // showingOGWorkoutGroup && data
  //   ? data
  //   : !showingOGWorkoutGroup && completedData
  //   ? completedData
  //   : ({} as WorkoutGroupProps);

  // const isOGWorkoutGroup = workoutGroup.workouts ? true : false
  mediaClass = showingOGWorkoutGroup ? WORKOUT_MEDIA : COMPLETED_WORKOUT_MEDIA;

  const [editable, setEditable] = useState(false);
  const addWorkoutSheetRef = useRef<BottomSheetModal>(null);
  const addWorkoutSnapPoints = useMemo(() => ["72%"], []);
  const renderAddWorkoutBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.55}
        pressBehavior="close"
      />
    ),
    []
  );

  const [deleteWorkoutGroupMutation, { isLoading: isDeleteOGWorkoutGroup }] =
    useDeleteWorkoutGroupMutation();
  const [
    deleteCompletedWorkoutGroup,
    { isLoading: isDeleteCompletedWorkoutGroup },
  ] = useDeleteCompletedWorkoutGroupMutation();
  const [deleteWorkoutGroupModalVisible, setDeleteWorkoutGroupModalVisible] =
    useState(false);
  const [showFinishWorkoutGroupModal, setShowFinishWorkoutGroupModal] =
    useState(false);

  const [tags, names] = useMemo(() => {
    const calc = new CalcWorkoutStats(new Map()); // Doesnt need maxes since we are calculating them when creating, we  just use this to combine workouts...
    calc.calcMultiJSON(workouts, workoutGroup.owned_by_class);
    console.log("Calc multi on: ", workouts[0]?.stats);
    return calc.getStats();
  }, [workouts, data]);

  // Show when:
  //  - OgWorkout is Finished
  //  - The oGworkout is not personally created by the current user
  const isFinished = workoutGroup.finished || false;

  // Used to determine if user is viewing their own workout.
  const personalWorkout =
    userData?.id == data?.owner_id && !data?.owned_by_class;

  // When a user is viewing a classWorkout and they are owner. Missing when the owner is viewing a WorkoutGroup that a class owns....
  // Figure out a better way to tell who is the owner. aybe this should come from the server....
  const WGOwner =
    (workoutGroup.owner_id == userData?.id && !workoutGroup.owned_by_class) ||
    (workoutGroup.user_owner_id == userData?.id &&
      workoutGroup.owned_by_class) ||
    Object.keys(workoutGroup).indexOf("completed_workouts") >= 0;

  const canDeleteWorkoutGroup = WGOwner && showingOGWorkoutGroup;
  const canDuplicateWorkoutGroup = WGOwner && isFinished;
  const canLaunchCompletedWorkout =
    showingOGWorkoutGroup &&
    !dataIsLoading &&
    isFinished &&
    !personalWorkout &&
    completedIsSuccess;

  const navToWorkoutScreenWithItems = (
    workoutGroupID: string,
    workoutGroupTitle: string,
    workoutID: string,
    schemeType: number,
    items: WorkoutItems,
    workoutTitle: string,
    workoutDesc: string,
    scheme_rounds: string,
    instruction: string
  ) => {
    router.push({
      pathname: "/input_pages/gyms/CreateWorkoutScreen",
      params: {
        workoutGroupID,
        workoutGroupTitle,
        workoutID,
        schemeType: String(schemeType),
        initItems: JSON.stringify(items),
        workoutTitle,
        workoutDesc,
        scheme_rounds,
        instruction,
      },
    });
  };

  const navToWorkoutScreen = (
    workoutGroupID: string,
    workoutGroupTitle: string,
    schemeType: number
  ) => {
    router.push({
      pathname: "/input_pages/gyms/CreateWorkoutScreen",
      params: {
        workoutGroupID,
        workoutGroupTitle,
        schemeType: String(schemeType),
        workoutTitle: "",
        workoutDesc: "",
        initItems: JSON.stringify([]),
      },
    });
  };

  const openCreateWorkoutScreenForStandard = () => {
    navToWorkoutScreen(data.id.toString(), title, 0);
  };
  const openCreateWorkoutScreenForReps = () => {
    navToWorkoutScreen(data.id.toString(), title, 1);
  };
  const openCreateWorkoutScreenForRounds = () => {
    navToWorkoutScreen(data.id.toString(), title, 2);
  };
  const openCreateWorkoutScreenCreative = () => {
    navToWorkoutScreen(data.id.toString(), title, 3);
  };
  const openCreateWorkoutScreenForTimeScore = () => {
    navToWorkoutScreen(data.id.toString(), title, 4);
  };

  const openCreateWorkoutScreenForTimeLimit = () => {
    navToWorkoutScreen(data.id.toString(), title, 5);
  };

  const onConfirmDelete = () => {
    setDeleteWorkoutGroupModalVisible(true);
  };

  const disableDeleteBtnRed = useRef(false);

  const [isWaitingForDelete, setIsWaitingForDelete] = useState(false);
  const onDelete = async () => {
    if (showingOGWorkoutGroup && !disableDeleteBtnRed.current) {
      disableDeleteBtnRed.current = true;
      const delData = new FormData();
      delData.append("owner_id", data.owner_id);
      delData.append("owned_by_class", data.owned_by_class);
      delData.append("id", data.id);
      console.log("Deleteing workout GORUP", delData);
      const deletedWorkoutGroup = await deleteWorkoutGroupMutation(
        delData
      ).unwrap();
      console.log("Deleting result: ", deletedWorkoutGroup);
    } else {
      const delData = new FormData();
      delData.append("owner_id", completedData.owner_id);
      delData.append("owned_by_class", completedData.owned_by_class);
      delData.append("id", completedData.id);
      console.log("Deleteing completed workout GORUP", delData);
      const deletedWorkoutGroup = await deleteCompletedWorkoutGroup(
        delData
      ).unwrap();
      console.log("Del WG res: ", deletedWorkoutGroup);
    }
    setIsWaitingForDelete(true);
    setDeleteWorkoutGroupModalVisible(false);
    setTimeout(() => {
      setIsWaitingForDelete(false);
      disableDeleteBtnRed.current = false;
      router.push({
        pathname: "/",
      });
    }, 750);
  };

  const promptUpdateDualItems = () => {
    const shouldShow = hasUnfinsihedDualItems(workouts);
    if (shouldShow) {
      console.log(
        "User needs to submit their results if this is not owned by a class"
      );
      console.log("Workouts length: ", workoutGroup.workouts?.length);
      // Show a modal to allow the user to enter the information for the workouts
      setShowFinishDualWorkoutItems(true);
    }

    console.log("Should prompt user to complete dual items: ", shouldShow);
    return shouldShow;
  };

  const _finishGroupWorkout = async () => {
    console.log(
      "Need to check......: ",
      hasUnfinsihedDualItems(workouts),
      workouts
    );

    // Allow user to submit finish to WorkoutGroup for class.
    const formdata = new FormData();
    formdata.append("group", data.id.toString());
    try {
      const res = await finishWorkoutGroup(formdata).unwrap();
      console.log("res finsih", res);
      setShowFinishWorkoutGroupModal(false);
    } catch (err) {
      console.log("Error finishing workout", err);
    }
  };

  const navigateToCompletedWorkoutGroupScreen = () => {
    console.log("Sending data to screen: ", data);
    if (data && Object.keys(data).length > 0) {
      // navigation.navigate('CreateCompletedWorkoutScreen', data);
      console.log(
        "Should be navigating to // navigation.navigate('CreateCompletedWorkoutScreen', data);"
      );
    }
  };

  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

  const onDuplicateGroup = (groupID: number) => {
    // setCurGroupID(groupID.toString());
    router.push({
      pathname: "/WorkoutScreen",
      params: {
        id: groupID,
      },
    });
  };

  const [updatedCaption, setUpdatedCaption] = useState(workoutGroup.caption);

  const [updateForDate, setUpdateForDate] = useState(
    parseWorkoutDateToPickerDate(workoutGroup.for_date ?? new Date())
  );

  const [showUpdateCaption, setShowUpdateCaption] = useState(false);
  const [showUpdateForDate, setShowUpdateForDate] = useState(false);

  const [updateDescMutation, {}] = useUpdateWorkoutGroupCaptionMutation();
  const [updateForDateMutation, {}] = useUpdateWorkoutGroupForDateMutation();

  const updateCaption = async (caption: string) => {
    try {
      const res = await updateDescMutation({
        id: workoutGroup.id,
        caption: caption,
        user_id: userData.id,
      }).unwrap();
    } catch (err) {
      console.log("Failed to update caption: ", caption, err);
    }
  };

  const updateDate = async (date: Date) => {
    try {
      const res = await updateForDateMutation({
        id: workoutGroup.id,
        for_date: dateFormat(date),
        user_id: userData.id,
      }).unwrap();
    } catch (err) {
      console.log("Failed to update for date: ", date, err);
    }
  };

  return (
    <View
      style={{
        height: "100%",
        width: SCREEN_WIDTH,
      }}
    >
      {isWaitingForDelete ? <FullScreenSpinner></FullScreenSpinner> : <></>}
      <BannerAddMembership />
      <View
        style={{
          width: "100%",
          backgroundColor: theme.palette.backgroundColor,
        }}
      >
        {/* === Action bar === */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 12,
            paddingTop: 10,
            paddingBottom: 6,
          }}
        >
          {/* Delete — left */}
          {canDeleteWorkoutGroup ? (
            <Pressable
              onPress={onConfirmDelete}
              testID={TestIDs.DeleteWorkoutBtn.name()}
              style={{
                flexDirection: "row",
                alignItems: "center",
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 9,
                backgroundColor: lightenHexColor(theme.palette.AWE_Red, 0.1),
              }}
            >
              <Icon
                name="trash-outline"
                color={theme.palette.AWE_Red}
                style={{ fontSize: 15, marginRight: 6 }}
              />
              <TSCaptionText
                textStyles={{ color: theme.palette.AWE_Red, fontWeight: "700" }}
              >
                Delete
              </TSCaptionText>
            </Pressable>
          ) : null}

          {/* Duplicate (shown when finished) */}
          {canDuplicateWorkoutGroup ? (
            <Pressable
              onPress={() => setShowDuplicateModal(true)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 9,
                marginLeft: 8,
                backgroundColor: lightenHexColor(
                  theme.palette.primary.main,
                  0.1
                ),
              }}
            >
              <Icon
                name="copy-outline"
                color={theme.palette.primary.main}
                style={{ fontSize: 15, marginRight: 6 }}
              />
              <TSCaptionText
                textStyles={{
                  color: theme.palette.primary.main,
                  fontWeight: "700",
                }}
              >
                Duplicate
              </TSCaptionText>
            </Pressable>
          ) : null}

          {/* View Result (shown when finished and has completed version) */}
          {canLaunchCompletedWorkout ? (
            <Pressable
              onPress={() =>
                console.log("Not implemented WorkoutScreen rocket icon")
              }
              style={{
                flexDirection: "row",
                alignItems: "center",
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 9,
                marginLeft: 8,
                backgroundColor: lightenHexColor(
                  theme.palette.primary.main,
                  0.08
                ),
              }}
            >
              <Icon
                name="rocket-outline"
                color={theme.palette.primary.main}
                style={{ fontSize: 15, marginRight: 6 }}
              />
              <TSCaptionText
                textStyles={{
                  color: theme.palette.primary.main,
                  fontWeight: "700",
                }}
              >
                View Result
              </TSCaptionText>
            </Pressable>
          ) : null}

          <View style={{ flex: 1 }} />

          {/* Finish Workout — right, only when in progress with workouts */}
          {data && showingOGWorkoutGroup && !data.finished && workouts.length > 0 ? (
            <Pressable
              onPress={() => setShowFinishWorkoutGroupModal(true)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 9,
                marginRight: 8,
                backgroundColor: theme.palette.primary.main,
              }}
            >
              <Icon
                name="checkmark-circle-outline"
                color="white"
                style={{ fontSize: 15, marginRight: 6 }}
              />
              <TSCaptionText
                textStyles={{ color: "white", fontWeight: "700" }}
              >
                Finish Workout
              </TSCaptionText>
            </Pressable>
          ) : null}

          {/* Add Workout — right, only when in progress */}
          {data && showingOGWorkoutGroup && !data.finished ? (
            <Pressable
              onPress={() => addWorkoutSheetRef.current?.present()}
              testID={TestIDs.ToggleShowCreateWorkoutBtns.name()}
              style={{
                flexDirection: "row",
                alignItems: "center",
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 9,
                backgroundColor: lightenHexColor(theme.palette.AWE_Green, 0.14),
                borderWidth: 1,
                borderColor: lightenHexColor(theme.palette.AWE_Green, 0.3),
              }}
            >
              <Icon
                name="add-circle-outline"
                color={theme.palette.AWE_Green}
                style={{ fontSize: 15, marginRight: 6 }}
              />
              <TSCaptionText
                textStyles={{
                  color: theme.palette.AWE_Green,
                  fontWeight: "700",
                }}
              >
                Add Workout
              </TSCaptionText>
            </Pressable>
          ) : null}
        </View>

        {/* === Info card === */}
        <WorkoutScreenHeader
          user={userData}
          WGOwner={WGOwner}
          completedIsSuccess={completedIsSuccess}
          isFinished={isFinished}
          dataIsLoading={dataIsLoading}
          isSuccess={isSuccess}
          personalWorkout={personalWorkout}
          setShowingOGWorkoutGroup={setShowingOGWorkoutGroup}
          showingOGWorkoutGroup={showingOGWorkoutGroup}
          workoutGroup={workoutGroup}
          updatedCaption={updatedCaption}
          showUpdateCaption={showUpdateCaption}
          setShowUpdateCaption={setShowUpdateCaption}
          onUpdateCaption={(text) => {
            setUpdatedCaption(text);
            updateCaption(text)
              .then()
              .catch((err) => console.log(err));
          }}
          updateForDate={updateForDate}
          showUpdateForDate={showUpdateForDate}
          setShowUpdateForDate={setShowUpdateForDate}
          onUpdateForDate={(date) => {
            setUpdateForDate(date);
            updateDate(date)
              .then((res) => console.log(res))
              .catch((err) => console.log(err));
          }}
        />

        {/* === Add Workout bottom sheet === */}
        <BottomSheetModal
          ref={addWorkoutSheetRef}
          snapPoints={addWorkoutSnapPoints}
          enableDynamicSizing={false}
          enablePanDownToClose
          backdropComponent={renderAddWorkoutBackdrop}
          backgroundStyle={{ backgroundColor: theme.palette.darkGray }}
          handleIndicatorStyle={{
            backgroundColor: lightenHexColor(theme.palette.lightGray, 0.3),
            width: 40,
          }}
        >
          <BottomSheetView style={{ flex: 1, paddingHorizontal: 20, paddingTop: 8 }}>
            <TSCaptionText
              textStyles={{
                color: theme.palette.text,
                fontWeight: "700",
                fontSize: 16,
                marginBottom: 16,
                textAlign: "center",
              }}
            >
              Choose Workout Type
            </TSCaptionText>

            <View style={{ gap: 10 }}>
              {[
                {
                  label: "Standard",
                  desc: "Sets x Reps x Weight",
                  color: theme.palette.AWE_Blue,
                  icon: "barbell-outline",
                  onPress: openCreateWorkoutScreenForStandard,
                  testID: TestIDs.CreateRegularWorkoutBtn.name(),
                },
                {
                  label: "Reps",
                  desc: "Rep-based schemes (AMRAP, EMOM)",
                  color: theme.palette.AWE_Red,
                  icon: "flame-outline",
                  onPress: openCreateWorkoutScreenForReps,
                  testID: undefined,
                },
                {
                  label: "Rounds",
                  desc: "Round-based circuits",
                  color: theme.palette.AWE_Yellow,
                  icon: "sync-outline",
                  onPress: openCreateWorkoutScreenForRounds,
                  testID: undefined,
                },
                {
                  label: "Creative",
                  desc: "Custom format, freeform",
                  color: theme.palette.AWE_Green,
                  icon: "bulb-outline",
                  onPress: openCreateWorkoutScreenCreative,
                  testID: undefined,
                },
              ].map((type) => (
                <Pressable
                  key={type.label}
                  onPress={() => {
                    addWorkoutSheetRef.current?.dismiss();
                    type.onPress();
                  }}
                  testID={type.testID}
                  style={({ pressed }) => ({
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: lightenHexColor(type.color, 0.1),
                    borderRadius: 14,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    opacity: pressed ? 0.8 : 1,
                  })}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: lightenHexColor(type.color, 0.18),
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 14,
                    }}
                  >
                    <Icon name={type.icon} color={type.color} style={{ fontSize: 20 }} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <TSCaptionText
                      textStyles={{ color: type.color, fontWeight: "700", fontSize: 14 }}
                    >
                      {type.label}
                    </TSCaptionText>
                    <TSCaptionText
                      textStyles={{ color: lightenHexColor(type.color, 0.5), fontSize: 11, marginTop: 2 }}
                    >
                      {type.desc}
                    </TSCaptionText>
                  </View>
                  <Icon name="chevron-forward" color={type.color} style={{ fontSize: 18 }} />
                </Pressable>
              ))}
            </View>
          </BottomSheetView>
        </BottomSheetModal>

        {/* === Delete mode toggle === */}
        {data && !data.finished && workouts.length > 0 ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-end",
              paddingHorizontal: 16,
              paddingTop: 2,
              paddingBottom: 8,
            }}
          >
            <TouchableWithoutFeedback onPress={() => setEditable(!editable)}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <TSCaptionText
                  textStyles={{
                    color: editable
                      ? red
                      : lightenHexColor(theme.palette.text, 0.4),
                    marginRight: 8,
                    fontWeight: editable ? "600" : "400",
                  }}
                >
                  {editable ? "Delete mode on" : "Delete mode"}
                </TSCaptionText>
                <Switch
                  value={editable}
                  onValueChange={() => setEditable(!editable)}
                  trackColor={{
                    true: lightenHexColor(red, 0.3),
                    false: theme.palette.primary.contrastText,
                  }}
                  thumbColor={editable ? red : theme.palette.gray}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        ) : null}
      </View>

      <ScrollView
        style={{
          backgroundColor: theme.palette.backgroundColor,
        }}
        testID={TestIDs.WorkoutScreenScrollView.name()}
        contentContainerStyle={{
          justifyContent: "center",
          alignContent: "center",
          alignItems: "center",
        }}
      >
        {/* {workoutGroup.media_ids &&
          JSON.parse(workoutGroup.media_ids).length > 0 ? (
            <Row style={{height: 300}}>
              <MediaURLSliderClass
                data={JSON.parse(workoutGroup.media_ids)}
                mediaClassID={workoutGroup.id}
                mediaClass={MEDIA_CLASSES[mediaClass]}
              />
            </Row>
          ) : (
            <View style={{margin: 69}}>
              <TSCaptionText>Add some pictures next time!</TSCaptionText>
            </View>
          )} */}

        <View style={{ width: "100%" }}>
          {workouts.length ? (
            <>
              <Row style={{ width: "100%" }}>
                <TSTitleText textStyles={{ marginLeft: 6 }}>Stats</TSTitleText>
              </Row>

              <View
                style={{
                  width: "100%",
                  borderRadius: 16,
                  backgroundColor: lightenHexColor(
                    theme.palette.AWE_Blue,
                    0.25
                  ),
                  padding: 4,
                }}
              >
                <StatsPanel tags={tags} names={names} />
              </View>

              <Row style={{ width: "100%", borderRadius: 8 }} />

              <Row style={{ width: "100%" }}>
                <TSTitleText textStyles={{ marginLeft: 6 }}>
                  Workouts
                </TSTitleText>
              </Row>

              <Row style={{ width: "100%" }}>
                {(showingOGWorkoutGroup && dataIsLoading) ||
                (!showingOGWorkoutGroup && completedIsLoading) ? (
                  <TSCaptionText>Loading....</TSCaptionText>
                ) : (showingOGWorkoutGroup && isSuccess) ||
                  (!showingOGWorkoutGroup && completedIsSuccess) ? (
                  <WorkoutCardFullList
                    data={workouts}
                    editable={editable}
                    group={workoutGroup}
                    navToWorkoutScreenWithItems={navToWorkoutScreenWithItems}
                  />
                ) : (showingOGWorkoutGroup && isError) ||
                  (!showingOGWorkoutGroup && completedIsError) ? (
                  <TSCaptionText>
                    Error.... {error.toString() | completedError.toString()}
                  </TSCaptionText>
                ) : (
                  <TSCaptionText>No Data</TSCaptionText>
                )}
              </Row>
            </>
          ) : (
            <></>
          )}
        </View>
      </ScrollView>

      <View
        style={{
          display: `${
            showClassIsDeleted && showingOGWorkoutGroup ? "flex" : "none"
          }`,
          position: "absolute",
          width: "100%",
          height: SCREEN_HEIGHT * 0.75,
          top: SCREEN_HEIGHT * 0.15,

          backgroundColor: "#4c0519",
        }}
      >
        <LargeText textStyles={{ marginTop: 32 }}>
          {" "}
          Wokout Deleted by Class{" "}
        </LargeText>
      </View>

      <DuplicateWorkoutGroupModal
        owner_id={data?.owner_id}
        actionText="Duplicate"
        closeText="Cancel"
        modalText="Duplicate Workout Group"
        modalVisible={showDuplicateModal}
        onRequestClose={() => setShowDuplicateModal(false)}
        key={"duplicatemodal"}
        workouts={workouts}
        onDuplicateGroup={onDuplicateGroup}
      />
      <ActionCancelModal
        actionText="Delete"
        closeText="Close"
        modalText={`Delete ${title}${showingOGWorkoutGroup ? "" : ""}?`}
        onAction={onDelete}
        modalVisible={deleteWorkoutGroupModalVisible}
        onRequestClose={() => setDeleteWorkoutGroupModalVisible(false)}
      />

      <ActionCancelModal
        actionText="Finish"
        closeText="Close"
        modalText={`Finish ${title}?`}
        onAction={() => {
          setShowFinishWorkoutGroupModal(false);
          if (!promptUpdateDualItems()) {
            _finishGroupWorkout()
              .then((res) => console.log("workout group finished", res))
              .catch((err) => console.log("Failed to finish workout: ", err));
          }
        }}
        modalVisible={showFinishWorkoutGroupModal}
        onRequestClose={() => setShowFinishWorkoutGroupModal(false)}
      />
      <FinishDualWorkoutItems
        bodyText=""
        workoutGroup={workoutGroup}
        closeText="Close"
        modalVisible={showFinishDualWorkoutItems}
        onRequestClose={() => setShowFinishDualWorkoutItems(false)}
        setShowFinishWorkoutGroupModal={() =>
          setShowFinishWorkoutGroupModal(false)
        }
      />
    </View>
  );
};

export default WorkoutScreen;
