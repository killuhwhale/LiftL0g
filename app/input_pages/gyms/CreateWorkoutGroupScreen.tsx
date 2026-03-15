import {
  Container,
  formatLongDate,
  isDateInFuture,
  limitTextLength,
  mdFontSize,
  WorkoutGroupDescLimit,
  WorkoutGroupTitleLimit
} from "@/src/app_components/shared";
import {
  TSCaptionText,
  TSTitleText
} from "@/src/app_components/Text/Text";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  ActivityIndicator,
  ScrollView,
  TouchableHighlight,
  View,
} from "react-native";
import ImagePicker, { ImageOrVideo } from "react-native-image-crop-picker";
import Icon from "react-native-vector-icons/Ionicons";
import styled from "styled-components/native";

import {
  useCreateWorkoutGroupMutation,
  useGetProfileViewQuery,
} from "@/src/redux/api/apiSlice";
import { useAppDispatch } from "@/src/redux/hooks";
import { useTheme } from "styled-components";
// import { MediaSlider } from "@/src/app_components/MediaSlider/MediaSlider";

import DatePicker from "react-native-date-picker";

import BannerAddMembership from "@/src/app_components/ads/BannerAd";
import InterstitialAdMembership from "@/src/app_components/ads/InterstitialAd";
import { RegularButton } from "@/src/app_components/Buttons/buttons";
import Input from "@/src/app_components/Input/input";
import AlertModal from "@/src/app_components/modals/AlertModal";
import { dateFormat } from "@/src/utils/algos";
import { TestIDs } from "@/src/utils/constants";
import { router, useLocalSearchParams } from "expo-router";
const PageContainer = styled(Container)`
  background-color: ${(props) => props.theme.palette.backgroundColor};
  justify-content: space-between;
  width: 100%;
`;

const MediaPicker: FunctionComponent<{
  setState(file: ImageOrVideo[]): void;
  title: string;
}> = (props) => {
  const theme = useTheme();

  const pickFile = useCallback(async () => {
    try {
      const files = await ImagePicker.openPicker({
        multiple: true,
        mediaType: "any",
      });

      console.log("DocuPicker res ", files);

      props.setState(files);
    } catch (err) {
      console.log("err picker", err);
      throw err;
    }
  }, [props.title]);

  return (
    <View>
      <RegularButton
        onPress={pickFile}
        btnStyles={{ backgroundColor: theme.palette.darkGray }}
        text={props.title}
      />
    </View>
  );
};

const CreateWorkoutGroupScreen: FunctionComponent = () => {
  const theme = useTheme();
  const params = useLocalSearchParams();

  const { ownerID: _ownerID } = params;
  const ownerID: string = _ownerID as string;

  const ownedByClass = false;
  const {
    data: userData,
    isLoading: userIsLoading,
    isSuccess,
    isError,
    error,
  } = useGetProfileViewQuery("");
  // Access/ send actions
  const dispatch = useAppDispatch();
  const [files, setFiles] = useState<ImageOrVideo[]>();
  const [title, setTitle] = useState("");
  const [forDate, setForDate] = useState<Date>(new Date());
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [caption, setCaption] = useState("");
  // Need to set ownedByClass somehow......
  // 1. User has classes, use a picker || Deciding to not use a picker. We will just go to the class and add from there...
  // 2. User does not have classes, no picker.
  // 3. User has classes but wants to make a post for themselves.

  // WHen we open this Screen, we can pass a prop with ownedByClass. and an optional owner id
  // This allows us to handle the above casses and lets use get to this screen from a variety of places.
  //     From a class w/ its ID to add a workout to it.
  //     From profile, for class, use a picker to choose ID of class
  //     From profile, for user, no picker

  const [createWorkoutGroup, { isLoading }] = useCreateWorkoutGroupMutation();
  // useGet... workoutNames

  const [isCreating, setIsCreating] = useState(false);

  const [showAd, setShowAd] = useState(false);
  const [readyToCreate, setReadyToCreate] = useState(false);
  useEffect(() => {
    if (readyToCreate && !showAd) {
      _createWorkout()
        .then((res) => setReadyToCreate(false))
        .catch((err) => console.log("Error creating workoutGroup: ", err));
    }
  }, [readyToCreate]);

  // const _createWorkout = () => {
  //   console.log('title: ', title);
  //   console.log('caption: ', caption);
  //   console.log('forDate: ', forDate);
  // };

  const [titleError, setTitleError] = useState("");
  const _createWorkout = async () => {
    console.log("Creatting workout: ");

    if (!title) {
      setTitleError("Title is required");
      return console.error("User must provide title to workout group.");
    }

    setIsCreating(true);
    // Need to get file from the URI
    const data = new FormData();
    data.append("owner_id", ownerID);
    data.append("owned_by_class", ownedByClass ? "True" : "False");

    data.append("title", title);
    data.append("caption", caption);
    data.append("for_date", dateFormat(forDate));
    // data.append("media_ids", []);
    // if (files && files.length) {
    //   files.forEach((file) =>
    //     data.append("files", {
    //       uri: file.path,
    //       name: file.path,
    //       type: file.mime,
    //     })
    //   );
    // }

    console.log("_createWorkout FOrmdata");
    console.log("_createWorkout FOrmdata", data);

    try {
      const workoutGroup = await createWorkoutGroup(data).unwrap();
      console.log("Create WorkoutGroup res", workoutGroup.status);

      if (workoutGroup.id) {
        router.push("/");
      } else if (workoutGroup.err_type === 0 || workoutGroup.error) {
        setShowAlert(true);
        setAlertMsg(`"${title}" already exists. Please choose a new Title.`);
      } else if (workoutGroup.err_type === 1 || workoutGroup.detail) {
        setShowAlert(true);
        setAlertMsg(
          "Failed to create workoutGroup: members are limited to 15 workouts per day and non members 1 workout per day including Completed workouts."
        );
      }
    } catch (err) {
      console.log("Error creating  WorkoutGroup", err);
    }
    setIsCreating(false);
    // TODO possibly dispatch to refresh data
  };

  const [showDatePicker, setShowDatePicker] = useState(false);
  const CREATE_TEXT_STYLE = { paddingVertical: 2 };
  const CREATE_BTN_STYLE = {
    paddingVertical: 12,
    marginHorizontal: 24,
    backgroundColor: theme.palette.transparent,
    borderWidth: 1,
    border: "",
    borderColor: "white",
  };

  return (
    <PageContainer>
      <ScrollView
        style={{ flex: 10, width: "100%" }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ height: "100%", width: "100%", flex: 1 }}>
          <BannerAddMembership />
          <View style={{ flex: 20, marginTop: 12 }}>
            <View style={{ flex: 1, marginBottom: 6 }}>
              <TSTitleText
                textStyles={{ marginBottom: 8, textAlign: "center" }}
              >
                Create Workout Group
              </TSTitleText>
            </View>

            <View style={{ flex: 5 }}>
              <View style={{ marginBottom: 15, height: 40 }}>
                <Input
                  placeholder="Title"
                  testID={TestIDs.WorkoutGroupTitleField.name()}
                  onChangeText={(t) => {
                    setTitle(limitTextLength(t, WorkoutGroupTitleLimit));
                    setTitleError("");
                  }}
                  value={title || ""}
                  label="Title"
                  isError={titleError.length > 0}
                  helperText={titleError}
                  containerStyle={{
                    width: "100%",
                    backgroundColor: theme.palette.darkGray,
                    borderRadius: 8,
                    paddingHorizontal: 8,
                  }}
                  leading={
                    <Icon
                      name="information-circle-outline"
                      color={theme.palette.text}
                      style={{ fontSize: mdFontSize }}
                    />
                  }
                />
              </View>
              <View style={{ marginBottom: 15, height: 40 }}>
                <Input
                  placeholder="Caption"
                  testID={TestIDs.WorkoutGroupCaptionField.name()}
                  onChangeText={(t) =>
                    setCaption(limitTextLength(t, WorkoutGroupDescLimit))
                  }
                  value={caption || ""}
                  label="Caption"
                  containerStyle={{
                    width: "100%",
                    backgroundColor: theme.palette.darkGray,
                    borderRadius: 8,
                    paddingHorizontal: 8,
                  }}
                  leading={
                    <Icon
                      name="information-circle-outline"
                      color={theme.palette.text}
                      style={{ fontSize: mdFontSize }}
                    />
                  }
                />
              </View>

              <View
                style={{
                  flexDirection: "row",
                  flex: 1,
                  height: 35,
                  width: "100%",

                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: 12,
                }}
              >
                <TouchableHighlight
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    marginHorizontal: 48,
                    paddingVertical: 6,
                    borderRadius: 12,
                    backgroundColor: theme.palette.primary.main,
                  }}
                  onPress={() => setShowDatePicker(!showDatePicker)}
                >
                  <View>
                    <TSCaptionText
                      textStyles={{ textAlign: "center", paddingLeft: 16 }}
                    >
                      For: {formatLongDate(forDate)}
                    </TSCaptionText>
                    <DatePicker
                      date={forDate}
                      mode="date"
                      locale="en"
                      theme="dark"
                      modal={true}
                      open={showDatePicker}
                      onCancel={() => setShowDatePicker(false)}
                      onConfirm={(date) => setForDate(date)}
                      buttonColor={theme.palette.text}
                      title={"For Date"}
                    />
                  </View>
                </TouchableHighlight>
              </View>
            </View>
            {/* <View style={{flex: 8}}>
              <MediaPicker
                setState={setFiles.bind(this)}
                title="Select Main Image"
              />
              {files && files.length > 0 ? <MediaSlider data={files} /> : <></>}
            </View> */}
            <View
              style={{ flex: 2, marginTop: 48 }}
              testID={TestIDs.WorkoutGroupCreateBtn.name()}
            >
              {!isCreating ? (
                isDateInFuture(userData.user) ? (
                  <RegularButton
                    testID={TestIDs.WorkoutGroupCreateBtn.name()}
                    onPress={() => {
                      setReadyToCreate(true); // Trigger useEffect
                    }}
                    btnStyles={CREATE_BTN_STYLE}
                    textStyles={CREATE_TEXT_STYLE}
                    text="Create"
                  />
                ) : (
                  <>
                    <RegularButton
                      onPress={() => {
                        setShowAd(true);
                      }}
                      btnStyles={CREATE_BTN_STYLE}
                      textStyles={CREATE_TEXT_STYLE}
                      text="Create"
                    />
                    <InterstitialAdMembership
                      text="Create"
                      onClose={() => {
                        setShowAd(false); // return to prev state.
                        setReadyToCreate(true); // Trigger useEffect
                      }}
                      show={showAd}
                      testID={TestIDs.GymClassCreateBtn.name()}
                    />
                  </>
                )
              ) : (
                <ActivityIndicator size="small" color={theme.palette.text} />
              )}
            </View>
          </View>
          <AlertModal
            closeText="Close"
            bodyText={alertMsg}
            modalVisible={showAlert}
            onRequestClose={() => setShowAlert(false)}
          />
        </View>
      </ScrollView>
    </PageContainer>
  );
};

export default CreateWorkoutGroupScreen;

export { MediaPicker };
