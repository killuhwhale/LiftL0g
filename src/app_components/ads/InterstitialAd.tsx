import {
  useGetAdUnitsQuery,
  useGetUserInfoQuery,
} from "@/src/redux/api/apiSlice";
import {
  InterstitialAd,
  AdEventType,
  TestIds,
} from "react-native-google-mobile-ads";
import React, { FunctionComponent, useEffect, useRef, useState } from "react";

import { useTheme } from "styled-components";

import { Platform, View } from "react-native";
import { UserProps } from "@/app/types";

const INTERSTITIAL_AD_UNIT =
  Platform.OS == "ios" ? "ios_interstitial" : "android_interstitial";

const InterstitialAdMembership: FunctionComponent<{
  onClose?(): void;
  text: string;
  testID?: string;
  show?: boolean;
}> = (props) => {
  const theme = useTheme();
  const {
    data: _userData,
    isLoading: userIsloading,
  } = useGetUserInfoQuery("");

  const userData = _userData as UserProps;

  const { data, isLoading } = useGetAdUnitsQuery("");
  const interstitialRef = useRef<InterstitialAd | null>(null);

  const [loaded, setLoaded] = useState(false);

  const adUnitId = __DEV__
    ? TestIds.INTERSTITIAL
    : !isLoading && data && data[INTERSTITIAL_AD_UNIT]?.length > 0
    ? data[INTERSTITIAL_AD_UNIT]
    : TestIds.INTERSTITIAL;

  useEffect(() => {
    if (!interstitialRef.current) {
      interstitialRef.current = InterstitialAd.createForAdRequest(adUnitId, {
        requestNonPersonalizedAdsOnly: true,
        keywords: ["fitness", "fashion", "clothing"],
      });
    }

    const onAdLoaded = () => setLoaded(true);

    const unsubscribe = interstitialRef.current.addAdEventListener(
      AdEventType.LOADED,
      onAdLoaded
    );

    const onAdClosed = () => {
      setLoaded(false);
      interstitialRef.current?.load();
      if (props.onClose) props.onClose();
    };
    const unsubscribeClosed = interstitialRef.current.addAdEventListener(
      AdEventType.CLOSED,
      onAdClosed
    );

    interstitialRef.current.load();

    return () => {
      unsubscribe();
      unsubscribeClosed();
    };
  }, []);

  const showAd = () => {
    if (loaded) {
      interstitialRef.current?.show();
    }
  };

  useEffect(() => {
    if (props.show) {
      showAd();
    }
  }, [props.show, loaded]);

  return <View style={{ height: 400 }}></View>;
};

export default InterstitialAdMembership;
