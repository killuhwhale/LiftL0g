import React, { FunctionComponent } from "react";
import { FlatList, TouchableHighlight, View } from "react-native";
import { useTheme } from "styled-components";

import { TSSnippetText, XSmallText } from "@/src/app_components/Text/Text";
import { WorkoutNameProps } from "@/src/app_components/Cards/types";

// ─── Category chip ────────────────────────────────────────────────────────────

// Deterministic color from category name so the same muscle group always
// gets the same hue — purely visual, no semantic mapping needed.
const categoryColor = (name: string): string => {
  const palette = [
    "#00d1b2", // teal
    "#4285F4", // blue
    "#F4B400", // amber
    "#DB4437", // red
    "#ed93cb", // pink
    "#a3de83", // green
    "#9870fc", // purple
    "#fd2eb3", // magenta
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
};

// ─── Row item ─────────────────────────────────────────────────────────────────

interface WorkoutNameRowItemProps {
  workoutName: WorkoutNameProps;
  onSelect(workoutName: WorkoutNameProps): void;
}

export class WorkoutNameRowItem extends React.PureComponent<WorkoutNameRowItemProps> {
  render() {
    const { workoutName, onSelect } = this.props;
    const primaryLabel = workoutName.primary?.title ?? workoutName.categories?.[0]?.title;

    return (
      <WorkoutNameRowItemFn
        workoutName={workoutName}
        onSelect={onSelect}
        primaryLabel={primaryLabel}
      />
    );
  }
}

// Functional inner component so we can use hooks
const WorkoutNameRowItemFn: FunctionComponent<
  WorkoutNameRowItemProps & { primaryLabel?: string }
> = ({ workoutName, onSelect, primaryLabel }) => {
  const theme = useTheme();
  const chipColor = primaryLabel ? categoryColor(primaryLabel) : null;

  return (
    <TouchableHighlight
      testID={workoutName.name}
      onPress={() => onSelect(workoutName)}
      underlayColor={`${theme.palette.AWE_Green}14`}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingVertical: 13,
          borderBottomWidth: 1,
          borderBottomColor: `${theme.palette.lightGray}14`,
        }}
      >
        {/* Accent dot */}
        <View
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: chipColor ?? `${theme.palette.lightGray}44`,
            marginRight: 12,
          }}
        />

        {/* Exercise name */}
        <TSSnippetText
          numberOfLines={1}
          textStyles={{ flex: 1, fontWeight: "600", fontSize: 14 }}
        >
          {workoutName.name}
        </TSSnippetText>

        {/* Primary category chip */}
        {primaryLabel && (
          <View
            style={{
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 20,
              backgroundColor: `${chipColor}1A`,
              borderWidth: 1,
              borderColor: `${chipColor}44`,
              marginLeft: 8,
            }}
          >
            <XSmallText
              textStyles={{
                color: chipColor,
                fontWeight: "700",
                fontSize: 10,
              }}
            >
              {primaryLabel}
            </XSmallText>
          </View>
        )}
      </View>
    </TouchableHighlight>
  );
};

// ─── List wrapper ─────────────────────────────────────────────────────────────

const PickerFilterListView: FunctionComponent<{
  data: WorkoutNameProps[];
  RowView: any;
  extraProps: any;
}> = (props) => {
  return (
    <FlatList
      data={props.data}
      horizontal={false}
      keyboardShouldPersistTaps="always"
      keyExtractor={({ id }: any) => id.toString()}
      renderItem={({ item }: { item: WorkoutNameProps }) => (
        <props.RowView {...props.extraProps} workoutName={item} />
      )}
    />
  );
};

export default PickerFilterListView;
