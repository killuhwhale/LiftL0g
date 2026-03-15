import { View } from "react-native";
import {
  CREATIVE_W,
  REPS_W,
  ROUNDS_W,
  STANDARD_W,
  WORKOUT_TYPES,
  mdFontSize,
  numFilter,
  numFilterWithSpaces,
} from "@/src/app_components/shared";
import { TSCaptionText, TSListTitleText } from "@/src/app_components/Text/Text";
import React, { FunctionComponent } from "react";
import Input from "@/src/app_components/Input/input";
import { useTheme } from "styled-components";
import Icon from "react-native-vector-icons/Ionicons";
import { TestIDs } from "@/src/utils/constants";

const INPUT_HEADER_HEIGHT = 25;

const RepSheme: FunctionComponent<{
  onSchemeRoundChange(scheme: string): void;
  schemeRounds: string;
  editable?: boolean;
}> = (props) => {
  const theme = useTheme();

  return (
    <View
      style={{ marginBottom: 15, height: INPUT_HEADER_HEIGHT }}
      testID={TestIDs.CreateWorkoutSchemeReps.name()}
    >
      <Input
        placeholder="Reps"
        editable={props.editable}
        onChangeText={props.onSchemeRoundChange}
        value={props.schemeRounds}
        label="Reps"
        containerStyle={{
          width: "100%",
          backgroundColor: theme.palette.darkGray,
          borderRadius: 8,
          paddingHorizontal: 8,
        }}
        leading={
          <Icon
            name="code-outline"
            color={theme.palette.text}
            style={{ fontSize: mdFontSize }}
          />
        }
      />
    </View>
  );
};

const RoundSheme: FunctionComponent<{
  onSchemeRoundChange(scheme: string): void;
  schemeRounds: string;
  isError: boolean;
  editable?: boolean;
}> = (props) => {
  const theme = useTheme();
  const errorStyles = props.isError
    ? {
        borderBottomWidth: 2,
        borderColor: "red",
      }
    : {};
  return (
    <View
      style={{ marginBottom: 15, height: INPUT_HEADER_HEIGHT }}
      testID={TestIDs.CreateWorkoutSchemeRounds.name()}
    >
      <Input
        placeholder="Rounds"
        testID={TestIDs.CreateWorkoutSchemeRounds.name()}
        onChangeText={props.onSchemeRoundChange}
        value={props.schemeRounds}
        label=""
        helperText="Please enter number of rounds"
        isError={props.isError}
        editable={props.editable}
        containerStyle={{
          width: "100%",
          backgroundColor: theme.palette.darkGray,
          borderRadius: 8,
          paddingHorizontal: 8,
        }}
        leading={
          <Icon
            name="code-outline"
            color={theme.palette.text}
            style={{ fontSize: mdFontSize }}
          />
        }
      />
    </View>
  );
};

const CreativeScheme: FunctionComponent<{
  onSchemeInstructionChange(instructions: string): void;
  instruction: string;
}> = (props) => {
  const theme = useTheme();
  return (
    <View
      style={{ marginBottom: 15, height: INPUT_HEADER_HEIGHT }}
      testID={TestIDs.CreateWorkoutSchemeCreative.name()}
    >
      <Input
        placeholder="20 min AMRAP"
        testID={TestIDs.CreateWorkoutSchemeCreative.name()}
        onChangeText={props.onSchemeInstructionChange}
        value={props.instruction}
        label="Instructions"
        helperText=""
        containerStyle={{
          width: "100%",
          backgroundColor: theme.palette.darkGray,
          borderRadius: 8,
          paddingHorizontal: 8,
        }}
        leading={
          <Icon
            name="code-outline"
            color={theme.palette.text}
            style={{ fontSize: mdFontSize }}
          />
        }
      />
    </View>
  );
};

const SchemeField: FunctionComponent<{
  schemeType: number;
  setSchemeRounds(a: string): void;
  setInstruction(a: string): void;
  schemeRounds: string;
  instruction?: string;
  setSchemeRoundsError(a: boolean): void;
  schemeRoundsError: boolean;
}> = ({
  schemeType,
  setSchemeRounds,
  schemeRounds,
  setSchemeRoundsError,
  schemeRoundsError,
  instruction,
  setInstruction,
}) => {
  return (
    <View
      style={{
        flex:
          WORKOUT_TYPES[schemeType] == STANDARD_W ||
          WORKOUT_TYPES[schemeType] == CREATIVE_W
            ? 1
            : 2,
      }}
    >
      {WORKOUT_TYPES[schemeType] == STANDARD_W ? (
        <></>
      ) : WORKOUT_TYPES[schemeType] == REPS_W ? (
        <>
          <TSCaptionText>Rep Scheme</TSCaptionText>
          <RepSheme
            onSchemeRoundChange={(t) => setSchemeRounds(numFilterWithSpaces(t))}
            schemeRounds={schemeRounds}
          />
        </>
      ) : WORKOUT_TYPES[schemeType] == ROUNDS_W ? (
        <>
          <TSCaptionText>Number of Rounds</TSCaptionText>
          <RoundSheme
            onSchemeRoundChange={(t) => {
              // Reset
              if (schemeRoundsError) {
                setSchemeRoundsError(false);
              }
              setSchemeRounds(numFilter(t));
            }}
            isError={schemeRoundsError}
            schemeRounds={schemeRounds}
          />
        </>
      ) : WORKOUT_TYPES[schemeType] == CREATIVE_W ? (
        <>
          <TSListTitleText>Instructions</TSListTitleText>
          <CreativeScheme
            onSchemeInstructionChange={(t) => setInstruction(t)}
            instruction={instruction ?? ""}
          />
        </>
      ) : (
        <></>
      )}
    </View>
  );
};

export default SchemeField;
