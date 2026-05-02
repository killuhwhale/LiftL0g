import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
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
import { apiSlice, useGetTokenStatusQuery } from "@/src/redux/api/apiSlice";
import { store } from "@/src/redux/store";
import { Container } from "@/src/app_components/shared";
import styled from "styled-components/native";
import { TOKENS_PER_CREDIT } from "@/src/utils/constants";

const PageContainer = styled(Container)`
  background-color: ${(props) => props.theme.palette.backgroundColor};
  justify-content: flex-start;
  width: 100%;
`;

const RC_MEMBERSHIPS_OFFERING = "ai_memberships";

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

type MembershipTier = Package & {
  tierName: string;
  badge: string;
  accent: string;
  summary: string;
  monthlyLabel: string;
  featureBullets: string[];
};

const TIER_COPY = [
  {
    tierName: "Starter",
    badge: "LIGHT USE",
    summary:
      "For someone who wants a couple AI workout builds each month and only occasional coach chat. Includes AD free experience.",
  },
  {
    tierName: "Athlete",
    badge: "MOST POPULAR",
    summary:
      "For steady weekly programming help, regular workout generation, and consistent coach support. Includes AD free experience.",
  },
  {
    tierName: "Pro",
    badge: "POWER USER",
    summary:
      "For high-volume AI usage, frequent workout drafting, and ongoing back-and-forth with the coach. Includes AD free experience.",
  },
] as const;

const TokenShopScreen: FunctionComponent = () => {
  const theme = useTheme();
  const params = useLocalSearchParams();
  const userId = params.userId as string;

  const { data, isLoading, refetch, isFetching } = useGetTokenStatusQuery(
    userId,
    {
      skip: !userId,
      refetchOnMountOrArgChange: true,
    },
  );

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [rcPackages, setRcPackages] = useState<PurchasesPackage[]>([]);

  useEffect(() => {
    Purchases.getOfferings()
      .then((offerings) => {
        const offering =
          offerings.all[RC_MEMBERSHIPS_OFFERING] ?? offerings.current;
        setRcPackages(offering?.availablePackages ?? []);
      })
      .catch((e) => console.warn("[TokenShop] getOfferings failed:", e));
  }, []);

  const nativeProductId = (pkg: Package) =>
    Platform.OS === "ios" ? pkg.apple_product_id : pkg.google_product_id;

  const getRcPackage = (pkg: Package) => {
    const id = nativeProductId(pkg);
    return rcPackages.find(
      (p) =>
        p.product.productIdentifier === id ||
        (p.product as any).identifier === id,
    );
  };

  const handleRestore = async () => {
    try {
      const info = await Purchases.restorePurchases();
      const active = Object.keys(info?.entitlements?.active ?? {});
      await refetch();
      Alert.alert(
        "Restore Complete",
        active.length
          ? `Restored entitlements: ${active.join(", ")}`
          : "No previous purchases were found on this Apple ID.",
      );
    } catch (e: any) {
      console.warn("[TokenShop] restore error:", e);
      Alert.alert("Restore Failed", e?.message ?? "Please try again.");
    }
  };

  const handleManageSubscription = async () => {
    try {
      // RevenueCat deep-links to the native Manage Subscriptions screen on iOS.
      await Purchases.showManageSubscriptions();
    } catch (e) {
      // Fallback: open Apple's subscription management URL.
      Linking.openURL("https://apps.apple.com/account/subscriptions").catch(
        () => {},
      );
    }
  };

  const handlePurchase = async (pkg: Package) => {
    const rcPackage = getRcPackage(pkg);

    if (!rcPackage) {
      Alert.alert(
        "Not Available",
        "This membership isn't available for purchase yet. Please check back soon.",
      );
      return;
    }

    const pkgNativeId = nativeProductId(pkg);
    setPurchasingId(pkgNativeId);
    setIsPurchasing(true);
    try {
      await Purchases.purchasePackage(rcPackage);

      // Wait for the RevenueCat webhook to update sub_end_date on our backend,
      // then invalidate both User (drives ad gating) and TOKEN_STATUS so credits
      // and the no-ads entitlement refresh without requiring an app reload.
      setTimeout(() => {
        store.dispatch(apiSlice.util.invalidateTags(["User", "TOKEN_STATUS"]));
        setIsPurchasing(false);
        setPurchasingId(null);
      }, 5000);

      Alert.alert("Membership Updated", `${pkg.name} is now active.`);
    } catch (e: any) {
      setIsPurchasing(false);
      setPurchasingId(null);
      if (e?.userCancelled) return;
      console.warn("[TokenShop] purchase error:", e);
      Alert.alert(
        "Purchase Failed",
        e?.message ?? "Something went wrong. Please try again.",
      );
    }
  };

  const remaining = data?.remaining_tokens ?? 0;
  const used = data?.total_tokens_used ?? 0;
  const total = remaining + used > 0 ? remaining + used : 1;
  const pct = Math.max(0, Math.min(1, remaining / total));
  const creditsRemaining = Math.floor(remaining / TOKENS_PER_CREDIT);

  const barColor =
    pct > 0.5
      ? theme.palette.AWE_Green
      : pct > 0.2
        ? (theme.palette.AWE_Yellow ?? "#f5c518")
        : (theme.palette.AWE_Red ?? "#e74c3c");

  const packages: Package[] = data?.packages ?? [];

  const membershipTiers: MembershipTier[] = useMemo(() => {
    const sorted = packages
      .slice()
      .sort((a, b) => a.credits - b.credits)
      .slice(0, 3);
    const accents = [
      theme.palette.AWE_Green,
      theme.palette.AWE_Blue,
      theme.palette.AWE_Yellow ?? "#f5c518",
    ];

    return sorted.map((pkg, idx) => {
      const copy = TIER_COPY[Math.min(idx, TIER_COPY.length - 1)];
      return {
        ...pkg,
        tierName: copy.tierName,
        badge: copy.badge,
        accent: accents[Math.min(idx, accents.length - 1)],
        summary: copy.summary,
        monthlyLabel: `${pkg.credits} credits / month`,
        featureBullets: [
          `${pkg.credits} AI workout credits each month`,
          `Around ${pkg.credits} workout generations monthly`,
          `About ${pkg.credits * 8} coach chat messages monthly`,
        ],
      };
    });
  }, [
    packages,
    theme.palette.AWE_Blue,
    theme.palette.AWE_Green,
    theme.palette.AWE_Yellow,
  ]);

  return (
    <PageContainer>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: theme.palette.darkGray,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginRight: 12 }}
        >
          <Icon name="chevron-back" size={26} color={theme.palette.text} />
        </TouchableOpacity>
        <TSTitleText textStyles={{ flex: 1, fontSize: 18 }}>
          AI Memberships
        </TSTitleText>
        <TouchableOpacity
          onPress={refetch}
          disabled={isFetching}
          style={{ marginRight: 10 }}
        >
          <Icon
            name="refresh"
            size={22}
            color={isFetching ? theme.palette.gray : theme.palette.text}
          />
        </TouchableOpacity>
        <Icon
          name="sparkles"
          size={20}
          color={theme.palette.AWE_Yellow ?? "#f5c518"}
        />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {isLoading ? (
          <ActivityIndicator
            color={theme.palette.AWE_Green}
            style={{ marginVertical: 20 }}
          />
        ) : (
          <View
            style={{
              backgroundColor: theme.palette.darkGray,
              borderRadius: 16,
              padding: 16,
              marginBottom: 20,
            }}
          >
            <TSCaptionText
              textStyles={{ color: theme.palette.gray, marginBottom: 4 }}
            >
              Current Monthly Balance
            </TSCaptionText>
            <TSTitleText
              textStyles={{ fontSize: 28, color: barColor, marginBottom: 4 }}
            >
              {creditsRemaining} AI Credits
            </TSTitleText>
            <TSCaptionText
              textStyles={{ color: theme.palette.gray, marginBottom: 10 }}
            >
              Credits reset monthly. 1 credit = 1 workout generation or about 8
              coach chat messages.
            </TSCaptionText>

            <View
              style={{
                height: 8,
                borderRadius: 4,
                backgroundColor: theme.palette.backgroundColor,
                overflow: "hidden",
                marginBottom: 6,
              }}
            >
              <View
                style={{
                  height: "100%",
                  width: `${pct * 100}%`,
                  backgroundColor: barColor,
                  borderRadius: 4,
                }}
              />
            </View>

            <TSCaptionText textStyles={{ color: theme.palette.gray }}>
              Resets{" "}
              {data?.reset_at
                ? new Date(data.reset_at).toLocaleDateString()
                : "—"}
            </TSCaptionText>
          </View>
        )}

        <View style={{ marginBottom: 14 }}>
          <TSInputTextSm
            textStyles={{
              color: theme.palette.text,
              fontWeight: "700",
              marginBottom: 6,
            }}
          >
            Choose Your Membership
          </TSInputTextSm>
          <TSCaptionText
            textStyles={{ color: theme.palette.gray, lineHeight: 18 }}
          >
            Instead of one-off token packs, this screen now presents monthly AI
            memberships with increasing credit allowances.
          </TSCaptionText>
        </View>

        {membershipTiers.map((pkg) => {
          const isThisPurchasing =
            isPurchasing && purchasingId === nativeProductId(pkg);
          const rcPackage = getRcPackage(pkg);

          // All pricing is derived from the RevenueCat product (App Store truth),
          // never from the backend. While RC offerings load, we show a spinner.
          const displayPrice =
            rcPackage?.product.priceString ??
            (rcPackage?.product as any)?.currentPrice?.formattedPrice ??
            null;
          const rcPrice =
            typeof rcPackage?.product.price === "number"
              ? rcPackage.product.price
              : null;
          const currencyCode =
            rcPackage?.product.currencyCode ??
            (rcPackage?.product as any)?.currencyCode ??
            "USD";
          const perCreditString =
            rcPrice != null && pkg.credits > 0
              ? new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: currencyCode,
                }).format(rcPrice / pkg.credits)
              : null;
          const rcReady = !!rcPackage;

          return (
            <View
              key={pkg.apple_product_id}
              style={{ marginBottom: 14, position: "relative" }}
            >
              <View
                style={{
                  position: "absolute",
                  top: -10,
                  right: 16,
                  zIndex: 1,
                  backgroundColor: pkg.accent,
                  paddingHorizontal: 10,
                  paddingVertical: 3,
                  borderRadius: 10,
                }}
              >
                <TSCaptionText
                  textStyles={{ color: "#FFF", fontWeight: "700" }}
                >
                  {pkg.badge}
                </TSCaptionText>
              </View>

              <TouchableOpacity
                onPress={() => handlePurchase(pkg)}
                disabled={isPurchasing || !rcReady}
                style={{
                  backgroundColor: theme.palette.darkGray,
                  borderRadius: 18,
                  padding: 18,
                  borderWidth: 1.5,
                  borderColor: `${pkg.accent}66`,
                  opacity: rcReady ? 1 : 0.6,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: `${pkg.accent}22`,
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 14,
                    }}
                  >
                    <Icon
                      name="sparkles-outline"
                      size={22}
                      color={pkg.accent}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <TSInputTextSm
                      textStyles={{
                        color: theme.palette.text,
                        fontWeight: "700",
                        fontSize: 16,
                      }}
                    >
                      {pkg.tierName}
                    </TSInputTextSm>
                    <TSCaptionText textStyles={{ color: theme.palette.gray }}>
                      {pkg.monthlyLabel}
                    </TSCaptionText>
                  </View>

                  <View style={{ alignItems: "flex-end" }}>
                    {isThisPurchasing || !displayPrice ? (
                      <ActivityIndicator size="small" color={pkg.accent} />
                    ) : (
                      <>
                        <TSSnippetText
                          textStyles={{
                            color: theme.palette.text,
                            fontWeight: "700",
                          }}
                        >
                          {displayPrice}/mo
                        </TSSnippetText>
                        <TSCaptionText textStyles={{ color: pkg.accent }}>
                          {rcReady ? "Subscribe →" : "Loading…"}
                        </TSCaptionText>
                      </>
                    )}
                  </View>
                </View>

                <TSParagrapghText
                  textStyles={{
                    color: theme.palette.gray,
                    marginBottom: 12,
                    lineHeight: 20,
                  }}
                >
                  {pkg.summary}
                </TSParagrapghText>

                {pkg.featureBullets.map((feature) => (
                  <View
                    key={`${pkg.tierName}-${feature}`}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 6,
                    }}
                  >
                    <Icon
                      name="checkmark-circle-outline"
                      size={15}
                      color={pkg.accent}
                      style={{ marginRight: 8 }}
                    />
                    <TSCaptionText textStyles={{ color: theme.palette.text }}>
                      {feature}
                    </TSCaptionText>
                  </View>
                ))}

                {perCreditString ? (
                  <TSCaptionText
                    textStyles={{ color: theme.palette.gray, marginTop: 10 }}
                  >
                    Effective rate: {perCreditString}/credit
                  </TSCaptionText>
                ) : null}
              </TouchableOpacity>
            </View>
          );
        })}

        {membershipTiers.length === 0 ? (
          <View
            style={{
              backgroundColor: theme.palette.darkGray,
              borderRadius: 14,
              padding: 16,
              marginBottom: 14,
            }}
          >
            <TSCaptionText textStyles={{ color: theme.palette.gray }}>
              No membership tiers are configured yet. Once you add your
              subscription products, they will show up here.
            </TSCaptionText>
          </View>
        ) : null}

        <View
          style={{
            marginTop: 8,
            marginBottom: 8,
            padding: 14,
            borderRadius: 12,
            backgroundColor: theme.palette.darkGray,
          }}
        >
          <TSCaptionText
            textStyles={{
              color: theme.palette.gray,
              marginBottom: 6,
              fontWeight: "700",
            }}
          >
            What counts as 1 credit?
          </TSCaptionText>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 4,
            }}
          >
            <Icon
              name="sparkles-outline"
              size={14}
              color={theme.palette.AWE_Green}
              style={{ marginRight: 6 }}
            />
            <TSCaptionText textStyles={{ color: theme.palette.gray }}>
              1 AI workout generation
            </TSCaptionText>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Icon
              name="chatbubble-outline"
              size={14}
              color={theme.palette.AWE_Green}
              style={{ marginRight: 6 }}
            />
            <TSCaptionText textStyles={{ color: theme.palette.gray }}>
              About 8 to 10 coaching chat messages
            </TSCaptionText>
          </View>
        </View>

        {/* ── Subscription disclosures (required by Apple 3.1.2) ──────────── */}
        <View
          style={{
            marginTop: 8,
            marginBottom: 20,
            padding: 14,
            borderRadius: 12,
            backgroundColor: theme.palette.darkGray,
          }}
        >
          <TSCaptionText
            textStyles={{
              color: theme.palette.gray,
              lineHeight: 18,
              marginBottom: 10,
            }}
          >
            Memberships auto-renew monthly at the price shown above until
            cancelled. Payment is charged to your Apple ID on confirmation.
            Credits reset each billing period and do not roll over. Manage or
            cancel anytime in your Apple ID subscription settings — at least 24
            hours before the next renewal to avoid being charged.
          </TSCaptionText>

          <TouchableOpacity
            onPress={handleManageSubscription}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 8,
            }}
          >
            <Icon
              name="settings-outline"
              size={16}
              color={theme.palette.AWE_Green}
              style={{ marginRight: 8 }}
            />
            <TSCaptionText
              textStyles={{ color: theme.palette.text, fontWeight: "700" }}
            >
              Manage Subscription
            </TSCaptionText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleRestore}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 8,
            }}
          >
            <Icon
              name="refresh-outline"
              size={16}
              color={theme.palette.AWE_Green}
              style={{ marginRight: 8 }}
            />
            <TSCaptionText
              textStyles={{ color: theme.palette.text, fontWeight: "700" }}
            >
              Restore Purchases
            </TSCaptionText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              Linking.openURL(
                "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/",
              )
            }
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 8,
            }}
          >
            <Icon
              name="document-text-outline"
              size={16}
              color={theme.palette.AWE_Green}
              style={{ marginRight: 8 }}
            />
            <TSCaptionText
              textStyles={{ color: theme.palette.text, fontWeight: "700" }}
            >
              Terms of Use (EULA)
            </TSCaptionText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              Linking.openURL(
                "https://gist.github.com/killuhwhale/1613abbf3258807a5bc78e5fc5e569fb",
              )
            }
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 8,
            }}
          >
            <Icon
              name="shield-checkmark-outline"
              size={16}
              color={theme.palette.AWE_Green}
              style={{ marginRight: 8 }}
            />
            <TSCaptionText
              textStyles={{ color: theme.palette.text, fontWeight: "700" }}
            >
              Privacy Policy
            </TSCaptionText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </PageContainer>
  );
};

export default TokenShopScreen;
