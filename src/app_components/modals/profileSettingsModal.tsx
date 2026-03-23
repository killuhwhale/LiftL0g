import React, {
  FunctionComponent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Linking,
  View,
  Pressable,
  TouchableHighlight,
  ViewStyle,
} from "react-native";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useTheme } from "styled-components/native";
import Icon from "react-native-vector-icons/Ionicons";
import ActionCancelModal from "./ActionCancelModal";
import AuthManager from "@/src/utils/auth";
import {
  TSCaptionText,
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

const SettingsRow: FunctionComponent<{
  onAction(): void;
  title: string;
  testID?: string;
  icon: string;
  iconColor?: string;
  danger?: boolean;
}> = ({ onAction, title, testID, icon, iconColor, danger }) => {
  const theme = useTheme();
  const color = iconColor ?? (danger ? theme.palette.AWE_Red : theme.palette.text);

  return (
    <TouchableHighlight
      testID={testID}
      onPress={onAction}
      underlayColor={lightenHexColor(theme.palette.backgroundColor, 0.15)}
      style={{ borderRadius: 10, marginBottom: 2 }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 14,
          paddingHorizontal: 4,
        }}
      >
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            backgroundColor: `${color}18`,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          <Icon name={icon} color={color} style={{ fontSize: 17 }} />
        </View>
        <TSSnippetText
          textStyles={{
            flex: 1,
            color: danger ? theme.palette.AWE_Red : theme.palette.text,
          }}
        >
          {title}
        </TSSnippetText>
        <Icon
          name="chevron-forward-outline"
          color={lightenHexColor(theme.palette.text, 0.3)}
          style={{ fontSize: 14 }}
        />
      </View>
    </TouchableHighlight>
  );
};

const SectionDivider = () => {
  const theme = useTheme();
  return (
    <View
      style={{
        height: 1,
        backgroundColor: lightenHexColor(theme.palette.lightGray, 0.08),
        marginVertical: 2,
      }}
    />
  );
};

const ProfileSettingsModal: FunctionComponent<{
  user: UserProps;
  modalVisible: boolean;
  onRequestClose(): void;
}> = (props) => {
  const theme = useTheme();
  const sheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["90%"], []);
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);

  React.useEffect(() => {
    if (props.modalVisible) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
    }
  }, [props.modalVisible]);

  const renderBackdrop = useCallback(
    (backdropProps: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...backdropProps}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.55}
        pressBehavior="close"
      />
    ),
    []
  );

  const logout = () => {
    AuthManager.logout()
      .then(() => console.log("ProfileSettings: Logged out"))
      .catch((err) => console.log("ProfileSettings Logout Error", err));
  };

  const isMember = isDateInFuture(props.user);

  return (
    <>
      <BottomSheetModal
        ref={sheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose
        onDismiss={props.onRequestClose}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: theme.palette.darkGray }}
        handleIndicatorStyle={{
          backgroundColor: lightenHexColor(theme.palette.lightGray, 0.3),
          width: 40,
        }}
      >
        <BottomSheetScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20,
              marginTop: 4,
            }}
          >
            <TSTitleText textStyles={{ marginVertical: 0 }}>Settings</TSTitleText>
            <Pressable onPress={props.onRequestClose} hitSlop={10}>
              <Icon
                name="close"
                size={22}
                color={lightenHexColor(theme.palette.text, 0.4)}
              />
            </Pressable>
          </View>

          {/* Account info card */}
          <View
            style={{
              backgroundColor: lightenHexColor(theme.palette.AWE_Blue, 0.1),
              borderRadius: 12,
              padding: 14,
              marginBottom: 20,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}
            >
              <Icon
                name="person-circle-outline"
                color={theme.palette.AWE_Blue}
                style={{ fontSize: 18, marginRight: 8 }}
              />
              <TSSnippetText textStyles={{ color: theme.palette.AWE_Blue }}>
                {props.user.email}
              </TSSnippetText>
            </View>
            {isMember ? (
              <TSCaptionText
                textStyles={{ color: lightenHexColor(theme.palette.text, 0.55) }}
              >
                Sub renews:{" "}
                <TSCaptionText
                  textStyles={{ color: theme.palette.AWE_Green, fontWeight: "600" }}
                >
                  {dateFormatDayOfWeek(props.user.sub_end_date)}
                </TSCaptionText>
              </TSCaptionText>
            ) : (
              <TSCaptionText textStyles={{ color: theme.palette.AWE_Red }}>
                Not a member
              </TSCaptionText>
            )}

            {/* Refresh sub status */}
            <TouchableHighlight
              onPress={invalidateUser}
              underlayColor={lightenHexColor(theme.palette.AWE_Green, 0.08)}
              style={{
                marginTop: 10,
                borderRadius: 8,
                alignSelf: "flex-start",
                paddingHorizontal: 10,
                paddingVertical: 6,
                backgroundColor: lightenHexColor(theme.palette.AWE_Green, 0.12),
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Icon
                  name="refresh"
                  color={theme.palette.AWE_Green}
                  style={{ fontSize: 13, marginRight: 5 }}
                />
                <TSCaptionText textStyles={{ color: theme.palette.AWE_Green }}>
                  Refresh Sub Status
                </TSCaptionText>
              </View>
            </TouchableHighlight>
          </View>

          {/* Navigation section */}
          <TSCaptionText
            textStyles={{
              color: lightenHexColor(theme.palette.text, 0.4),
              fontWeight: "700",
              letterSpacing: 0.8,
              textTransform: "uppercase",
              fontSize: 10,
              marginBottom: 6,
            }}
          >
            Account
          </TSCaptionText>

          <SettingsRow
            icon="barbell-outline"
            title="Workout Item Maxes"
            onAction={() => {
              router.push({
                pathname: "/WorkoutItemMaxes",
                params: { userID: props.user.id },
              });
              props.onRequestClose();
            }}
          />
          <SectionDivider />
          <SettingsRow
            testID={TestIDs.CreateWorkoutGroupScreenBtn.name()}
            icon="add-circle-outline"
            title="Create Personal Workout Group"
            onAction={() => {
              router.push({
                pathname: "/input_pages/gyms/CreateWorkoutGroupScreen",
                params: { ownedByClass: 0, ownerID: props.user.id.toString() },
              });
              props.onRequestClose();
            }}
          />
          <SectionDivider />
          <SettingsRow
            testID={TestIDs.ResetPasswordScreenBtn.name()}
            icon="lock-closed-outline"
            title="Change Password"
            onAction={() => {
              router.push({ pathname: "/input_pages/users/ResetPassword" });
              props.onRequestClose();
            }}
          />

          {/* Legal section */}
          <TSCaptionText
            textStyles={{
              color: lightenHexColor(theme.palette.text, 0.4),
              fontWeight: "700",
              letterSpacing: 0.8,
              textTransform: "uppercase",
              fontSize: 10,
              marginBottom: 6,
              marginTop: 20,
            }}
          >
            Legal
          </TSCaptionText>

          <SettingsRow
            icon="document-text-outline"
            title="Terms of Use (EULA)"
            iconColor={theme.palette.AWE_Blue}
            onAction={() => {
              Linking.openURL(
                "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/"
              );
              props.onRequestClose();
            }}
          />
          <SectionDivider />
          <SettingsRow
            icon="shield-outline"
            title="Privacy Policy"
            iconColor={theme.palette.AWE_Blue}
            onAction={() => {
              Linking.openURL(
                "https://gist.github.com/killuhwhale/1613abbf3258807a5bc78e5fc5e569fb"
              );
              props.onRequestClose();
            }}
          />

          {/* Danger zone */}
          <TSCaptionText
            textStyles={{
              color: lightenHexColor(theme.palette.AWE_Red, 0.7),
              fontWeight: "700",
              letterSpacing: 0.8,
              textTransform: "uppercase",
              fontSize: 10,
              marginBottom: 6,
              marginTop: 20,
            }}
          >
            Danger Zone
          </TSCaptionText>

          <SettingsRow
            icon="trash-outline"
            title="Remove Account"
            danger
            onAction={() => {
              Linking.openURL(`https://${DOMAIN_NAME}/removeAccount`);
              props.onRequestClose();
            }}
          />
          <SectionDivider />
          <SettingsRow
            icon="log-out-outline"
            title="Logout"
            danger
            onAction={() => setShowConfirmLogout(true)}
          />
        </BottomSheetScrollView>
      </BottomSheetModal>

      {/* Nested confirm-logout sheet */}
      <ActionCancelModal
        containerStyle={{ borderWidth: 2, borderColor: "white" }}
        actionText="Logout"
        closeText="Cancel"
        modalText="Are you sure you want to logout?"
        onAction={logout}
        modalVisible={showConfirmLogout}
        onRequestClose={() => setShowConfirmLogout(false)}
      />
    </>
  );
};

export default ProfileSettingsModal;
