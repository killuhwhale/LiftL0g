import React, { FunctionComponent, useState } from "react";
import { View, TextInput, Pressable } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useTheme } from "styled-components/native";
import {
  TSCaptionText,
  TSSnippetText,
} from "@/src/app_components/Text/Text";
import { lightenHexColor } from "@/src/app_components/shared";
import { BASEURL } from "@/src/utils/constants";
import { post } from "@/src/utils/fetchAPI";

// ─── Shared field ─────────────────────────────────────────────────────────────

const Field: FunctionComponent<{
  icon: string;
  placeholder: string;
  value: string;
  onChangeText(t: string): void;
  keyboardType?: "default" | "email-address";
  error?: boolean;
  hint?: string;
}> = ({ icon, placeholder, value, onChangeText, keyboardType = "default", error, hint }) => {
  const theme = useTheme();
  const borderColor = error
    ? theme.palette.AWE_Red
    : value.length > 0
    ? `${theme.palette.AWE_Green}66`
    : lightenHexColor(theme.palette.lightGray, 0.1);

  return (
    <View style={{ marginBottom: hint ? 20 : 14 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: lightenHexColor(theme.palette.backgroundColor, 0.06),
          borderRadius: 12,
          borderWidth: 1.5,
          borderColor,
          paddingHorizontal: 14,
          height: 52,
        }}
      >
        <Icon
          name={icon}
          size={17}
          color={lightenHexColor(theme.palette.text, 0.35)}
          style={{ marginRight: 10 }}
        />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={lightenHexColor(theme.palette.text, 0.3)}
          keyboardType={keyboardType}
          autoCapitalize="none"
          autoCorrect={false}
          style={{
            flex: 1,
            color: theme.palette.text,
            fontSize: 15,
            paddingVertical: 0,
          }}
        />
      </View>
      {hint ? (
        <TSCaptionText
          textStyles={{
            marginTop: 4,
            fontSize: 11,
            color: error ? theme.palette.AWE_Red : theme.palette.AWE_Green,
          }}
        >
          {hint}
        </TSCaptionText>
      ) : null}
    </View>
  );
};

// ─── Forgot Password form ─────────────────────────────────────────────────────

interface ResetPasswordAuthPageProps {
  setAuthMode(authMode: number): void;
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
  const [showHint, setShowHint] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const sendEmail = async () => {
    setResetEmailError("");
    setEmailError("");
    if (!emailRegex.test(resetEmail)) {
      setEmailError("Please enter a valid email address");
      return;
    }
    setIsLoading(true);
    try {
      const result = await (
        await post(`${BASEURL}user/send_reset_code/`, { email: resetEmail })
      ).json();
      if (result.error) {
        setResetEmailError(result.error);
      } else {
        setShowHint(true);
      }
    } catch {
      setResetEmailError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const error = emailError || resetEmailError;

  return (
    <View>
      <Field
        icon="mail-outline"
        placeholder="Email address"
        value={resetEmail}
        onChangeText={(txt) => {
          setResetEmail(txt);
          if (error && emailRegex.test(txt)) {
            setEmailError("");
            setResetEmailError("");
          }
        }}
        keyboardType="email-address"
        error={!!error}
        hint={error || undefined}
      />

      {showHint && (
        <View
          style={{
            backgroundColor: `${theme.palette.AWE_Green}15`,
            borderRadius: 10,
            padding: 12,
            marginBottom: 14,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Icon
            name="checkmark-circle-outline"
            size={16}
            color={theme.palette.AWE_Green}
            style={{ marginRight: 8 }}
          />
          <TSCaptionText
            textStyles={{ color: theme.palette.AWE_Green, flex: 1, fontSize: 12 }}
          >
            Reset code sent! Check your inbox.
          </TSCaptionText>
        </View>
      )}

      <Pressable
        onPress={sendEmail}
        disabled={showHint || isLoading}
        style={({ pressed }) => ({
          backgroundColor:
            showHint
              ? lightenHexColor(theme.palette.AWE_Green, 0.1)
              : theme.palette.AWE_Green,
          borderRadius: 12,
          paddingVertical: 14,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          marginTop: 4,
          opacity: pressed || showHint ? 0.6 : 1,
        })}
      >
        <Icon
          name={showHint ? "checkmark-outline" : "paper-plane-outline"}
          size={17}
          color="white"
          style={{ marginRight: 7 }}
        />
        <TSCaptionText textStyles={{ color: "white", fontWeight: "700", fontSize: 14 }}>
          {showHint ? "Code Sent" : "Send Reset Code"}
        </TSCaptionText>
      </Pressable>

      {showHint && (
        <Pressable
          onPress={() => setAuthMode(3)}
          style={({ pressed }) => ({
            marginTop: 14,
            paddingVertical: 13,
            borderRadius: 12,
            alignItems: "center",
            backgroundColor: lightenHexColor(theme.palette.AWE_Blue, 0.12),
            opacity: pressed ? 0.75 : 1,
          })}
        >
          <TSCaptionText
            textStyles={{ color: theme.palette.AWE_Blue, fontWeight: "700", fontSize: 13 }}
          >
            Enter Code →
          </TSCaptionText>
        </Pressable>
      )}
    </View>
  );
};

export default ResetPasswordAuthPage;
