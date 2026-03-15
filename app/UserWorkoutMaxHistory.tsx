// components/WorkoutMaxHistory.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LineChart } from "react-native-chart-kit";
import { useGetWorkoutMaxHistoryQuery } from "@/src/redux/api/apiSlice";
import { useLocalSearchParams } from "expo-router";
import { useTheme } from "styled-components/native";

const { width } = Dimensions.get("window");

interface HistoryItem {
  id: string;
  max_value: number;
  unit: string;
  recorded_date: string;
  location?: string;
  notes?: string;
}

const WorkoutMaxHistory = () => {
  const params = useLocalSearchParams();
  const { workoutItemId, workoutName, userID } = params;
  const theme = useTheme();

  const [view, setView] = useState("chart"); // 'chart' or 'list'

  // Get workout max history
  const {
    data: historyData,
    isLoading,
    error,
    refetch,
  } = useGetWorkoutMaxHistoryQuery({
    workoutItemId: workoutItemId as string,
    userID: userID as string,
    user_id: userID as string,
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Prepare chart data
  const prepareChartData = () => {
    if (!historyData || historyData.length === 0) {
      return {
        labels: [],
        datasets: [{ data: [] }],
      };
    }

    // Show last 10 records if more than 10 exist
    const chartData = [...historyData].slice(-10);

    return {
      labels: chartData.map((item) => {
        // Format date as month/day
        const date = new Date(item.recorded_date);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      }),
      datasets: [
        {
          data: chartData.map((item) => item.max_value),
          color: (opacity = 1) => `rgba(0, 90, 255, ${opacity})`, // theme.palette.primary.main with opacity
          strokeWidth: 2,
        },
      ],
    };
  };

  // Render chart view
  const renderChartView = () => {
    if (!historyData || historyData.length === 0) {
      return (
        <View style={styles(theme).emptyContainer}>
          <Ionicons
            name="analytics-outline"
            size={48}
            color={theme.palette.gray}
          />
          <Text style={styles(theme).emptyText}>No history data available</Text>
        </View>
      );
    }

    const chartData = prepareChartData();
    const unit = historyData[0]?.unit || "kg";

    return (
      <View style={styles(theme).chartContainer}>
        <Text style={styles(theme).chartTitle}>Progress Over Time</Text>

        <LineChart
          data={chartData}
          width={width - 40}
          height={220}
          chartConfig={{
            backgroundGradientFrom: theme.palette.IP_Label_bg,
            backgroundGradientTo: theme.palette.IP_Label_bg,
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(0, 90, 255, ${opacity})`, // Primary color
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: "6",
              strokeWidth: "2",
              stroke: theme.palette.primary.main,
            },
          }}
          bezier
          style={styles(theme).chart}
          yAxisSuffix={` ${unit}`}
        />

        <View style={styles(theme).chartStats}>
          <View style={styles(theme).statItem}>
            <Text style={styles(theme).statLabel}>Current</Text>
            <Text style={styles(theme).statValue}>
              {historyData[historyData.length - 1]?.max_value} {unit}
            </Text>
          </View>

          <View style={styles(theme).statDivider} />

          <View style={styles(theme).statItem}>
            <Text style={styles(theme).statLabel}>Best</Text>
            <Text style={styles(theme).statValue}>
              {Math.max(...historyData.map((item) => item.max_value))} {unit}
            </Text>
          </View>

          <View style={styles(theme).statDivider} />

          <View style={styles(theme).statItem}>
            <Text style={styles(theme).statLabel}>Average</Text>
            <Text style={styles(theme).statValue}>
              {(
                historyData.reduce((sum, item) => sum + item.max_value, 0) /
                historyData.length
              ).toFixed(1)}{" "}
              {unit}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // Render list item
  const renderHistoryItem = ({ item }: { item: HistoryItem }) => (
    <View style={styles(theme).historyItem}>
      <View style={styles(theme).historyItemHeader}>
        <Text style={styles(theme).historyItemDate}>
          {formatDate(item.recorded_date)}
        </Text>
        <Text style={styles(theme).historyItemValue}>
          {item.max_value} {item.unit}
        </Text>
      </View>

      {(item.location || item.notes) && (
        <View style={styles(theme).historyItemDetails}>
          {item.location && (
            <View style={styles(theme).detailRow}>
              <Ionicons
                name="location-outline"
                size={16}
                color={theme.palette.gray}
              />
              <Text style={styles(theme).detailText}>{item.location}</Text>
            </View>
          )}

          {item.notes && (
            <View style={styles(theme).detailRow}>
              <Ionicons
                name="document-text-outline"
                size={16}
                color={theme.palette.gray}
              />
              <Text style={styles(theme).detailText}>{item.notes}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );

  // Render list view
  const renderListView = () => {
    if (!historyData || historyData.length === 0) {
      return (
        <View style={styles(theme).emptyContainer}>
          <Ionicons name="list-outline" size={48} color={theme.palette.gray} />
          <Text style={styles(theme).emptyText}>No history data available</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={historyData}
        renderItem={renderHistoryItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles(theme).historyList}
      />
    );
  };

  if (isLoading) {
    return (
      <View style={styles(theme).centered}>
        <ActivityIndicator size="large" color={theme.palette.primary.main} />
        <Text style={styles(theme).loadingText}>Loading history...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles(theme).centered}>
        <Ionicons name="alert-circle" size={48} color={theme.palette.AWE_Red} />
        <Text style={styles(theme).errorText}>Failed to load history data</Text>
        <TouchableOpacity style={styles(theme).retryButton} onPress={refetch}>
          <Text style={styles(theme).retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles(theme).container}>
      <View style={styles(theme).header}>
        <Text style={styles(theme).title}>{workoutName} History</Text>

        <View style={styles(theme).tabs}>
          <TouchableOpacity
            style={[
              styles(theme).tab,
              view === "chart" && styles(theme).activeTab,
            ]}
            onPress={() => setView("chart")}
          >
            <Ionicons
              name="analytics-outline"
              size={20}
              color={
                view === "chart"
                  ? theme.palette.primary.main
                  : theme.palette.text
              }
            />
            <Text
              style={[
                styles(theme).tabText,
                view === "chart" && styles(theme).activeTabText,
              ]}
            >
              Chart
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles(theme).tab,
              view === "list" && styles(theme).activeTab,
            ]}
            onPress={() => setView("list")}
          >
            <Ionicons
              name="list-outline"
              size={20}
              color={
                view === "list"
                  ? theme.palette.primary.main
                  : theme.palette.text
              }
            />
            <Text
              style={[
                styles(theme).tabText,
                view === "list" && styles(theme).activeTabText,
              ]}
            >
              List
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles(theme).content}>
        {view === "chart" ? renderChartView() : renderListView()}
      </View>
    </SafeAreaView>
  );
};

// Use a function to generate styles with the theme
const styles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.palette.backgroundColor,
    },
    header: {
      padding: 16,
      backgroundColor: theme.palette.IP_Label_bg,
      borderBottomWidth: 1,
      borderBottomColor: theme.palette.darkGray,
    },
    title: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme.palette.text,
      marginBottom: 12,
    },
    tabs: {
      flexDirection: "row",
      marginTop: 8,
    },
    tab: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 8,
      paddingHorizontal: 16,
      marginRight: 12,
      borderRadius: 20,
      backgroundColor: theme.palette.IP_TextInput_bg,
    },
    activeTab: {
      backgroundColor: theme.palette.transparent,
    },
    tabText: {
      marginLeft: 4,
      fontSize: 14,
      fontWeight: "500",
      color: theme.palette.text,
    },
    activeTabText: {
      color: theme.palette.primary.main,
    },
    content: {
      flex: 1,
      padding: 16,
    },
    centered: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
      backgroundColor: theme.palette.backgroundColor,
    },
    loadingText: {
      marginTop: 10,
      fontSize: 16,
      color: theme.palette.text,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    emptyText: {
      marginTop: 12,
      fontSize: 16,
      color: theme.palette.gray,
      textAlign: "center",
    },
    chartContainer: {
      backgroundColor: theme.palette.IP_Label_bg,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    chartTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.palette.text,
      marginBottom: 16,
    },
    chart: {
      marginVertical: 8,
      borderRadius: 16,
    },
    chartStats: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: theme.palette.darkGray,
    },
    statItem: {
      alignItems: "center",
    },
    statLabel: {
      fontSize: 14,
      color: theme.palette.gray,
      marginBottom: 4,
    },
    statValue: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.palette.text,
    },
    statDivider: {
      width: 1,
      backgroundColor: theme.palette.darkGray,
    },
    historyList: {
      paddingBottom: 20,
    },
    historyItem: {
      backgroundColor: theme.palette.IP_Label_bg,
      borderRadius: 10,
      padding: 16,
      marginBottom: 12,
      shadowColor: theme.palette.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
      elevation: 2,
    },
    historyItemHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    historyItemDate: {
      fontSize: 16,
      fontWeight: "500",
      color: theme.palette.text,
    },
    historyItemValue: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.palette.primary.main,
    },
    historyItemDetails: {
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: theme.palette.darkGray,
    },
    detailRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 6,
    },
    detailText: {
      marginLeft: 8,
      fontSize: 14,
      color: theme.palette.gray,
    },
    errorText: {
      marginTop: 12,
      marginBottom: 20,
      fontSize: 16,
      color: theme.palette.AWE_Red,
      textAlign: "center",
    },
    retryButton: {
      backgroundColor: theme.palette.primary.main,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 6,
    },
    retryButtonText: {
      color: theme.palette.white,
      fontWeight: "bold",
      fontSize: 16,
    },
  });

export default WorkoutMaxHistory;
