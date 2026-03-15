import React, { FunctionComponent } from "react";
import { Pressable, SafeAreaView, View } from "react-native";
import { RegularButton } from "@/src/app_components/Buttons/buttons";
import { TestIDs } from "@/src/utils/constants";
import {
  TSCaptionText,
  TSParagrapghText,
  TSSnippetText,
} from "@/src/app_components/Text/Text";
import Input, { AutoCaptilizeEnum } from "@/src/app_components/Input/input";
import Icon from "react-native-vector-icons/Ionicons";
import { useTheme } from "styled-components/native";
import { SCREEN_WIDTH } from "@/src/app_components/shared";

interface SignInProps {
  email: string;
  emailHelperText: string;
  onEmailChange(text: string): void;
  onPasswordChange(text: string): void;
  password: string;
  hidePassword: boolean;
  setHidePassword(hide: boolean): void;
  login(): void;
  setAuthMode(authMode: number): void;
  showSignInFailedText: boolean;
}

const SignInComp: FunctionComponent<SignInProps> = ({
  email,
  emailHelperText,
  onEmailChange,
  password,
  onPasswordChange,
  hidePassword,
  setHidePassword,
  login,
  setAuthMode,
  showSignInFailedText,
}) => {
  const theme = useTheme();

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme.palette.backgroundColor,
      }}
    >
      <View
        style={{
          justifyContent: "center",
          padding: 24,
          width: SCREEN_WIDTH * 0.85,
        }}
      >
        {/* Card Container */}
        <View
          style={{
            backgroundColor: theme.palette.AWE_Green,
            borderRadius: 16,
            padding: 24,
            // Android shadow:
            elevation: 6,
            // iOS shadow:
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
            Sign In
          </TSParagrapghText>

          {/* Email */}

          {/* Password */}
          <View style={{ height: 28, marginVertical: 6 }}>
            <Input
              testID={TestIDs.SignInEmailField.name()}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize={AutoCaptilizeEnum.None}
              value={email}
              isError={!!emailHelperText}
              helperText={emailHelperText}
              onChangeText={onEmailChange}
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

                height: 20,
              }}
              label="Email"
            />
          </View>
          <View style={{ height: 28, marginVertical: 6 }}>
            <Input
              testID={TestIDs.SignInPasswordField.name()}
              placeholder="Password"
              secureTextEntry={hidePassword}
              value={password}
              onChangeText={onPasswordChange}
              leading={
                <Icon
                  name={hidePassword ? "eye-off-outline" : "eye-outline"}
                  size={10}
                  color={theme.palette.text}
                  onPress={() => setHidePassword(!hidePassword)}
                />
              }
              containerStyle={{
                backgroundColor: theme.palette.backgroundColor,
                borderRadius: 8,
              }}
              label="Password"
            />
          </View>

          {/* Sign In Button */}
          <RegularButton
            testID={TestIDs.SignInSubmit.name()}
            onPress={login}
            btnStyles={{
              backgroundColor: theme.palette.primary.main,
              paddingVertical: 14,
              borderRadius: 8,
            }}
            text="Sign In"
          />

          {/* Error Message */}
          {showSignInFailedText && (
            <View style={{ marginTop: 16 }}>
              <TSCaptionText
                textStyles={{
                  textAlign: "center",
                  color: theme.palette.AWE_Red,
                }}
              >
                No active account found with those credentials.
              </TSCaptionText>
            </View>
          )}
        </View>

        {/* Footer Links */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            marginTop: 24,
            paddingHorizontal: 8,
          }}
        >
          <Pressable onPress={() => setAuthMode(1)}>
            <TSSnippetText textStyles={{ color: theme.palette.AWE_Green }}>
              Register
            </TSSnippetText>
          </Pressable>
          {/* // 0 - Sign in
            // 1 - Sign up
            // 2 - Forgot Password
            // 3 - Reset Password code page thing */}
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

export default SignInComp;
