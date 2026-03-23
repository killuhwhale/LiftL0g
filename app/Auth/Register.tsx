import React, { FunctionComponent } from "react";
import { View, TextInput, Pressable } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useTheme } from "styled-components/native";
import {
  TSCaptionText,
} from "@/src/app_components/Text/Text";
import { lightenHexColor } from "@/src/app_components/shared";
import { TestIDs } from "@/src/utils/constants";

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
  testID?: string;
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
  testID,
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
          testID={testID}
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

// ─── Register form ────────────────────────────────────────────────────────────

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
  register,
}) => {
  const theme = useTheme();
  const passwordsMatch =
    newPassword.length > 0 &&
    newPasswordConfirm.length > 0 &&
    newPassword === newPasswordConfirm;

  return (
    <View>
      {registerError.length > 0 && (
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
            {registerError}
          </TSCaptionText>
        </View>
      )}

      <Field
        testID={TestIDs.AuthSignUpEmail.name()}
        icon="mail-outline"
        placeholder="Email address"
        value={newEmail}
        onChangeText={onNewEmailChange}
        keyboardType="email-address"
        error={!!newEmailHelperText}
        hint={newEmailHelperText || undefined}
      />

      <Field
        testID={TestIDs.AuthSignUpPassword.name()}
        icon="lock-closed-outline"
        placeholder="Password"
        value={newPassword}
        onChangeText={onNewPasswordChange}
        secure={hideNewPassword}
        trailing={
          <Pressable
            onPress={() => setHideNewPassword(!hideNewPassword)}
            hitSlop={8}
          >
            <Icon
              name={hideNewPassword ? "eye-off-outline" : "eye-outline"}
              size={18}
              color={lightenHexColor(theme.palette.text, 0.4)}
            />
          </Pressable>
        }
      />

      <Field
        testID={TestIDs.AuthSignUpPasswordConfirm.name()}
        icon="lock-closed-outline"
        placeholder="Confirm password"
        value={newPasswordConfirm}
        onChangeText={onNewPasswordConfirmChange}
        secure={hideNewPassword}
        error={!!mismatchPasswordText}
        hint={
          newPasswordConfirm.length > 0
            ? passwordsMatch
              ? "Passwords match"
              : mismatchPasswordText || "Passwords do not match"
            : undefined
        }
        trailing={
          <Pressable
            onPress={() => setHideNewPassword(!hideNewPassword)}
            hitSlop={8}
          >
            <Icon
              name={hideNewPassword ? "eye-off-outline" : "eye-outline"}
              size={18}
              color={lightenHexColor(theme.palette.text, 0.4)}
            />
          </Pressable>
        }
      />

      <Pressable
        testID={TestIDs.AuthSignUpRegisterBtn.name()}
        onPress={register}
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
          name="person-add-outline"
          size={17}
          color="white"
          style={{ marginRight: 7 }}
        />
        <TSCaptionText textStyles={{ color: "white", fontWeight: "700", fontSize: 14 }}>
          Create Account
        </TSCaptionText>
      </Pressable>
    </View>
  );
};

export default RegisterComp;
