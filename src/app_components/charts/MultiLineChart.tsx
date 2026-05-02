import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import { ScrollView, View, TouchableOpacity } from "react-native";
import { useTheme } from "styled-components/native";
import Icon from "react-native-vector-icons/Ionicons";
import { TSCaptionText, TSParagrapghText, XSmallText } from "../Text/Text";
import { SCREEN_WIDTH } from "../shared";
import { LineChart } from "react-native-chart-kit";
import HorizontalPicker from "../Pickers/HorizontalPicker";

// ── Colour palette — one per line ─────────────────────────────────────────────
const LINE_COLORS = [
  "#4CAF50", // green
  "#2196F3", // blue
  "#FF9800", // orange
  "#E91E63", // pink
  "#9C27B0", // purple
  "#00BCD4", // cyan
  "#FF5722", // deep orange
  "#607D8B", // slate
  "#FFEB3B", // yellow
  "#F44336", // red
];

const shortDateFormat = (d: Date) =>
  `${d.getMonth() + 1}-${d.getDate()}`;

// ── Build multi-dataset line data ─────────────────────────────────────────────
// All labels share the same x-axis (union of all dates). Missing values → 0.
const bMultiLineData = (
  workouts: any[],
  allLabels: string[],
  metric: string
) => {
  // 1. Collect + sort all unique dates across every workout entry
  const dateSet = new Set<string>();
  workouts
    .slice()
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .forEach((ws) => dateSet.add(shortDateFormat(new Date(ws.date))));
  const sortedDates = Array.from(dateSet);

  if (sortedDates.length === 0 || allLabels.length === 0) {
    return { labels: [""], datasets: [{ data: [0] }] };
  }

  // 2. For each label build a date→value map, then align to sortedDates
  const datasets = allLabels.map((label, i) => {
    const byDate: Record<string, number> = {};
    workouts.forEach((ws) => {
      const key = shortDateFormat(new Date(ws.date));
      if (ws[label]?.[metric]) {
        byDate[key] = (byDate[key] ?? 0) + ws[label][metric];
      }
    });

    const data = sortedDates.map((d) => byDate[d] ?? 0);
    const hex = LINE_COLORS[i % LINE_COLORS.length];

    return {
      data,
      color: (_opacity: number) => hex,
      strokeWidth: 2,
    };
  });

  return { labels: sortedDates, datasets };
};

// ── Legend row ────────────────────────────────────────────────────────────────
const Legend: FunctionComponent<{ labels: string[] }> = ({ labels }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    style={{ marginBottom: 6 }}
    contentContainerStyle={{ flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 4 }}
  >
    {labels.map((label, i) => (
      <View
        key={`legend_${label}_${i}`}
        style={{ flexDirection: "row", alignItems: "center", marginRight: 12, marginBottom: 4 }}
      >
        <View
          style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: LINE_COLORS[i % LINE_COLORS.length],
            marginRight: 4,
          }}
        />
        <TSCaptionText textStyles={{ fontSize: 11 }}>
          {label}
        </TSCaptionText>
      </View>
    ))}
  </ScrollView>
);

// ── Filter metrics that have data across ANY of the active labels ──────────────
const filterMetrics = (
  workouts: any[],
  allLabels: string[],
  dataTypes: string[],
  dataTypeYAxisSuffix: string[]
): [string[], string[]] => {
  const filtered: string[] = [];
  const filteredAbbrev: string[] = [];

  dataTypes.forEach((metric, i) => {
    const hasData = allLabels.some((label) =>
      workouts.some((ws) => ws[label]?.[metric] > 0)
    );
    if (hasData) {
      filtered.push(metric);
      filteredAbbrev.push(dataTypeYAxisSuffix[i]);
    }
  });

  return [filtered, filteredAbbrev];
};

// ── Main component ────────────────────────────────────────────────────────────
const MultiLineChart: FunctionComponent<{
  tagLabels: string[];
  nameLabels: string[];
  dataTypeYAxisSuffix: string[];
  dataTypes: string[];
  workoutTagStats: {}[];
  workoutNameStats: {}[];
}> = (props) => {
  const theme = useTheme();
  const [showTags, setShowTags] = useState(true);

  const workouts: {}[] = showTags
    ? props.workoutTagStats
    : props.workoutNameStats;

  const sTagLabels = props.tagLabels
    .slice()
    .sort((a, b) => (a < b ? -1 : 1));
  const sNameLabels = props.nameLabels
    .slice()
    .sort((a, b) => (a < b ? -1 : 1));

  const activeLabels = showTags ? sTagLabels : sNameLabels;

  // Metrics that have at least one non-zero value across all active labels
  const [filteredDataTypes, filteredDataTypesAbbrev] = useMemo(
    () =>
      filterMetrics(
        workouts,
        activeLabels,
        props.dataTypes,
        props.dataTypeYAxisSuffix
      ),
    [workouts, activeLabels, props.dataTypes]
  );

  const [showMetricIdx, setShowMetricIdx] = useState(
    filteredDataTypes.length > 1 ? 1 : 0
  );
  const [prevDTLength, setPrevDTLength] = useState(filteredDataTypes.length);

  // Reset metric index when the available metrics change
  useEffect(() => {
    if (prevDTLength === filteredDataTypes.length) return;
    setShowMetricIdx(filteredDataTypes.length > 1 ? 1 : 0);
    setPrevDTLength(filteredDataTypes.length);
  }, [filteredDataTypes.length, showTags]);

  const currentMetric = filteredDataTypes[showMetricIdx] ?? "";

  const multiLineData = useMemo(
    () => bMultiLineData(workouts, activeLabels, currentMetric),
    [workouts, activeLabels, currentMetric]
  );

  const chartConfig = {
    backgroundGradientFrom: "#1E2923",
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: "#08130D",
    backgroundGradientToOpacity: 0.5,
    // Per-dataset colors are driven by dataset.color(); this is the fallback
    color: (opacity = 1) => `rgba(255,255,255,${opacity})`,
    labelColor: (_opacity = 1) => theme.palette.AWE_Green,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: true,
  };

  const chartWidth = Math.max(
    SCREEN_WIDTH,
    multiLineData.labels.length * 30
  );

  return (
    <View style={{ flex: 3, width: "100%", marginBottom: 24 }}>
      {/* Header row — title + toggle */}
      <View
        style={{
          width: "100%",
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 6,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TSParagrapghText>Totals by date</TSParagrapghText>
          <TouchableOpacity
            onPress={() => setShowTags((prev) => !prev)}
            activeOpacity={0.75}
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginLeft: 10,
              paddingVertical: 7,
              paddingHorizontal: 10,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: `${theme.palette.AWE_Blue}55`,
              backgroundColor: `${theme.palette.AWE_Blue}14`,
            }}
          >
            <Icon
              name="swap-horizontal-outline"
              color={theme.palette.AWE_Blue}
              style={{ fontSize: 18, marginRight: 6 }}
            />
            <TSCaptionText
              textStyles={{
                color: theme.palette.AWE_Blue,
                fontSize: 12,
                fontWeight: "700",
              }}
            >
              {showTags ? "Tags" : "Names"}
            </TSCaptionText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Colour legend */}
      {activeLabels.length > 0 && <Legend labels={activeLabels} />}

      {/* Metric picker */}
      {filteredDataTypesAbbrev.length > 0 && (
        <View style={{ width: "100%", minHeight: 44, marginBottom: 10 }}>
          <HorizontalPicker
            key={`hpMetrics_${filteredDataTypesAbbrev.length}_${showTags}`}
            data={filteredDataTypesAbbrev}
            onChange={setShowMetricIdx}
          />
        </View>
      )}

      {/* Chart */}
      <ScrollView horizontal style={{ flex: 1, height: 260 }}>
        <LineChart
          data={multiLineData}
          width={chartWidth}
          height={260}
          verticalLabelRotation={90}
          chartConfig={chartConfig}
          withDots={multiLineData.labels.length <= 30}
          bezier
          fromZero
        />
      </ScrollView>
    </View>
  );
};

export default MultiLineChart;
