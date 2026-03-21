import {
  Container,
  GymClassDescLimit,
  GymClassTitleLimit,
  limitTextLength,
  mdFontSize,
} from "@/src/app_components/shared";
import {
  TSCaptionText,
  TSTitleText,
} from "@/src/app_components/Text/Text";
import React, {
  FunctionComponent,
  useEffect,
  useRef,
  useState,
} from "react";
import { ActivityIndicator, ScrollView, Switch, View } from "react-native";
import RNPickerSelect from "react-native-picker-select";
import Icon from "react-native-vector-icons/Ionicons";
import styled from "styled-components/native";

import {
  useCreateGymClassMutation,
  useGetUserGymsQuery,
} from "@/src/redux/api/apiSlice";
import { useAppDispatch } from "@/src/redux/hooks";
import { useTheme } from "styled-components";

import BannerAddMembership from "@/src/app_components/ads/BannerAd";
import InterstitialAdMembership from "@/src/app_components/ads/InterstitialAd";
import { RegularButton } from "@/src/app_components/Buttons/buttons";
import Input from "@/src/app_components/Input/input";
import AlertModal from "@/src/app_components/modals/AlertModal";
import { TestIDs } from "@/src/utils/constants";
import { useRouter } from "expo-router";

const PageContainer = styled(Container)`
  background-color: ${(props) => props.theme.palette.backgroundColor};
  justify-content: space-between;
  width: 100%;
`;

const CreateGymClassScreen: FunctionComponent = () => {
  const theme = useTheme();
  const router = useRouter();

  const dispatch = useAppDispatch();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [createGymClass, { isLoading }] = useCreateGymClassMutation();
  const {
    data,
    isLoading: userGymsLoading,
    isSuccess,
    isError,
    error,
  } = useGetUserGymsQuery("");
  const [gym, setGym] = useState(data && data.length > 0 ? data[0].id : 0);
  const pickerRef = useRef<any>();

  const [isCreating, setIsCreating] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const _createGymClass = async () => {
    console.log("Creatting gym class: ", title, desc, gym);
    setIsCreating(true);

    const data = new FormData();
    data.append("title", title);
    data.append("desc", desc);
    data.append("gym", gym);
    data.append("private", isPrivate);

    console.log("FOrmdata", data);

    try {
      const gymClass = await createGymClass(data).unwrap();
      console.log("Gym class res", gymClass);
      if (gymClass.id) {
        router.push("/(tabs)/Profile");
      } else if (gymClass.err_type === 1 || gymClass.detail) {
        setShowAlert(true);
      }
    } catch (err) {
      console.log("Error creating gym class", err);
    }
    setIsCreating(false);
  };

  const [showAd, setShowAd] = useState(false);
  const [readyToCreate, setReadyToCreate] = useState(false);
  useEffect(() => {
    if (readyToCreate && !showAd) {
      _createGymClass()
        .then((res) => setReadyToCreate(false))
        .catch((err) => console.log("Error creating GymClass: ", err));
    }
  }, [readyToCreate]);

  const INPUT_STYLE = {
    width: "100%",
    backgroundColor: theme.palette.darkGray,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  };

  return (
    <PageContainer>
      <BannerAddMembership />
      <ScrollView
        style={{ flex: 1, width: "100%" }}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 24,
          paddingBottom: 40,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ width: "100%", maxWidth: 480, alignSelf: "center" }}>
          <TSTitleText textStyles={{ textAlign: "center", marginBottom: 32 }}>
            Create Gym Class
          </TSTitleText>

          <TSCaptionText textStyles={{ marginBottom: 6 }}>Title</TSCaptionText>
          <View style={{ height: 48, marginBottom: 20 }}>
            <Input
              onChangeText={(t) =>
                setTitle(limitTextLength(t, GymClassTitleLimit))
              }
              testID={TestIDs.GymClassTitleField.name()}
              value={title}
              containerStyle={INPUT_STYLE}
              leading={
                <Icon
                  name="create-outline"
                  style={{ fontSize: mdFontSize }}
                  color={theme.palette.text}
                />
              }
              label=""
              placeholder="Class name"
            />
          </View>

          <TSCaptionText textStyles={{ marginBottom: 6 }}>
            Description
          </TSCaptionText>
          <View style={{ height: 48, marginBottom: 24 }}>
            <Input
              onChangeText={(t) =>
                setDesc(limitTextLength(t, GymClassDescLimit))
              }
              value={desc}
              containerStyle={INPUT_STYLE}
              testID={TestIDs.GymClassDescField.name()}
              leading={
                <Icon
                  name="document-text-outline"
                  style={{ fontSize: mdFontSize }}
                  color={theme.palette.text}
                />
              }
              label=""
              placeholder="Short description"
            />
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingVertical: 14,
              borderTopWidth: 1,
              borderBottomWidth: 1,
              borderColor: "rgba(255,255,255,0.1)",
              marginBottom: 24,
            }}
          >
            <TSCaptionText>Private Class</TSCaptionText>
            <Switch
              testID={TestIDs.GymClassPrivateSwitch.name()}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={isPrivate ? "#f5dd4b" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={setIsPrivate}
              value={isPrivate}
            />
          </View>

          {!userGymsLoading && (
            <View style={{ marginBottom: 32 }}>
              <TSCaptionText textStyles={{ marginBottom: 8 }}>
                Select Gym
              </TSCaptionText>
              <RNPickerSelect
                ref={pickerRef}
                onValueChange={(itemValue, itemIndex) => setGym(itemValue)}
                useNativeAndroidPickerStyle={false}
                value={gym}
                placeholder={{}}
                key="GymClassKeyz"
                touchableWrapperProps={{
                  testID: TestIDs.GymClassRNPickerTouchableGym.name(),
                }}
                modalProps={{ testID: TestIDs.GymClassRNPickerModalGym.name() }}
                pickerProps={{ testID: TestIDs.GymClassRNPickerGym.name() }}
                style={{
                  inputAndroidContainer: {
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.15)",
                    borderRadius: 12,
                  },
                  inputAndroid: {
                    color: theme.palette.primary.main,
                    backgroundColor: theme.palette.darkGray,
                    borderRadius: 12,
                    width: "100%",
                    textAlign: "center",
                    paddingVertical: 12,
                  },
                  inputIOSContainer: {
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.15)",
                    borderRadius: 12,
                  },
                  inputIOS: {
                    color: theme.palette.primary.main,
                    backgroundColor: theme.palette.darkGray,
                    borderRadius: 12,
                    width: "100%",
                    textAlign: "center",
                    paddingVertical: 12,
                  },
                }}
                items={data.map((gym, i) => ({
                  label: gym.title,
                  value: gym.id,
                }))}
              />
            </View>
          )}

          {!isCreating ? (
            <>
              <RegularButton
                onPress={() => setShowAd(true)}
                btnStyles={{
                  backgroundColor: theme.palette.primary.main,
                  paddingVertical: 14,
                  borderRadius: 16,
                }}
                text="Create"
              />
              <InterstitialAdMembership
                testID={TestIDs.GymClassCreateBtn.name()}
                text="Create"
                onClose={() => {
                  setShowAd(false);
                  setReadyToCreate(true);
                }}
                show={showAd}
              />
            </>
          ) : (
            <ActivityIndicator size="small" color={theme.palette.text} />
          )}
        </View>
      </ScrollView>

      <AlertModal
        closeText="Close"
        bodyText="Failed to create class: classes can only be created by members and are limited to 15 classes per gym with unique names."
        modalVisible={showAlert}
        onRequestClose={() => setShowAlert(false)}
      />
    </PageContainer>
  );
};

export default CreateGymClassScreen;
