import React, { FunctionComponent, useState } from "react";
import { View, TouchableOpacity, ScrollView, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  cancelAnimation,
  runOnJS,
} from "react-native-reanimated";
import { useTheme } from "styled-components";

import Icon from "react-native-vector-icons/Ionicons";
import { TSCaptionText, XSmallText } from "@/src/app_components/Text/Text";
import {
  SCREEN_HEIGHT,
  WORKOUT_TYPES,
  STANDARD_W,
  REPS_W,
} from "@/src/app_components/shared";

import {
  WorkoutDualItemProps,
  WorkoutItemProps,
} from "@/src/app_components/Cards/types";
import ItemString from "@/src/app_components/WorkoutItems/ItemString";
import { COLORSPALETTE } from "@/src/utils/algos";

const HOLD_MS = 700;

// ─── Delete trigger button ────────────────────────────────────────────────────
// Just fires press events — the fill animation lives in ItemRow

const DeleteTrigger: FunctionComponent<{
  onPressIn(): void;
  onPressOut(): void;
}> = ({ onPressIn, onPressOut }) => {
  const theme = useTheme();
  return (
    <Pressable
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={{
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: `${theme.palette.AWE_Red}22`,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Icon name="trash-outline" size={16} color={theme.palette.AWE_Red} />
    </Pressable>
  );
};

// ─── Inline color picker ─────────────────────────────────────────────────────

const InlineColorPicker: FunctionComponent<{
  onSelect(colorIdx: number): void;
  selectedIdx: number;
}> = ({ onSelect, selectedIdx }) => {
  return (
    <View
      style={{
        flexDirection: "row",
        paddingHorizontal: 12,
        paddingVertical: 6,
        gap: 6,
        alignItems: "center",
      }}
    >
      <XSmallText textStyles={{ fontSize: 10, opacity: 0.6, marginRight: 4 }}>
        Superset color:
      </XSmallText>
      {COLORSPALETTE.map((color, idx) => (
        <TouchableOpacity
          key={idx}
          onPress={() => onSelect(idx)}
          style={{
            width: 22,
            height: 22,
            borderRadius: 11,
            backgroundColor: color,
            borderWidth: selectedIdx === idx ? 2.5 : 0,
            borderColor: "white",
          }}
        />
      ))}
    </View>
  );
};

// ─── Single item row ─────────────────────────────────────────────────────────

const ItemRow: FunctionComponent<{
  item: WorkoutItemProps | WorkoutDualItemProps;
  idx: number;
  schemeType: number;
  isEditing: boolean;
  requestUpdate(item: WorkoutItemProps | WorkoutDualItemProps | null): void;
  removeItem(idx: number): void;
  removeItemSSID(idx: number): void;
  addItemToSSIDWithColor(idx: number, colorIdx: number): void;
  updateItemConstant(idx: number): void;
}> = ({
  item,
  idx,
  schemeType,
  isEditing,
  requestUpdate,
  removeItem,
  removeItemSSID,
  addItemToSSIDWithColor,
  updateItemConstant,
}) => {
  const theme = useTheme();
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [rowWidth, setRowWidth] = useState(0);

  const isStandard = WORKOUT_TYPES[schemeType] == STANDARD_W;
  const isReps = WORKOUT_TYPES[schemeType] == REPS_W;
  const ssidColor = item.ssid >= 0 ? COLORSPALETTE[item.ssid] : null;

  // Full-row fill for hold-to-delete
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

  const handleSuperset = () => {
    if (item.ssid >= 0) {
      removeItemSSID(idx);
      setShowColorPicker(false);
    } else {
      setShowColorPicker((v) => !v);
    }
  };

  const handleColorSelect = (colorIdx: number) => {
    addItemToSSIDWithColor(idx, colorIdx);
    setShowColorPicker(false);
  };

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
          : ssidColor
          ? `${ssidColor}44`
          : `${theme.palette.lightGray}18`,
      }}
    >
      {/* Full-row delete fill — sits behind content */}
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
        {/* Superset left bar (STANDARD_W) */}
        {isStandard && (
          <TouchableOpacity
            onPress={handleSuperset}
            style={{
              width: 28,
              alignSelf: "stretch",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: ssidColor ?? `${theme.palette.lightGray}12`,
            }}
          >
            <Icon
              name={ssidColor ? "link" : "add"}
              size={13}
              color={ssidColor ? "white" : `${theme.palette.lightGray}55`}
            />
          </TouchableOpacity>
        )}

        {/* Constant indicator (REPS_W) */}
        {isReps && (
          <TouchableOpacity
            onPress={() => updateItemConstant(idx)}
            style={{
              width: 28,
              alignSelf: "stretch",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: item.constant
                ? `${theme.palette.AWE_Blue}33`
                : `${theme.palette.lightGray}12`,
            }}
          >
            <Icon
              name={item.constant ? "lock-closed" : "lock-open-outline"}
              size={13}
              color={
                item.constant
                  ? theme.palette.AWE_Blue
                  : `${theme.palette.lightGray}55`
              }
            />
          </TouchableOpacity>
        )}

        {/* Item text */}
        <View style={{ flex: 1, paddingHorizontal: 10, paddingVertical: 8 }}>
          <ItemString item={item} schemeType={schemeType} prefix="" />
        </View>

        {/* Action icons */}
        <View style={{ flexDirection: "row", paddingRight: 8, gap: 2 }}>
          <TouchableOpacity
            onPress={() => requestUpdate(item)}
            style={{
              padding: 8,
              borderRadius: 8,
              backgroundColor: `${theme.palette.AWE_Yellow}18`,
            }}
          >
            <Icon
              name="create-outline"
              size={16}
              color={theme.palette.AWE_Yellow}
            />
          </TouchableOpacity>
          <DeleteTrigger
            onPressIn={handleDeletePressIn}
            onPressOut={handleDeletePressOut}
          />
        </View>
      </View>

      {/* Inline color picker */}
      {showColorPicker && isStandard && (
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: `${theme.palette.lightGray}18`,
          }}
        >
          <InlineColorPicker
            onSelect={handleColorSelect}
            selectedIdx={item.ssid}
          />
        </View>
      )}
    </View>
  );
};

// ─── List header ──────────────────────────────────────────────────────────────

const ListHeader: FunctionComponent<{
  schemeType: number;
  count: number;
}> = ({ schemeType, count }) => {
  const theme = useTheme();
  const isStandard = WORKOUT_TYPES[schemeType] == STANDARD_W;
  const isReps = WORKOUT_TYPES[schemeType] == REPS_W;

  return (
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
        Items ({count})
      </TSCaptionText>
      <View style={{ flexDirection: "row", gap: 12 }}>
        {isStandard && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Icon name="link" size={11} color={`${theme.palette.lightGray}88`} />
            <XSmallText textStyles={{ fontSize: 10, color: `${theme.palette.lightGray}88` }}>
              Tap bar to superset
            </XSmallText>
          </View>
        )}
        {isReps && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Icon name="lock-closed-outline" size={11} color={`${theme.palette.lightGray}88`} />
            <XSmallText textStyles={{ fontSize: 10, color: `${theme.palette.lightGray}88` }}>
              Tap to mark constant
            </XSmallText>
          </View>
        )}
      </View>
    </View>
  );
};

// ─── Main list component ──────────────────────────────────────────────────────

const CreateWorkoutItemList: FunctionComponent<{
  items: WorkoutItemProps[];
  schemeType: number;
  curColor: number;
  showAddSSID: boolean;
  itemToUpdate: WorkoutItemProps | WorkoutDualItemProps | null;

  setShowAddSSID(n: boolean): void;
  setCurColor(n: number): void;
  removeItemSSID(n: number): void;
  addItemToSSID(n: number): void;
  addItemToSSIDWithColor?(idx: number, colorIdx: number): void;
  updateItemConstant(n: number): void;
  removeItem(n: number): void;
  requestUpdate: (item: WorkoutItemProps | WorkoutDualItemProps | null) => void;
}> = ({
  items,
  schemeType,
  itemToUpdate,
  removeItemSSID,
  addItemToSSIDWithColor,
  addItemToSSID,
  setCurColor,
  updateItemConstant,
  removeItem,
  requestUpdate,
}) => {
  const handleAddWithColor = (idx: number, colorIdx: number) => {
    if (addItemToSSIDWithColor) {
      addItemToSSIDWithColor(idx, colorIdx);
    } else {
      setCurColor(colorIdx);
      setTimeout(() => addItemToSSID(idx), 0);
    }
  };

  return (
    <View style={{ flex: 1, width: "100%" }}>
      {items.length > 0 && (
        <ListHeader schemeType={schemeType} count={items.length} />
      )}
      <ScrollView nestedScrollEnabled>
        {items.map((item, idx) => {
          const isEditing = itemToUpdate?.uuid === item.uuid;
          return (
            <ItemRow
              key={`item_${item.uuid ?? idx}`}
              item={item}
              idx={idx}
              schemeType={schemeType}
              isEditing={isEditing}
              requestUpdate={requestUpdate}
              removeItem={removeItem}
              removeItemSSID={removeItemSSID}
              addItemToSSIDWithColor={handleAddWithColor}
              updateItemConstant={updateItemConstant}
            />
          );
        })}
      </ScrollView>
    </View>
  );
};

export default CreateWorkoutItemList;
