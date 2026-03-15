import React, { FunctionComponent, useState } from "react";
import { Platform, ScrollView, TouchableHighlight, View } from "react-native";
import styled from "styled-components/native";
import { useTheme } from "styled-components/native";
import {
  TSButtonText,
  TSCaptionText,
  TSSnippetText,
} from "@/src/app_components/Text/Text";
import { Container, formatLongDate } from "@/src/app_components/shared";
import { RootStackParamList } from "@/src/navigators/RootStack";
import { StackScreenProps } from "@react-navigation/stack";
import { useGetCompletedWorkoutGroupsForUserByDateRangeQuery } from "@/src/redux/api/apiSlice";

import DatePicker from "react-native-date-picker";

import TotalsBarChart from "@/src/app_components/charts/barChart";
import TotalsLineChart from "@/src/app_components/charts/lineChart";
import TotalsPieChart from "@/src/app_components/charts/pieChart";
import FreqCalendar from "@/src/app_components/charts/freqCalendar";
import BannerAddMembership from "@/src/app_components/ads/BannerAd";
import { StatsPanel } from "@/src/app_components/Stats/StatsPanel";
import { dateFormat } from "@/src/utils/algos";
import FullScreenSpinner from "@/src/app_components/Spinner";
import { useStats } from "@/hooks/useStats";

export type Props = StackScreenProps<RootStackParamList, "StatsScreen">;

const ScreenContainer = styled(Container)`
  background-color: ${(props) => props.theme.palette.backgroundColor};
  justify-content: space-between;
  width: 100%;
`;

// Convert,String date (res from db) as UTC to local time as String
export const _date = (
  dateString: string,
  tz: string = "America/Los_Angeles"
) => {
  let d = new Date(dateFormat(new Date(dateString)));
  return new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
  }).format(d);
};

const StatsScreen: FunctionComponent<Props> = () => {
  const theme = useTheme();
  const oneday = 1000 * 60 * 60 * 24;
  const today = new Date();
  const now = today.getTime();
  const five_days_ago = new Date(now - oneday * 15);

  const [startDate, setStartDate] = useState<Date>(five_days_ago);
  const [endDate, setEndDate] = useState<Date>(today);
  const [startDateModalOpen, setStartDateModalOpen] = useState(false);
  const [endDateModalOpen, setEndDateModalOpen] = useState(false);

  // Get workout data - use skip option to prevent calling with undefined userId
  const { data, isLoading, isSuccess, isError, error } =
    useGetCompletedWorkoutGroupsForUserByDateRangeQuery({
      id: "0",
      startDate: dateFormat(startDate),
      endDate: dateFormat(endDate),
    });

  const {
    isUserMaxesLoading,
    workoutTagStats,
    workoutNameStats,
    totalTags,
    totalNames,
  } = useStats({ workoutGroups: data });

  const tagLabels: string[] = Array.from(new Set(Object.keys(totalTags)));
  const nameLabels: string[] = Array.from(new Set(Object.keys(totalNames)));

  const dataTypes = [
    "totalDistanceM",
    "totalKgM",
    "totalKgSec",
    "totalKgs",
    "totalLbM",
    "totalLbSec",
    "totalLbs",
    "totalReps",
    "totalTime",
  ];

  // Abbrev. for dataTypes
  const dataTypeYAxisSuffix = [
    "m",
    "kg*m",
    "kg*sec",
    "kgs",
    "lb*m",
    "lb*sec",
    "lbs",
    "reps",
    "sec",
  ];

  const dataReady = workoutTagStats.length || workoutNameStats.length;

  return (
    <ScreenContainer>
      {/* Date Picker */}
      {isLoading || isUserMaxesLoading ? (
        <FullScreenSpinner></FullScreenSpinner>
      ) : (
        <></>
      )}
      <BannerAddMembership />
      <View style={{ flex: 1, width: "100%", alignItems: "center" }}>
        <View
          style={{
            flexDirection: "row",
            width: "100%",
            height: 42,
            backgroundColor: theme.palette.darkGray,
            justifyContent: "center",
            alignItems: "center",
            marginTop: 12,
            borderBottomWidth: 2,
            borderColor: theme.palette.text,
          }}
        >
          <View style={{ flex: 1 }}>
            <TouchableHighlight onPress={() => setStartDateModalOpen(true)}>
              <>
                <TSButtonText
                  textStyles={{ textAlign: "center", paddingLeft: 16 }}
                >
                  Start Date
                </TSButtonText>
                <TSButtonText
                  textStyles={{ textAlign: "center", paddingLeft: 16 }}
                >
                  {formatLongDate(startDate)}
                </TSButtonText>
              </>
            </TouchableHighlight>
          </View>
          <View style={{ flex: 1 }}>
            <TouchableHighlight onPress={() => setEndDateModalOpen(true)}>
              <>
                <TSButtonText
                  textStyles={{ textAlign: "center", paddingLeft: 16 }}
                >
                  End Date
                </TSButtonText>
                <TSButtonText
                  textStyles={{ textAlign: "center", paddingLeft: 16 }}
                >
                  {formatLongDate(endDate)}
                </TSButtonText>
              </>
            </TouchableHighlight>
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            width: "100%",
            backgroundColor: theme.palette.darkGray,

            justifyContent: "center",
            alignItems: "center",
            borderBottomWidth: 2,
            borderColor: theme.palette.text,
            marginBottom: 15,
          }}
        >
          <DatePicker
            date={startDate}
            onDateChange={setStartDate}
            mode="date"
            locale="en"
            // theme="dark"
            theme="dark"
            maximumDate={new Date(endDate.getTime() - oneday)}
            onCancel={() => setStartDateModalOpen(false)}
            onConfirm={(date) => {
              setStartDate(date);
              setStartDateModalOpen(false);
            }}
            modal={true}
            open={startDateModalOpen}
            title={"Start Date"}
          />
          <DatePicker
            date={endDate}
            onDateChange={setEndDate}
            mode="date"
            locale="en"
            theme="dark"
            modal={true}
            open={endDateModalOpen}
            minimumDate={new Date(startDate.getTime() + oneday)}
            onCancel={() => setEndDateModalOpen(false)}
            onConfirm={(date) => {
              setEndDate(date);
              setEndDateModalOpen(false);
            }}
            title={"End Date"}
          />
        </View>
      </View>

      <View style={{ flex: 8 }}>
        <View style={{ height: 20, alignSelf: "flex-end", marginRight: 12 }}>
          <TSSnippetText textStyles={{ color: theme.palette.AWE_Green }}>
            Found {dataReady ? data?.length : 0}{" "}
            {dataReady && data?.length == 1 ? "Workout" : "Workouts"}
          </TSSnippetText>
        </View>

        <ScrollView>
          {dataReady ? (
            <>
              {Platform.OS === "ios" ? (
                <></>
              ) : (
                <FreqCalendar
                  startDate={startDate}
                  endDate={endDate}
                  data={data}
                />
              )}

              <View style={{ marginBottom: 24 }}>
                <StatsPanel tags={totalTags} names={totalNames} />
              </View>

              <TotalsBarChart
                dataTypes={dataTypes}
                tags={totalTags}
                names={totalNames}
              />

              <View
                style={{
                  width: "100%",
                  borderBottomWidth: 1,
                  borderColor: theme.palette.text,
                  marginVertical: 8,
                }}
              ></View>

              <TotalsLineChart
                dataTypes={dataTypes}
                nameLabels={nameLabels}
                tagLabels={tagLabels}
                dataTypeYAxisSuffix={dataTypeYAxisSuffix}
                workoutNameStats={workoutNameStats}
                workoutTagStats={workoutTagStats}
              />

              <View
                style={{
                  width: "100%",
                  borderBottomWidth: 1,
                  borderColor: theme.palette.text,
                  marginVertical: 8,
                }}
              ></View>

              <TotalsPieChart
                dataTypes={dataTypes}
                tags={totalTags}
                names={totalNames}
              />
            </>
          ) : (
            <></>
          )}
        </ScrollView>
      </View>
    </ScreenContainer>
  );
};

export default StatsScreen;
