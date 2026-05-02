import React, { FunctionComponent, useRef, useState } from "react";
import {
  LayoutChangeEvent,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
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
import MultiLineChart from "@/src/app_components/charts/MultiLineChart";
import TotalsPieChart from "@/src/app_components/charts/pieChart";
import FreqCalendar from "@/src/app_components/charts/freqCalendar";
import BannerAddMembership from "@/src/app_components/ads/BannerAd";
import { StatsPanel } from "@/src/app_components/Stats/StatsPanel";
import WallCalendarView from "@/src/app_components/Stats/WallCalendarView";
import { dateFormat } from "@/src/utils/algos";
import FullScreenSpinner from "@/src/app_components/Spinner";
import { useStats } from "@/hooks/useStats";

export type Props = StackScreenProps<RootStackParamList, "StatsScreen">;

const ScreenContainer = styled(Container)`
  background-color: ${(props) => props.theme.palette.backgroundColor};
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  width: 100%;
`;

export const _date = (
  dateString: string,
  tz: string = "America/Los_Angeles"
) => {
  const d = new Date(dateFormat(new Date(dateString)));
  return new Intl.DateTimeFormat("en-US", { timeZone: tz }).format(d);
};

// ─── Chart Card ───────────────────────────────────────────────────────────────

const ChartCard: FunctionComponent<{ children: React.ReactNode }> = ({
  children,
}) => {
  const theme = useTheme();
  return (
    <View
      style={{
        marginHorizontal: 12,
        marginBottom: 14,
        borderRadius: 14,
        backgroundColor: theme.palette.darkGray,
        overflow: "hidden",
        paddingBottom: 10,
      }}
    >
      {children}
    </View>
  );
};

// ─── Section Header ───────────────────────────────────────────────────────────

const SectionHeader: FunctionComponent<{
  title: string;
  subtitle?: string;
}> = ({ title, subtitle }) => {
  const theme = useTheme();
  return (
    <View style={{ paddingHorizontal: 14, paddingTop: 14, paddingBottom: 6 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: subtitle ? 2 : 0,
        }}
      >
        <View
          style={{
            width: 3,
            height: 14,
            borderRadius: 2,
            backgroundColor: theme.palette.AWE_Green,
            marginRight: 8,
          }}
        />
        <TSButtonText
          textStyles={{
            color: theme.palette.text,
            fontSize: 12,
            letterSpacing: 0.8,
          }}
        >
          {title.toUpperCase()}
        </TSButtonText>
      </View>
      {subtitle ? (
        <TSCaptionText
          textStyles={{
            color: theme.palette.lightGray,
            marginLeft: 11,
            fontSize: 11,
          }}
        >
          {subtitle}
        </TSCaptionText>
      ) : null}
    </View>
  );
};

// ─── Line Chart Toggle ────────────────────────────────────────────────────────

type LineChartMode = "single" | "multi";
type StatsViewMode = "analytics" | "calendar";

const LineChartToggle: FunctionComponent<{
  mode: LineChartMode;
  onChange: (mode: LineChartMode) => void;
}> = ({ mode, onChange }) => {
  const theme = useTheme();
  const options = [
    { key: "single" as LineChartMode, label: "Focus", icon: "╌" },
    { key: "multi" as LineChartMode, label: "Compare", icon: "≡" },
  ];
  return (
    <View
      style={{
        flexDirection: "row",
        alignSelf: "flex-start",
        backgroundColor: theme.palette.backgroundColor,
        borderRadius: 20,
        padding: 3,
        marginVertical: 8,
        marginLeft: 14,
      }}
    >
      {options.map((opt) => {
        const active = mode === opt.key;
        return (
          <TouchableOpacity
            key={opt.key}
            onPress={() => onChange(opt.key)}
            activeOpacity={0.75}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 5,
              paddingHorizontal: 16,
              borderRadius: 17,
              backgroundColor: active ? theme.palette.AWE_Green : "transparent",
            }}
          >
            <TSCaptionText
              textStyles={{
                color: active
                  ? theme.palette.backgroundColor
                  : theme.palette.lightGray,
                fontWeight: active ? "700" : "400",
                fontSize: 12,
                marginRight: 4,
              }}
            >
              {opt.icon}
            </TSCaptionText>
            <TSCaptionText
              textStyles={{
                color: active
                  ? theme.palette.backgroundColor
                  : theme.palette.lightGray,
                fontWeight: active ? "700" : "400",
                fontSize: 12,
              }}
            >
              {opt.label}
            </TSCaptionText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// ─── Tab Bar ──────────────────────────────────────────────────────────────────

const ALL_TABS = ["Frequency", "Summary", "Volume", "Trends", "Distribution"];
const TABS =
  Platform.OS === "ios"
    ? ALL_TABS.filter((t) => t !== "Frequency")
    : ALL_TABS;

const TabBar: FunctionComponent<{
  active: string;
  onPress: (tab: string) => void;
}> = ({ active, onPress }) => {
  const theme = useTheme();
  return (
    <View
      style={{
        backgroundColor: theme.palette.darkGray,
        borderBottomWidth: 1,
        borderBottomColor: theme.palette.backgroundColor,
      }}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 12,
          paddingVertical: 8,
        }}
      >
        {TABS.map((tab, i) => {
          const isActive = active === tab;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => onPress(tab)}
              activeOpacity={0.75}
              style={{
                paddingVertical: 5,
                paddingHorizontal: 14,
                borderRadius: 16,
                marginRight: i < TABS.length - 1 ? 6 : 0,
                backgroundColor: isActive
                  ? theme.palette.AWE_Green
                  : theme.palette.backgroundColor,
                borderWidth: 1,
                borderColor: isActive
                  ? theme.palette.AWE_Green
                  : `${theme.palette.lightGray}44`,
              }}
            >
              <TSCaptionText
                textStyles={{
                  color: isActive
                    ? theme.palette.backgroundColor
                    : theme.palette.lightGray,
                  fontWeight: isActive ? "700" : "400",
                  fontSize: 12,
                }}
              >
                {tab}
              </TSCaptionText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const MasterViewToggle: FunctionComponent<{
  mode: StatsViewMode;
  onChange: (mode: StatsViewMode) => void;
}> = ({ mode, onChange }) => {
  const theme = useTheme();
  const options = [
    { key: "analytics" as StatsViewMode, label: "Analytics" },
    { key: "calendar" as StatsViewMode, label: "Calendar" },
  ];

  return (
    <View
      style={{
        paddingHorizontal: 12,
        paddingBottom: 10,
        backgroundColor: theme.palette.darkGray,
        borderBottomWidth: 1,
        borderBottomColor: theme.palette.backgroundColor,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignSelf: "center",
          backgroundColor: theme.palette.backgroundColor,
          borderRadius: 22,
          padding: 4,
        }}
      >
        {options.map((opt) => {
          const active = mode === opt.key;
          return (
            <TouchableOpacity
              key={opt.key}
              onPress={() => onChange(opt.key)}
              activeOpacity={0.75}
              style={{
                paddingVertical: 7,
                paddingHorizontal: 20,
                borderRadius: 18,
                backgroundColor: active ? theme.palette.AWE_Blue : "transparent",
              }}
            >
              <TSCaptionText
                textStyles={{
                  color: active
                    ? theme.palette.backgroundColor
                    : theme.palette.lightGray,
                  fontWeight: active ? "700" : "500",
                  fontSize: 12,
                }}
              >
                {opt.label}
              </TSCaptionText>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

// ─── Screen ───────────────────────────────────────────────────────────────────

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
  const [lineChartMode, setLineChartMode] = useState<LineChartMode>("single");
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [viewMode, setViewMode] = useState<StatsViewMode>("analytics");

  const scrollRef = useRef<ScrollView>(null);
  const sectionOffsets = useRef<Record<string, number>>({});

  const onSectionLayout =
    (key: string) => (e: LayoutChangeEvent) => {
      sectionOffsets.current[key] = e.nativeEvent.layout.y;
    };

  const scrollToTab = (tab: string) => {
    setActiveTab(tab);
    scrollRef.current?.scrollTo({
      y: sectionOffsets.current[tab] ?? 0,
      animated: true,
    });
  };

  const { data, isLoading } =
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

  const dataTypeYAxisSuffix = [
    "m", "kg*m", "kg*sec", "kgs", "lb*m", "lb*sec", "lbs", "reps", "sec",
  ];

  const dataReady = workoutTagStats.length || workoutNameStats.length;

  const sharedLineProps = {
    dataTypes,
    nameLabels,
    tagLabels,
    dataTypeYAxisSuffix,
    workoutNameStats,
    workoutTagStats,
  };

  return (
    <ScreenContainer>
      {isLoading || isUserMaxesLoading ? <FullScreenSpinner /> : null}
      <BannerAddMembership />

      {/* ── Date Range Bar ──────────────────────────────────────── */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 12,
          paddingVertical: 10,
          backgroundColor: theme.palette.darkGray,
        }}
      >
        <TouchableOpacity
          onPress={() => setStartDateModalOpen(true)}
          activeOpacity={0.75}
          style={{
            flex: 1,
            backgroundColor: theme.palette.backgroundColor,
            borderRadius: 10,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderWidth: 1,
            borderColor: `${theme.palette.lightGray}44`,
            marginRight: 8,
          }}
        >
          <TSCaptionText
            textStyles={{
              color: theme.palette.lightGray,
              fontSize: 9,
              letterSpacing: 0.8,
              marginBottom: 2,
            }}
          >
            FROM
          </TSCaptionText>
          <TSButtonText textStyles={{ fontSize: 13 }}>
            {formatLongDate(startDate)}
          </TSButtonText>
        </TouchableOpacity>

        <TSCaptionText
          textStyles={{ color: theme.palette.lightGray, fontSize: 16, marginRight: 8 }}
        >
          →
        </TSCaptionText>

        <TouchableOpacity
          onPress={() => setEndDateModalOpen(true)}
          activeOpacity={0.75}
          style={{
            flex: 1,
            backgroundColor: theme.palette.backgroundColor,
            borderRadius: 10,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderWidth: 1,
            borderColor: `${theme.palette.lightGray}44`,
            marginRight: 8,
          }}
        >
          <TSCaptionText
            textStyles={{
              color: theme.palette.lightGray,
              fontSize: 9,
              letterSpacing: 0.8,
              marginBottom: 2,
            }}
          >
            TO
          </TSCaptionText>
          <TSButtonText textStyles={{ fontSize: 13 }}>
            {formatLongDate(endDate)}
          </TSButtonText>
        </TouchableOpacity>

        {/* Workout count badge */}
        <View
          style={{
            backgroundColor: `${theme.palette.AWE_Green}22`,
            borderRadius: 10,
            paddingHorizontal: 10,
            paddingVertical: 8,
            borderWidth: 1,
            borderColor: `${theme.palette.AWE_Green}55`,
            alignItems: "center",
          }}
        >
          <TSCaptionText
            textStyles={{
              color: theme.palette.AWE_Green,
              fontSize: 9,
              letterSpacing: 0.8,
            }}
          >
            SESSIONS
          </TSCaptionText>
          <TSSnippetText
            textStyles={{
              color: theme.palette.AWE_Green,
              fontSize: 16,
              fontWeight: "700",
            }}
          >
            {dataReady ? String(data?.length ?? 0) : "0"}
          </TSSnippetText>
        </View>
      </View>

      {/* DatePicker modals */}
      <DatePicker
        date={startDate}
        onDateChange={setStartDate}
        mode="date"
        locale="en"
        theme="dark"
        maximumDate={new Date(endDate.getTime() - oneday)}
        onCancel={() => setStartDateModalOpen(false)}
        onConfirm={(date) => {
          setStartDate(date);
          setStartDateModalOpen(false);
        }}
        modal
        open={startDateModalOpen}
        title="Start Date"
      />
      <DatePicker
        date={endDate}
        onDateChange={setEndDate}
        mode="date"
        locale="en"
        theme="dark"
        modal
        open={endDateModalOpen}
        minimumDate={new Date(startDate.getTime() + oneday)}
        onCancel={() => setEndDateModalOpen(false)}
        onConfirm={(date) => {
          setEndDate(date);
          setEndDateModalOpen(false);
        }}
        title="End Date"
      />

      <MasterViewToggle mode={viewMode} onChange={setViewMode} />

      {/* ── Tab Bar ─────────────────────────────────────────────── */}
      {viewMode === "analytics" ? (
        <TabBar active={activeTab} onPress={scrollToTab} />
      ) : null}

      {/* ── Chart Scroll Area ───────────────────────────────────── */}
      <View style={{ flex: 1 }}>
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 40 }}
        >
          {dataReady ? (
            <>
              {viewMode === "analytics" ? (
                <>
                  {/* Frequency */}
                  {Platform.OS !== "ios" && (
                    <View onLayout={onSectionLayout("Frequency")}>
                      <ChartCard>
                        <SectionHeader
                          title="Workout Frequency"
                          subtitle="Activity heatmap for the selected range"
                        />
                        <FreqCalendar
                          startDate={startDate}
                          endDate={endDate}
                          data={data}
                        />
                      </ChartCard>
                    </View>
                  )}

                  {/* Summary */}
                  <View onLayout={onSectionLayout("Summary")}>
                    <ChartCard>
                      <SectionHeader
                        title="Summary"
                        subtitle="Totals across all workouts in range"
                      />
                      <StatsPanel tags={totalTags} names={totalNames} />
                    </ChartCard>
                  </View>

                  {/* Volume */}
                  <View onLayout={onSectionLayout("Volume")}>
                    <ChartCard>
                      <SectionHeader
                        title="Volume by Category"
                        subtitle="Cumulative metric totals grouped by tag or name"
                      />
                      <TotalsBarChart
                        dataTypes={dataTypes}
                        tags={totalTags}
                        names={totalNames}
                      />
                    </ChartCard>
                  </View>

                  {/* Trends */}
                  <View onLayout={onSectionLayout("Trends")}>
                    <ChartCard>
                      <SectionHeader
                        title="Trends Over Time"
                        subtitle={
                          lineChartMode === "single"
                            ? "Focus on one tag or name at a time"
                            : "Compare all tags or names side-by-side"
                        }
                      />
                      <LineChartToggle
                        mode={lineChartMode}
                        onChange={setLineChartMode}
                      />
                      {lineChartMode === "single" ? (
                        <TotalsLineChart {...sharedLineProps} />
                      ) : (
                        <MultiLineChart {...sharedLineProps} />
                      )}
                    </ChartCard>
                  </View>

                  {/* Distribution */}
                  <View onLayout={onSectionLayout("Distribution")}>
                    <ChartCard>
                      <SectionHeader
                        title="Distribution"
                        subtitle="Proportional breakdown by tag or name"
                      />
                      <TotalsPieChart
                        dataTypes={dataTypes}
                        tags={totalTags}
                        names={totalNames}
                      />
                    </ChartCard>
                  </View>
                </>
              ) : (
                <ChartCard>
                  <SectionHeader
                    title="Wall Calendar"
                    subtitle="A real month-by-month training calendar for the selected range"
                  />
                  <WallCalendarView
                    data={data}
                    startDate={startDate}
                    endDate={endDate}
                  />
                </ChartCard>
              )}
            </>
          ) : (
            <View style={{ alignItems: "center", paddingTop: 60 }}>
              <TSCaptionText
                textStyles={{
                  color: theme.palette.lightGray,
                  textAlign: "center",
                  lineHeight: 22,
                }}
              >
                No workout data for the selected date range.
                {"\n"}Try expanding the range above.
              </TSCaptionText>
            </View>
          )}
        </ScrollView>
      </View>
    </ScreenContainer>
  );
};

export default StatsScreen;
