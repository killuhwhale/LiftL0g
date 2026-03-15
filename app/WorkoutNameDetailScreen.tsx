import React, { FunctionComponent } from "react";
import styled from "styled-components/native";
import { Container, MEDIA_CLASSES } from "../src/app_components/shared";
import {
  TSCaptionText,
  LargeText,
  MediumText,
} from "../src/app_components/Text/Text";
// import { withTheme } from 'styled-components'
import { useTheme } from "styled-components";
import { RootStackParamList } from "../src/navigators/RootStack";
import { StackScreenProps } from "@react-navigation/stack";
import { View } from "react-native";
import { MediaURLSliderClass } from "../src/app_components/MediaSlider/MediaSlider";
import BannerAddMembership from "../src/app_components/ads/BannerAd";
import { useLocalSearchParams } from "expo-router";

export type Props = StackScreenProps<
  RootStackParamList,
  "WorkoutNameDetailScreen"
>;

const ScreenContainer = styled(Container)`
  background-color: ${(props) => props.theme.palette.backgroundColor};
  justify-content: space-between;
  width: 100%;
  padding: 16px;
`;

const WorkoutNameDetailScreen: FunctionComponent = () => {
  const theme = useTheme();
  const params = useLocalSearchParams();
  console.log("WorkoutNameDetail paramas: ", params);

  const { id, name, primary, secondary, desc, categories, media_ids, date } =
    params || {};

  // TODO fetch WorkoutName by ID
  // const {name, primary, secondary, desc, categories, media_ids, date } =
  console.log("Primary category: ");
  return (
    <ScreenContainer>
      <View style={{ width: "100%" }}>
        <BannerAddMembership />

        <View>
          <LargeText
            textStyles={{
              color: theme.palette.accent,
              marginBottom: 4,
            }}
          >
            {name}
          </LargeText>
          <MediumText
            textStyles={{ marginBottom: 32, color: theme.palette.primary.main }}
          >
            Category: {primary}
          </MediumText>

          <MediumText
            textStyles={{ marginBottom: 32, color: theme.palette.text }}
          >
            Description
          </MediumText>
          <TSCaptionText>{desc}</TSCaptionText>

          <MediaURLSliderClass
            data={JSON.parse(media_ids as string)}
            mediaClassID={parseInt(id as string)}
            mediaClass={MEDIA_CLASSES[3]}
          />
        </View>
      </View>
    </ScreenContainer>
  );
};

export default WorkoutNameDetailScreen;
