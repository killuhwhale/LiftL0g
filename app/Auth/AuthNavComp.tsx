import React, { FunctionComponent } from "react";
import { View, Pressable } from "react-native";
import { TestIDs } from "@/src/utils/constants";
import { TSCaptionText } from "@/src/app_components/Text/Text";
import { useTheme } from "styled-components/native";
import { lightenHexColor } from "@/src/app_components/shared";

interface AuthNavCompProps {
  authModes: number[];
  authMode: number;
  setAuthMode(authMode: number): void;
}

const TABS = [
  { label: "Sign In", mode: 0, testID: undefined },
  { label: "Register", mode: 1, testID: TestIDs.AuthSignUpBtn.name() },
];

const AuthNavComp: FunctionComponent<AuthNavCompProps> = ({
  authModes,
  authMode,
  setAuthMode,
}) => {
  const theme = useTheme();
  const active = authModes[authMode];

  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: lightenHexColor(theme.palette.lightGray, 0.06),
        borderRadius: 12,
        padding: 3,
      }}
    >
      {TABS.map(({ label, mode, testID }) => {
        const isActive = active === mode;
        return (
          <Pressable
            key={mode}
            testID={testID}
            onPress={() => setAuthMode(mode)}
            style={({ pressed }) => ({
              flex: 1,
              alignItems: "center",
              paddingVertical: 9,
              borderRadius: 10,
              backgroundColor: isActive ? theme.palette.AWE_Green : "transparent",
              opacity: pressed ? 0.75 : 1,
            })}
          >
            <TSCaptionText
              textStyles={{
                fontWeight: "700",
                fontSize: 13,
                color: isActive
                  ? "white"
                  : lightenHexColor(theme.palette.text, 0.4),
              }}
            >
              {label}
            </TSCaptionText>
          </Pressable>
        );
      })}
    </View>
  );
};

export default AuthNavComp;
