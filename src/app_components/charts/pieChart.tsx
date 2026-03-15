import React, { FunctionComponent, useState } from "react";
import { ScrollView, View } from "react-native";

import Icon from "react-native-vector-icons/Ionicons";
import { useTheme } from "styled-components/native";
import { TSParagrapghText } from "../Text/Text";
import { SCREEN_WIDTH, lightenHexColor } from "../shared";

import { PieChart } from "react-native-chart-kit";
import HorizontalPicker from "../Pickers/HorizontalPicker";

function remap_shade(value) {
  const oldBase = 0.2;
  const newBase = 0.55;
  const endRange = 1;
  return (
    newBase + ((value - oldBase) * (endRange - newBase)) / (endRange - oldBase)
  );
}

const pieData = (tags, metric, pieColors) => {
  // Given a metric [dataTypes], return data

  const data: any[] = [];
  const labels: string[] = [];
  Object.keys(tags)
    .sort((a, b) => (a < b ? -1 : 1))
    .forEach((key, i) => {
      labels.push(key);
      if (tags[key] && tags[key][metric]) {
        const val = parseInt(tags[key][metric]);
        data.push({
          total: val,
          name: key,
          color: pieColors[i % pieColors.length],
          legendFontColor: "#FFF",
          legendFontSize: 10,
        });
      }
      // } else {
      //   data.push({
      //     total: 0,
      //     name: key,
      //     color: '#94a3b8',
      //     legendFontColor: '#94a3b8',
      //     legendFontSize: 8,
      //   });
      // }
    });

  return data;
};

const TotalsBarChart: FunctionComponent<{
  dataTypes: string[];
  tags: {};
  names: {};
}> = (props) => {
  const theme = useTheme();

  const [showAbsolute, setShowAbsolute] = useState(false);
  const [showTags, setShowTags] = useState(true);

  // todo,

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

  const chartConfig = {
    backgroundGradientFrom: "#1E2923",
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: "#08130D",
    backgroundGradientToOpacity: 0.5,
    color: (opacity = 1) =>
      opacity >= 0.2
        ? lightenHexColor(theme.palette.primary.main, 1)
        : theme.palette.primary.main,
    strokeWidth: 2, // optional, default 3
    barPercentage: 0.5,
    useShadowColorFromDataset: false, // optional
  };

  // generate bar data, given all data with chosen metric/ dataType
  // We can generate a filtered dataTypes by parsing tags or names.
  // If we look at a dataType, metric, we can check if all values are zero...
  //  Then we can use that list for Horizontal Picker and the IDX will match the filteredList, and pick the right metric
  const shade = 400;
  const pieColors = [
    theme.palette.AWE_Blue,
    theme.palette.AWE_Green,

    theme.palette.AWE_Red,
    theme.palette.AWE_Yellow,

    theme.palette.accent,
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.tertiary.main,

    lightenHexColor(theme.palette.AWE_Blue, 1),
    lightenHexColor(theme.palette.AWE_Green, 1),
    lightenHexColor(theme.palette.AWE_Red, 1),
    lightenHexColor(theme.palette.AWE_Yellow, 1),
    lightenHexColor(theme.palette.accent, 1),
    lightenHexColor(theme.palette.primary.main, 1),
    lightenHexColor(theme.palette.secondary.main, 1),
    lightenHexColor(theme.palette.tertiary.main, 1),
  ];

  const PieData = pieData(
    showTags ? props.tags : props.names,
    barDataFilteredDataTypes[showBarChartDataType],
    pieColors
  );

  return (
    <View
      style={{
        marginBottom: 24,
        paddingBottom: 12,
      }}
    >
      <View style={{ width: "100%", flexDirection: "row" }}>
        <TSParagrapghText>Totals</TSParagrapghText>
      </View>
      <View style={{ width: "100%", flexDirection: "row" }}>
        <Icon
          name="repeat"
          color={theme.palette.text}
          style={{ fontSize: 24, marginHorizontal: 8 }}
          onPress={() => {
            setShowTags(!showTags);
          }}
        />
        <Icon
          name="analytics"
          color={theme.palette.text}
          style={{ fontSize: 24, marginHorizontal: 8 }}
          onPress={() => {
            setShowAbsolute(!showAbsolute);
          }}
        />

        <HorizontalPicker
          key={`barChartKey_${barDataFilteredDataTypes.length}`}
          data={barDataFilteredDataTypes}
          onChange={setShowBarChartDataType}
        />
      </View>

      <ScrollView horizontal={true} style={{ flex: 1, height: 200 }}>
        <PieChart
          backgroundColor="transparent"
          paddingLeft="5"
          data={PieData}
          width={SCREEN_WIDTH}
          height={200}
          yAxisLabel=""
          chartConfig={chartConfig}
          accessor="total"
          fromZero
          absolute={showAbsolute}
        />
      </ScrollView>
    </View>
  );
};

export default TotalsBarChart;
