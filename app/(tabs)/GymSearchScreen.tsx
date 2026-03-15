import React, { FunctionComponent, useEffect, useState } from "react";
import styled from "styled-components/native";
import { Container } from "@/src/app_components/shared";
import { TSCaptionText } from "@/src/app_components/Text/Text";
import Icon from "react-native-vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useTheme } from "styled-components";
import { GymCardList } from "@/src/app_components/Cards/cardList";
import { useGetGymsQuery } from "@/src/redux/api/apiSlice";
import AuthManager from "@/src/utils/auth";
import { View } from "react-native";
import { filter } from "@/src/utils/algos";
import Input from "@/src/app_components/Input/input";
import BannerAddMembership from "@/src/app_components/ads/BannerAd";

const HomePageContainer = styled(Container)`
  background-color: ${(props) => props.theme.palette.backgroundColor};
  justify-content: space-between;
  flex: 1;
`;

const GymSearchScreen: FunctionComponent = () => {
  const theme = useTheme();
  const router = useRouter();

  const { data, isLoading, isSuccess, isError, error } = useGetGymsQuery("");
  const isTokenError =
    data && Object.keys(data) && Object.keys(data).indexOf("error") >= 0
      ? true
      : false;

  const [stringData, setOgData] = useState<string[]>(
    data && data.map ? data.map((gym) => gym.title) : []
  );
  const [filterResult, setFilterResult] = useState<number[]>(
    Array.from(Array(stringData.length).keys()).map((idx) => idx)
  );
  useEffect(() => {
    if (data && !isTokenError) {
      setOgData(data ? data.map((gym) => gym.title) : []);
      setFilterResult(
        Array.from(Array(data?.length || 0).keys()).map((idx) => idx)
      );
    }
  }, [data]);

  const [term, setTerm] = useState("");
  const filterText = (term: string) => {
    // Updates filtered data.
    const { items, marks } = filter(term, stringData, { word: false });
    setFilterResult(items);
    setTerm(term);
  };

  if (isTokenError) {
    // Naviagte to Auth page and logout.
    AuthManager.logout().then(() => {
      router.push("/AuthScreen");
    });
  }

  return (
    <HomePageContainer>
      <BannerAddMembership />
      <View style={{ height: 40, marginTop: 16 }}>
        <Input
          onChangeText={filterText}
          value={term}
          containerStyle={{
            width: "100%",
            backgroundColor: theme.palette.darkGray,
            borderRadius: 8,
            paddingHorizontal: 8,
          }}
          leading={
            <Icon
              name="search"
              android="md-add"
              style={{ fontSize: 16 }}
              color={theme.palette.text}
            />
          }
          label=""
          placeholder="Search gyms"
        />
      </View>
      {isTokenError ? (
        <TSCaptionText>bad token....</TSCaptionText>
      ) : isLoading ? (
        <TSCaptionText>Loading....</TSCaptionText>
      ) : data !== undefined && isSuccess && !isTokenError ? (
        <GymCardList
          data={data.filter((_, i) => filterResult.indexOf(i) >= 0)}
        />
      ) : isError || isTokenError ? (
        <TSCaptionText>Error.... {error?.toString()}</TSCaptionText>
      ) : (
        <TSCaptionText>No Data</TSCaptionText>
      )}
    </HomePageContainer>
  );
};

export default GymSearchScreen;
