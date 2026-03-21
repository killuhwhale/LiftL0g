import {
  Container,
  GymDescLimit,
  GymTitleLimit,
  limitTextLength,
  mdFontSize,
} from "@/src/app_components/shared";
import { TSCaptionText, TSTitleText } from "@/src/app_components/Text/Text";
import React, {
  FunctionComponent,
  useEffect,
  useState,
} from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import styled from "styled-components/native";

import { useCreateGymMutation } from "@/src/redux/api/apiSlice";
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

const CreateGymScreen: FunctionComponent = () => {
  const theme = useTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [createGym, { isLoading }] = useCreateGymMutation();

  const [isCreating, setIsCreating] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const _createGym = async () => {
    console.log("Creatting gym: ", title, desc);
    setIsCreating(true);

    const data = new FormData();
    data.append("title", title);
    data.append("desc", desc);

    try {
      const gym = await createGym(data).unwrap();
      console.log("Newly creaated gym", gym);
      if (gym.id) {
        router.push("/(tabs)/Profile");
      } else if (gym.err_type === 1 || gym.detail) {
        setShowAlert(true);
      }
    } catch (err) {
      console.log("Error creating gym", err);
    }
    setIsCreating(false);
  };

  const [showAd, setShowAd] = useState(false);
  const [readyToCreate, setReadyToCreate] = useState(false);
  useEffect(() => {
    if (readyToCreate && !showAd) {
      _createGym()
        .then((res) => setReadyToCreate(false))
        .catch((err) => console.log("Error creating Gym: ", err));
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
            Create Gym
          </TSTitleText>

          <TSCaptionText textStyles={{ marginBottom: 6 }}>Title</TSCaptionText>
          <View style={{ height: 48, marginBottom: 20 }}>
            <Input
              onChangeText={(t) => setTitle(limitTextLength(t, GymTitleLimit))}
              testID={TestIDs.GymTitleField.name()}
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
              placeholder="Gym name"
            />
          </View>

          <TSCaptionText textStyles={{ marginBottom: 6 }}>
            Description
          </TSCaptionText>
          <View style={{ height: 48, marginBottom: 36 }}>
            <Input
              onChangeText={(t) => setDesc(limitTextLength(t, GymDescLimit))}
              value={desc}
              testID={TestIDs.GymDescField.name()}
              containerStyle={INPUT_STYLE}
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
                testID={TestIDs.GymSubmitBtn.name()}
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
        bodyText="Failed to create gym: gyms can only be created by members and are limited to 15 gyms with unique names."
        modalVisible={showAlert}
        onRequestClose={() => setShowAlert(false)}
      />
    </PageContainer>
  );
};

export default CreateGymScreen;
