import React, { FunctionComponent, useState } from "react";
import { StyleProp, StyleSheet, Text, TextStyle, View } from "react-native";
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Text as SvgText,
} from "react-native-svg";
import { useTheme } from "styled-components/native";
import { lightenHexColor, tsPageTitle } from "../shared";

interface GradientTextProps {
  textStyles?: StyleProp<TextStyle>;
  text: string;
  reversed: boolean;
  angle?: number;
}

const GradientText: FunctionComponent<GradientTextProps> = (props) => {
  const theme = useTheme();
  const renderBuffer = 8;
  const [size, setSize] = useState<{ width: number; height: number } | null>(
    null
  );

  const stops = [
    lightenHexColor(theme.palette.AWE_Green, 0.35),
    lightenHexColor(theme.palette.AWE_Green, 0.7),
    lightenHexColor(theme.palette.AWE_Green, 1.5),
    lightenHexColor(theme.palette.AWE_Green, 2),
  ];
  const orderedStops = props.reversed ? [...stops].reverse() : stops;

  // Merge TSTitleText base size with any caller overrides for accurate measurement
  const flat =
    StyleSheet.flatten([{ fontSize: tsPageTitle }, props.textStyles]) ?? {};
  const fontSize = (flat.fontSize as number) ?? tsPageTitle;
  const fontFamily = (flat.fontFamily as string) ?? undefined;
  const fontWeight = (flat.fontWeight as string) ?? undefined;

  return (
    <View>
      {/* Invisible RN Text drives the layout dimensions */}
      <Text
        style={[flat, { opacity: 0 }]}
        onLayout={(e) => setSize(e.nativeEvent.layout)}
      >
        {props.text}
      </Text>

      {/* SVG paints gradient text over the measured space */}
      {size && (
        <Svg
          width={size.width + renderBuffer}
          height={size.height}
          style={StyleSheet.absoluteFill}
        >
          <Defs>
            <SvgLinearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
              {orderedStops.map((color, i) => (
                <Stop
                  key={i}
                  offset={`${Math.round(
                    (i / (orderedStops.length - 1)) * 100
                  )}%`}
                  stopColor={color}
                  stopOpacity="1"
                />
              ))}
            </SvgLinearGradient>
          </Defs>
          <SvgText
            fill="url(#g)"
            fontSize={fontSize}
            fontFamily={fontFamily}
            fontWeight={fontWeight}
            x="0"
            y={fontSize}
          >
            {props.text}
          </SvgText>
        </Svg>
      )}
    </View>
  );
};

export default GradientText;
