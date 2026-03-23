import React, { FunctionComponent } from "react";
import { View, TextInput, Pressable } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useTheme } from "styled-components/native";
import { TSCaptionText } from "@/src/app_components/Text/Text";
import { lightenHexColor } from "@/src/app_components/shared";

// ─── Shared field ─────────────────────────────────────────────────────────────

const Field: FunctionComponent<{
  icon: string;
  placeholder: string;
  value: string;
  onChangeText(t: string): void;
  secure?: boolean;
  keyboardType?: "default" | "email-address";
  trailing?: React.ReactNode;
  error?: boolean;
  hint?: string;
}> = ({
  icon,
  placeholder,
  value,
  onChangeText,
  secure,
  keyboardType = "default",
  trailing,
  error,
  hint,
}) => {
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
          secureTextEntry={secure}
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
        {trailing}
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

// ─── Code Reset Password form ─────────────────────────────────────────────────

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
}) => {
  const theme = useTheme();

  return (
    <View>
      {resetPasswordError.length > 0 && (
        <View
          style={{
            backgroundColor: `${theme.palette.AWE_Red}15`,
            borderRadius: 10,
            padding: 10,
            marginBottom: 14,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Icon
            name="alert-circle-outline"
            size={15}
            color={theme.palette.AWE_Red}
            style={{ marginRight: 6 }}
          />
          <TSCaptionText
            textStyles={{ color: theme.palette.AWE_Red, flex: 1, fontSize: 12 }}
          >
            {resetPasswordError}
          </TSCaptionText>
        </View>
      )}

      <Field
        icon="mail-outline"
        placeholder="Email address"
        value={resetEmail}
        onChangeText={(txt) => {
          setResetEmail(txt);
          if (resetEmailError && validEmailRegex.test(txt)) {
            setResetEmailError("");
          }
        }}
        keyboardType="email-address"
        error={!!resetEmailError}
        hint={resetEmailError || undefined}
      />

      <Field
        icon="key-outline"
        placeholder="Reset code"
        value={resetCode}
        onChangeText={setResetCode}
      />

      <Field
        icon="lock-closed-outline"
        placeholder="New password"
        value={resetPassword}
        onChangeText={setResetPassword}
        secure={hideResetPassword}
        trailing={
          <Pressable
            onPress={() => setHideResetPassword(!hideResetPassword)}
            hitSlop={8}
          >
            <Icon
              name={hideResetPassword ? "eye-off-outline" : "eye-outline"}
              size={18}
              color={lightenHexColor(theme.palette.text, 0.4)}
            />
          </Pressable>
        }
      />

      <Pressable
        onPress={changePassword}
        style={({ pressed }) => ({
          backgroundColor: theme.palette.AWE_Green,
          borderRadius: 12,
          paddingVertical: 14,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          marginTop: 4,
          opacity: pressed ? 0.75 : 1,
        })}
      >
        <Icon
          name="checkmark-circle-outline"
          size={17}
          color="white"
          style={{ marginRight: 7 }}
        />
        <TSCaptionText textStyles={{ color: "white", fontWeight: "700", fontSize: 14 }}>
          Reset Password
        </TSCaptionText>
      </Pressable>
    </View>
  );
};

export default CodeResetPasswordPage;
