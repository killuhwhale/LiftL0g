import React, { FunctionComponent, ReactNode, useState } from "react";
import {
  View,
  Switch,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";
import { useTheme } from "styled-components";

import Icon from "react-native-vector-icons/Ionicons";
import { TSCaptionText } from "@/src/app_components/Text/Text";
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
import { AnimatedButton } from "@/src/app_components/Buttons/buttons";
import { ColorPalette, COLORSPALETTE } from "@/src/utils/algos";

const ItemRowButton: FunctionComponent<{
  showAddSSID: boolean;
  allowMarkConstant: boolean;
  allowDeleteInUpdateMode: boolean;
  idx: number;
  item: WorkoutItemProps | WorkoutDualItemProps;
  children: ReactNode;
  isCurrentUpdateItem: boolean;
  RowItemOnPress: (
    idx: number,
    item: WorkoutItemProps | WorkoutDualItemProps,
    _showAddSSID: boolean,
    _allowMarkConstant: boolean,
    _allowDeleteInUpdateMode: boolean
  ) => void;
}> = ({
  showAddSSID,
  allowMarkConstant,
  allowDeleteInUpdateMode,
  idx,
  item,
  children,
  isCurrentUpdateItem,
  RowItemOnPress,
}) => {
  return showAddSSID || allowMarkConstant || allowDeleteInUpdateMode ? (
    <TouchableWithoutFeedback
      key={`item_test_${Math.random()}`}
      style={{ width: "100%" }}
      onPress={() => {
        RowItemOnPress(
          idx,
          item,
          showAddSSID,
          allowMarkConstant,
          allowDeleteInUpdateMode
        );
      }}
    >
      <View
        style={{
          borderWidth: isCurrentUpdateItem ? 1 : 0,
          borderColor: "white",
        }}
      >
        {children}
      </View>
    </TouchableWithoutFeedback>
  ) : (
    <AnimatedButton
      title={item.name.name}
      style={{ width: "100%" }}
      onFinish={() => {
        RowItemOnPress(idx, item, showAddSSID, allowMarkConstant, false);
      }}
      key={`itemz_${idx}_${Math.random()}`}
    >
      {children}
    </AnimatedButton>
  );
};

const ListToggles: FunctionComponent<{
  schemeType: number;
  curColor: number;
  allowMarkConstant: boolean;
  showAddSSID: boolean;
  allowDeleteInUpdateMode: boolean;
  setShowAddSSID(n: boolean): void;
  setCurColor(n: number): void;
  setAllowMarkConstant: React.Dispatch<React.SetStateAction<boolean>>;
  setAllowDeleteInUpdateMode: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({
  schemeType,
  curColor,
  allowMarkConstant,
  showAddSSID,
  allowDeleteInUpdateMode,
  setShowAddSSID,
  setCurColor,
  setAllowMarkConstant,
  setAllowDeleteInUpdateMode,
}) => {
  const theme = useTheme();

  return (
    <View style={{ flexDirection: "row", width: "100%" }}>
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

      {schemeType === 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignContent: "center",
            alignItems: "center",
            borderWidth: 1,
            borderColor: "white",
          }}
        >
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "space-between",
              flexDirection: "row",
              paddingHorizontal: 12,
              width: "100%",
            }}
          >
            <TSCaptionText
              textStyles={{ color: theme.palette.text, textAlign: "left" }}
            >
              Add Superset
            </TSCaptionText>
            <Switch
              value={showAddSSID}
              onValueChange={(v) => {
                setShowAddSSID(v);
                if (!v) {
                  setCurColor(-1);
                }
              }}
              trackColor={{
                true: theme.palette.primary.contrastText,
                false: theme.palette.darkGray,
              }}
              thumbColor={
                showAddSSID ? theme.palette.primary.main : theme.palette.gray
              }
            />
          </View>
          <View style={{ flex: 5, paddingBottom: showAddSSID ? 12 : 0 }}>
            {showAddSSID ? (
              <ColorPalette onSelect={setCurColor} selectedIdx={curColor} />
            ) : (
              <></>
            )}
          </View>
        </View>
      ) : schemeType === 1 ? (
        <View
          style={{
            flex: 1,
            width: "100%",
            alignItems: "center",
            flexDirection: "row",
            paddingHorizontal: 12,
            justifyContent: "space-between",
            borderWidth: 1,
            borderColor: "white",
          }}
        >
          <TSCaptionText
            textStyles={{ color: theme.palette.text, textAlign: "left" }}
          >
            Constant
          </TSCaptionText>
          <Switch
            value={allowMarkConstant}
            onValueChange={(v) => {
              console.log("Allow mark constant", v);
              setAllowMarkConstant(v);
            }}
            trackColor={{
              true: theme.palette.primary.contrastText,
              false: theme.palette.darkGray,
            }}
            thumbColor={
              allowMarkConstant
                ? theme.palette.primary.main
                : theme.palette.gray
            }
          />
        </View>
      ) : (
        <></>
      )}
    </View>
  );
};

// List of buttons that have text to display the workout item and different press behavior depending on state
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
  updateItemConstant(n: number): void;
  removeItem(n: number): void;
  requestUpdate: (item: WorkoutItemProps | WorkoutDualItemProps | null) => void;
}> = ({
  items,
  schemeType,
  curColor,
  showAddSSID,
  itemToUpdate,

  setShowAddSSID,
  setCurColor,
  removeItemSSID,
  addItemToSSID,
  updateItemConstant,
  removeItem,
  requestUpdate,
}) => {
  const theme = useTheme();
  const [allowMarkConstant, setAllowMarkConstant] = useState(false);
  const [allowDeleteInUpdateMode, setAllowDeleteInUpdateMode] = useState(false);

  const RowItemOnPress = (
    idx: number,
    item: WorkoutItemProps | WorkoutDualItemProps,
    _showAddSSID: boolean,
    _allowMarkConstant: boolean,
    _allowDeleteInUpdateMode: boolean
  ) => {
    // We need to change the button behavior for item row when pressed, depending on the state
    // If we need to mark the row as constant or group w/ SSID then we can do that in the first block
    // If we need to modify the row item, we can do that in the second block
    //    To modify we can remove the item or update it.
    // We can add another switch to toggle update mode

    if (_showAddSSID || _allowMarkConstant) {
      if (WORKOUT_TYPES[schemeType] == STANDARD_W) {
        item.ssid >= 0
          ? removeItemSSID(idx)
          : curColor > -1
          ? addItemToSSID(idx)
          : console.log("Select a color first!");
      } else if (WORKOUT_TYPES[schemeType] == REPS_W) {
        updateItemConstant(idx);
      }
    } else {
      if (_allowDeleteInUpdateMode) {
        console.log("Setting item to update: ", item);
        requestUpdate(item);
      } else {
        removeItem(idx);
      }
    }
  };

  return (
    <View
      style={{
        flex: 4,
        width: "100%",
        height: "100%",
      }}
    >
      <ListToggles
        allowDeleteInUpdateMode={allowDeleteInUpdateMode}
        schemeType={schemeType}
        curColor={curColor}
        allowMarkConstant={allowMarkConstant}
        showAddSSID={showAddSSID}
        setShowAddSSID={setShowAddSSID}
        setCurColor={setCurColor}
        setAllowMarkConstant={setAllowMarkConstant}
        setAllowDeleteInUpdateMode={setAllowDeleteInUpdateMode}
      />

      <View>
        <ScrollView>
          {items.map((item, idx) => {
            const isCurrentUpdateItem = itemToUpdate?.uuid === item.uuid;

            return (
              <ItemRowButton
                key={`item_test_${Math.random()}`}
                idx={idx}
                item={item}
                isCurrentUpdateItem={isCurrentUpdateItem}
                showAddSSID={showAddSSID}
                allowMarkConstant={allowMarkConstant}
                RowItemOnPress={RowItemOnPress}
                allowDeleteInUpdateMode={allowDeleteInUpdateMode}
              >
                <View
                  style={{
                    height: SCREEN_HEIGHT * 0.05,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <View style={{ flex: 10 }}>
                    <ItemString item={item} schemeType={schemeType} prefix="" />
                  </View>
                  <View style={{ flex: 1 }}>
                    {WORKOUT_TYPES[schemeType] == STANDARD_W ? (
                      <Icon
                        name="person"
                        color={
                          item.ssid >= 0
                            ? COLORSPALETTE[item.ssid]
                            : theme.palette.text
                        }
                      />
                    ) : (
                      <Icon
                        name="person"
                        color={
                          item.constant ? COLORSPALETTE[0] : theme.palette.text
                        }
                      />
                    )}
                  </View>
                </View>
              </ItemRowButton>
            );
          })}
        </ScrollView>
        {/* {
          allowDeleteInUpdateMode?
          :
          <ScrollView>
          {items.map((item, idx) => {
            return (
              <ItemRowButton
                key={`item_test_${Math.random()}`}
                idx={idx}
                item={item}
                showAddSSID={showAddSSID}
                allowMarkConstant={allowMarkConstant}
                allowDeleteInUpdateMode={allowDeleteInUpdateMode}
                RowItemOnPress={RowItemOnPress}
              >
                <View
                  style={{
                    height: SCREEN_HEIGHT * 0.05,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <View style={{ flex: 10 }}>
                    <ItemString item={item} schemeType={schemeType} prefix="" />
                  </View>
                  <View style={{ flex: 1 }}>
                    {WORKOUT_TYPES[schemeType] == STANDARD_W ? (
                      <Icon
                        name="person"
                        color={
                          item.ssid >= 0
                            ? COLORSPALETTE[item.ssid]
                            : theme.palette.text
                        }
                      />
                    ) : (
                      <Icon
                        name="person"
                        color={
                          item.constant ? COLORSPALETTE[0] : theme.palette.text
                        }
                      />
                    )}
                  </View>
                </View>
              </ItemRowButton>
            );
          })}
        </ScrollView>
        } */}
      </View>
    </View>
  );
};

export default CreateWorkoutItemList;
