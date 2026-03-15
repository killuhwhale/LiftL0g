import {
  useGetAdUnitsQuery,
  useGetUserInfoQuery,
} from "@/src/redux/api/apiSlice";
import React, { FunctionComponent } from "react";
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from "react-native-google-mobile-ads";

import { UserProps } from "@/app/types";
import { Platform, View } from "react-native";
import { isDateInFuture } from "../shared";

const BANNER_AD_UNIT = Platform.OS == "ios" ? "ios_banner" : "android_banner";

const BannerAddMembership: FunctionComponent = () => {
  const {
    data: _userData,
    isLoading: userIsloading,
  } = useGetUserInfoQuery("");

  const userData = _userData as UserProps;
  const { data, isLoading } = useGetAdUnitsQuery("");

  const adUnitId = __DEV__
    ? TestIds.BANNER
    : !isLoading && data && data[BANNER_AD_UNIT]?.length > 0
    ? data[BANNER_AD_UNIT]
    : TestIds.BANNER;

  return (
    <View style={{ width: "100%" }}>
      {userIsloading ? (
        <></>
      ) : !userIsloading && userData && isDateInFuture(userData) ? (
        <></>
      ) : (
        <BannerAd
          unitId={adUnitId}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          requestOptions={{
            requestNonPersonalizedAdsOnly: true,
          }}
          onAdLoaded={() => {
            console.log("Banner Ad loaded");
          }}
          onAdFailedToLoad={(error) => {
            console.error("Banner Ad failed to load", error);
          }}
        />
      )}
    </View>
  );
};

export default BannerAddMembership;
