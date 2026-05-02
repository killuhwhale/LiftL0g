import React, { FunctionComponent } from "react";
import { TouchableOpacity, View } from "react-native";
import { useTheme } from "styled-components/native";
import Icon from "react-native-vector-icons/Ionicons";
import { TSCaptionText, TSInputTextSm } from "./Text/Text";
import { useGetTokenStatusQuery } from "@/src/redux/api/apiSlice";
import { router } from "expo-router";
import { TOKENS_PER_CREDIT } from "@/src/utils/constants";

type Props = { userId: string | number };

const TokenStatusBar: FunctionComponent<Props> = ({ userId }) => {
  const theme = useTheme();
  const { data, isLoading } = useGetTokenStatusQuery(userId, { skip: !userId });

  if (!userId || isLoading || !data) return null;

  const remaining = data.remaining_tokens ?? 0;
  const used = data.total_tokens_used ?? 0;
  const total = remaining + used > 0 ? remaining + used : 1;
  const pct = Math.max(0, Math.min(1, remaining / total));
  const creditsRemaining = Math.floor(remaining / TOKENS_PER_CREDIT);

  const barColor =
    pct > 0.5
      ? theme.palette.AWE_Green
      : pct > 0.2
        ? (theme.palette.AWE_Yellow ?? "#f5c518")
        : (theme.palette.AWE_Red ?? "#e74c3c");

  return (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: "/input_pages/ai/TokenShopScreen",
          params: { userId },
        })
      }
      style={{
        backgroundColor: theme.palette.darkGray,
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 6,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Icon
            name="flash-outline"
            size={14}
            color={barColor}
            style={{ marginRight: 4 }}
          />
          <TSInputTextSm
            textStyles={{ color: theme.palette.text, fontWeight: "600" }}
          >
            AI Credits
          </TSInputTextSm>
        </View>
        <TSCaptionText textStyles={{ color: theme.palette.gray }}>
          {creditsRemaining} credits remaining
        </TSCaptionText>
      </View>

      {/* Progress bar */}
      <View
        style={{
          height: 6,
          borderRadius: 3,
          backgroundColor: theme.palette.backgroundColor,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            height: "100%",
            width: `${pct * 100}%`,
            backgroundColor: barColor,
            borderRadius: 3,
          }}
        />
      </View>

      <TSCaptionText
        textStyles={{
          color: theme.palette.AWE_Green,
          marginTop: 6,
          textAlign: "right",
        }}
      >
        Tap to buy more →
      </TSCaptionText>
    </TouchableOpacity>
  );
};

export default TokenStatusBar;
