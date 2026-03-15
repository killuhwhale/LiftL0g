import { AnyWorkoutItem } from "../Cards/types";
import { ScrollView, View } from "react-native";
import ItemString from "./ItemString";
import { useTheme } from "styled-components/native";
import LinearGradient from "react-native-linear-gradient";
import { lightenHexColor } from "../shared";

type ItemStringDisplayListProps = {
  items: AnyWorkoutItem[];
  schemeType: number;
};

export const ItemStringDisplayList: React.FC<ItemStringDisplayListProps> = ({
  items,
  schemeType,
}) => {
  const theme = useTheme();
  //   const [top, right, bottom, left] = [
  //     theme.palette.AWE_Red,
  //     theme.palette.AWE_Yellow,
  //     theme.palette.AWE_Green,
  //     theme.palette.AWE_Blue,
  //   ];

  //   const [top, right, bottom, left] = [
  //     "#000000", // black
  //     "#660000", // deep maroon
  //     "#330000", // almost black‑red
  //     "#8B0000", // dark red
  //   ];

  //   const [top, right, bottom, left] = [
  //     "#8B008B", // dark magenta
  //     "#551A8B", // dark purple
  //     "#4B0082", // indigo
  //     "#9932CC", // dark orchid
  //   ];

  const [top, right, bottom, left] = [
    lightenHexColor("#C0C0C0", 0.7),
    lightenHexColor("#5B9BD5", 0.7),
    lightenHexColor("#2F4F8F", 0.7),
    lightenHexColor("#1A2A44", 0.7),
  ];

  return (
    <View
      style={{
        width: "100%",
        height: "100%",
        borderRadius: 12,
      }}
    >
      <LinearGradient
        // gradient bg from primary → secondary
        colors={[left, top, right, bottom]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 12, flex: 1, paddingVertical: 8 }}
      >
        <ScrollView style={{ flex: 1, padding: 8 }}>
          {items.map((item) => {
            return (
              <ItemString
                key={`ISDLI_${Math.random()}`}
                item={item}
                schemeType={schemeType}
                prefix=""
                inclPenalty={true}
              />
            );
          })}
          <View style={{ height: 20 }}></View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
};
