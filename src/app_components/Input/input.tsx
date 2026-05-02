import React, { FunctionComponent, useRef, ReactNode } from "react";
import {
  View,
  TextInput as NTextInput,
  StyleProp,
  TextStyle,
  ViewStyle,
  TextInput as TTextInput,
  TouchableWithoutFeedback,
  KeyboardTypeOptions,
  InputAccessoryView,
  Keyboard,
  Platform,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "styled-components";
import { TSCaptionText } from "../Text/Text";
import { tsInput } from "../shared";

enum AutoCaptilizeEnum {
  None = "none",
  Sent = "sentences",
  Words = "words",
  Char = "characters",
}

interface InputProps {
  onChangeText(text: string): void | undefined;
  value: string | undefined;
  containerStyle: StyleProp<ViewStyle>;
  label: string;
  placeholder?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  inputStyles?: StyleProp<TextStyle>;
  isError?: boolean;
  helperText?: string;
  editable?: boolean;
  fontSize?: number;
  centerInput?: boolean;
  secureTextEntry?: boolean;
  autoCapitalize?: AutoCaptilizeEnum; //'none', 'sentences', 'words', 'characters'
  testID?: string;
  keyboardType?: KeyboardTypeOptions;
  focus?: boolean;
  multiline?: boolean;
  onSubmitEditing?: any;
  inputAccessoryViewID?: string;
  returnKeyType?: "default" | "done" | "go" | "next" | "search" | "send";
}

function intercept(s: string, og: string): string {
  const lines = s.split("\n");
  // let violation = false;
  lines.forEach((line: string) => {
    if (line.length > 140) {
      // violation = true;
      return og;
    }
  });

  return lines.length <= 10 ? s : og;
}

const Input: FunctionComponent<InputProps> = (props) => {
  const theme = useTheme();
  const inpRef = useRef<TTextInput>(null);
  const generatedAccessoryIdRef = useRef(
    `inputAccessory-${Math.random().toString(36).slice(2)}`
  );
  const resolvedAccessoryId =
    Platform.OS === "ios"
      ? props.inputAccessoryViewID ?? generatedAccessoryIdRef.current
      : undefined;
  const shouldShowDefaultAccessory =
    Platform.OS === "ios" && !props.inputAccessoryViewID;

  return (
    <>
      <View style={[props.containerStyle, { width: "100%", flex: 1 }]}>
        <TouchableWithoutFeedback
          onPress={() => {
            if (inpRef.current) {
              inpRef.current.focus();
            }
          }}
          hitSlop={{ bottom: 12, left: 12, right: 12, top: 12 }}
        >
          <View style={{ width: "100%", height: "100%" }}>
            <View style={{ flexDirection: "row", width: "100%", height: "100%" }}>
              <View
                style={{
                  width: props.leading ? "10%" : 0,
                  height: "100%",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {props.leading ? props.leading : <></>}
              </View>
              <View
                style={{
                  width: props.leading || props.trailing ? "80%" : "100%",
                  height: "100%",
                  justifyContent: "center",
                  alignItems: props.centerInput ? "center" : "flex-start",
                }}
              >
                <NTextInput
                  testID={props.testID}
                  multiline={props.multiline ?? false}
                  // numberOfLines={props.multiline ? 10 : 1}
                  numberOfLines={2}
                  secureTextEntry={props.secureTextEntry ?? false}
                  // secureTextEntry={
                  //   props.secureTextEntry == undefined
                  //     ? false
                  //     : props.secureTextEntry
                  // }
                  returnKeyType={props.returnKeyType ?? "done"}
                  returnKeyLabel="Done"
                  onEndEditing={() => console.log("DONE EDITINGINGIGNGIN!!!!!")}
                  onSubmitEditing={() => {
                    if (props.onSubmitEditing) props.onSubmitEditing();
                    Keyboard.dismiss();
                    console.log("Submit Editing!@!@!@");
                  }}
                  keyboardType={props.keyboardType ?? "default"}
                  inputAccessoryViewID={resolvedAccessoryId}
                  autoCapitalize={
                    props.autoCapitalize == undefined
                      ? AutoCaptilizeEnum.Sent
                      : props.autoCapitalize
                  }
                  style={[
                    {
                      color: theme.palette.text,
                      width: "100%",
                      fontSize: props.fontSize || tsInput,
                      justifyContent: "center",
                      alignItems: "center",
                      alignContent: "center",

                      padding: 0,
                    },
                    props.inputStyles,
                  ]}
                  ref={inpRef}
                  onChangeText={(t: string) =>
                    props.onChangeText(intercept(t, props.value))
                  }
                  value={props.value}
                  placeholder={props.placeholder}
                  placeholderTextColor={theme.palette.text}
                  selectionColor={theme.palette.text}
                  editable={props.editable == undefined ? true : props.editable}
                />
              </View>
              <View
                style={{
                  width: props.trailing ? "10%" : 0,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {props.trailing ? props.trailing : <></>}
              </View>
            </View>
            {props.isError ? (
              <View
                style={{
                  position: "absolute",
                  left: props.leading ? 40 : 5,
                  bottom: 0,
                }}
              >
                <TSCaptionText textStyles={{ color: "red" }}>
                  {props.helperText}
                </TSCaptionText>
              </View>
            ) : (
              <></>
            )}
          </View>
        </TouchableWithoutFeedback>
      </View>

      {shouldShowDefaultAccessory ? (
        <InputAccessoryView nativeID={resolvedAccessoryId}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              backgroundColor: theme.palette.darkGray,
              borderTopWidth: 1,
              borderTopColor: `${theme.palette.lightGray}22`,
              paddingHorizontal: 14,
              paddingVertical: 8,
            }}
          >
            <TouchableOpacity
              onPress={() => Keyboard.dismiss()}
              activeOpacity={0.75}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 6,
                borderRadius: 8,
                backgroundColor: theme.palette.primary.main,
              }}
            >
              <TSCaptionText
                textStyles={{
                  color: theme.palette.backgroundColor,
                  fontWeight: "700",
                  fontSize: 14,
                }}
              >
                Done
              </TSCaptionText>
            </TouchableOpacity>
          </View>
        </InputAccessoryView>
      ) : null}
    </>
  );
};

export default Input;
export { AutoCaptilizeEnum };
