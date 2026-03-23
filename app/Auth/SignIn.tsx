import React, { FunctionComponent } from "react";
import { View, TextInput, Pressable } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useTheme } from "styled-components/native";
import {
  TSCaptionText,
  TSSnippetText,
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
  autoCapitalize?: "none" | "sentences";
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
  autoCapitalize = "none",
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
          autoCapitalize={autoCapitalize}
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

// ─── Sign In form ─────────────────────────────────────────────────────────────

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
    <View>
      <Field
        testID={TestIDs.SignInEmailField.name()}
        icon="mail-outline"
        placeholder="Email address"
        value={email}
        onChangeText={onEmailChange}
        keyboardType="email-address"
        error={!!emailHelperText}
        hint={emailHelperText || undefined}
      />

      <Field
        testID={TestIDs.SignInPasswordField.name()}
        icon="lock-closed-outline"
        placeholder="Password"
        value={password}
        onChangeText={onPasswordChange}
        secure={hidePassword}
        trailing={
          <Pressable onPress={() => setHidePassword(!hidePassword)} hitSlop={8}>
            <Icon
              name={hidePassword ? "eye-off-outline" : "eye-outline"}
              size={18}
              color={lightenHexColor(theme.palette.text, 0.4)}
            />
          </Pressable>
        }
      />

      {showSignInFailedText && (
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
            No account found with those credentials.
          </TSCaptionText>
        </View>
      )}

      {/* Primary button */}
      <Pressable
        testID={TestIDs.SignInSubmit.name()}
        onPress={login}
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
          name="log-in-outline"
          size={17}
          color="white"
          style={{ marginRight: 7 }}
        />
        <TSCaptionText textStyles={{ color: "white", fontWeight: "700", fontSize: 14 }}>
          Sign In
        </TSCaptionText>
      </Pressable>

      {/* Footer link */}
      <Pressable
        onPress={() => setAuthMode(2)}
        style={{ alignItems: "center", marginTop: 18 }}
      >
        <TSSnippetText
          textStyles={{
            color: lightenHexColor(theme.palette.text, 0.4),
            fontSize: 13,
          }}
        >
          Forgot your password?
        </TSSnippetText>
      </Pressable>
    </View>
  );
};

export default SignInComp;
