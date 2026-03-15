import React, { FunctionComponent, useState, useRef, useEffect } from "react";
import { FlatList, TouchableOpacity, View } from "react-native";
import { useTheme } from "styled-components";

import { TSCaptionText } from "@/src/app_components/Text/Text";
import { WorkoutNameProps } from "@/src/app_components/Cards/types";

interface WorkoutNameRowItemProps {
  workoutName: WorkoutNameProps;
  onSelect(workoutName: WorkoutNameProps): void;
}

export class WorkoutNameRowItem extends React.PureComponent<WorkoutNameRowItemProps> {
  render() {
    return (
      <TouchableOpacity
        testID={this.props.workoutName.name}
        onPress={() => this.props.onSelect(this.props.workoutName)}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            alignContent: "center",
            paddingHorizontal: 16,
            flex: 1,
            borderBottomColor: "white",
            borderBottomWidth: 1,
            paddingVertical: 8,
          }}
        >
          <TSCaptionText>{this.props.workoutName.name}</TSCaptionText>
        </View>
      </TouchableOpacity>
    );
  }
}

const PickerFilterListView: FunctionComponent<{
  data: WorkoutNameProps[];
  RowView: any;
  extraProps: any;
}> = (props) => {
  /** The list view to display the filtered results. */
  // const theme = useTheme();

  return (
    <View>
      <FlatList
        data={props.data}
        horizontal={false}
        keyboardShouldPersistTaps="always"
        contentContainerStyle={{ flexGrow: 1 }}
        keyExtractor={({ id }: any) => id.toString()}
        renderItem={({ item }: { item: WorkoutNameProps }) => {
          // console.log('WorkoutName item: ', item);

          return (
            <props.RowView {...props.extraProps} workoutName={item} />
            // <WorkoutNameRowItem workoutName={item} onSelect={props.onSelect} />
          );
        }}
      />
    </View>
  );
};

export default PickerFilterListView;
