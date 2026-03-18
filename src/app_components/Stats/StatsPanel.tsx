import React, { FunctionComponent } from "react";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import styled from "styled-components/native";

import { TSCaptionText, TSParagrapghText } from "../Text/Text";

export interface WorkoutStats {
  totalReps: number;
  totalLbs: number;
  totalKgs: number;
  totalTime: number;
  totalKgSec: number;
  totalLbSec: number;
  totalDistanceM: number;
  totalDistanceY: number;
  totalKgM: number;
  totalLbM: number;
  key?: string;
}

// ─── Stat Row ─────────────────────────────────────────────────────────────────

const StatRow: FunctionComponent<{ label: string; value: string }> = ({
  label,
  value,
}) => {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 2,
      }}
    >
      <TSCaptionText
        textStyles={{ color: theme.palette.lightGray, fontSize: 10 }}
      >
        {label}
      </TSCaptionText>
      <TSCaptionText
        textStyles={{
          color: theme.palette.text,
          fontSize: 10,
          fontWeight: "600",
          marginLeft: 10,
        }}
      >
        {value}
      </TSCaptionText>
    </View>
  );
};

// ─── Stat Pill Card ───────────────────────────────────────────────────────────

export const TagPanelItem: FunctionComponent<{ tag: WorkoutStats }> = ({
  tag,
}) => {
  const theme = useTheme();
  return (
    <View
      style={{
        backgroundColor: theme.palette.backgroundColor,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginRight: 8,
        minWidth: 120,
        maxWidth: 160,
        borderWidth: 1,
        borderColor: `${theme.palette.AWE_Green}40`,
      }}
    >
      <TSCaptionText
        textStyles={{
          color: theme.palette.AWE_Green,
          fontWeight: "700",
          fontSize: 11,
          marginBottom: 6,
        }}
      >
        {tag.key}
      </TSCaptionText>
      {!!tag.totalReps && <StatRow label="Reps" value={`${tag.totalReps}`} />}
      {!!tag.totalKgs && <StatRow label="Volume" value={`${tag.totalKgs} kg`} />}
      {!!tag.totalLbs && <StatRow label="Volume" value={`${tag.totalLbs} lb`} />}
      {!!tag.totalTime && <StatRow label="Duration" value={`${tag.totalTime}s`} />}
      {!!tag.totalKgSec && <StatRow label="Vol·Time" value={`${tag.totalKgSec} kg·s`} />}
      {!!tag.totalLbSec && <StatRow label="Vol·Time" value={`${tag.totalLbSec} lb·s`} />}
      {!!tag.totalDistanceM && <StatRow label="Distance" value={`${tag.totalDistanceM} m`} />}
      {!!tag.totalDistanceY && <StatRow label="Distance" value={`${tag.totalDistanceY} yd`} />}
      {!!tag.totalKgM && <StatRow label="Vol·Dist" value={`${tag.totalKgM} kg·m`} />}
      {!!tag.totalLbM && <StatRow label="Vol·Dist" value={`${tag.totalLbM} lb·m`} />}
    </View>
  );
};

export const NamePanelItem: FunctionComponent<{ name: WorkoutStats }> = ({
  name,
}) => {
  const theme = useTheme();
  return (
    <View
      style={{
        backgroundColor: theme.palette.backgroundColor,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginRight: 8,
        minWidth: 120,
        maxWidth: 160,
        borderWidth: 1,
        borderColor: `${theme.palette.AWE_Green}40`,
      }}
    >
      <TSCaptionText
        textStyles={{
          color: theme.palette.AWE_Green,
          fontWeight: "700",
          fontSize: 11,
          marginBottom: 6,
        }}
      >
        {name.key}
      </TSCaptionText>
      {!!name.totalReps && <StatRow label="Reps" value={`${name.totalReps}`} />}
      {!!name.totalKgs && <StatRow label="Volume" value={`${name.totalKgs} kg`} />}
      {!!name.totalLbs && <StatRow label="Volume" value={`${name.totalLbs} lb`} />}
      {!!name.totalTime && <StatRow label="Duration" value={`${name.totalTime}s`} />}
      {!!name.totalKgSec && <StatRow label="Vol·Time" value={`${name.totalKgSec} kg·s`} />}
      {!!name.totalLbSec && <StatRow label="Vol·Time" value={`${name.totalLbSec} lb·s`} />}
      {!!name.totalDistanceM && <StatRow label="Distance" value={`${name.totalDistanceM} m`} />}
      {!!name.totalDistanceY && <StatRow label="Distance" value={`${name.totalDistanceY} yd`} />}
      {!!name.totalKgM && <StatRow label="Vol·Dist" value={`${name.totalKgM} kg·m`} />}
      {!!name.totalLbM && <StatRow label="Vol·Dist" value={`${name.totalLbM} lb·m`} />}
    </View>
  );
};

// ─── Horizontal Lists ─────────────────────────────────────────────────────────

const NarrowList = styled.FlatList`
  width: 100%;
  padding-left: 12px;
  padding-bottom: 6px;
` as unknown as typeof import("react-native").FlatList;

const WorkoutStatsByTagHorizontalList: FunctionComponent<{
  data: WorkoutStats[];
}> = (props) => (
  <NarrowList
    data={props.data}
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={{ alignItems: "flex-start" }}
    keyExtractor={({ key }: any) => `tag_${key}`}
    renderItem={({ item }: any) => <TagPanelItem tag={item} />}
  />
);

const WorkoutStatsByNameHorizontalList: FunctionComponent<{
  data: WorkoutStats[];
}> = (props) => (
  <NarrowList
    data={props.data}
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={{ alignItems: "flex-start" }}
    keyExtractor={({ key }: any) => `name_${key}`}
    renderItem={({ item }: any) => <NamePanelItem name={item} />}
  />
);

// ─── Sub-section label ───────────────────────────────────────────────────────

const GroupLabel: FunctionComponent<{ label: string }> = ({ label }) => {
  const theme = useTheme();
  return (
    <TSCaptionText
      textStyles={{
        color: theme.palette.lightGray,
        fontSize: 10,
        letterSpacing: 0.6,
        marginLeft: 14,
        marginBottom: 8,
        marginTop: 4,
      }}
    >
      {label.toUpperCase()}
    </TSCaptionText>
  );
};

// ─── StatsPanel ───────────────────────────────────────────────────────────────

export const StatsPanel: FunctionComponent<{ tags: {}; names: {} }> = ({
  tags,
  names,
}) => {
  const theme = useTheme();

  const sTags = Object.keys(tags)
    .sort((a, b) => (a < b ? -1 : 1))
    .map((key) => tags[key]);
  const sNames = Object.keys(names)
    .sort((a, b) => (a < b ? -1 : 1))
    .map((key) => names[key]);

  if (!Object.values(tags).length) return null;

  return (
    <View style={{ paddingTop: 4, paddingBottom: 8 }}>
      <GroupLabel label="By Category" />
      <WorkoutStatsByTagHorizontalList data={Object.values(sTags) as WorkoutStats[]} />

      <View
        style={{
          height: 1,
          backgroundColor: theme.palette.backgroundColor,
          marginVertical: 10,
          marginHorizontal: 14,
          opacity: 0.5,
        }}
      />

      <GroupLabel label="By Exercise" />
      <WorkoutStatsByNameHorizontalList data={Object.values(sNames) as WorkoutStats[]} />
    </View>
  );
};
