import React, { FunctionComponent, useState } from "react";
import {
  Linking,
  Modal,
  TouchableHighlight,
  View,
  ViewStyle,
} from "react-native";
import { useTheme } from "styled-components/native";
import Icon from "react-native-vector-icons/Ionicons";
import { RegularButton } from "../Buttons/buttons";
import * as RootNavigation from "@/src/navigators/RootNavigation";
import ActionCancelModal from "./ActionCancelModal";
import AuthManager from "@/src/utils/auth";
import { centeredViewStyle, settingsModalViewStyle } from "./modalStyles";
import {
  MediumText,
  TSCaptionText,
  TSParagrapghText,
  TSSnippetText,
  TSTitleText,
} from "../Text/Text";
import { TestIDs } from "@/src/utils/constants";
import { router } from "expo-router";
import { DOMAIN_NAME } from "@/src/utils/constants";
import { apiSlice } from "@/src/redux/api/apiSlice";
import { store } from "@/src/redux/store";
import { UserProps } from "@/app/types";
import { dateFormatDayOfWeek } from "@/src/utils/algos";
import { isDateInFuture, lightenHexColor } from "../shared";

const invalidateUser = () => {
  store.dispatch(apiSlice.util.invalidateTags(["User"]));
};

const ProfileSettingsModalRow: FunctionComponent<{
  onAction(): void;
  title: string;
  testID?: string;
  color?: string;
  variant?: number;
}> = (props) => {
  const theme = useTheme();

  const variantStyles = [
    {
      width: "100%",
      height: "100%",
      justifyContent: "flex-start",
      alignItems: "center",
      borderRadius: 8,
      paddingLeft: 8,
      flex: 1,
      flexDirection: "row",
    },
    {
      width: "75%",
      height: "60%",
      justifyContent: "center",
      borderRadius: 8,
      paddingLeft: 8,
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
    },
    {
      width: "75%",
      height: "60%",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 8,
      paddingLeft: 8,
      flex: 1,
      flexDirection: "row",
    },
  ] as ViewStyle[];

  const variant = props.variant ? props.variant : 0;
  return (
    <View
      style={{
        width: "100%",
        height: 35,
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center",
        marginVertical: 8,
      }}
    >
      <TouchableHighlight
        style={[variantStyles[variant]]}
        testID={props.testID}
        underlayColor={theme.palette.transparent}
        onPress={() => {
          props.onAction();
        }}
      >
        <View style={[variantStyles[variant]]}>
          <TSSnippetText
            textStyles={{
              textAlign: variant === 0 ? "left" : "center",
              color:
                variant === 0
                  ? theme.palette.text
                  : variant === 1
                  ? theme.palette.AWE_Red
                  : theme.palette.AWE_Blue,
            }}
          >
            {props.title}
          </TSSnippetText>
          {variant > 0 ? (
            <Icon
              name="link-outline"
              color={theme.palette.AWE_Red}
              style={{ fontSize: 12, marginLeft: 8 }}
            />
          ) : (
            <></>
          )}
        </View>
      </TouchableHighlight>
    </View>
  );
};

const ProfileSettingsModal: FunctionComponent<{
  user: UserProps;
  modalVisible: boolean;
  onRequestClose(): void;
}> = (props) => {
  const theme = useTheme();
  const auth = AuthManager;

  const [showConfirmLogout, setShowConfirmLogout] = useState(false);

  const logout = () => {
    console.log("Loggin out");
    auth
      .logout()
      .then((res) => {
        console.log("ProfileSettings: Logged out");
      })
      .catch((err) => console.log("ProfileSettings Logout Error", err));
  };

  const handleNavToWorkoutItemMaxes = () => {
    router.push({
      pathname: "/WorkoutItemMaxes",
      params: { userID: props.user.id },
    });
    props.onRequestClose();
  };

  const handleNavToCreateWorkoutGroupScreen = () => {
    router.push({
      pathname: "/input_pages/gyms/CreateWorkoutGroupScreen",
      params: {
        ownedByClass: 0,
        ownerID: props.user.id.toString(),
      },
    });
    props.onRequestClose();
  };

  const handleNavToChangePassword = () => {
    router.push({
      pathname: "/input_pages/users/ResetPassword",
    });
    props.onRequestClose();
  };

  const isMember = isDateInFuture(props.user);
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={props.modalVisible}
      onRequestClose={props.onRequestClose}
    >
      <View style={centeredViewStyle.centeredView}>
        <View
          style={{
            ...settingsModalViewStyle.settingsModalView,
            backgroundColor: theme.palette.darkGray,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              flex: 1,
            }}
          >
            <TSTitleText>Settings</TSTitleText>
          </View>

          <View
            style={{
              alignItems: "flex-end",
              width: "100%",
              justifyContent: "flex-end",
              flexDirection: "row",
              flex: 1,
            }}
          >
            <TouchableHighlight
              underlayColor="#00000022"
              style={{ borderRadius: 8 }}
              onPress={() => {
                invalidateUser();
              }}
            >
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  padding: 12,
                }}
              >
                <Icon
                  name="refresh"
                  color={theme.palette.AWE_Green}
                  style={{ fontSize: 24, marginRight: 4 }}
                />
                <TSCaptionText>Sub Status</TSCaptionText>
              </View>
            </TouchableHighlight>
            <TouchableHighlight
              underlayColor="#00000022"
              style={{ borderRadius: 8 }}
              onPress={() => {
                setShowConfirmLogout(true);
              }}
            >
              <View
                style={{
                  alignItems: "flex-end",
                  width: "100%",
                  padding: 12,
                }}
              >
                <Icon
                  name="log-out"
                  color={theme.palette.AWE_Red}
                  style={{ fontSize: 24, marginRight: 4 }}
                />
                <TSCaptionText>Logout</TSCaptionText>
              </View>
            </TouchableHighlight>
          </View>

          <View style={{ flex: 6, width: "100%" }}>
            {/* <ProfileSettingsModalRow
              testID={TestIDs.CreateGymScreenBtn.name()}
              onAction={() => {
                RootNavigation.navigate('CreateGymScreen', {});
                props.onRequestClose();
              }}
              title="Create Gym"
            />
            <View
              style={{
                borderTopWidth: 1,
                height: 1,
                borderColor: theme.palette.text,
              }}
            />

            <ProfileSettingsModalRow
              testID={TestIDs.CreateGymClassScreenBtn.name()}
              onAction={() => {
                RootNavigation.navigate('CreateGymClassScreen', {});
                props.onRequestClose();
              }}
              title="Create Gym Class"
            />
             */}

            <View
              style={{
                // padding: 12,
                // paddingLeft: 24,
                backgroundColor: lightenHexColor(theme.palette.AWE_Blue, 0.2),
                marginBottom: 24,
                borderColor: theme.palette.text,
                borderRadius: 8,
              }}
            >
              <TSSnippetText
                textStyles={{
                  color: theme.palette.AWE_Blue,
                  textAlign: "center",
                }}
              >
                {props.user.email}
              </TSSnippetText>
              {isMember ? (
                <TSSnippetText
                  textStyles={{
                    color: theme.palette.AWE_Blue,
                    textAlign: "center",
                  }}
                >
                  Sub renews:{" "}
                  <TSCaptionText
                    textStyles={{ color: theme.palette.text, fontSize: 9 }}
                  >
                    {dateFormatDayOfWeek(props.user.sub_end_date)}
                  </TSCaptionText>
                </TSSnippetText>
              ) : (
                <TSSnippetText
                  textStyles={{
                    color: theme.palette.AWE_Red,
                    textAlign: "center",
                  }}
                >
                  Not a member
                </TSSnippetText>
              )}
            </View>

            <View
              style={{
                borderTopWidth: 1,
                height: 1,
                borderColor: theme.palette.text,
              }}
            />

            <ProfileSettingsModalRow
              // testID={TestIDs.CreateWorkoutGroupScreenBtn.name()}
              onAction={handleNavToWorkoutItemMaxes}
              title="Workout Item Maxes"
            />

            <View
              style={{
                borderTopWidth: 1,
                height: 1,
                borderColor: theme.palette.text,
              }}
            />
            <ProfileSettingsModalRow
              testID={TestIDs.CreateWorkoutGroupScreenBtn.name()}
              onAction={handleNavToCreateWorkoutGroupScreen}
              title="Create Personal Workout Group"
            />
            <View
              style={{
                borderTopWidth: 1,
                height: 1,
                borderColor: theme.palette.text,
              }}
            />
            <ProfileSettingsModalRow
              testID={TestIDs.ResetPasswordScreenBtn.name()}
              onAction={handleNavToChangePassword}
              title="Change Password"
            />
            <View
              style={{
                borderTopWidth: 1,
                height: 1,
                borderColor: theme.palette.text,
              }}
            />
            <ProfileSettingsModalRow
              onAction={() => {
                Linking.openURL(
                  `https://www.apple.com/legal/internet-services/itunes/dev/stdeula/`
                );
                props.onRequestClose();
              }}
              variant={2}
              color={theme.palette.primary.main}
              title="Terms of Use (EULA)"
            />
            <View
              style={{
                borderTopWidth: 1,
                height: 1,
                borderColor: theme.palette.text,
              }}
            />
            <ProfileSettingsModalRow
              onAction={() => {
                Linking.openURL(
                  `https://gist.github.com/killuhwhale/1613abbf3258807a5bc78e5fc5e569fb`
                );
                props.onRequestClose();
              }}
              variant={2}
              color={theme.palette.primary.main}
              title="Privacy Policy"
            />
            <View
              style={{
                borderTopWidth: 1,
                height: 1,
                borderColor: theme.palette.text,
              }}
            />
            <ProfileSettingsModalRow
              onAction={() => {
                Linking.openURL(`https://${DOMAIN_NAME}/removeAccount`);
                props.onRequestClose();
              }}
              variant={1}
              title="Remove Account"
            />
            <View
              style={{
                borderTopWidth: 1,
                height: 1,
                borderColor: theme.palette.text,
              }}
            />
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-end",
              alignContent: "flex-end",
              flex: 2,
              height: "100%",
              width: "100%",
              justifyContent: "center",
            }}
          >
            <RegularButton
              testID={TestIDs.CloseProfileSettingsBtn.name()}
              underlayColor={theme.palette.AWE_Blue}
              onPress={props.onRequestClose}
              btnStyles={{
                backgroundColor: theme.palette.primary.main,
                padding: 6,
                width: "75%",
              }}
              text="Close"
            />
          </View>

          {showConfirmLogout ? (
            <ActionCancelModal
              containerStyle={{ borderWidth: 2, borderColor: "white" }}
              actionText="Logout"
              closeText="Close"
              modalText={"Are you sure?"}
              onAction={() => logout()}
              modalVisible={showConfirmLogout}
              onRequestClose={() => setShowConfirmLogout(false)}
            />
          ) : (
            <></>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default ProfileSettingsModal;
