import React, { FunctionComponent, useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "styled-components/native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import Icon from "react-native-vector-icons/Ionicons";
import Purchases, { PurchasesPackage } from "react-native-purchases";
import {
  TSCaptionText,
  TSInputTextSm,
  TSParagrapghText,
  TSSnippetText,
  TSTitleText,
} from "@/src/app_components/Text/Text";
import {
  useGetTokenStatusQuery,
} from "@/src/redux/api/apiSlice";
import { Container } from "@/src/app_components/shared";
import styled from "styled-components/native";

const PageContainer = styled(Container)`
  background-color: ${(props) => props.theme.palette.backgroundColor};
  justify-content: flex-start;
  width: 100%;
`;

// RevenueCat offering identifier for credit consumables
const RC_CREDITS_OFFERING = "ai_credits";

// Tokens credited per AI credit (must match backend TOKENS_PER_CREDIT)
const TOKENS_PER_CREDIT = 18_000;

type Package = {
  name: string;
  credits: number;
  tokens: number;
  price_usd: number;
  description: string;
  apple_product_id: string;
  google_product_id: string;
  stripe_price_id: string;
};

const TokenShopScreen: FunctionComponent = () => {
  const theme = useTheme();
  const params = useLocalSearchParams();
  const userId = params.userId as string;

  const { data, isLoading, refetch, isFetching } = useGetTokenStatusQuery(userId, {
    skip: !userId,
    refetchOnMountOrArgChange: true,
  });

  // Refetch fresh data every time the screen comes into focus
  useFocusEffect(useCallback(() => { refetch(); }, [refetch]));
  const [purchasingId, setPurchasingId]               = useState<string | null>(null);
  const [isPurchasing, setIsPurchasing]               = useState(false);
  const [rcPackages, setRcPackages]                   = useState<PurchasesPackage[]>([]);

  // Load RevenueCat packages from the ai_credits offering
  useEffect(() => {
    Purchases.getOfferings()
      .then((offerings) => {
        const offering = offerings.all[RC_CREDITS_OFFERING] ?? offerings.current;
        setRcPackages(offering?.availablePackages ?? []);
      })
      .catch((e) => console.warn("[TokenShop] getOfferings failed:", e));
  }, []);

  const nativeProductId = (pkg: Package) =>
    Platform.OS === "ios" ? pkg.apple_product_id : pkg.google_product_id;

  const getRcPackage = (pkg: Package) => {
    const id = nativeProductId(pkg);
    return rcPackages.find(
      (p) => p.product.productIdentifier === id || (p.product as any).identifier === id
    );
  };

  const handlePurchase = async (pkg: Package) => {
    const rcPackage = getRcPackage(pkg);

    if (!rcPackage) {
      Alert.alert(
        "Not Available",
        "This pack isn't available for purchase yet. Please check back soon.",
      );
      return;
    }

    const pkgNativeId = nativeProductId(pkg);
    setPurchasingId(pkgNativeId);
    setIsPurchasing(true);
    try {
      await Purchases.purchasePackage(rcPackage);

      // Wait for the RevenueCat webhook to credit tokens on our backend,
      // then refresh the UI.
      setTimeout(async () => {
        await refetch();
        setIsPurchasing(false);
        setPurchasingId(null);
      }, 5000);

      Alert.alert(
        "Credits Added!",
        `${pkg.credits} AI Credits added to your account.`,
      );
    } catch (e: any) {
      setIsPurchasing(false);
      setPurchasingId(null);
      // User cancelled — don't show an error
      if (e?.userCancelled) return;
      console.warn("[TokenShop] purchase error:", e);
      Alert.alert("Purchase Failed", e?.message ?? "Something went wrong. Please try again.");
    }
  };

  const remaining = data?.remaining_tokens ?? 0;
  const used      = data?.total_tokens_used ?? 0;
  const total     = remaining + used > 0 ? remaining + used : 1;
  const pct       = Math.max(0, Math.min(1, remaining / total));
  const creditsRemaining = Math.floor(remaining / TOKENS_PER_CREDIT);

  const barColor =
    pct > 0.5
      ? theme.palette.AWE_Green
      : pct > 0.2
      ? theme.palette.AWE_Yellow ?? "#f5c518"
      : theme.palette.AWE_Red ?? "#e74c3c";

  const packages: Package[] = data?.packages ?? [];

  // Savings % relative to the Starter per-credit price ($3.99 / 5 = $0.798/credit)
  const basePerCredit = packages.length > 0 ? packages[0].price_usd / packages[0].credits : 0.798;
  const savingsPct = (pkg: Package) =>
    Math.round((1 - pkg.price_usd / pkg.credits / basePerCredit) * 100);

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
        <TSTitleText textStyles={{ flex: 1, fontSize: 18 }}>AI Credits</TSTitleText>
        <TouchableOpacity onPress={refetch} disabled={isFetching} style={{ marginRight: 10 }}>
          <Icon name="refresh" size={22} color={isFetching ? theme.palette.gray : theme.palette.text} />
        </TouchableOpacity>
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
            <TSCaptionText textStyles={{ color: theme.palette.gray, marginBottom: 4 }}>
              Current Balance
            </TSCaptionText>
            <TSTitleText textStyles={{ fontSize: 28, color: barColor, marginBottom: 4 }}>
              {creditsRemaining} AI Credits
            </TSTitleText>
            <TSCaptionText textStyles={{ color: theme.palette.gray, marginBottom: 10 }}>
              1 credit = 1 workout generation or ~8 chat messages
            </TSCaptionText>

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

            <TSCaptionText textStyles={{ color: theme.palette.gray }}>
              Resets {data?.reset_at ? new Date(data.reset_at).toLocaleDateString() : "—"}
            </TSCaptionText>
          </View>
        )}

        {/* Packages */}
        <TSInputTextSm textStyles={{ color: theme.palette.text, fontWeight: "700", marginBottom: 12 }}>
          Top Up
        </TSInputTextSm>

        {packages.map((pkg: Package, i: number) => {
          const isThisPurchasing = isPurchasing && purchasingId === nativeProductId(pkg);
          const rcPackage        = getRcPackage(pkg);
          const isPopular        = i === 1;
          const isPro            = i === packages.length - 1 && i > 0;
          const savings          = savingsPct(pkg);
          // Show store price if available, otherwise fall back to our price
          const displayPrice     = rcPackage?.product.priceString ?? (rcPackage?.product as any)?.currentPrice?.formattedPrice ?? `$${pkg.price_usd.toFixed(2)}`;
          const perCredit        = (pkg.price_usd / pkg.credits).toFixed(2);

          return (
            <View key={pkg.apple_product_id} style={{ marginBottom: 12, position: "relative" }}>
              {isPopular && (
                <View style={{
                  position: "absolute", top: -10, right: 16, zIndex: 1,
                  backgroundColor: theme.palette.AWE_Green,
                  paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10,
                }}>
                  <TSCaptionText textStyles={{ color: theme.palette.white, fontWeight: "700" }}>
                    MOST POPULAR
                  </TSCaptionText>
                </View>
              )}
              {isPro && savings > 0 && (
                <View style={{
                  position: "absolute", top: -10, right: 16, zIndex: 1,
                  backgroundColor: theme.palette.AWE_Blue,
                  paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10,
                }}>
                  <TSCaptionText textStyles={{ color: theme.palette.white, fontWeight: "700" }}>
                    SAVE {savings}%
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
                  borderColor: isPopular
                    ? theme.palette.AWE_Green
                    : isPro
                    ? theme.palette.AWE_Blue
                    : theme.palette.gray,
                }}
              >
                <View style={{
                  width: 44, height: 44, borderRadius: 22,
                  backgroundColor: `${isPopular ? theme.palette.AWE_Green : theme.palette.AWE_Blue}22`,
                  alignItems: "center", justifyContent: "center", marginRight: 14,
                }}>
                  <Icon
                    name="flash"
                    size={22}
                    color={isPopular ? theme.palette.AWE_Green : theme.palette.AWE_Blue}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <TSInputTextSm textStyles={{ color: theme.palette.text, fontWeight: "700" }}>
                    {pkg.credits} AI Credits
                  </TSInputTextSm>
                  <TSCaptionText textStyles={{ color: theme.palette.gray }}>
                    ${perCredit}/credit · {pkg.name}
                  </TSCaptionText>
                </View>

                <View style={{ alignItems: "flex-end" }}>
                  {isThisPurchasing ? (
                    <ActivityIndicator size="small" color={theme.palette.AWE_Green} />
                  ) : (
                    <>
                      <TSSnippetText textStyles={{ color: theme.palette.text, fontWeight: "700" }}>
                        {displayPrice}
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

        {/* What is a credit? */}
        <View style={{
          marginTop: 8, marginBottom: 8, padding: 14, borderRadius: 12,
          backgroundColor: theme.palette.darkGray,
        }}>
          <TSCaptionText textStyles={{ color: theme.palette.gray, marginBottom: 6, fontWeight: "700" }}>
            What counts as 1 credit?
          </TSCaptionText>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
            <Icon name="sparkles-outline" size={14} color={theme.palette.AWE_Green} style={{ marginRight: 6 }} />
            <TSCaptionText textStyles={{ color: theme.palette.gray }}>1 AI workout generation</TSCaptionText>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Icon name="chatbubble-outline" size={14} color={theme.palette.AWE_Green} style={{ marginRight: 6 }} />
            <TSCaptionText textStyles={{ color: theme.palette.gray }}>~8–10 coaching chat messages</TSCaptionText>
          </View>
        </View>

        {/* Purchase history */}
        {data?.purchase_history?.length > 0 && (
          <>
            <TSInputTextSm textStyles={{ color: theme.palette.text, fontWeight: "700", marginTop: 20, marginBottom: 12 }}>
              Purchase History
            </TSInputTextSm>
            {data.purchase_history.map((p: any, i: number) => {
              const credits = Math.floor(p.tokens_added / TOKENS_PER_CREDIT);
              return (
                <View key={i} style={{
                  flexDirection: "row", justifyContent: "space-between",
                  paddingVertical: 10, borderBottomWidth: 1,
                  borderBottomColor: theme.palette.darkGray,
                }}>
                  <View>
                    <TSCaptionText textStyles={{ color: theme.palette.text }}>
                      +{credits} AI Credits
                    </TSCaptionText>
                    <TSCaptionText textStyles={{ color: theme.palette.gray }}>
                      {p.method} · {new Date(p.created_at).toLocaleDateString()}
                    </TSCaptionText>
                  </View>
                  <TSCaptionText textStyles={{ color: theme.palette.gray }}>
                    ${parseFloat(p.price_paid_usd).toFixed(2)}
                  </TSCaptionText>
                </View>
              );
            })}
          </>
        )}
      </ScrollView>
    </PageContainer>
  );
};

export default TokenShopScreen;
