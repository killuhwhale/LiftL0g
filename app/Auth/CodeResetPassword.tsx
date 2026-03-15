import React, { FunctionComponent } from "react";
import { Platform, Pressable, SafeAreaView, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { RegularButton } from "@/src/app_components/Buttons/buttons";
import Input, { AutoCaptilizeEnum } from "@/src/app_components/Input/input";
import {
  TSParagrapghText,
  TSSnippetText,
} from "@/src/app_components/Text/Text";
import { useTheme } from "styled-components/native";
import { SCREEN_WIDTH } from "@/src/app_components/shared";

interface CodeResetPasswordProps {
  resetPasswordError: string;
  setAuthMode(authMode: number): void;
  resetEmailError: string;
  validEmailRegex: RegExp;
  resetEmail: string;
  resetPassword: string;
  resetCode: string;
  hideResetPassword: boolean;
  setHideResetPassword(hide: boolean): void;
  changePassword(): void;
  setResetPassword(text: string): void;
  setResetEmailError(text: string): void;
  setResetEmail(text: string): void;
  setResetCode(text: string): void;
}

const CodeResetPasswordPage: FunctionComponent<CodeResetPasswordProps> = ({
  resetPasswordError,
  resetEmailError,
  validEmailRegex,
  resetEmail,
  resetPassword,
  resetCode,
  hideResetPassword,
  setHideResetPassword,
  setResetEmail,
  setResetEmailError,
  setResetCode,
  setResetPassword,
  changePassword,
  setAuthMode,
}) => {
  const theme = useTheme();

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.palette.backgroundColor }}
    >
      <View
        style={{
          justifyContent: "center",
          padding: 24,
          width: SCREEN_WIDTH * 0.85,
        }}
      >
        {/* Card */}
        <View
          style={{
            backgroundColor: theme.palette.AWE_Green,
            borderRadius: 16,
            padding: 24,
            elevation: 6,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.1,
            shadowRadius: 6,
          }}
        >
          {/* Instructions */}
          <TSSnippetText
            textStyles={{
              textAlign: "center",
              fontSize: 14,
              marginBottom: 12,
              color: theme.palette.text,
            }}
          >
            Check your email for the code we sent you
          </TSSnippetText>

          {/* Server Error */}
          {resetPasswordError.length > 0 && (
            <TSParagrapghText
              textStyles={{
                textAlign: "center",
                color: theme.palette.AWE_Red,
                marginBottom: 12,
              }}
            >
              {resetPasswordError}
            </TSParagrapghText>
          )}

          {/* Email Input */}
          <View style={{ height: 28, marginVertical: 6 }}>
            <Input
              placeholder="Email"
              label="Email"
              autoCapitalize={AutoCaptilizeEnum.None}
              keyboardType="email-address"
              value={resetEmail}
              isError={!!resetEmailError}
              helperText={resetEmailError}
              onChangeText={(txt) => {
                setResetEmail(txt);
                if (resetEmailError && validEmailRegex.test(txt)) {
                  setResetEmailError("");
                } else if (!validEmailRegex.test(txt)) {
                  setResetEmailError("Invalid email");
                }
              }}
              leading={
                <Icon
                  name="mail-outline"
                  size={10}
                  color={theme.palette.AWE_Yellow}
                />
              }
              containerStyle={{
                backgroundColor: theme.palette.backgroundColor,
                borderRadius: 8,
              }}
            />
          </View>

          {/* Code Input */}
          <View style={{ height: 28, marginVertical: 6 }}>
            <Input
              placeholder="Reset Code"
              label="Code"
              autoCapitalize={AutoCaptilizeEnum.None}
              value={resetCode}
              onChangeText={setResetCode}
              containerStyle={{
                backgroundColor: theme.palette.backgroundColor,
                borderRadius: 8,
              }}
              leading={
                <Icon
                  name="key-outline"
                  size={10}
                  color={theme.palette.AWE_Yellow}
                />
              }
            />
          </View>

          {/* New Password Input */}
          <View style={{ height: 28, marginVertical: 6 }}>
            <Input
              placeholder="New Password"
              label="New Password"
              secureTextEntry={hideResetPassword}
              autoCapitalize={AutoCaptilizeEnum.None}
              value={resetPassword}
              onChangeText={setResetPassword}
              leading={
                <Icon
                  name={
                    hideResetPassword
                      ? "lock-closed-outline"
                      : "lock-open-outline"
                  }
                  size={10}
                  color={theme.palette.AWE_Yellow}
                  onPress={() => setHideResetPassword(!hideResetPassword)}
                />
              }
              trailing={
                <Icon
                  name={hideResetPassword ? "eye-off-outline" : "eye-outline"}
                  size={16}
                  color={theme.palette.text}
                  onPress={() => setHideResetPassword(!hideResetPassword)}
                />
              }
              containerStyle={{
                backgroundColor: theme.palette.backgroundColor,
                borderRadius: 8,
              }}
            />
          </View>

          {/* Reset Button */}
          <View style={{ marginTop: 16 }}>
            <RegularButton
              onPress={changePassword}
              btnStyles={{
                backgroundColor: theme.palette.primary.main,
                paddingVertical: 12,
                borderRadius: 8,
              }}
              text="Reset Password"
            />
          </View>
        </View>

        {/* Back to Sign In */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginTop: 24,
          }}
        >
          <Pressable onPress={() => setAuthMode(0)}>
            <TSSnippetText textStyles={{ color: theme.palette.AWE_Green }}>
              Back to Sign In
            </TSSnippetText>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default CodeResetPasswordPage;
