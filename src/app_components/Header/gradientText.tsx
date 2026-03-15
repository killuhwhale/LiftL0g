import MaskedView from "@react-native-masked-view/masked-view";
import React, { FunctionComponent } from "react";
import { StyleProp, TextStyle } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useTheme } from "styled-components/native";
import { TSTitleText } from "../Text/Text";
import { lightenHexColor } from "../shared";

interface GradientTextProps {
  textStyles?: StyleProp<TextStyle>;
  text: string;
  reversed: boolean;
  angle?: number;
}

// const g1 = twrnc.color("bg-emerald-100");
// const g2 = twrnc.color("bg-emerald-200");
// const g3 = twrnc.color("bg-emerald-300");
// const g4 = twrnc.color("bg-emerald-400");
// const g5 = twrnc.color("bg-emerald-500");
// const g6 = twrnc.color("bg-emerald-600");
// const g7 = twrnc.color("bg-emerald-700");
// const g8 = twrnc.color("bg-emerald-800");
// const g9 = twrnc.color("bg-emerald-900");
// const _COLORS = [
//   g1 ?? "#0F0",
//   g2 ?? "#0F0",
//   g3 ?? "#0F0",
//   g4 ?? "#0F0",
//   g5 ?? "#0F0",
//   g6 ?? "#0F0",
//   g7 ?? "#0F0",
//   g8 ?? "#0F0",
//   g9 ?? "#0F0",
// ];

// function getColors(reversed: boolean) {
//   return reversed ? _COLORS.toReversed() : _COLORS;
// }

const GradientText: FunctionComponent<GradientTextProps> = (props) => {
  const theme = useTheme();
  const _COLORS = [
    lightenHexColor(theme.palette.AWE_Green, 0.35),
    lightenHexColor(theme.palette.AWE_Green, 0.45),
    lightenHexColor(theme.palette.AWE_Green, 0.5),
    lightenHexColor(theme.palette.AWE_Green, 0.6),
    lightenHexColor(theme.palette.AWE_Green, 0.7),
    lightenHexColor(theme.palette.AWE_Green, 0.8),
    lightenHexColor(theme.palette.AWE_Green, 1),
    lightenHexColor(theme.palette.AWE_Green, 1.5),
    lightenHexColor(theme.palette.AWE_Green, 2),
  ];

  return (
    <MaskedView
      maskElement={
        <TSTitleText textStyles={props.textStyles}>{props.text}</TSTitleText>
      }
    >
      <LinearGradient
        colors={props.reversed ? _COLORS.toReversed() : _COLORS}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        angle={props.angle || 180}
        angleCenter={{ x: 0.5, y: 0.5 }}
      >
        <TSTitleText textStyles={[{ color: "#00000000" }, props.textStyles]}>
          {" "}
          {props.text}
        </TSTitleText>
      </LinearGradient>
    </MaskedView>
  );
};

export default GradientText;
