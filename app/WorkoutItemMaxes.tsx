// components/WorkoutMaxes.js
import React, {
  useState,
  useEffect,
  useCallback,
  FunctionComponent,
  useMemo,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import {
  useGetUserWorkoutMaxesQuery,
  useGetWorkoutNamesQuery,
  useUpdateWorkoutMaxMutation,
} from "@/src/redux/api/apiSlice";
import { useLocalSearchParams, useRouter } from "expo-router";
import { WorkoutNameProps } from "@/src/app_components/Cards/types";
import { useTheme } from "styled-components/native";
import { debounce, filter } from "@/src/utils/algos";
import Input from "@/src/app_components/Input/input";
import PickerFilterListView from "@/src/app_components/modals/pickerFilterListView";
import { SCREEN_HEIGHT, lightenHexColor } from "@/src/app_components/shared";
import FullScreenSpinner from "@/src/app_components/Spinner";
import { TSSnippetText } from "@/src/app_components/Text/Text";
// import debounce from 'lodash/debounce';

export interface CurrentMaxProps {
  id: string;
  max_value: number;
  unit: string;
  last_updated: string;
}

export interface WorkoutMaxProps {
  id: string;
  name: string;
  current_max: CurrentMaxProps;
}

// Separate component for editing max value
const EditWorkoutMax = ({
  workoutNameId,
  initialValue = "",
  initialUnit = "lb",
  onSave,
  onCancel,
  theme,
}) => {
  const [value, setValue] = useState(initialValue);
  const [unit, setUnit] = useState(initialUnit);
  const [isUpdating, setIsUpdating] = useState(false);

  // Toggle unit and convert value
  const toggleUnit = () => {
    const newUnit = unit === "kg" ? "lb" : "kg";
    setUnit(newUnit);

    // Convert the value when changing units
    if (value && !isNaN(parseFloat(value))) {
      if (unit === "kg") {
        // Convert kg to lb (1 kg = 2.20462 lb)
        setValue((parseFloat(value) * 2.20462).toFixed(1));
      } else {
        // Convert lb to kg (1 lb = 0.453592 kg)
        setValue((parseFloat(value) * 0.453592).toFixed(1));
      }
    }
  };

  // Handle save
  const handleSave = async () => {
    if (!value || isNaN(parseFloat(value))) {
      Alert.alert(
        "Invalid Value",
        "Please enter a valid number for the max value."
      );
      return;
    }

    setIsUpdating(true);
    try {
      await onSave(workoutNameId, parseFloat(value), unit);
    } catch (err) {
      Alert.alert("Error", "Failed to update max value. Please try again.");
      console.error("Failed to update max:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <View style={styles.editContainer}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={setValue}
        keyboardType="numeric"
        autoFocus
        selectTextOnFocus
      />

      <TouchableOpacity style={styles.unitToggleButton} onPress={toggleUnit}>
        <Text style={styles.unitToggleText}>{unit}</Text>
      </TouchableOpacity>

      <View style={styles.editActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.cancelButton]}
          onPress={onCancel}
          disabled={isUpdating}
        >
          <Text
            style={[styles.actionButtonText, { color: theme.palette.gray }]}
          >
            Cancel
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.saveButton,
            { backgroundColor: theme.palette.AWE_Green },
          ]}
          onPress={handleSave}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text
              style={[styles.actionButtonText, { color: theme.palette.text }]}
            >
              Save
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

interface WorkoutItemRowProps {
  item: WorkoutMaxProps;
  maxItem?: WorkoutMaxProps;
  onEdit: (id: string | null) => void;
  onSaveMax: (id: string, value: number, unit: string) => Promise<void>;
  editingId: string | null;
  onViewHistory: (item: WorkoutMaxProps) => void;
  theme: any;
}
// Individual workout item component with its own state management
const WorkoutItemRow: FunctionComponent<WorkoutItemRowProps> = React.memo(
  ({ item, maxItem, onEdit, onSaveMax, editingId, onViewHistory, theme }) => {
    const isEditing = editingId === item.id;

    return (
      <View
        style={[
          styles.itemContainer,
          {
            backgroundColor: theme.palette.backgroundColor,
            borderWidth: 1,
            borderColor: theme.palette.AWE_Yellow,
          },
        ]}
      >
        <View style={styles.itemHeader}>
          <Text
            style={[
              styles.itemName,
              { color: lightenHexColor(theme.palette.primary.main, 1.35) },
            ]}
          >
            {item.name}
          </Text>

          <TouchableOpacity
            style={[
              styles.historyButton,
              { backgroundColor: lightenHexColor(theme.palette.text, 0.92) },
            ]}
            onPress={() => onViewHistory(item)}
          >
            <Ionicons
              name="time-outline"
              size={20}
              color={theme.palette.AWE_Green}
            />
            <Text
              style={[
                styles.historyButtonText,
                { color: theme.palette.AWE_Green },
              ]}
            >
              History
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.maxContainer}>
          {!isEditing ? (
            // Display current max value
            <View style={styles.currentMaxContainer}>
              <Text style={[styles.maxLabel, { color: theme.palette.text }]}>
                Current Max:
              </Text>
              <Text
                style={[
                  styles.maxValue,
                  { color: lightenHexColor(theme.palette.AWE_Red, 0.92) },
                ]}
              >
                {maxItem?.current_max
                  ? `${maxItem.current_max.max_value} ${maxItem.current_max.unit}`
                  : "Not set"}
              </Text>
              <TouchableOpacity
                style={[
                  styles.editButton,
                  {
                    backgroundColor: lightenHexColor(theme.palette.text, 0.25),
                  },
                ]}
                onPress={() => onEdit(item.id)}
              >
                <Ionicons
                  name="pencil"
                  size={16}
                  color={theme.palette.AWE_Green}
                />
              </TouchableOpacity>
            </View>
          ) : (
            // Edit max value form with its own component
            <EditWorkoutMax
              workoutNameId={item.id}
              initialValue={
                maxItem?.current_max
                  ? maxItem.current_max.max_value.toString()
                  : ""
              }
              initialUnit={
                maxItem?.current_max ? maxItem.current_max.unit : "lb"
              }
              onSave={onSaveMax}
              onCancel={() => onEdit(null)}
              theme={theme}
            />
          )}
        </View>
      </View>
    );
  }
);

const WorkoutMaxes = () => {
  const theme = useTheme();
  const params = useLocalSearchParams();
  const router = useRouter();

  // Local state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [filteredIndices, setFilteredIndices] = useState<number[]>([]);

  // API queries
  const { data: _workoutNames, isLoading: isItemsLoading } =
    useGetWorkoutNamesQuery("");
  const workoutNames = _workoutNames as WorkoutNameProps[];
  const {
    data: workoutItemMaxes,
    isLoading,
    error: getWorkoutsError,
    refetch,
  } = useGetUserWorkoutMaxesQuery(params.userID);

  const [updateWorkoutMax] = useUpdateWorkoutMaxMutation();

  // Create a map of workout maxes for quick lookup
  const workoutItemMaxesMap = useMemo(() => {
    if (!workoutItemMaxes) return new Map();

    return new Map(
      workoutItemMaxes.map((wnm: WorkoutMaxProps) => [wnm.id, wnm])
    );
  }, [workoutItemMaxes]);

  // Create a memoized array of workout names
  const workoutNameStrings = useMemo(() => {
    if (!workoutNames) return [];
    return workoutNames.map((item) => item.name);
  }, [workoutNames]);

  // Handle initial filter setup
  useEffect(() => {
    if (workoutNames && workoutNames.length > 0) {
      setFilteredIndices(Array.from(Array(workoutNames.length).keys()));
    }
  }, [workoutNames]);

  // Create a debounced filter function
  const debouncedFilter = useCallback(
    debounce((term: string) => {
      if (!workoutNameStrings.length) return;

      const { items } = filter(term, workoutNameStrings, { word: false });
      setFilteredIndices(items);
    }, 300),
    [workoutNameStrings]
  );

  // Handle search input change
  const handleSearchChange = useCallback(
    (text: string) => {
      setSearchText(text);
      debouncedFilter(text);
    },
    [debouncedFilter]
  );

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  // Memoize filtered workout items
  const filteredWorkoutItems = useMemo(() => {
    if (!workoutNames) return [];
    return filteredIndices.map((index) => workoutNames[index]);
  }, [workoutNames, filteredIndices]);

  // Set editing item id
  const handleEdit = useCallback((id: string | null) => {
    setEditingId(id);
  }, []);

  // Save max value
  const handleSaveMax = useCallback(
    async (workoutNameId: string, maxValue: number, unit: string) => {
      await updateWorkoutMax({
        user_id: params.userID,
        workout_name_id: workoutNameId,
        max_value: maxValue,
        unit: unit,
        notes: "Updated from app",
      }).unwrap();

      setEditingId(null);
    },
    [params.userID, updateWorkoutMax]
  );

  // View history for a workout item
  const handleViewHistory = useCallback(
    (item: any) => {
      router.push({
        pathname: "/UserWorkoutMaxHistory",
        params: {
          workoutItemId: item.id,
          workoutName: item.name,
          userID: params.userID,
        },
      });
    },
    [router, params.userID]
  );

  // Render workout item row with memoization
  const renderWorkoutItem = useCallback(
    (props: any) => {
      const item = props.workoutName;
      const maxItem = workoutItemMaxesMap.get(item.id);

      return (
        <WorkoutItemRow
          item={item}
          maxItem={maxItem}
          editingId={editingId}
          onEdit={handleEdit}
          onSaveMax={handleSaveMax}
          onViewHistory={handleViewHistory}
          theme={theme}
        />
      );
    },
    [
      workoutItemMaxesMap,
      editingId,
      handleEdit,
      handleSaveMax,
      handleViewHistory,
      theme,
    ]
  );

  // Loading state
  if (isLoading || isItemsLoading) {
    return (
      <View
        style={[
          styles.centered,
          { backgroundColor: theme.palette.backgroundColor },
        ]}
      >
        {/* <ActivityIndicator size="large" color="#4a90e2" /> */}
        <FullScreenSpinner />
        <Text style={styles.loadingText}>Loading workout items...</Text>
      </View>
    );
  }

  // Error state
  // || "Failed to load workout items"
  if (getWorkoutsError) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle" size={48} color="#e74c3c" />
        <Text style={styles.errorText}>
          {getWorkoutsError
            ? getWorkoutsError.toString()
            : "Failed to load workout items"}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={refetch}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.palette.backgroundColor },
      ]}
    >
      <TSSnippetText
        textStyles={[styles.description, { color: theme.palette.text }]}
      >
        Record your current max for each exercise. This helps calculate your
        intensity factor during workouts.
      </TSSnippetText>

      {/* Search input */}
      <View
        style={{
          height: 45,
          borderWidth: 1,
          borderColor: theme.palette.text,
          marginBottom: 12,
          borderRadius: 8,
        }}
      >
        <Input
          onChangeText={handleSearchChange}
          value={searchText}
          inputStyles={{ fontSize: 14 }}
          focus={false}
          containerStyle={{
            width: "100%",
            backgroundColor: theme.palette.backgroundColor,
            borderRadius: 8,
            height: "100%",
          }}
          leading={
            <Icon
              name="search"
              style={{ fontSize: 16 }}
              color={theme.palette.text}
            />
          }
          label=""
          placeholder="Search exercises..."
        />
      </View>

      {/* List view */}
      <View style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={
            Platform.OS === "ios" ? SCREEN_HEIGHT * 0.3 : 0
          }
          style={{ flex: 1 }}
        >
          <PickerFilterListView
            data={filteredWorkoutItems}
            extraProps={{
              onSelect: (item: WorkoutNameProps) =>
                console.log("User selected: ", item),
            }}
            RowView={renderWorkoutItem}
          />
        </KeyboardAvoidingView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  description: {
    fontSize: 16,
    marginBottom: 16,
    lineHeight: 22,
  },
  listContainer: {
    paddingBottom: 20,
  },
  itemContainer: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  itemName: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
  },
  historyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f7ff",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  historyButtonText: {
    color: "#4a90e2",
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 4,
  },
  maxContainer: {
    marginTop: 8,
  },
  currentMaxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  maxLabel: {
    fontSize: 12,
    color: "#666",
    marginRight: 8,
  },
  maxValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  editContainer: {
    marginTop: 8,
  },
  input: {
    backgroundColor: "#f6f6f6",
    borderRadius: 8,
    fontSize: 18,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  unitToggleButton: {
    alignSelf: "flex-start",
    backgroundColor: "#eee",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
  },
  unitToggleText: {
    fontWeight: "bold",
    color: "#666",
  },
  editActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    marginLeft: 12,
    minWidth: 80,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#eee",
  },
  saveButton: {
    backgroundColor: "#4a90e2",
  },
  actionButtonText: {
    fontWeight: "bold",
    color: "#fff",
  },
  errorText: {
    marginTop: 12,
    marginBottom: 20,
    fontSize: 16,
    color: "#e74c3c",
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#4a90e2",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  emptyContainer: {
    padding: 30,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
  },
});

export default WorkoutMaxes;
