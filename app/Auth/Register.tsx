import React, { FunctionComponent } from "react";
import { Platform, Pressable, SafeAreaView, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { RegularButton } from "@/src/app_components/Buttons/buttons";
import Input, { AutoCaptilizeEnum } from "@/src/app_components/Input/input";
import {
  TSParagrapghText,
  TSCaptionText,
  TSSnippetText,
} from "@/src/app_components/Text/Text";
import { TestIDs } from "@/src/utils/constants";
import { useTheme } from "styled-components/native";
import { SCREEN_WIDTH } from "@/src/app_components/shared";

interface RegisterCompProps {
  registerError: string;
  newEmail: string;
  newEmailHelperText: string;
  newPassword: string;
  hideNewPassword: boolean;
  newPasswordConfirm: string;
  mismatchPasswordText: string;
  onNewEmailChange(text: string): void;
  onNewPasswordChange(text: string): void;
  onNewPasswordConfirmChange(text: string): void;
  setHideNewPassword(hide: boolean): void;
  setAuthMode(authMode: number): void;
  register(): void;
}

const RegisterComp: FunctionComponent<RegisterCompProps> = ({
  registerError,
  newEmail,
  newEmailHelperText,
  newPassword,
  hideNewPassword,
  newPasswordConfirm,
  mismatchPasswordText,
  onNewEmailChange,
  onNewPasswordChange,
  onNewPasswordConfirmChange,
  setHideNewPassword,
  setAuthMode,
  register,
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
          {/* Title */}
          <TSParagrapghText
            textStyles={{
              textAlign: "center",
              fontSize: 26,
              fontWeight: "600",
              marginBottom: 18,
              color: theme.palette.text,
            }}
          >
            Sign Up
          </TSParagrapghText>

          {/* Server/Validation Error */}
          {registerError.length > 0 && (
            <View style={{ marginBottom: 12 }}>
              <TSCaptionText
                textStyles={{
                  textAlign: "center",
                  color: theme.palette.AWE_Red,
                }}
              >
                {registerError}
              </TSCaptionText>
            </View>
          )}
          <View style={{ height: 28, marginVertical: 6 }}>
            <Input
              testID={TestIDs.AuthSignUpEmail.name()}
              placeholder="Email"
              label="Email"
              keyboardType="email-address"
              autoCapitalize={AutoCaptilizeEnum.None}
              value={newEmail}
              isError={!!newEmailHelperText}
              helperText={newEmailHelperText}
              onChangeText={onNewEmailChange}
              leading={
                <Icon
                  name="mail-outline"
                  size={10}
                  color={theme.palette.text}
                />
              }
              containerStyle={{
                backgroundColor: theme.palette.backgroundColor,
                borderRadius: 8,
              }}
            />
          </View>
          <View style={{ height: 28, marginVertical: 6 }}>
            <Input
              testID={TestIDs.AuthSignUpPassword.name()}
              placeholder="Password"
              label="Password"
              secureTextEntry={hideNewPassword}
              value={newPassword}
              onChangeText={onNewPasswordChange}
              leading={
                <Icon
                  name={
                    hideNewPassword
                      ? "lock-closed-outline"
                      : "lock-open-outline"
                  }
                  size={10}
                  color={theme.palette.text}
                  onPress={() => setHideNewPassword(!hideNewPassword)}
                />
              }
              containerStyle={{
                backgroundColor: theme.palette.backgroundColor,
                borderRadius: 8,
              }}
            />
          </View>
          <View style={{ height: 28, marginVertical: 6 }}>
            <Input
              testID={TestIDs.AuthSignUpPasswordConfirm.name()}
              secureTextEntry={hideNewPassword}
              placeholder="Confirm Password"
              label="Confirm Password"
              value={newPasswordConfirm}
              onChangeText={onNewPasswordConfirmChange}
              isError={!!mismatchPasswordText}
              helperText={mismatchPasswordText}
              leading={
                <Icon
                  name={
                    hideNewPassword
                      ? "lock-closed-outline"
                      : "lock-open-outline"
                  }
                  size={10}
                  color={theme.palette.AWE_Yellow}
                  onPress={() => setHideNewPassword(!hideNewPassword)}
                />
              }
              trailing={
                <Icon
                  name={hideNewPassword ? "eye-off-outline" : "eye-outline"}
                  size={16}
                  color={theme.palette.text}
                  onPress={() => setHideNewPassword(!hideNewPassword)}
                />
              }
              containerStyle={{
                backgroundColor: theme.palette.backgroundColor,
                borderRadius: 8,
              }}
            />
          </View>

          {/* Register Button */}
          <RegularButton
            testID={TestIDs.AuthSignUpRegisterBtn.name()}
            onPress={register}
            btnStyles={{
              backgroundColor: theme.palette.primary.main,
              paddingVertical: 14,
              borderRadius: 8,
            }}
            text="Register"
          />
        </View>

        {/* Footer Links */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 24,
            paddingHorizontal: 8,
          }}
        >
          <Pressable onPress={() => setAuthMode(0)}>
            <View>
              <TSSnippetText textStyles={{ color: theme.palette.AWE_Green }}>
                Already have an account?
              </TSSnippetText>
              <TSSnippetText
                textStyles={{
                  color: theme.palette.AWE_Green,
                  textAlign: "center",
                }}
              >
                Sign In
              </TSSnippetText>
            </View>
          </Pressable>
          <Pressable onPress={() => setAuthMode(2)}>
            <TSSnippetText textStyles={{ color: theme.palette.AWE_Green }}>
              Forgot Password?
            </TSSnippetText>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default RegisterComp;
