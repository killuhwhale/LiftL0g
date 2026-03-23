import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTheme } from "styled-components";
import Icon from "react-native-vector-icons/Ionicons";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import {
  BottomSheetModal,
  BottomSheetFlatList,
  BottomSheetBackdrop,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import { filter } from "@/src/utils/algos";
import { WorkoutNameProps } from "../Cards/types";
import { TestIDs } from "@/src/utils/constants";
import { WorkoutNameRowItem } from "./pickerFilterListView";
import { TSButtonText, TSCaptionText } from "../Text/Text";

const FilterItemsModal: FunctionComponent<{
  modalVisible: boolean;
  onRequestClose(): void;
  items: WorkoutNameProps[];
  extraProps?: any;
  searchTextPlaceHolder: string;
}> = (props) => {
  const theme = useTheme();
  const sheetRef = useRef<BottomSheetModal>(null);

  const snapPoints = useMemo(() => ["78%"], []);

  // Open / close in response to modalVisible
  useEffect(() => {
    if (props.modalVisible) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
    }
  }, [props.modalVisible]);

  // ── Filter state ──────────────────────────────────────────────────────────

  const [stringData, setOgData] = useState<string[]>(
    props.items ? props.items.map((w) => w.name) : []
  );
  const [filterResult, setFilterResult] = useState<number[]>(
    Array.from(Array(stringData.length).keys())
  );
  const [term, setTerm] = useState("");

  const filterText = (t: string) => {
    const { items } = filter(t, stringData, { word: false });
    setFilterResult(items);
    setTerm(t);
  };

  useEffect(() => {
    setOgData(props.items ? props.items.map((w) => w.name) : []);
    setFilterResult(Array.from(Array(props.items?.length || 0).keys()));
  }, [props.items]);

  const filteredData = props.items.filter((_, i) => filterResult.indexOf(i) >= 0);
  const resultCount = filteredData.length;

  // ── Backdrop ──────────────────────────────────────────────────────────────

  const renderBackdrop = useCallback(
    (backdropProps: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...backdropProps}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.55}
        pressBehavior="close"
      />
    ),
    []
  );

  // ── Row renderer ──────────────────────────────────────────────────────────

  const renderItem = useCallback(
    ({ item }: { item: WorkoutNameProps }) => (
      <WorkoutNameRowItem {...props.extraProps} workoutName={item} />
    ),
    [props.extraProps]
  );

  // ── Sheet styling ─────────────────────────────────────────────────────────

  const sheetStyle = useMemo(
    () => ({
      backgroundColor: theme.palette.darkGray,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 20,
    }),
    [theme]
  );

  const handleIndicatorStyle = useMemo(
    () => ({
      backgroundColor: `${theme.palette.lightGray}66`,
      width: 40,
      height: 4,
    }),
    [theme]
  );

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      onDismiss={props.onRequestClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={sheetStyle}
      handleIndicatorStyle={handleIndicatorStyle}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View>
          <TSButtonText textStyles={{ fontWeight: "700", fontSize: 16 }}>
            Select Exercise
          </TSButtonText>
          <TSCaptionText
            textStyles={{ fontSize: 11, opacity: 0.5, marginTop: 1 }}
          >
            {resultCount} result{resultCount !== 1 ? "s" : ""}
          </TSCaptionText>
        </View>
        <TouchableOpacity
          onPress={props.onRequestClose}
          style={[
            styles.closeBtn,
            { backgroundColor: `${theme.palette.lightGray}18` },
          ]}
        >
          <Icon name="close" size={18} color={theme.palette.text} />
        </TouchableOpacity>
      </View>

      {/* ── Search input ────────────────────────────────────────────────── */}
      <View style={styles.searchRow}>
        <View
          style={[
            styles.searchContainer,
            {
              backgroundColor: theme.palette.backgroundColor,
              borderColor: `${theme.palette.AWE_Green}44`,
            },
          ]}
        >
          <Icon
            name="search"
            size={16}
            color={theme.palette.lightGray}
            style={styles.searchIcon}
          />
          {/* BottomSheetTextInput keeps keyboard open while sheet is active */}
          <BottomSheetTextInput
            testID={TestIDs.AddItemFilterModalInputField.name()}
            value={term}
            onChangeText={filterText}
            placeholder={props.searchTextPlaceHolder}
            placeholderTextColor={theme.palette.lightGray}
            autoCapitalize="none"
            style={[styles.searchInput, { color: theme.palette.text }]}
            autoFocus
          />
          {term.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setTerm("");
                setFilterResult(
                  Array.from(Array(props.items?.length || 0).keys())
                );
              }}
            >
              <Icon
                name="close-circle"
                size={16}
                color={`${theme.palette.lightGray}88`}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Results list ────────────────────────────────────────────────── */}
      <BottomSheetFlatList
        data={filteredData}
        keyboardShouldPersistTaps="always"
        keyExtractor={(item: WorkoutNameProps) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 14,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  searchRow: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 46,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  listContent: {
    paddingBottom: 40,
  },
});

export default FilterItemsModal;
