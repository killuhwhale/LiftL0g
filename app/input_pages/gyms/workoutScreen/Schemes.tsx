import { View } from "react-native";
import {
  CREATIVE_W,
  REPS_W,
  ROUNDS_W,
  STANDARD_W,
  WORKOUT_TYPES,
  numFilter,
  numFilterWithSpaces,
} from "@/src/app_components/shared";
import { TSCaptionText, TSListTitleText } from "@/src/app_components/Text/Text";
import React, { FunctionComponent } from "react";
import Input from "@/src/app_components/Input/input";
import { useTheme } from "styled-components";
import Icon from "react-native-vector-icons/Ionicons";
import { TestIDs } from "@/src/utils/constants";

const RepSheme: FunctionComponent<{
  onSchemeRoundChange(scheme: string): void;
  schemeRounds: string;
  editable?: boolean;
}> = (props) => {
  const theme = useTheme();

  return (
    <View style={{ marginBottom: 15 }} testID={TestIDs.CreateWorkoutSchemeReps.name()}>
      <Input
        placeholder="Ex: 21 15 9"
        editable={props.editable}
        onChangeText={props.onSchemeRoundChange}
        value={props.schemeRounds}
        label=""
        inputStyles={{
          justifyContent: "center",
          alignItems: "center",
        }}
        containerStyle={{
          width: "100%",
          backgroundColor: theme.palette.darkGray,
          borderRadius: 10,
          paddingHorizontal: 10,
          height: 44,
        }}
        leading={
          <Icon
            name="text-outline"
            color={`${theme.palette.text}66`}
            style={{ fontSize: 16 }}
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
    <View style={{ marginBottom: 15 }} testID={TestIDs.CreateWorkoutSchemeRounds.name()}>
      <Input
        placeholder="Ex: 10"
        testID={TestIDs.CreateWorkoutSchemeRounds.name()}
        onChangeText={props.onSchemeRoundChange}
        value={props.schemeRounds}
        label=""
        helperText="Please enter number of rounds"
        isError={props.isError}
        editable={props.editable}
        inputStyles={{
          justifyContent: "center",
          alignItems: "center",
        }}
        containerStyle={{
          width: "100%",
          backgroundColor: theme.palette.darkGray,
          borderRadius: 10,
          paddingHorizontal: 10,
          height: 44,
        }}
        leading={
          <Icon
            name="text-outline"
            color={`${theme.palette.text}66`}
            style={{ fontSize: 16 }}
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
    <View style={{ marginBottom: 15 }} testID={TestIDs.CreateWorkoutSchemeCreative.name()}>
      <Input
        placeholder="20 min AMRAP"
        testID={TestIDs.CreateWorkoutSchemeCreative.name()}
        onChangeText={props.onSchemeInstructionChange}
        value={props.instruction}
        label=""
        helperText=""
        inputStyles={{
          justifyContent: "center",
          alignItems: "center",
        }}
        containerStyle={{
          width: "100%",
          backgroundColor: theme.palette.darkGray,
          borderRadius: 10,
          paddingHorizontal: 10,
          height: 44,
        }}
        leading={
          <Icon
            name="text-outline"
            color={`${theme.palette.text}66`}
            style={{ fontSize: 16 }}
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
