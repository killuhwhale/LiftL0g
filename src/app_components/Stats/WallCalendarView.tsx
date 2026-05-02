import React, { FunctionComponent, useMemo } from "react";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import Icon from "react-native-vector-icons/Ionicons";

import { WorkoutGroupProps } from "../Cards/types";
import { TSCaptionText, TSSnippetText } from "../Text/Text";
import { lightenHexColor } from "../shared";
import { dateFormat } from "@/src/utils/algos";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

type MonthCursor = {
  year: number;
  month: number;
};

const stripTime = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const buildWorkoutDateSet = (data: WorkoutGroupProps[]) => {
  const dates = new Set<string>();
  data.forEach((group) => {
    if (group.for_date) {
      dates.add(dateFormat(new Date(group.for_date)));
    }
  });
  return dates;
};

const buildMonthRange = (startDate: Date, endDate: Date): MonthCursor[] => {
  const months: MonthCursor[] = [];
  const cursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

  while (cursor <= end) {
    months.push({ year: cursor.getFullYear(), month: cursor.getMonth() });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return months;
};

const WallCalendarView: FunctionComponent<{
  data: WorkoutGroupProps[];
  startDate: Date;
  endDate: Date;
}> = ({ data, startDate, endDate }) => {
  const theme = useTheme();
  const normalizedStart = stripTime(startDate);
  const normalizedEnd = stripTime(endDate);

  const workoutDates = useMemo(() => buildWorkoutDateSet(data), [data]);
  const months = useMemo(
    () => buildMonthRange(normalizedStart, normalizedEnd),
    [normalizedStart, normalizedEnd]
  );

  return (
    <View style={{ width: "100%", paddingBottom: 8 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingHorizontal: 14,
          marginBottom: 12,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Icon
            name="barbell-outline"
            size={14}
            color={theme.palette.AWE_Green}
            style={{ marginRight: 6 }}
          />
          <TSCaptionText textStyles={{ color: theme.palette.lightGray }}>
            Workout day
          </TSCaptionText>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Icon
            name="remove-circle-outline"
            size={14}
            color={theme.palette.AWE_Red}
            style={{ marginRight: 6 }}
          />
          <TSCaptionText textStyles={{ color: theme.palette.lightGray }}>
            No workout
          </TSCaptionText>
        </View>
      </View>

      {months.map(({ year, month }) => {
        const firstDay = new Date(year, month, 1);
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const leadingBlanks = firstDay.getDay();
        const cells = Array.from({ length: leadingBlanks + daysInMonth }, (_, idx) =>
          idx < leadingBlanks ? null : idx - leadingBlanks + 1
        );

        return (
          <View
            key={`${year}-${month}`}
            style={{
              marginHorizontal: 14,
              marginBottom: 14,
              borderRadius: 16,
              backgroundColor: lightenHexColor(theme.palette.backgroundColor, 1.12),
              borderWidth: 1,
              borderColor: `${theme.palette.lightGray}22`,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                paddingHorizontal: 14,
                paddingVertical: 12,
                backgroundColor: `${theme.palette.AWE_Blue}18`,
                borderBottomWidth: 1,
                borderBottomColor: `${theme.palette.lightGray}18`,
              }}
            >
              <TSSnippetText textStyles={{ fontWeight: "700" }}>
                {MONTHS[month]} {year}
              </TSSnippetText>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingHorizontal: 8,
                paddingTop: 10,
                paddingBottom: 6,
              }}
            >
              {WEEKDAYS.map((day) => (
                <View key={day} style={{ width: `${100 / 7}%`, alignItems: "center" }}>
                  <TSCaptionText
                    textStyles={{
                      color: theme.palette.lightGray,
                      fontSize: 10,
                      fontWeight: "700",
                    }}
                  >
                    {day}
                  </TSCaptionText>
                </View>
              ))}
            </View>

            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                paddingHorizontal: 8,
                paddingBottom: 10,
              }}
            >
              {cells.map((day, idx) => {
                if (day == null) {
                  return (
                    <View
                      key={`blank-${year}-${month}-${idx}`}
                      style={{ width: `${100 / 7}%`, height: 66 }}
                    />
                  );
                }

                const cellDate = new Date(year, month, day);
                const dateKey = dateFormat(cellDate);
                const inRange = cellDate >= normalizedStart && cellDate <= normalizedEnd;
                const hasWorkout = inRange && workoutDates.has(dateKey);

                return (
                  <View
                    key={dateKey}
                    style={{
                      width: `${100 / 7}%`,
                      padding: 4,
                    }}
                  >
                    <View
                      style={{
                        minHeight: 58,
                        borderRadius: 12,
                        paddingTop: 7,
                        paddingHorizontal: 6,
                        alignItems: "center",
                        justifyContent: "space-between",
                        backgroundColor: inRange
                          ? theme.palette.darkGray
                          : `${theme.palette.darkGray}55`,
                        borderWidth: 1,
                        borderColor: inRange
                          ? hasWorkout
                            ? `${theme.palette.AWE_Green}55`
                            : `${theme.palette.AWE_Red}33`
                          : `${theme.palette.lightGray}14`,
                        opacity: inRange ? 1 : 0.45,
                      }}
                    >
                      <TSCaptionText
                        textStyles={{
                          fontWeight: "700",
                          fontSize: 11,
                          color: theme.palette.text,
                        }}
                      >
                        {day}
                      </TSCaptionText>

                      {inRange ? (
                        <Icon
                          name={hasWorkout ? "barbell-outline" : "remove-circle-outline"}
                          size={16}
                          color={hasWorkout ? theme.palette.AWE_Green : theme.palette.AWE_Red}
                          style={{ marginBottom: 8 }}
                        />
                      ) : (
                        <View style={{ height: 24 }} />
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
};

export default WallCalendarView;
