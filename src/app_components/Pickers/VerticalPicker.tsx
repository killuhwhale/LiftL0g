import React, {
  FunctionComponent,
  ReactElement,
  useEffect,
  useState,
} from "react";
import { StyleSheet, View } from "react-native";
// 1. UPDATE GESTURE HANDLER IMPORTS
import MaskedView from "@react-native-masked-view/masked-view";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
// 2. REMOVE useAnimatedGestureHandler
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { useTheme } from "styled-components/native";
import { SmallText } from "../Text/Text";

{
  /* https://www.youtube.com/watch?v=PVSjPswRn0U&ab_channel=WilliamCandillon */
}
const VerticalPicker: FunctionComponent<{
  data: string[];
  onChange(idx: number): void;
  testID?: string;
  itemDisplayIndex?: number;
}> = (props) => {
  const { data } = props;
  const _data = data?.length == 1 ? ["", data[0], ""] : data;

  const [xState, setXState] = useState(0);

  const transX = useSharedValue(xState);
  const sharedStartPos = useSharedValue(0);
  const sharedCurIdx = useSharedValue(0);
  const sharedPrevIdx = useSharedValue(-1);

  const [itemWidth, setItemWidth] = useState(10);
  const sharedItemWidth = useSharedValue(itemWidth);

  const [wordSkew, setWordSkew] = useState(0);
  const sharedWordSkew = useSharedValue(wordSkew);
  // iF data cotnains only 1 item, fix it in the middle, dont allow user to change

  useEffect(() => {
    if (
      props.itemDisplayIndex === null ||
      props.itemDisplayIndex === undefined
    ) {
      return console.log(
        "Dont do anything we just set a new index ....",
        props.itemDisplayIndex
      );
    }

    console.log(
      "Update, display item index: show index ",
      props.itemDisplayIndex
    );

    const moveTo = props.itemDisplayIndex * -sharedItemWidth.value;
    safeXUpdate(moveTo);
    transX.value = moveTo;
    sharedStartPos.value = moveTo;
    sharedPrevIdx.value = sharedCurIdx.value;
    sharedCurIdx.value = props.itemDisplayIndex;
    safeCallOnChange(props.itemDisplayIndex);
  }, [props.itemDisplayIndex]);

  const slideToIndex = (index: number) => {};

  const safeCallOnChange = (idx: number) => {
    props.onChange(idx);
  };

  const safeXUpdate = (moveTo: number) => {
    setXState(moveTo);
  };

  const eventHandler = Gesture.Pan()
    .onStart((event) => {
      // console.log("On start event: ", event.x, event.y)
    })
    .onUpdate((event) => {
      try {
        transX.value = event.translationX + sharedStartPos.value;
        sharedWordSkew.value = event.translationX + sharedStartPos.value * 4;
      } catch (err) {
        console.log("onActive Error: ", err);
      }
    })
    .onEnd((event) => {
      try {
        const totalDistMoved = event.translationX;
        const rawVal =
          totalDistMoved /
          (sharedItemWidth.value == 0 ? 1 : sharedItemWidth.value);
        
        const _numItemsTOMove =
          rawVal > 0
            ? -Math.ceil(Math.abs(rawVal))
            : Math.ceil(Math.abs(rawVal));

        // We have a padded array, do not change index.
        if (data.length != _data.length) {
          const moveTo = 0;
          transX.value = moveTo;
          runOnJS(safeXUpdate)(moveTo);
          runOnJS(safeCallOnChange)(0);
          console.log("End moveTo ", moveTo, "onChange ", 0);
          return;
        }
        const numItemsTOMove = Math.max(
          -data.length - 1,
          Math.min(data.length - 1, _numItemsTOMove)
        );
        
        const newIdx = Math.max(
          0,
          Math.min(data.length - 1, numItemsTOMove + sharedCurIdx.value)
        );
        
        const moveTo = newIdx * -sharedItemWidth.value;
        
        sharedWordSkew.value = 0;
        transX.value = moveTo;

        runOnJS(safeXUpdate)(moveTo);
        sharedStartPos.value = moveTo;
        sharedPrevIdx.value = sharedCurIdx.value;
        sharedCurIdx.value = newIdx;

        // Send new selected item
        if (sharedPrevIdx.value != sharedCurIdx.value) {
          runOnJS(safeCallOnChange)(newIdx);
        } else {
          console.log(
            "Value not changed!!!",
            sharedPrevIdx.value,
            sharedCurIdx.value
          );
        }
      } catch (err) {
        console.log("onActive Error: ", err);
      }
    });

  const uas = useAnimatedStyle(() => {
    return {
      // left: snapToPoints[Math.floor(transX.value / itemWidth)],
      transform: [{ translateX: withSpring(transX.value) }],
      // transform: [{translateX: transX.value}],
    };
  }, [transX.value]);

  const getWidthLayout = (e) => {
    sharedItemWidth.value = e.nativeEvent.layout.width;
    setItemWidth(e.nativeEvent.layout.width);
    setXState(0);
    props.onChange(0);
    transX.value = 0;
  };

  const mapData = () => {
    const mappedData: ReactElement[] = [];

    for (let i = 0; i < _data.length; i++) {
      const label = _data[i];
      mappedData.push(
        <View
          key={`${label}_${i}`}
          style={[
            {
              width: itemWidth,
            },
          ]}
        >
          <SmallText textStyles={{ textAlign: "center" }}>{label}</SmallText>
        </View>
      );
    }

    return mappedData;
  };
  const theme = useTheme();
  return (
    <View
      style={{
        flex: 1,
        width: "100%",
      }}
      testID={props.testID}
      onLayout={getWidthLayout}
    >
      <MaskedView
        style={{ flex: 1, height: "100%", flexDirection: "row", width: "100%" }}
        androidRenderingMode="software"
        maskElement={
          <Animated.View
            testID={props.testID}
            style={[
              {
                flexDirection: "row",
                height: "100%",
                alignItems: "center",
              },
              uas,
            ]}
          >
            {mapData()}
          </Animated.View>
        }
      >
        <View style={{ width: "15%", backgroundColor: "grey" }} />
        <View
          style={{ width: "70%", backgroundColor: theme.palette.IP_Swipe_bg }}
        />
        <View style={{ width: "15%", backgroundColor: "grey" }} />
      </MaskedView>

      <GestureDetector gesture={eventHandler}>
        <Animated.View style={[StyleSheet.absoluteFill, { flex: 1 }]} testID={props.testID} />
      </GestureDetector>
    </View>
  );
};
export default VerticalPicker;
