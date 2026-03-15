import React, { FunctionComponent } from "react";

import { useTheme } from "styled-components";

import { useGetProfileViewQuery } from "../src/redux/api/apiSlice";

import { View } from "react-native";

import { RegularButton } from "../src/app_components/Buttons/buttons";
import { useRouter } from "expo-router";

const HomePage: FunctionComponent = () => {
  const theme = useTheme();
  const router = useRouter();
  const { data, isLoading, isSuccess, isError, error } =
    useGetProfileViewQuery("");

  const navToGymSeach = () => {
    router.push("/(tabs)/GymSearchScreen");
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.palette.backgroundColor,
      }}
    >
      {/* <View style={{flex: 1, width: '100%'}}>
        <RegularButton
          underlayColor="#cacaca30"
          btnStyles={{
            marginTop: 12,
            backgroundColor: '#cacaca00',
            borderTopColor: '#cacaca92',
            borderBottomColor: '#cacaca92',
            borderWidth: 2,
            width: '100%',
          }}
          onPress={navToGymSeach}
          text="Search for Gyms"
        />
      </View> */}

      {isLoading ? (
        <></>
      ) : isSuccess ? (
        <View
          style={{
            flex: 2,
            width: "100%",
            justifyContent: "center",
          }}
        ></View>
      ) : isError ? (
        <></>
      ) : (
        <></>
      )}
    </View>
  );
};

export default HomePage;
