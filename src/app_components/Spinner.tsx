import React from "react";
import { View, ActivityIndicator, StyleSheet, Dimensions } from "react-native";
import { useTheme } from "styled-components/native";

const { width, height } = Dimensions.get("window");

const FullScreenSpinner = () => {
  const theme = useTheme() as any; // cast if you're using a custom theme shape

  return (
    <View
      style={[styles.overlay, { backgroundColor: theme.palette.transparent }]}
    >
      <ActivityIndicator size="large" color={theme.palette.primary.main} />
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width,
    height,
    zIndex: 999,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default FullScreenSpinner;
