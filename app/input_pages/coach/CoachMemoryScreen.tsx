import React, { FunctionComponent, useCallback, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "styled-components/native";
import { router, useFocusEffect } from "expo-router";
import Icon from "react-native-vector-icons/Ionicons";
import {
  TSCaptionText,
  TSInputTextSm,
  TSParagrapghText,
  TSTitleText,
} from "@/src/app_components/Text/Text";
import {
  CoachMemory,
  clearCoachMemory,
  getCoachMemory,
  saveCoachMemory,
} from "@/src/utils/coachStorage";
import { Container } from "@/src/app_components/shared";
import styled from "styled-components/native";

const PageContainer = styled(Container)`
  background-color: ${(props) => props.theme.palette.backgroundColor};
  justify-content: flex-start;
  width: 100%;
`;

// ── Field config ───────────────────────────────────────────────────────────────

type MemoryKey = keyof Omit<CoachMemory, "last_updated">;

const FIELDS: {
  key: MemoryKey;
  label: string;
  icon: string;
  placeholder: string;
  multiline?: boolean;
}[] = [
  {
    key: "height",
    label: "Height",
    icon: "resize-outline",
    placeholder: "e.g. 5'10\"",
  },
  {
    key: "weight",
    label: "Weight",
    icon: "barbell-outline",
    placeholder: "e.g. 185 lbs",
  },
  {
    key: "diet",
    label: "Diet",
    icon: "nutrition-outline",
    placeholder: "e.g. mostly carnivore, avoids dairy",
    multiline: true,
  },
  {
    key: "health_conditions",
    label: "Health Notes",
    icon: "medkit-outline",
    placeholder: "e.g. bad left knee, no overhead pressing",
    multiline: true,
  },
  {
    key: "equipment",
    label: "Equipment",
    icon: "fitness-outline",
    placeholder: "e.g. home gym — barbell, dumbbells, pull-up bar",
    multiline: true,
  },
  {
    key: "schedule",
    label: "Training Schedule",
    icon: "calendar-outline",
    placeholder: "e.g. 4× per week, evenings",
  },
  {
    key: "notes",
    label: "Other Notes",
    icon: "document-text-outline",
    placeholder: "e.g. prefers compound lifts, hates cardio",
    multiline: true,
  },
];

// ── Field row ─────────────────────────────────────────────────────────────────

const FieldRow: FunctionComponent<{
  icon: string;
  label: string;
  placeholder: string;
  value: string;
  multiline?: boolean;
  onChangeText: (v: string) => void;
  onClear: () => void;
}> = ({ icon, label, placeholder, value, multiline, onChangeText, onClear }) => {
  const theme = useTheme();
  const hasValue = value.trim().length > 0;

  return (
    <View
      style={{
        marginBottom: 12,
        backgroundColor: theme.palette.darkGray,
        borderRadius: 12,
        padding: 14,
      }}
    >
      {/* Label row */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <Icon
          name={icon}
          size={16}
          color={theme.palette.AWE_Green}
          style={{ marginRight: 8 }}
        />
        <TSCaptionText
          textStyles={{ color: theme.palette.gray, flex: 1 }}
        >
          {label}
        </TSCaptionText>
        {hasValue && (
          <TouchableOpacity onPress={onClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Icon name="close-circle" size={18} color={theme.palette.gray} />
          </TouchableOpacity>
        )}
      </View>

      {/* Input */}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.palette.gray}
        multiline={multiline}
        style={{
          color: theme.palette.text,
          fontSize: 14,
          lineHeight: 20,
          minHeight: multiline ? 48 : undefined,
          textAlignVertical: multiline ? "top" : "center",
          paddingTop: multiline ? 2 : 0,
        }}
      />
    </View>
  );
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatLastUpdated = (ts?: number): string | null => {
  if (!ts) return null;
  const diff = Date.now() - ts;
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins < 1)   return "just now";
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

// ── Main screen ───────────────────────────────────────────────────────────────

const CoachMemoryScreen: FunctionComponent = () => {
  const theme = useTheme();

  const [lastUpdated, setLastUpdated] = useState<number | undefined>();
  const [isSaving, setIsSaving]       = useState(false);
  const [isDirty,  setIsDirty]        = useState(false);

  // One string state per field key
  const [fields, setFields] = useState<Record<MemoryKey, string>>({
    height:            "",
    weight:            "",
    diet:              "",
    health_conditions: "",
    equipment:         "",
    schedule:          "",
    notes:             "",
  });

  // ── Load on focus ───────────────────────────────────────────────────────────
  useFocusEffect(
    useCallback(() => {
      getCoachMemory().then((mem) => {
        if (mem) {
          setFields({
            height:            mem.height            ?? "",
            weight:            mem.weight            ?? "",
            diet:              mem.diet              ?? "",
            health_conditions: mem.health_conditions ?? "",
            equipment:         mem.equipment         ?? "",
            schedule:          mem.schedule          ?? "",
            notes:             mem.notes             ?? "",
          });
          setLastUpdated(mem.last_updated);
        }
        setIsDirty(false);
      });
    }, [])
  );

  // ── Handlers ────────────────────────────────────────────────────────────────
  const updateField = (key: MemoryKey, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  const clearField = (key: MemoryKey) => {
    setFields((prev) => ({ ...prev, [key]: "" }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const now = Date.now();
    const updated: CoachMemory = {
      last_updated: now,
    };
    // Only persist fields that have content
    (Object.keys(fields) as MemoryKey[]).forEach((key) => {
      const v = fields[key].trim();
      if (v) (updated as Record<string, unknown>)[key] = v;
    });
    await saveCoachMemory(updated);
    setLastUpdated(now);
    setIsDirty(false);
    setIsSaving(false);
  };

  const handleClearAll = () => {
    Alert.alert(
      "Clear All Memory",
      "Your coach will forget everything it has learned about you. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            await clearCoachMemory();
            setFields({
              height:            "",
              weight:            "",
              diet:              "",
              health_conditions: "",
              equipment:         "",
              schedule:          "",
              notes:             "",
            });
            setLastUpdated(undefined);
            setIsDirty(false);
          },
        },
      ]
    );
  };

  const hasAnyValue = Object.values(fields).some((v) => v.trim().length > 0);
  const updatedLabel = formatLastUpdated(lastUpdated);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.palette.backgroundColor }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
    >
      <PageContainer>
        {/* ── Header ── */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 12,
            borderBottomWidth: 1,
            borderBottomColor: theme.palette.darkGray,
          }}
        >
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
            <Icon name="chevron-back" size={26} color={theme.palette.text} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <TSTitleText textStyles={{ fontSize: 18 }}>Coach Memory</TSTitleText>
            {updatedLabel && (
              <TSCaptionText textStyles={{ color: theme.palette.gray }}>
                Last updated {updatedLabel}
              </TSCaptionText>
            )}
          </View>
        </View>

        <ScrollView
          style={{ flex: 1, width: "100%" }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Info banner ── */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              backgroundColor: `${theme.palette.AWE_Green}18`,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: `${theme.palette.AWE_Green}44`,
              padding: 14,
              marginBottom: 20,
            }}
          >
            <Icon
              name="bulb-outline"
              size={18}
              color={theme.palette.AWE_Green}
              style={{ marginRight: 10, marginTop: 1 }}
            />
            <TSCaptionText textStyles={{ color: theme.palette.text, flex: 1, lineHeight: 18 }}>
              Your coach learns about you during conversations and uses this to
              give more personalised advice. Edit or clear anything below.
            </TSCaptionText>
          </View>

          {/* ── No memory yet ── */}
          {!hasAnyValue && !isDirty && (
            <View
              style={{
                alignItems: "center",
                paddingVertical: 24,
                marginBottom: 20,
              }}
            >
              <Icon
                name="chatbubble-ellipses-outline"
                size={40}
                color={theme.palette.gray}
                style={{ marginBottom: 10 }}
              />
              <TSCaptionText textStyles={{ color: theme.palette.gray, textAlign: "center" }}>
                No memory yet. Start chatting with your coach and it will{"\n"}
                build a profile about you automatically.
              </TSCaptionText>
            </View>
          )}

          {/* ── Fields ── */}
          {FIELDS.map((f) => (
            <FieldRow
              key={f.key}
              icon={f.icon}
              label={f.label}
              placeholder={f.placeholder}
              value={fields[f.key]}
              multiline={f.multiline}
              onChangeText={(v) => updateField(f.key, v)}
              onClear={() => clearField(f.key)}
            />
          ))}

          {/* ── Save ── */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={!isDirty || isSaving}
            style={{
              paddingVertical: 16,
              borderRadius: 12,
              backgroundColor:
                isDirty && !isSaving
                  ? theme.palette.AWE_Green
                  : theme.palette.darkGray,
              alignItems: "center",
              marginTop: 8,
              marginBottom: 12,
            }}
          >
            <TSParagrapghText
              textStyles={{
                color: isDirty && !isSaving ? theme.palette.white : theme.palette.gray,
                fontWeight: "700",
              }}
            >
              {isSaving ? "Saving…" : isDirty ? "Save Changes" : "No Changes"}
            </TSParagrapghText>
          </TouchableOpacity>

          {/* ── Clear all ── */}
          {hasAnyValue && (
            <TouchableOpacity
              onPress={handleClearAll}
              style={{
                paddingVertical: 14,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: theme.palette.AWE_Red ?? "#ff4444",
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
              }}
            >
              <Icon
                name="trash-outline"
                size={16}
                color={theme.palette.AWE_Red ?? "#ff4444"}
                style={{ marginRight: 8 }}
              />
              <TSInputTextSm
                textStyles={{ color: theme.palette.AWE_Red ?? "#ff4444" }}
              >
                Clear All Memory
              </TSInputTextSm>
            </TouchableOpacity>
          )}
        </ScrollView>
      </PageContainer>
    </KeyboardAvoidingView>
  );
};

export default CoachMemoryScreen;
