import React, { FunctionComponent, useState } from "react";
import {
  View,
  ScrollView,
  GestureResponderEvent,
  Pressable,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  cancelAnimation,
  runOnJS,
} from "react-native-reanimated";
import { useTheme } from "styled-components/native";
import { TSCaptionText, XSmallText } from "@/src/app_components/Text/Text";
import { SCREEN_HEIGHT } from "@/src/app_components/shared";
import {
  WorkoutDualItemProps,
  WorkoutItemProps,
} from "@/src/app_components/Cards/types";
import ItemString from "@/src/app_components/WorkoutItems/ItemString";
import PenaltyModal from "@/src/app_components/modals/PenaltyModal";
import Icon from "react-native-vector-icons/Ionicons";

const HOLD_MS = 700;

const hasPenalty = (item: WorkoutDualItemProps) => {
  return item.penalty?.length && item.penalty?.length > 0;
};

// ─── Single item row ─────────────────────────────────────────────────────────

const DualItemRow: FunctionComponent<{
  item: WorkoutDualItemProps;
  idx: number;
  schemeType: number;
  isEditing: boolean;
  requestUpdate(item: WorkoutDualItemProps): void;
  removeItem(idx: number): void;
  onPenaltyPress(idx: number, currentPenalty: string): void;
}> = ({
  item,
  idx,
  schemeType,
  isEditing,
  requestUpdate,
  removeItem,
  onPenaltyPress,
}) => {
  const theme = useTheme();
  const [rowWidth, setRowWidth] = useState(0);

  const fillWidth = useSharedValue(0);
  const fillStyle = useAnimatedStyle(() => ({ width: fillWidth.value }));

  const handleDeletePressIn = () => {
    fillWidth.value = withTiming(rowWidth, { duration: HOLD_MS }, (finished) => {
      if (finished) {
        runOnJS(removeItem)(idx);
        fillWidth.value = 0;
      }
    });
  };

  const handleDeletePressOut = () => {
    cancelAnimation(fillWidth);
    fillWidth.value = withSpring(0, { damping: 18, stiffness: 220 });
  };

  const penaltyExists = hasPenalty(item);

  return (
    <View
      onLayout={(e) => setRowWidth(e.nativeEvent.layout.width)}
      style={{
        marginBottom: 6,
        borderRadius: 10,
        overflow: "hidden",
        backgroundColor: theme.palette.darkGray,
        borderWidth: 1.5,
        borderColor: isEditing
          ? `${theme.palette.AWE_Yellow}55`
          : `${theme.palette.lightGray}18`,
      }}
    >
      {/* Hold-to-delete fill overlay */}
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            backgroundColor: `${theme.palette.AWE_Red}44`,
          },
          fillStyle,
        ]}
      />

      {/* Row content */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          minHeight: SCREEN_HEIGHT * 0.055,
        }}
      >
        {/* Item text */}
        <View style={{ flex: 1, paddingHorizontal: 10, paddingVertical: 8 }}>
          <ItemString item={item} schemeType={schemeType} prefix="" inclPenalty={false} />
        </View>

        {/* Action buttons */}
        <View style={{ flexDirection: "row", alignItems: "center", paddingRight: 8, gap: 4 }}>
          {/* Penalty button */}
          <Pressable
            onPress={(event?: GestureResponderEvent) => {
              event?.stopPropagation();
              onPenaltyPress(idx, penaltyExists ? item.penalty! : "");
            }}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              paddingHorizontal: 8,
              paddingVertical: 6,
              borderRadius: 8,
              backgroundColor: penaltyExists
                ? `${theme.palette.AWE_Yellow}22`
                : `${theme.palette.AWE_Green}18`,
              opacity: pressed ? 0.65 : 1,
            })}
          >
            <Icon
              name={penaltyExists ? "alert-circle" : "add-circle-outline"}
              size={13}
              color={penaltyExists ? theme.palette.AWE_Yellow : theme.palette.AWE_Green}
            />
            <TSCaptionText
              textStyles={{
                fontSize: 11,
                color: penaltyExists ? theme.palette.AWE_Yellow : theme.palette.AWE_Green,
              }}
            >
              {penaltyExists ? "Penalty" : "Penalty"}
            </TSCaptionText>
          </Pressable>

          {/* Edit button */}
          <Pressable
            onPress={() => requestUpdate(item)}
            style={({ pressed }) => ({
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: `${theme.palette.AWE_Yellow}18`,
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.65 : 1,
            })}
          >
            <Icon name="create-outline" size={15} color={theme.palette.AWE_Yellow} />
          </Pressable>

          {/* Delete (hold) */}
          <Pressable
            onPressIn={handleDeletePressIn}
            onPressOut={handleDeletePressOut}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: `${theme.palette.AWE_Red}22`,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="trash-outline" size={15} color={theme.palette.AWE_Red} />
          </Pressable>
        </View>
      </View>
    </View>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

const CreateWorkoutDualItemList: FunctionComponent<{
  items: WorkoutDualItemProps[];
  schemeType: number;
  itemToUpdate: WorkoutItemProps | WorkoutDualItemProps | null;
  removeItem(n: number): void;
  addPenalty(penalty: string, selectedIdx: number): void;
  requestUpdate: (item: WorkoutItemProps | WorkoutDualItemProps | null) => void;
}> = ({ items, schemeType, itemToUpdate, removeItem, addPenalty, requestUpdate }) => {
  const theme = useTheme();
  const [showPenaltyModal, setShowPenaltyModal] = useState(false);
  const [curItem, setCurItem] = useState(0);
  const [text, setText] = useState("");

  const handlePenaltyPress = (idx: number, currentPenalty: string) => {
    setCurItem(idx);
    setText(currentPenalty);
    setShowPenaltyModal(true);
  };

  return (
    <View style={{ flex: 4, width: "100%", height: "100%", marginBottom: 8 }}>
      {items.length > 0 && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 4,
            paddingBottom: 8,
          }}
        >
          <TSCaptionText textStyles={{ fontWeight: "700", fontSize: 12 }}>
            Items ({items.length})
          </TSCaptionText>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Icon
              name="time-outline"
              size={11}
              color={`${theme.palette.lightGray}88`}
            />
            <XSmallText
              textStyles={{ fontSize: 10, color: `${theme.palette.lightGray}88` }}
            >
              Hold trash to delete
            </XSmallText>
          </View>
        </View>
      )}

      <ScrollView style={{ marginTop: 0 }} nestedScrollEnabled>
        {items.map((item, idx) => {
          const isEditing = itemToUpdate?.uuid === item.uuid;
          return (
            <DualItemRow
              key={`dual_item_${item.uuid ?? idx}`}
              item={item}
              idx={idx}
              schemeType={schemeType}
              isEditing={isEditing}
              requestUpdate={requestUpdate}
              removeItem={removeItem}
              onPenaltyPress={handlePenaltyPress}
            />
          );
        })}
      </ScrollView>

      <PenaltyModal
        bodyText="Add your penalty: i.e. 10 reps every 1 min."
        closeText="Cancel"
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
