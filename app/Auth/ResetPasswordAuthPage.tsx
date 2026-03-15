import React, { FunctionComponent, useState } from "react";
import { Platform, Pressable, SafeAreaView, View } from "react-native";
import { RegularButton } from "@/src/app_components/Buttons/buttons";
import { BASEURL, TestIDs } from "@/src/utils/constants";
import {
  TSCaptionText,
  TSParagrapghText,
  TSSnippetText,
} from "@/src/app_components/Text/Text";
import Input, { AutoCaptilizeEnum } from "@/src/app_components/Input/input";
import Icon from "react-native-vector-icons/Ionicons";
import { useTheme } from "styled-components/native";
import { validEmailRegex } from "@/src/utils/algos";
import { post } from "@/src/utils/fetchAPI";
import { SCREEN_WIDTH } from "@/src/app_components/shared";

interface ResetPasswordAuthPageProps {
  setAuthMode(authMode: number): void; // 0 = Sign In, 1 = Sign Up, 2 = Forgot Password, 3 = Reset Password via Code
  resetEmail: string;
  setResetEmail(text: string): void;
  resetEmailError: string;
  setResetEmailError(text: string): void;
}

const ResetPasswordAuthPage: FunctionComponent<ResetPasswordAuthPageProps> = ({
  setAuthMode,
  resetEmail,
  setResetEmail,
  resetEmailError,
  setResetEmailError,
}) => {
  const theme = useTheme();

  const [emailError, setEmailError] = useState("");
  // const [errorMsg, setErrorMsg] = useState("");
  const [showHint, setShowHint] = useState(false);

  const validEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const sendEmail = async () => {
    setResetEmailError("");
    if (!validEmailRegex.test(resetEmail)) {
      setEmailError("Invalid email address");
      return;
    }
    // call your API…
    try {
      const result = await (
        await post(`${BASEURL}user/send_reset_code/`, { resetEmail })
      ).json();
      if (result.error) {
        setResetEmailError(result.error);
      } else {
        setShowHint(true);
      }
    } catch (err: any) {
      setResetEmailError("Something went wrong. Please try again.");
    }
  };

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
          {/* Instruction */}
          <TSParagrapghText
            textStyles={{
              textAlign: "center",
              fontSize: 18,
              marginBottom: 16,
              color: theme.palette.text,
            }}
          >
            Enter the email associated with your account
          </TSParagrapghText>

          {/* Email Input */}
          <View style={{ height: 28, marginVertical: 6 }}>
            <Input
              testID="resetEmailField"
              label="Email"
              placeholder="Email"
              autoCapitalize={AutoCaptilizeEnum.None}
              keyboardType="email-address"
              value={resetEmail}
              isError={!!emailError}
              helperText={emailError}
              onChangeText={(txt) => {
                setResetEmail(txt);
                if (emailError && validEmailRegex.test(txt)) {
                  // setEmailError("");

                  setResetEmailError("");
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

          {/* Send Button */}
          <View style={{ marginTop: 16 }}>
            <RegularButton
              btnStyles={{
                backgroundColor: theme.palette.primary.main,
                paddingVertical: 12,
                borderRadius: 8,
              }}
              text="Send Reset Code"
              textStyles={{ textAlign: "center" }}
              onPress={sendEmail}
              disabled={showHint}
            />
          </View>

          {/* Feedback */}
          {(resetEmailError.length > 0 || showHint) && (
            <View style={{ marginTop: 16 }}>
              <TSCaptionText
                textStyles={{
                  textAlign: "center",
                  color: resetEmailError
                    ? theme.palette.AWE_Red
                    : theme.palette.AWE_Green,
                }}
              >
                {resetEmailError ||
                  "A reset code has been sent. Please check your inbox."}
              </TSCaptionText>
            </View>
          )}
        </View>

        {/* Back to Sign In */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            marginTop: 24,
          }}
        >
          <Pressable onPress={() => setAuthMode(0)}>
            <TSSnippetText textStyles={{ color: theme.palette.AWE_Green }}>
              Back to Sign In
            </TSSnippetText>
          </Pressable>
          <Pressable onPress={() => setAuthMode(3)}>
            <TSSnippetText textStyles={{ color: theme.palette.AWE_Green }}>
              Submit Code
            </TSSnippetText>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ResetPasswordAuthPage;
