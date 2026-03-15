import { FunctionComponent } from "react";
import WorkoutItemPanel from "../WorkoutItems/ItemPanel";
import {
  AnyWorkoutItem,
  WorkkoutItemsList,
  WorkoutDualItemProps,
} from "./types";
import { useTheme } from "styled-components";
import { FlatList } from "react-native";
import { useMaxes } from "@/hooks/useMaxes";
import FullScreenSpinner from "../Spinner";

const WorkoutItemPreviewHorizontalList: FunctionComponent<{
  data: WorkkoutItemsList;
  schemeType: number;
  itemWidth: number;
  itemHeight: number;
  testID?: string;
  ownedByClass: boolean;
}> = (props) => {
  const theme = useTheme();
  const { getMaxValueWithUnit, isLoading } = useMaxes();

  if (isLoading) {
    return <FullScreenSpinner></FullScreenSpinner>;
  }

  return (
    <FlatList
      data={props.data}
      horizontal={true}
      contentContainerStyle={{
        alignItems: "center",
        justifyContent: "space-between",
        // width: '100%', baddd
        paddingLeft: 12,
        paddingRight: 12,
        paddingBottom: 15,
        paddingTop: 15,
      }}
      accessibilityLabel={props.testID}
      testID={props.testID}
      keyExtractor={(item: any, idx) => {
        // id.toString();
        return `${idx}_${item.id}`;
      }}
      renderItem={(renderProps) => {
        const index = renderProps.index == undefined ? 0 : renderProps.index;
        const item = renderProps.item as AnyWorkoutItem;
        const { maxUnit, maxValue } = getMaxValueWithUnit(
          item.name.id.toString()
        );

        return (
          <WorkoutItemPanel
            item={item}
            maxValue={maxValue}
            maxUnit={maxUnit}
            schemeType={props.schemeType}
            itemWidth={props.itemWidth}
            itemHeight={props.itemHeight}
            idx={index + 1}
            ownedByClass={props.ownedByClass}
          />
        );
      }}
      style={{ height: "100%" }}
    />
  );
};

export default WorkoutItemPreviewHorizontalList;
