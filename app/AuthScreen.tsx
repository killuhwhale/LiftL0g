import React, { FunctionComponent, useState } from "react";
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Pressable,
} from "react-native";
import { useTheme } from "styled-components/native";
import Icon from "react-native-vector-icons/Ionicons";
import AuthManager from "../src/utils/auth";
import { validEmailRegex } from "../src/utils/algos";
import { post } from "../src/utils/fetchAPI";
import { BASEURL } from "../src/utils/constants";
import SignInComp from "./Auth/SignIn";
import RegisterComp from "./Auth/Register";
import ResetPasswordAuthPage from "./Auth/ResetPasswordAuthPage";
import CodeResetPasswordPage from "./Auth/CodeResetPassword";
import AlertModal from "@/src/app_components/modals/AlertModal";
import {
  TSCaptionText,
  TSTitleText,
  TSSnippetText,
} from "@/src/app_components/Text/Text";
import { SCREEN_WIDTH, lightenHexColor } from "@/src/app_components/shared";

// ─── Mode tab strip (Sign In / Register only) ────────────────────────────────

const ModeTab: FunctionComponent<{
  label: string;
  active: boolean;
  onPress(): void;
}> = ({ label, active, onPress }) => {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        alignItems: "center",
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: active ? theme.palette.AWE_Green : "transparent",
        opacity: pressed ? 0.75 : 1,
      })}
    >
      <TSCaptionText
        textStyles={{
          fontWeight: "700",
          color: active ? "white" : lightenHexColor(theme.palette.text, 0.4),
          fontSize: 13,
        }}
      >
        {label}
      </TSCaptionText>
    </Pressable>
  );
};

// ─── Orchestrator ─────────────────────────────────────────────────────────────

const AuthScreen: FunctionComponent = () => {
  const theme = useTheme();
  const auth = AuthManager;

  // 0=Sign In, 1=Register, 2=Forgot Password, 3=Reset via Code
  const authModes = [0, 1, 2, 3];
  const [authMode, setAuthMode] = useState(0);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hidePassword, setHidePassword] = useState(true);
  const [emailHelperText, setEmailHelperText] = useState("");
  const [showSignInFailedText, setShowSignInFailedText] = useState(false);
  const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;

  const [newEmail, setNewEmail] = useState("");
  const [newEmailHelperText, setNewEmailHelperText] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [hideNewPassword, setHideNewPassword] = useState(true);
  const [mismatchPasswordText, setMismatchPasswordText] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [showVerifyEmailAlert, setShowVerifyEmailAlert] = useState(false);

  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [resetEmailError, setResetEmailError] = useState("");
  const [resetPasswordError, setResetPasswordError] = useState("");
  const [hideResetPassword, setHideResetPassword] = useState(true);

  const login = async () => {
    if (emailHelperText.length > 0) setEmailHelperText("");
    auth.login(email, password);
  };

  auth.listenLogin((loggedIn, msg) => {
    if (!loggedIn) setShowSignInFailedText(true);
  }, "authscreen");

  const onEmailChange = (text: string) => {
    if (text.indexOf("@") >= 0 && text.indexOf(".") >= 0) {
      setEmailHelperText(reg.test(text) ? "" : "Invalid email");
    } else if (emailHelperText !== "") {
      setEmailHelperText("");
    }
    setEmail(text);
    setNewEmail(text);
  };

  const onPasswordChange = (text: string) => {
    setPassword(text);
    setNewPassword(text);
  };

  const onNewEmailChange = (text: string) => {
    if (registerError) setRegisterError("");
    if (text.indexOf("@") >= 0 && text.indexOf(".") >= 0) {
      setNewEmailHelperText(reg.test(text) ? "" : "Invalid email");
    } else if (newEmailHelperText !== "") {
      setNewEmailHelperText("");
    }
    setEmail(text);
    setNewEmail(text);
  };

  const onNewPasswordChange = (text: string) => {
    setNewPassword(text);
    setPassword(text);
  };

  const onNewPasswordConfirmChange = (text: string) => {
    if (text.length >= newPassword.length && newPassword !== text) {
      setMismatchPasswordText("Passwords do not match");
    } else {
      setMismatchPasswordText("");
    }
    setNewPasswordConfirm(text);
  };

  const register = async () => {
    if (newEmailHelperText.length > 0) setNewEmailHelperText("");
    if (registerError.length > 0) setRegisterError("");
    if (newEmail.length <= 0 || newPassword !== newPasswordConfirm) return;
    if (!reg.test(newEmail)) {
      setNewEmailHelperText("Invalid Email");
      return;
    }
    const data = new FormData();
    data.append("email", newEmail);
    data.append("password", newPassword);
    data.append("username", newEmail);
    try {
      const res = await auth.register(data);
      if (res?.id > 0) {
        setShowVerifyEmailAlert(true);
      } else if (res?.email === "Email taken") {
        setRegisterError("Email already in use.");
      }
    } catch {
      setRegisterError("Error registering. Please try again.");
    }
  };

  const changePassword = async () => {
    if (resetPasswordError.length > 0) setResetPasswordError("");
    const res = await post(`${BASEURL}/user/reset_password/`, {
      email: resetEmail,
      reset_code: resetCode,
      new_password: resetPassword,
    }).then((r) => r.json());
    if (res.data) {
      setAuthMode(0);
      setResetCode("");
      setResetEmail("");
      setResetPassword("");
    } else {
      setResetPasswordError(res.error);
    }
  };

  const isSecondaryMode = authMode === 2 || authMode === 3;

  const secondaryTitle = authMode === 2 ? "Forgot Password" : "Reset Password";
  const secondarySubtitle =
    authMode === 2
      ? "Enter your email to receive a reset code"
      : "Enter the code from your email";

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.palette.backgroundColor }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            alignItems: "center",
            paddingTop: 36,
            paddingBottom: 40,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Brand header ── */}
          <View style={{ alignItems: "center", marginBottom: 32 }}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 18,
                backgroundColor: `${theme.palette.AWE_Green}20`,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 14,
              }}
            >
              <Icon
                name="barbell-outline"
                size={30}
                color={theme.palette.AWE_Green}
              />
            </View>
            <TSTitleText textStyles={{ marginVertical: 0, fontSize: 26 }}>
              LiftL0g
            </TSTitleText>
            <TSCaptionText
              textStyles={{
                color: lightenHexColor(theme.palette.text, 0.45),
                marginTop: 4,
              }}
            >
              {isSecondaryMode
                ? secondarySubtitle
                : "Track every rep. Own every workout."}
            </TSCaptionText>
          </View>

          {/* ── Card ── */}
          <View
            style={{
              width: SCREEN_WIDTH * 0.88,
              backgroundColor: lightenHexColor(theme.palette.darkGray, 0.04),
              borderRadius: 20,
              borderWidth: 1,
              borderColor: lightenHexColor(theme.palette.lightGray, 0.08),
              padding: 24,
            }}
          >
            {/* Mode tab strip or secondary header */}
            {isSecondaryMode ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                <Pressable
                  onPress={() => setAuthMode(0)}
                  hitSlop={10}
                  style={{ marginRight: 10 }}
                >
                  <Icon
                    name="arrow-back-outline"
                    size={20}
                    color={lightenHexColor(theme.palette.text, 0.5)}
                  />
                </Pressable>
                <TSSnippetText textStyles={{ fontWeight: "700" }}>
                  {secondaryTitle}
                </TSSnippetText>
              </View>
            ) : (
              <View
                style={{
                  flexDirection: "row",
                  backgroundColor: lightenHexColor(
                    theme.palette.lightGray,
                    0.06,
                  ),
                  borderRadius: 12,
                  padding: 3,
                  marginBottom: 24,
                }}
              >
                <ModeTab
                  label="Sign In"
                  active={authMode === 0}
                  onPress={() => setAuthMode(0)}
                />
                <ModeTab
                  label="Register"
                  active={authMode === 1}
                  onPress={() => setAuthMode(1)}
                />
              </View>
            )}

            {/* Active form */}
            {authMode === 0 ? (
              <SignInComp
                email={email}
                showSignInFailedText={showSignInFailedText}
                emailHelperText={emailHelperText}
                hidePassword={hidePassword}
                login={login}
                onEmailChange={onEmailChange}
                onPasswordChange={onPasswordChange}
                password={password}
                setHidePassword={setHidePassword}
                setAuthMode={setAuthMode}
              />
            ) : authMode === 1 ? (
              <RegisterComp
                hideNewPassword={hideNewPassword}
                mismatchPasswordText={mismatchPasswordText}
                newEmail={newEmail}
                newEmailHelperText={newEmailHelperText}
                newPassword={newPassword}
                newPasswordConfirm={newPasswordConfirm}
                onNewEmailChange={onNewEmailChange}
                onNewPasswordChange={onNewPasswordChange}
                onNewPasswordConfirmChange={onNewPasswordConfirmChange}
                register={register}
                registerError={registerError}
                setAuthMode={setAuthMode}
                setHideNewPassword={setHideNewPassword}
              />
            ) : authMode === 2 ? (
              <ResetPasswordAuthPage
                setAuthMode={setAuthMode}
                resetEmail={resetEmail}
                setResetEmail={setResetEmail}
                resetEmailError={resetEmailError}
                setResetEmailError={setResetEmailError}
              />
            ) : (
              <CodeResetPasswordPage
                changePassword={changePassword}
                hideResetPassword={hideResetPassword}
                resetCode={resetCode}
                resetEmail={resetEmail}
                resetEmailError={resetEmailError}
                resetPassword={resetPassword}
                resetPasswordError={resetPasswordError}
                setAuthMode={setAuthMode}
                setHideResetPassword={setHideResetPassword}
                setResetCode={setResetCode}
                setResetEmail={setResetEmail}
                setResetEmailError={setResetEmailError}
                setResetPassword={setResetPassword}
                validEmailRegex={validEmailRegex}
              />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <AlertModal
        modalVisible={showVerifyEmailAlert}
        onRequestClose={() => {
          setShowVerifyEmailAlert(false);
          setAuthMode(0);
        }}
        closeText="Got it"
        bodyText="Account created! Check your email to verify your account before signing in."
      />
    </SafeAreaView>
  );
};

export default AuthScreen;
