import React, { FunctionComponent, useState } from "react";
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "styled-components/native";
import Icon from "react-native-vector-icons/Ionicons";
import {
  TSCaptionText,
  TSSnippetText,
  TSTitleText,
} from "@/src/app_components/Text/Text";
import { authPost } from "@/src/utils/fetchAPI";
import { BASEURL } from "@/src/utils/constants";
import { SCREEN_WIDTH, lightenHexColor } from "@/src/app_components/shared";
import { router } from "expo-router";

// ─── Field ────────────────────────────────────────────────────────────────────

const PasswordField: FunctionComponent<{
  label: string;
  placeholder: string;
  value: string;
  onChangeText(t: string): void;
  hidden: boolean;
  toggleHidden(): void;
  error?: boolean;
  hint?: string;
}> = ({ label, placeholder, value, onChangeText, hidden, toggleHidden, error, hint }) => {
  const theme = useTheme();
  const borderColor = error
    ? theme.palette.AWE_Red
    : value.length > 0
    ? `${theme.palette.AWE_Blue}88`
    : lightenHexColor(theme.palette.lightGray, 0.12);

  return (
    <View style={{ marginBottom: 16 }}>
      <TSCaptionText
        textStyles={{
          fontSize: 11,
          fontWeight: "700",
          letterSpacing: 0.5,
          textTransform: "uppercase",
          color: lightenHexColor(theme.palette.text, 0.45),
          marginBottom: 6,
        }}
      >
        {label}
      </TSCaptionText>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: lightenHexColor(theme.palette.darkGray, 0.05),
          borderRadius: 12,
          borderWidth: 1.5,
          borderColor,
          paddingHorizontal: 14,
          height: 52,
        }}
      >
        <Icon
          name="lock-closed-outline"
          size={17}
          color={lightenHexColor(theme.palette.text, 0.35)}
          style={{ marginRight: 10 }}
        />
        <View style={{ flex: 1 }}>
          {/* TextInput via a native component — using the Input wrapper causes layout issues here */}
          <React.Fragment>
            {/* We render a raw TextInput so we can fully control height */}
            {React.createElement(
              require("react-native").TextInput,
              {
                value,
                onChangeText,
                placeholder,
                placeholderTextColor: lightenHexColor(theme.palette.text, 0.3),
                secureTextEntry: hidden,
                autoCapitalize: "none",
                autoCorrect: false,
                style: {
                  flex: 1,
                  color: theme.palette.text,
                  fontSize: 15,
                  paddingVertical: 0,
                },
              }
            )}
          </React.Fragment>
        </View>
        <Pressable onPress={toggleHidden} hitSlop={8}>
          <Icon
            name={hidden ? "eye-off-outline" : "eye-outline"}
            size={19}
            color={lightenHexColor(theme.palette.text, 0.4)}
          />
        </Pressable>
      </View>

      {hint ? (
        <TSCaptionText
          textStyles={{
            color: error ? theme.palette.AWE_Red : theme.palette.AWE_Green,
            marginTop: 4,
            fontSize: 11,
          }}
        >
          {hint}
        </TSCaptionText>
      ) : null}
    </View>
  );
};

// ─── Screen ───────────────────────────────────────────────────────────────────

const ResetPasswordScreen: FunctionComponent = () => {
  const theme = useTheme();

  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [hidePassword, setHidePassword] = useState(true);
  const [hideNewPassword, setHideNewPassword] = useState(true);
  const [hidePasswordConfirm, setHidePasswordConfirm] = useState(true);

  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const passwordsMatch =
    newPassword.length > 0 &&
    passwordConfirm.length > 0 &&
    newPassword === passwordConfirm;

  const canSubmit =
    password.length > 0 &&
    newPassword.length > 0 &&
    passwordConfirm.length > 0 &&
    passwordsMatch &&
    !isLoading;

  const updatePassword = async () => {
    if (passwordError.length > 0) setPasswordError("");
    if (!canSubmit) return;

    setIsLoading(true);
    try {
      const res = await authPost(`${BASEURL}user/reset_password_with_old/`, {
        password,
        new_password: newPassword,
        password_confirm: passwordConfirm,
      }).then((r) => r.json());

      if (res.data) {
        setSuccess(true);
      } else if (res.error) {
        setPasswordError(res.error);
      }
    } catch {
      setPasswordError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.palette.backgroundColor }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ flex: 1, alignItems: "center", paddingTop: 48, paddingBottom: 40 }}>

          {/* Icon header */}
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              backgroundColor: `${theme.palette.AWE_Blue}18`,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 20,
            }}
          >
            <Icon name="lock-closed" size={32} color={theme.palette.AWE_Blue} />
          </View>

          <TSTitleText textStyles={{ marginBottom: 6, textAlign: "center" }}>
            Change Password
          </TSTitleText>
          <TSCaptionText
            textStyles={{
              color: lightenHexColor(theme.palette.text, 0.45),
              textAlign: "center",
              marginBottom: 36,
            }}
          >
            Enter your current password and choose a new one.
          </TSCaptionText>

          {/* Card */}
          <View
            style={{
              width: SCREEN_WIDTH * 0.88,
              backgroundColor: lightenHexColor(theme.palette.darkGray, 0.04),
              borderRadius: 18,
              borderWidth: 1,
              borderColor: lightenHexColor(theme.palette.lightGray, 0.08),
              padding: 20,
            }}
          >
            {success ? (
              /* ── Success state ── */
              <View style={{ alignItems: "center", paddingVertical: 24 }}>
                <View
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    backgroundColor: `${theme.palette.AWE_Green}20`,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}
                >
                  <Icon
                    name="checkmark-circle"
                    size={36}
                    color={theme.palette.AWE_Green}
                  />
                </View>
                <TSSnippetText
                  textStyles={{ fontWeight: "700", marginBottom: 6, textAlign: "center" }}
                >
                  Password updated!
                </TSSnippetText>
                <TSCaptionText
                  textStyles={{
                    color: lightenHexColor(theme.palette.text, 0.45),
                    textAlign: "center",
                    marginBottom: 24,
                  }}
                >
                  Your password has been changed successfully.
                </TSCaptionText>
                <Pressable
                  onPress={() => router.back()}
                  style={({ pressed }) => ({
                    backgroundColor: theme.palette.AWE_Green,
                    borderRadius: 12,
                    paddingVertical: 13,
                    paddingHorizontal: 32,
                    opacity: pressed ? 0.75 : 1,
                  })}
                >
                  <TSCaptionText textStyles={{ color: "white", fontWeight: "700" }}>
                    Done
                  </TSCaptionText>
                </Pressable>
              </View>
            ) : (
              /* ── Form ── */
              <>
                <PasswordField
                  label="Current Password"
                  placeholder="Enter current password"
                  value={password}
                  onChangeText={setPassword}
                  hidden={hidePassword}
                  toggleHidden={() => setHidePassword((v) => !v)}
                  error={passwordError.length > 0}
                  hint={passwordError.length > 0 ? passwordError : undefined}
                />

                <View
                  style={{
                    height: 1,
                    backgroundColor: lightenHexColor(theme.palette.lightGray, 0.08),
                    marginBottom: 16,
                  }}
                />

                <PasswordField
                  label="New Password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  hidden={hideNewPassword}
                  toggleHidden={() => setHideNewPassword((v) => !v)}
                />

                <PasswordField
                  label="Confirm New Password"
                  placeholder="Re-enter new password"
                  value={passwordConfirm}
                  onChangeText={setPasswordConfirm}
                  hidden={hidePasswordConfirm}
                  toggleHidden={() => setHidePasswordConfirm((v) => !v)}
                  error={
                    passwordConfirm.length > 0 && !passwordsMatch
                  }
                  hint={
                    passwordConfirm.length > 0
                      ? passwordsMatch
                        ? "Passwords match"
                        : "Passwords do not match"
                      : undefined
                  }
                />

                <Pressable
                  onPress={updatePassword}
                  disabled={!canSubmit}
                  style={({ pressed }) => ({
                    marginTop: 8,
                    borderRadius: 12,
                    paddingVertical: 14,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: canSubmit
                      ? theme.palette.AWE_Blue
                      : lightenHexColor(theme.palette.AWE_Blue, 0.08),
                    opacity: pressed ? 0.75 : 1,
                  })}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <Icon
                        name="checkmark-circle-outline"
                        size={17}
                        color={canSubmit ? "white" : lightenHexColor(theme.palette.text, 0.3)}
                        style={{ marginRight: 7 }}
                      />
                      <TSCaptionText
                        textStyles={{
                          fontWeight: "700",
                          color: canSubmit
                            ? "white"
                            : lightenHexColor(theme.palette.text, 0.3),
                        }}
                      >
                        Update Password
                      </TSCaptionText>
                    </>
                  )}
                </Pressable>
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ResetPasswordScreen;
