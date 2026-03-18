import React, { FunctionComponent, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "styled-components/native";
import { router, useLocalSearchParams } from "expo-router";
import Icon from "react-native-vector-icons/Ionicons";
import {
  TSCaptionText,
  TSInputTextSm,
  TSParagrapghText,
  TSSnippetText,
  TSTitleText,
} from "@/src/app_components/Text/Text";
import {
  useGetTokenStatusQuery,
  usePurchaseTokensMutation,
} from "@/src/redux/api/apiSlice";
import { Container } from "@/src/app_components/shared";
import styled from "styled-components/native";

const PageContainer = styled(Container)`
  background-color: ${(props) => props.theme.palette.backgroundColor};
  justify-content: flex-start;
  width: 100%;
`;

const fmt = (n: number) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
    ? `${(n / 1_000).toFixed(0)}k`
    : `${n}`;

type Package = {
  id: string;
  name: string;
  tokens: number;
  price_usd: number;
  description: string;
};

const TokenShopScreen: FunctionComponent = () => {
  const theme = useTheme();
  const params = useLocalSearchParams();
  const userId = params.userId as string;

  const { data, isLoading, refetch } = useGetTokenStatusQuery(userId, { skip: !userId });
  const [purchaseTokens, { isLoading: isPurchasing }] = usePurchaseTokensMutation();
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  const handlePurchase = (pkg: Package) => {
    Alert.alert(
      `Buy ${pkg.name}`,
      `Add ${fmt(pkg.tokens)} tokens for $${pkg.price_usd.toFixed(2)}?\n\n(Mock purchase — no real charge)`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Buy",
          onPress: async () => {
            setPurchasingId(pkg.id);
            try {
              const result = await purchaseTokens({
                package_id: pkg.id,
                method: "mock",
                user_id: userId,
              }).unwrap();
              Alert.alert(
                "✅ Tokens Added",
                `${fmt(result.tokens_added)} tokens added!\nNew balance: ${fmt(result.remaining_tokens)}`
              );
            } catch (e: any) {
              Alert.alert("Error", e?.data?.error ?? "Purchase failed.");
            } finally {
              setPurchasingId(null);
            }
          },
        },
      ]
    );
  };

  const remaining = data?.remaining_tokens ?? 0;
  const used      = data?.total_tokens_used ?? 0;
  const total     = remaining + used > 0 ? remaining + used : 1;
  const pct       = Math.max(0, Math.min(1, remaining / total));
  const barColor  =
    pct > 0.5
      ? theme.palette.AWE_Green
      : pct > 0.2
      ? theme.palette.AWE_Yellow ?? "#f5c518"
      : theme.palette.AWE_Red ?? "#e74c3c";

  return (
    <PageContainer>
      {/* Header */}
      <View style={{
        flexDirection: "row", alignItems: "center",
        paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12,
        borderBottomWidth: 1, borderBottomColor: theme.palette.darkGray,
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <Icon name="chevron-back" size={26} color={theme.palette.text} />
        </TouchableOpacity>
        <TSTitleText textStyles={{ flex: 1, fontSize: 18 }}>AI Token Shop</TSTitleText>
        <Icon name="flash" size={20} color={theme.palette.AWE_Yellow ?? "#f5c518"} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>

        {/* Current balance card */}
        {isLoading ? (
          <ActivityIndicator color={theme.palette.AWE_Green} style={{ marginVertical: 20 }} />
        ) : (
          <View style={{
            backgroundColor: theme.palette.darkGray,
            borderRadius: 16, padding: 16, marginBottom: 24,
          }}>
            <TSCaptionText textStyles={{ color: theme.palette.gray, marginBottom: 6 }}>
              Current Balance
            </TSCaptionText>
            <TSTitleText textStyles={{ fontSize: 28, color: barColor, marginBottom: 8 }}>
              {fmt(remaining)} tokens
            </TSTitleText>

            {/* Progress bar */}
            <View style={{
              height: 8, borderRadius: 4,
              backgroundColor: theme.palette.backgroundColor, overflow: "hidden", marginBottom: 6,
            }}>
              <View style={{
                height: "100%", width: `${pct * 100}%`,
                backgroundColor: barColor, borderRadius: 4,
              }} />
            </View>

            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <TSCaptionText textStyles={{ color: theme.palette.gray }}>
                {fmt(used)} used lifetime
              </TSCaptionText>
              <TSCaptionText textStyles={{ color: theme.palette.gray }}>
                Resets {data?.reset_at ? new Date(data.reset_at).toLocaleDateString() : "—"}
              </TSCaptionText>
            </View>
          </View>
        )}

        {/* Packages */}
        <TSInputTextSm textStyles={{ color: theme.palette.text, fontWeight: "700", marginBottom: 12 }}>
          Top Up
        </TSInputTextSm>

        {(data?.packages ?? []).map((pkg: Package, i: number) => {
          const isThisPurchasing = isPurchasing && purchasingId === pkg.id;
          const isPopular = i === 1;
          return (
            <View key={pkg.id} style={{ marginBottom: 12, position: "relative" }}>
              {isPopular && (
                <View style={{
                  position: "absolute", top: -10, right: 16, zIndex: 1,
                  backgroundColor: theme.palette.AWE_Green,
                  paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10,
                }}>
                  <TSCaptionText textStyles={{ color: theme.palette.white, fontWeight: "700" }}>
                    POPULAR
                  </TSCaptionText>
                </View>
              )}
              <TouchableOpacity
                onPress={() => handlePurchase(pkg)}
                disabled={isPurchasing}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: theme.palette.darkGray,
                  borderRadius: 14,
                  padding: 16,
                  borderWidth: isPopular ? 2 : 1,
                  borderColor: isPopular ? theme.palette.AWE_Green : theme.palette.gray,
                }}
              >
                <View style={{
                  width: 44, height: 44, borderRadius: 22,
                  backgroundColor: `${theme.palette.AWE_Green}22`,
                  alignItems: "center", justifyContent: "center", marginRight: 14,
                }}>
                  <Icon name="flash" size={22} color={theme.palette.AWE_Green} />
                </View>
                <View style={{ flex: 1 }}>
                  <TSInputTextSm textStyles={{ color: theme.palette.text, fontWeight: "700" }}>
                    {pkg.name}
                  </TSInputTextSm>
                  <TSCaptionText textStyles={{ color: theme.palette.gray }}>
                    {fmt(pkg.tokens)} tokens · {pkg.description}
                  </TSCaptionText>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  {isThisPurchasing ? (
                    <ActivityIndicator size="small" color={theme.palette.AWE_Green} />
                  ) : (
                    <>
                      <TSSnippetText textStyles={{ color: theme.palette.text, fontWeight: "700" }}>
                        ${pkg.price_usd.toFixed(2)}
                      </TSSnippetText>
                      <TSCaptionText textStyles={{ color: theme.palette.AWE_Green }}>
                        Buy →
                      </TSCaptionText>
                    </>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          );
        })}

        {/* Mock disclaimer */}
        <View style={{
          marginTop: 16, padding: 12, borderRadius: 10,
          backgroundColor: `${theme.palette.AWE_Blue}22`,
          borderWidth: 1, borderColor: theme.palette.AWE_Blue,
        }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
            <Icon name="information-circle-outline" size={16} color={theme.palette.AWE_Blue} style={{ marginRight: 6 }} />
            <TSCaptionText textStyles={{ color: theme.palette.AWE_Blue, fontWeight: "700" }}>
              Dev Mode
            </TSCaptionText>
          </View>
          <TSCaptionText textStyles={{ color: theme.palette.gray }}>
            Purchases are mocked — no real charges. Apple/Google Pay integration coming soon.
          </TSCaptionText>
        </View>

        {/* Purchase history */}
        {data?.purchase_history?.length > 0 && (
          <>
            <TSInputTextSm textStyles={{ color: theme.palette.text, fontWeight: "700", marginTop: 24, marginBottom: 12 }}>
              Purchase History
            </TSInputTextSm>
            {data.purchase_history.map((p: any, i: number) => (
              <View key={i} style={{
                flexDirection: "row", justifyContent: "space-between",
                paddingVertical: 10, borderBottomWidth: 1,
                borderBottomColor: theme.palette.darkGray,
              }}>
                <View>
                  <TSCaptionText textStyles={{ color: theme.palette.text }}>
                    +{fmt(p.tokens_added)} tokens
                  </TSCaptionText>
                  <TSCaptionText textStyles={{ color: theme.palette.gray }}>
                    {p.method} · {new Date(p.created_at).toLocaleDateString()}
                  </TSCaptionText>
                </View>
                <TSCaptionText textStyles={{ color: theme.palette.gray }}>
                  ${parseFloat(p.price_paid_usd).toFixed(2)}
                </TSCaptionText>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </PageContainer>
  );
};

export default TokenShopScreen;
