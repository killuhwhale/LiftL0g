import React, { FunctionComponent, useState } from "react";
import styled from "styled-components/native";
import {
  Container,
  displayJList,
  WORKOUT_TYPES,
  DISTANCE_UNITS,
  DURATION_UNITS,
  REPS_W,
  ROUNDS_W,
  parseNumList,
} from "../src/app_components/shared";
import {
  TSCaptionText,
  TSListTitleText,
  TSParagrapghText,
  TSTitleText,
  TSDateText,
  TSSnippetText,
} from "../src/app_components/Text/Text";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { StatsPanel } from "../src/app_components/Stats/StatsPanel";
import BannerAddMembership from "../src/app_components/ads/BannerAd";
import { useLocalSearchParams } from "expo-router";
import { useGetWorkoutByIDQuery } from "@/src/redux/api/apiSlice";
import { useTheme } from "styled-components/native";
import { AnyWorkoutItem } from "@/src/app_components/Cards/types";
import { COLORSPALETTE, formatLongWorkoutDate } from "@/src/utils/algos";
import Icon from "react-native-vector-icons/Ionicons";
import ActionCancelModal from "@/src/app_components/modals/ActionCancelModal";

const ScreenContainer = styled(Container)`
  background-color: ${(props) => props.theme.palette.backgroundColor};
  justify-content: flex-start;
  width: 100%;
  padding: 16px;
`;

// ── Helpers ──────────────────────────────────────────────────────────────────

function buildMetricLine(item: AnyWorkoutItem, schemeType: number): string {
  const setsPrefix = schemeType === 0 && item.sets > 1 ? `${item.sets} × ` : "";
  if (item.reps !== "[0]")
    return `${setsPrefix}${displayJList(item.reps)} Reps`;
  if (item.distance !== "[0]")
    return `${setsPrefix}${displayJList(item.distance)} ${DISTANCE_UNITS[item.distance_unit]}`;
  if (item.duration !== "[0]")
    return `${setsPrefix}${displayJList(item.duration)} ${DURATION_UNITS[item.duration_unit]}`;
  return "";
}

function buildWeightLine(item: AnyWorkoutItem): string {
  try {
    const weights = JSON.parse(item.weights);
    if (!weights.length || weights[0] === 0) return "";
    const w = displayJList(item.weights);
    if (item.weight_unit === "%") return `@ ${w}% of ${item.percent_of}`;
    return `@ ${w} ${item.weight_unit}`;
  } catch {
    return "";
  }
}

// ── ChecklistItem ─────────────────────────────────────────────────────────────

const ChecklistItem: FunctionComponent<{
  item: AnyWorkoutItem;
  schemeType: number;
  checked: boolean;
  onToggle: () => void;
  onIncrement?: () => void;
  onDecrement?: () => void;
  roundCount?: number;
  checkedRounds?: boolean[];
}> = ({
  item,
  schemeType,
  checked,
  onToggle,
  onIncrement,
  onDecrement,
  roundCount = 0,
  checkedRounds = [],
}) => {
  const theme = useTheme();
  const metricLine = buildMetricLine(item, schemeType);
  const weightLine = buildWeightLine(item);
  const isSuperset = schemeType === 0 && item.ssid >= 0;
  const ssColor = isSuperset ? COLORSPALETTE[item.ssid] : undefined;
  const usesRoundChecklist =
    WORKOUT_TYPES[schemeType] === REPS_W || WORKOUT_TYPES[schemeType] === ROUNDS_W;
  const allRoundsChecked =
    usesRoundChecklist &&
    roundCount > 0 &&
    checkedRounds.length === roundCount &&
    checkedRounds.every(Boolean);

  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 12,
          paddingHorizontal: 4,
          opacity: usesRoundChecklist ? (allRoundsChecked ? 0.4 : 1) : checked ? 0.4 : 1,
        }}
      >
        {/* Superset left border */}
        {isSuperset && (
          <View
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: 3,
              backgroundColor: ssColor,
              borderRadius: 2,
            }}
          />
        )}

        {/* Checkbox icon */}
        {!usesRoundChecklist ? (
          <TouchableOpacity onPress={onToggle} activeOpacity={0.7}>
            <Icon
              name={checked ? "checkmark-circle" : "ellipse-outline"}
              color={checked ? theme.palette.AWE_Green : theme.palette.text}
              style={{ fontSize: 26, marginRight: 14, marginLeft: isSuperset ? 8 : 0 }}
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={onDecrement}
            activeOpacity={0.7}
            style={{
              width: 30,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 10,
              marginLeft: isSuperset ? 8 : 0,
            }}
          >
            <Icon
              name="remove-circle-outline"
              color={theme.palette.AWE_Red ?? theme.palette.text}
              style={{ fontSize: 22 }}
            />
            <TSCaptionText textStyles={{ opacity: 0.7, fontSize: 10 }}>
              -
            </TSCaptionText>
          </TouchableOpacity>
        )}

        {/* Exercise details */}
        <TouchableOpacity
          onPress={usesRoundChecklist ? onIncrement : onToggle}
          activeOpacity={0.7}
          style={{ flex: 1 }}
        >
          <TSListTitleText
            textStyles={{
              textDecorationLine:
                usesRoundChecklist
                  ? allRoundsChecked
                    ? "line-through"
                    : "none"
                  : checked
                  ? "line-through"
                  : "none",
            }}
          >
            {item.name.name}
          </TSListTitleText>

          {metricLine ? (
            <TSCaptionText>{metricLine}</TSCaptionText>
          ) : null}

          {weightLine ? (
            <TSCaptionText>{weightLine}</TSCaptionText>
          ) : null}

          {item.constant ? (
            <TSCaptionText>per round</TSCaptionText>
          ) : null}

          {item.pause_duration > 0 ? (
            <TSCaptionText>Hold: {item.pause_duration}s</TSCaptionText>
          ) : null}

          {item.rest_duration > 0 ? (
            <TSCaptionText>
              Rest: {item.rest_duration} {DURATION_UNITS[item.rest_duration_unit]}
            </TSCaptionText>
          ) : null}

          {item.penalty ? (
            <TSCaptionText
              textStyles={{ color: theme.palette.AWE_Red ?? "#ef4444" }}
            >
              Penalty: {item.penalty}
            </TSCaptionText>
          ) : null}

          {usesRoundChecklist && roundCount > 0 ? (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
              {Array.from({ length: roundCount }, (_, roundIdx) => {
                const roundChecked = checkedRounds[roundIdx] ?? false;
                return (
                  <View
                    key={`${item.id}-round-${roundIdx}`}
                    style={{ alignItems: "center" }}
                  >
                    <Icon
                      name={roundChecked ? "checkmark-circle" : "ellipse-outline"}
                      color={roundChecked ? theme.palette.AWE_Green : theme.palette.text}
                      style={{ fontSize: 22 }}
                    />
                    <TSCaptionText textStyles={{ opacity: 0.7, fontSize: 10 }}>
                      {roundIdx + 1}
                    </TSCaptionText>
                  </View>
                );
              })}
            </View>
          ) : null}
        </TouchableOpacity>

        {usesRoundChecklist ? (
          <TouchableOpacity
            onPress={onIncrement}
            activeOpacity={0.7}
            style={{
              width: 30,
              alignItems: "center",
              justifyContent: "center",
              marginLeft: 10,
            }}
          >
            <Icon
              name="add-circle-outline"
              color={theme.palette.AWE_Green}
              style={{ fontSize: 22 }}
            />
            <TSCaptionText textStyles={{ opacity: 0.7, fontSize: 10 }}>
              +
            </TSCaptionText>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Row separator */}
      <View
        style={{
          height: 1,
          backgroundColor: theme.palette.text,
          opacity: 0.08,
          marginLeft: 44,
        }}
      />
    </View>
  );
};

// ── MasterCheckboxRow ─────────────────────────────────────────────────────────

const MasterCheckboxRow: FunctionComponent<{
  total: number;
  checkedCount: number;
  onToggleAll: () => void;
}> = ({ total, checkedCount, onToggleAll }) => {
  const theme = useTheme();
  const allChecked = checkedCount === total;
  const someChecked = checkedCount > 0 && !allChecked;

  const iconName = allChecked
    ? "checkmark-circle"
    : someChecked
    ? "remove-circle-outline"
    : "ellipse-outline";

  return (
    <TouchableOpacity onPress={onToggleAll} activeOpacity={0.7}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 10,
          borderBottomWidth: 1,
          borderBottomColor: theme.palette.text,
          marginBottom: 4,
          opacity: 0.9,
        }}
      >
        <Icon
          name={iconName}
          color={allChecked ? theme.palette.AWE_Green : theme.palette.text}
          style={{ fontSize: 24, marginRight: 14 }}
        />
        <TSSnippetText>
          {checkedCount} / {total} complete
        </TSSnippetText>
        <View style={{ flex: 1 }} />
        <TSCaptionText
          textStyles={{ color: theme.palette.AWE_Green }}
        >
          {allChecked ? "Deselect All" : "Select All"}
        </TSCaptionText>
      </View>
    </TouchableOpacity>
  );
};

// ── Screen ────────────────────────────────────────────────────────────────────

const WorkoutDetailScreen: FunctionComponent = () => {
  const params = useLocalSearchParams();
  const theme = useTheme();

  const {
    id,
    title: _title,
    desc: _desc,
    scheme_rounds: _scheme_rounds,
    scheme_type: _scheme_type,
    instruction: _instruction,
    for_date: _for_date,
    ownedByClass: _ownedByClass,
  } = params || {};

  const title = _title as string;
  const desc = _desc as string;
  const scheme_rounds = _scheme_rounds as string;
  const scheme_type = parseInt(_scheme_type as string);
  const instruction = _instruction as string;
  const for_date = _for_date as string;

  const {
    data: workout,
    isLoading,
    isSuccess,
  } = useGetWorkoutByIDQuery(id);

  const items: AnyWorkoutItem[] =
    isSuccess && !isLoading ? workout.workout_items : [];

  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [pendingAction, setPendingAction] = useState<null | (() => void)>(null);

  const getRoundCount = () => {
    const workoutType = WORKOUT_TYPES[scheme_type];
    if (workoutType === REPS_W) {
      const repsPerRound = parseNumList(scheme_rounds ?? "");
      return repsPerRound.filter((n) => n > 0).length;
    }
    if (workoutType === ROUNDS_W) {
      const rounds = parseInt(scheme_rounds ?? "", 10);
      return Number.isFinite(rounds) && rounds > 0 ? rounds : 0;
    }
    return 0;
  };

  const roundCount = getRoundCount();
  const usesRoundChecklist =
    WORKOUT_TYPES[scheme_type] === REPS_W || WORKOUT_TYPES[scheme_type] === ROUNDS_W;
  const getItemKey = (itemId: number) => `item-${itemId}`;
  const getItemRoundKey = (itemId: number, roundIdx: number) =>
    `item-${itemId}-round-${roundIdx}`;
  const getAllChecklistKeys = () =>
    items.flatMap((item) =>
      usesRoundChecklist && roundCount > 0
        ? Array.from({ length: roundCount }, (_, roundIdx) =>
            getItemRoundKey(item.id, roundIdx)
          )
        : [getItemKey(item.id)]
    );

  const toggle = (id: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (!usesRoundChecklist || roundCount <= 0) {
        const itemKey = getItemKey(id);
        next.has(itemKey) ? next.delete(itemKey) : next.add(itemKey);
        return next;
      }
      return next;
    });
  };

  const incrementRoundProgress = (id: number) => {
    if (!usesRoundChecklist || roundCount <= 0) {
      toggle(id);
      return;
    }

    setChecked((prev) => {
      const next = new Set(prev);
      const roundKeys = Array.from({ length: roundCount }, (_, roundIdx) =>
        getItemRoundKey(id, roundIdx)
      );
      const checkedRoundsForItem = roundKeys.filter((key) => next.has(key)).length;

      if (checkedRoundsForItem < roundCount) {
        next.add(roundKeys[checkedRoundsForItem]);
      }
      return next;
    });
  };

  const decrementRoundProgress = (id: number) => {
    if (!usesRoundChecklist || roundCount <= 0) {
      toggle(id);
      return;
    }

    setChecked((prev) => {
      const next = new Set(prev);
      const roundKeys = Array.from({ length: roundCount }, (_, roundIdx) =>
        getItemRoundKey(id, roundIdx)
      );
      const checkedRoundsForItem = roundKeys.filter((key) => next.has(key)).length;

      if (checkedRoundsForItem > 0) {
        next.delete(roundKeys[checkedRoundsForItem - 1]);
      }
      return next;
    });
  };

  const toggleAll = () => {
    const allKeys = getAllChecklistKeys();
    const action = () => {
      if (checked.size === allKeys.length) {
        setChecked(new Set());
      } else {
        setChecked(new Set(allKeys));
      }
    };

    setConfirmText(
      checked.size === allKeys.length
        ? "Clear all checklist progress?"
        : "Mark all checklist items as complete?"
    );
    setPendingAction(() => action);
    setConfirmVisible(true);
  };

  const runPendingAction = () => {
    pendingAction?.();
    setConfirmVisible(false);
    setPendingAction(null);
  };

  const closeConfirm = () => {
    setConfirmVisible(false);
    setPendingAction(null);
  };

  const tags = workout?.stats?.tags ?? {};
  const names = workout?.stats?.items ?? {};

  const validRounds =
    scheme_rounds?.length > 0 && !scheme_rounds.includes("undefined");
  const schemePillLabel = `${WORKOUT_TYPES[scheme_type] ?? ""}${
    validRounds ? `  ·  ${displayJList(scheme_rounds)}` : ""
  }`;

  return (
    <ScreenContainer>
      <BannerAddMembership />

      <ScrollView
        style={{ flex: 1, width: "100%" }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={{ marginBottom: 16 }}>
          {/* Title row */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              justifyContent: "space-between",
              marginBottom: 4,
            }}
          >
            <TSTitleText textStyles={{ flex: 1, marginRight: 8 }}>
              {title?.length > 0 ? title : "Untitled workout"}
            </TSTitleText>

            {/* Exercises count badge */}
            <TSSnippetText
              textStyles={{ color: theme.palette.accent, marginTop: 4 }}
            >
              {isSuccess && !isLoading
                ? `Exercises (${workout.workout_items.length})`
                : "—"}
            </TSSnippetText>
          </View>

          {/* Scheme pill */}
          <View
            style={{
              alignSelf: "flex-start",
              borderWidth: 1,
              borderColor: theme.palette.accent,
              borderRadius: 12,
              paddingHorizontal: 10,
              paddingVertical: 3,
              marginBottom: 8,
            }}
          >
            <TSCaptionText>{schemePillLabel}</TSCaptionText>
          </View>

          {desc?.length > 0 && (
            <TSParagrapghText textStyles={{ marginBottom: 4 }}>
              {desc}
            </TSParagrapghText>
          )}

          <TSDateText>
            {for_date
              ? formatLongWorkoutDate(for_date)
              : "Date unknown"}
          </TSDateText>
        </View>

        {/* ── Checklist ── */}
        {isSuccess && !isLoading && (
          <View style={{ width: "100%", marginBottom: 24 }}>
            {instruction && instruction !== "undefined" && (
              <TSCaptionText
                textStyles={{ marginBottom: 12, fontStyle: "italic" }}
              >
                {instruction}
              </TSCaptionText>
            )}

            <MasterCheckboxRow
              total={getAllChecklistKeys().length}
              checkedCount={checked.size}
              onToggleAll={toggleAll}
            />

            {items.map((item) => (
              <ChecklistItem
                key={item.id}
                item={item}
                schemeType={scheme_type}
                checked={checked.has(getItemKey(item.id))}
                roundCount={usesRoundChecklist ? roundCount : 0}
                checkedRounds={
                  usesRoundChecklist
                    ? Array.from(
                        { length: roundCount },
                        (_, roundIdx) => checked.has(getItemRoundKey(item.id, roundIdx))
                      )
                    : []
                }
                onToggle={() => toggle(item.id)}
                onIncrement={() => incrementRoundProgress(item.id)}
                onDecrement={() => decrementRoundProgress(item.id)}
              />
            ))}
          </View>
        )}

        {/* ── Stats (bottom) ── */}
        <View style={{ marginBottom: 32 }}>
          <StatsPanel tags={tags} names={names} />
        </View>
      </ScrollView>

      <ActionCancelModal
        modalVisible={confirmVisible}
        onRequestClose={closeConfirm}
        closeText="Cancel"
        actionText="Confirm"
        modalText={confirmText}
        onAction={runPendingAction}
      />
    </ScreenContainer>
  );
};

export default WorkoutDetailScreen;
