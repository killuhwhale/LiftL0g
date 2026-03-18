import React, { FunctionComponent, useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";

import { useTheme } from "styled-components/native";
import { TSCaptionText } from "../Text/Text";
import { SCREEN_WIDTH } from "../shared";

import { BarChart } from "react-native-chart-kit";
import HorizontalPicker from "../Pickers/HorizontalPicker";

const barData = (tags, metric) => {
  // Given a metric [dataTypes], return data

  const data: number[] = [];
  const labels: string[] = [];
  Object.keys(tags)
    .sort((a, b) => (a < b ? -1 : 1))
    .forEach((key) => {
      labels.push(key);
      if (tags[key] && tags[key][metric]) {
        const val = parseInt(tags[key][metric]);
        data.push(val);
      } else {
        data.push(0);
      }
    });

  return {
    labels,
    datasets: [
      {
        data,
      },
    ],
  };
};

// ─── Chip Toggle ─────────────────────────────────────────────────────────────

type ChipToggleOption<T extends string> = { key: T; label: string };

function ChipToggle<T extends string>({
  options,
  value,
  onChange,
}: {
  options: ChipToggleOption<T>[];
  value: T;
  onChange: (v: T) => void;
}) {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: theme.palette.darkGray,
        borderRadius: 20,
        padding: 3,
      }}
    >
      {options.map((opt) => {
        const active = value === opt.key;
        return (
          <TouchableOpacity
            key={opt.key}
            onPress={() => onChange(opt.key)}
            activeOpacity={0.75}
            style={{
              paddingVertical: 5,
              paddingHorizontal: 14,
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
              }}
            >
              {opt.label}
            </TSCaptionText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Chart ───────────────────────────────────────────────────────────────────

const TotalsBarChart: FunctionComponent<{
  dataTypes: string[];
  tags: {};
  names: {};
}> = (props) => {
  const theme = useTheme();

  const [showTags, setShowTags] = useState(true);

  const chartConfig = {
    backgroundGradientFrom: "#1E2923",
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: "#08130D",
    backgroundGradientToOpacity: 0.5,
    // color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
    color: (opacity = 1) => theme.palette.primary.main,
    labelColor: (opacity = 1) => theme.palette.AWE_Green,

    strokeWidth: 2, // optional, default 3
    barPercentage: 0.5,
    useShadowColorFromDataset: false, // optional
  };

  const _barDataFilteredDataTypes = () => {
    const rawData = showTags ? props.tags : props.names;
    const filteredDataTypes: string[] = [];
    props.dataTypes.forEach((metric) => {
      let validMetric = false;
      Object.keys(rawData).forEach((key) => {
        const val = parseInt(rawData[key][metric]);
        if (val > 0) {
          validMetric = true;
        }
      });
      if (validMetric) {
        filteredDataTypes.push(metric);
      }
    });
    return filteredDataTypes;
  };

  const __barDataFilteredDataTypes = _barDataFilteredDataTypes();
  const barDataFilteredDataTypes =
    __barDataFilteredDataTypes.length === 0 ? [] : __barDataFilteredDataTypes;

  const [showBarChartDataType, setShowBarChartDataType] = useState(
    barDataFilteredDataTypes.length > 1 ? 1 : 0
  ); // Which data to show in the BarChart [totalReps etc...]

  // generate bar data, given all data with chosen metric/ dataType
  // We can generate a filtered dataTypes by parsing tags or names.
  // If we look at a dataType, metric, we can check if all values are zero...
  //  Then we can use that list for Horizontal Picker and the IDX will match the filteredList, and pick the right metric
  const BarData = barData(
    showTags ? props.tags : props.names,
    barDataFilteredDataTypes[showBarChartDataType]
  );

  return (
    <View
      style={{
        marginBottom: 24,
        paddingBottom: 12,
      }}
    >
      <View
        style={{
          width: "100%",
          flexDirection: "row",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 8,
          paddingHorizontal: 12,
          marginBottom: 8,
        }}
      >
        <ChipToggle
          options={[
            { key: "tags", label: "Category" },
            { key: "names", label: "Exercise" },
          ]}
          value={showTags ? "tags" : "names"}
          onChange={(v) => setShowTags(v === "tags")}
        />
      </View>

      <View style={{ paddingHorizontal: 12, marginBottom: 4 }}>
        <HorizontalPicker
          key={`barChartKey_${barDataFilteredDataTypes.length}`}
          data={barDataFilteredDataTypes}
          onChange={setShowBarChartDataType}
        />
      </View>

      <ScrollView horizontal={true} style={{ flex: 1, height: 420 }}>
        <BarChart
          yAxisSuffix=""
          xLabelsOffset={-15}
          data={BarData}
          width={Math.max(BarData.labels.length * 30 + 35, SCREEN_WIDTH)}
          height={420}
          yAxisLabel=""
          chartConfig={chartConfig}
          verticalLabelRotation={90}
          showValuesOnTopOfBars
          fromZero
        />
      </ScrollView>
    </View>
  );
};

export default TotalsBarChart;
