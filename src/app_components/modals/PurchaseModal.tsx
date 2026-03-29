import React, {
  FunctionComponent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useTheme } from "styled-components/native";
import { PurchasesStoreProduct } from "react-native-purchases";
import Icon from "react-native-vector-icons/Ionicons";
import LinearGradient from "react-native-linear-gradient";
import {
  TSCaptionText,
  TSInputTextSm,
  TSSnippetText,
} from "../Text/Text";
import { lightenHexColor } from "../shared";

const FEATURES = [
  { icon: "close-circle-outline", label: "Ad-free experience" },
  { icon: "barbell-outline", label: "Create up to 15 workouts/day" },
  { icon: "document-text-outline", label: "World class workout plans" },
  { icon: "sparkles-outline", label: "AI-powered workout generator" },
];

const PurchaseModal: FunctionComponent<{
  product: null | PurchasesStoreProduct;
  modalVisible: boolean;
  onRequestClose(): void;
  makePurchase: (product: PurchasesStoreProduct | null) => Promise<void>;
}> = ({ product, modalVisible, onRequestClose, makePurchase }) => {
  const theme = useTheme();
  const sheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["62%"], []);
  const [isWaiting, setIsWaiting] = useState(false);

  React.useEffect(() => {
    if (modalVisible) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
    }
  }, [modalVisible]);

  const renderBackdrop = useCallback(
    (backdropProps: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...backdropProps}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.6}
        pressBehavior="close"
      />
    ),
    []
  );

  const storeName = Platform.OS === "ios" ? "App Store" : "Play Store";
  const priceString = product?.priceString ?? "";

  const handleSubscribe = () => {
    setIsWaiting(true);
    makePurchase(product).finally(() => {
      setIsWaiting(false);
      onRequestClose();
    });
  };

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      onDismiss={onRequestClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: theme.palette.darkGray }}
      handleIndicatorStyle={{
        backgroundColor: lightenHexColor(theme.palette.lightGray, 0.3),
        width: 40,
      }}
    >
      <BottomSheetView style={styles.container}>
        {/* Header */}
        <View style={styles.headerSection}>
          <LinearGradient
            colors={[theme.palette.primary.main, theme.palette.AWE_Green]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconGradient}
          >
            <Icon name="star" size={28} color="#FFF" />
          </LinearGradient>

          <TSInputTextSm textStyles={{ color: theme.palette.text, fontWeight: "700", fontSize: 20, marginTop: 12 }}>
            Go Premium
          </TSInputTextSm>

          {priceString ? (
            <TSCaptionText textStyles={{ color: theme.palette.gray, marginTop: 4 }}>
              {priceString}/month
            </TSCaptionText>
          ) : null}
        </View>

        {/* Features */}
        <View style={styles.featuresSection}>
          {FEATURES.map((f) => (
            <View key={f.label} style={styles.featureRow}>
              <View style={[styles.featureIconCircle, { backgroundColor: lightenHexColor(theme.palette.AWE_Green, 0.15) }]}>
                <Icon name={f.icon} size={18} color={theme.palette.AWE_Green} />
              </View>
              <TSSnippetText textStyles={{ color: theme.palette.text, flex: 1 }}>
                {f.label}
              </TSSnippetText>
            </View>
          ))}
        </View>

        {/* Subscribe button */}
        <Pressable
          onPress={handleSubscribe}
          disabled={isWaiting || !product}
          style={({ pressed }) => [
            styles.subscribeButton,
            { backgroundColor: theme.palette.AWE_Green, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          {isWaiting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <TSInputTextSm textStyles={{ color: "#FFF", fontWeight: "700", fontSize: 16, textAlign: "center" }}>
              Subscribe {priceString ? `for ${priceString}/mo` : ""}
            </TSInputTextSm>
          )}
        </Pressable>

        {/* Fine print */}
        <TSCaptionText textStyles={{ color: theme.palette.gray, textAlign: "center", marginTop: 10, fontSize: 11 }}>
          Cancel anytime in the {storeName}
        </TSCaptionText>
      </BottomSheetView>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 32,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  iconGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  featuresSection: {
    gap: 14,
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  subscribeButton: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default PurchaseModal;
