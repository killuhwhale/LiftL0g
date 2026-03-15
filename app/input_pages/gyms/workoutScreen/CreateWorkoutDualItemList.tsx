import React, { FunctionComponent, ReactNode, useState } from "react";
import {
  View,
  ScrollView,
  Switch,
  TouchableWithoutFeedback,
  GestureResponderEvent,
  Pressable,
} from "react-native";
import { useTheme } from "styled-components/native";
import { TSCaptionText } from "@/src/app_components/Text/Text";
import { SCREEN_HEIGHT } from "@/src/app_components/shared";
import {
  WorkoutDualItemProps,
  WorkoutItemProps,
} from "@/src/app_components/Cards/types";
import ItemString from "@/src/app_components/WorkoutItems/ItemString";
import { AnimatedButton } from "@/src/app_components/Buttons/buttons";
import { TouchableOpacity } from "react-native-gesture-handler";
import PenaltyModal from "@/src/app_components/modals/PenaltyModal";

const hasPenalty = (item: WorkoutDualItemProps) => {
  return item.penalty?.length && item.penalty?.length > 0;
};

const ItemRowButton: FunctionComponent<{
  allowDeleteInUpdateMode: boolean;
  idx: number;
  item: WorkoutItemProps | WorkoutDualItemProps;
  children: ReactNode;
  RowItemOnPress: (
    idx: number,
    item: WorkoutItemProps | WorkoutDualItemProps,
    _allowDeleteInUpdateMode: boolean
  ) => void;
}> = ({ allowDeleteInUpdateMode, idx, item, children, RowItemOnPress }) => {
  return allowDeleteInUpdateMode ? (
    <TouchableWithoutFeedback
      key={`item_test_${Math.random()}`}
      style={{ width: "100%" }}
      onPress={() => {
        RowItemOnPress(idx, item, allowDeleteInUpdateMode);
      }}
    >
      {children}
    </TouchableWithoutFeedback>
  ) : (
    <AnimatedButton
      title={item.name.name}
      style={{ width: "100%" }}
      onFinish={() => {
        RowItemOnPress(idx, item, false);
      }}
      key={`itemz_${idx}_${Math.random()}`}
    >
      {children}
    </AnimatedButton>
  );
};

const CreateWorkoutDualItemList: FunctionComponent<{
  items: WorkoutDualItemProps[];
  schemeType: number;
  itemToUpdate: WorkoutItemProps | WorkoutDualItemProps | null;
  removeItem(n: number): void;
  addPenalty(penalty: string, selectedIdx: number): void;
  requestUpdate: (item: WorkoutItemProps | WorkoutDualItemProps | null) => void;
}> = ({
  items,
  schemeType,
  itemToUpdate,
  removeItem,
  addPenalty,
  requestUpdate,
}) => {
  const theme = useTheme();
  const [showPenaltyModal, setShowPenaltyModal] = useState(false);
  const [curItem, setCurItem] = useState(0);
  const [text, setText] = useState("");
  const [allowDeleteInUpdateMode, setAllowDeleteInUpdateMode] = useState(false);

  const RowItemOnPress = (
    idx: number,
    item: WorkoutItemProps | WorkoutDualItemProps,
    _allowDeleteInUpdateMode: boolean
  ) => {
    if (_allowDeleteInUpdateMode) {
      requestUpdate(item);
    } else {
      removeItem(idx);
    }
  };

  return (
    <View style={{ flex: 4, width: "100%", height: "100%", marginBottom: 8 }}>
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          justifyContent: "space-between",
          paddingHorizontal: 12,
          alignItems: "center",
          width: "100%",
          borderWidth: 1,
          borderColor: "white",
        }}
      >
        <View>
          <TSCaptionText
            textStyles={{ color: theme.palette.text, textAlign: "left" }}
          >
            Update
          </TSCaptionText>
        </View>
        <View>
          <Switch
            value={allowDeleteInUpdateMode}
            onValueChange={(v) => {
              setAllowDeleteInUpdateMode(v);
            }}
            trackColor={{
              true: theme.palette.primary.contrastText,
              false: theme.palette.darkGray,
            }}
            thumbColor={
              allowDeleteInUpdateMode
                ? theme.palette.primary.main
                : theme.palette.gray
            }
          />
        </View>
      </View>

      <ScrollView style={{ marginTop: 12 }}>
        {items.map((item, idx) => {
          return (
            <ItemRowButton
              idx={idx}
              item={item}
              allowDeleteInUpdateMode={allowDeleteInUpdateMode}
              RowItemOnPress={RowItemOnPress}
              key={`itemz_${idx}_${Math.random()}`}
            >
              <View
                style={{
                  height: SCREEN_HEIGHT * 0.05,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ flex: 10 }}>
                  <ItemString
                    item={item}
                    schemeType={schemeType}
                    prefix=""
                    inclPenalty={false}
                  />
                </View>
                <View
                  style={{
                    flex: 6,
                    backgroundColor: theme.palette.AWE_Green,
                    borderRadius: 8,
                  }}
                >
                  <Pressable
                    onPress={(event?: GestureResponderEvent) => {
                      event?.stopPropagation();
                      setCurItem(idx);
                      setText(hasPenalty(item) ? item.penalty! : "");
                      setShowPenaltyModal(true);
                    }}
                    style={({ pressed }) => [
                      {
                        // on iOS (and as a fallback), fade the opacity
                        opacity: pressed ? 0.6 : 1,
                      },
                      {
                        borderRadius: 8,
                        justifyContent: "center",
                        alignItems: "center",
                        width: "100%",
                        height: "90%",
                      },
                    ]}
                  >
                    {hasPenalty(item) ? (
                      <TSCaptionText textStyles={{ textAlign: "center" }}>
                        {item.penalty}
                      </TSCaptionText>
                    ) : (
                      <TSCaptionText>Penalty +</TSCaptionText>
                    )}
                  </Pressable>
                </View>
              </View>
            </ItemRowButton>
          );
        })}
      </ScrollView>
      <PenaltyModal
        bodyText="Add your penalty: i.e. 10 reps every 1mins. "
        closeText="Close"
        modalVisible={showPenaltyModal}
        onRequestClose={() => setShowPenaltyModal(false)}
        curItem={curItem}
        setText={setText}
        text={text}
        onAction={addPenalty}
      />
    </View>
  );
};

export default CreateWorkoutDualItemList;
