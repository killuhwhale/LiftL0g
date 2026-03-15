import React, { FunctionComponent, useState } from "react";

import {
  Linking,
  Modal,
  Pressable,
  StyleProp,
  TouchableOpacity,
  View,
  ViewStyle,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from "react-native";

import { LargeButton, RegularButton } from "../Buttons/buttons";
import { TSButtonText, TSParagrapghText, TSSnippetText } from "../Text/Text";
import { centeredViewStyle, modalViewStyle } from "./modalStyles";
import { useTheme } from "styled-components/native";
import { PurchasesStoreProduct } from "react-native-purchases";

const PurchaseModal: FunctionComponent<{
  product: null | PurchasesStoreProduct;
  modalVisible: boolean;
  onRequestClose(): void;
  makePurchase: (product: PurchasesStoreProduct | null) => Promise<void>;
}> = ({ product, modalVisible, onRequestClose, makePurchase }) => {
  const theme = useTheme();

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => onRequestClose()}
    >
      <View
        style={[
          {
            backgroundColor: "#000000DD",
            height: "100%",
          },
        ]}
      >
        <TouchableOpacity
          style={[
            {
              height: "95%",
              paddingTop: Platform.OS == "ios" ? 124 : 48,
              paddingBottom: 124,
            },
          ]}
          onPress={() => onRequestClose()}
        >
          <View
            style={{
              margin: 4,
              borderRadius: 20,
              padding: 12,
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
              backgroundColor: theme.palette.darkGray,
              height: "100%",
              width: "100%",
            }}
          >
            <View
              style={{
                width: "100%",
                height: "95%",
                // paddingTop: 48,
                justifyContent: "center",
              }}
            >
              <PurchaseOptions
                product={product}
                websiteUrl="https://reptrackrr.com"
                makePurchase={makePurchase}
              />
            </View>
            <View style={{ marginTop: 124 }}>
              <LargeButton
                onPress={onRequestClose}
                btnStyles={{
                  backgroundColor: "#DB4437",
                }}
                text={"Close"}
              />
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

interface PurchaseOptionsProps {
  /** The product object you fetched via your IAP library */
  product: PurchasesStoreProduct | null;
  /** URL to your Stripe-powered purchase page */
  websiteUrl: string;
  /** Called when user taps the in-app purchase button */
  makePurchase: (product: PurchasesStoreProduct | null) => Promise<void>;
}

const PurchaseOptions: React.FC<PurchaseOptionsProps> = ({
  product,
  websiteUrl,
  makePurchase,
}) => {
  const theme = useTheme();
  const [isWaiting, setIsWaiting] = useState(false);
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.palette.backgroundColor,
          alignItems: "center",
          borderRadius: 8,
          width: "100%",
        },
      ]}
    >
      {/* 1. In-App Purchase Option */}
      <TSSnippetText
        textStyles={[styles.heading, { color: theme.palette.text }]}
      >
        Subscribe via App Store
      </TSSnippetText>
      <View style={[styles.card, { backgroundColor: theme.palette.AWE_Blue }]}>
        <TSSnippetText
          textStyles={[styles.title, { color: theme.palette.text }]}
        >
          {product?.title}
        </TSSnippetText>

        <TSSnippetText
          textStyles={[styles.note, { color: theme.palette.text }]}
        >
          Manage Subscription with {Platform.OS == "ios" ? "Apple" : "Android"}{" "}
          in the {Platform.OS == "ios" ? "App" : "Play"} Store.
        </TSSnippetText>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && { opacity: 0.7 },
            { backgroundColor: theme.palette.primary.main },
          ]}
          onPress={() => {
            setIsWaiting(true);
            makePurchase(product).finally(() => setIsWaiting(false));
          }}
          accessibilityRole="button"
        >
          <View style={{ flexDirection: "row" }}>
            {isWaiting ? (
              <ActivityIndicator color={theme.palette.AWE_Green} style={{}} />
            ) : (
              <></>
            )}
            <TSSnippetText
              textStyles={[
                styles.buttonText,
                { color: theme.palette.AWE_Green },
              ]}
            >
              Subscribe {product?.priceString}
            </TSSnippetText>
            {isWaiting ? (
              <ActivityIndicator color={theme.palette.AWE_Green} style={{}} />
            ) : (
              <></>
            )}
          </View>
        </Pressable>
      </View>

      <View
        style={{
          // borderWidth: 1,
          // height: 1,
          // borderColor: theme.palette.text,
          marginVertical: 16,
        }}
      />

      {/* 2. External Site Option */}
      {/* <TSSnippetText
        textStyles={[styles.heading, { color: theme.palette.text }]}
      >
        Subscribe via Website
      </TSSnippetText>
      <View style={[styles.card, { backgroundColor: theme.palette.AWE_Blue }]}>
        <TSSnippetText
          textStyles={[styles.note, { color: theme.palette.text }]}
        >
          Manage Subscription on our website
        </TSSnippetText>
        <TSSnippetText
          textStyles={[styles.note, { color: theme.palette.text }]}
        >
          Checkout with Stripe
        </TSSnippetText>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && { opacity: 0.7 },
            { backgroundColor: theme.palette.primary.main },
          ]}
          onPress={() => Linking.openURL(websiteUrl)}
          accessibilityRole="button"
        >
          <TSSnippetText
            textStyles={[styles.buttonText, { color: theme.palette.AWE_Green }]}
          >
            Go to Website
          </TSSnippetText>
        </Pressable>
      </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
  heading: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    // If you want a subtle shadow:
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  price: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  note: {
    fontSize: 13,
    fontStyle: "italic",
    marginBottom: 16,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  buttonOutline: {
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: "center",
    marginTop: 12,
  },
  buttonOutlineText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default PurchaseModal;
