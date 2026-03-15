import React, { FunctionComponent, useEffect } from "react";
import {
  NavigationContainer,
  NavigationContainerRefWithCurrent,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import HomePage from "@/app/home";
import GymScreen from "@/app/GymScreen";
import GymClassScreen from "@/app/GymClassScreen";
import WorkoutScreen from "@/app/WorkoutScreen";
import {
  AnyWorkoutItem,
  GymCardProps,
  GymClassCardProps,
  WorkoutCardProps,
  WorkoutGroupCardProps,
  WorkoutGroupProps,
  WorkoutNameProps,
  WorkoutNameSimpleProps,
} from "../app_components/Cards/types";
import { DefaultTheme, useTheme } from "styled-components";
import Profile from "@/app/(tabs)/Profile";
import AuthScreen from "@/app/AuthScreen";
import CreateGymScreen from "@/app/input_pages/gyms/CreateGymScreen";
import CreateGymClassScreen from "@/app/input_pages/gyms/CreateGymClassScreen";
import CreateWorkoutGroupScreen from "@/app/input_pages/gyms/CreateWorkoutGroupScreen";
import CreateWorkoutScreen from "@/app/input_pages/gyms/CreateWorkoutScreen";
import WorkoutDetailScreen from "@/app/WorkoutDetailScreen";
import WorkoutNameDetailScreen from "@/app/WorkoutNameDetailScreen";
import CreateCompletedWorkoutScreen from "@/app/input_pages/gyms/CreateCompletedWorkoutScreen";
import StatsScreen from "@/app/(tabs)/StatsScreen";
import Icon from "react-native-vector-icons/Ionicons";
import { XSmallText } from "../app_components/Text/Text";
import ResetPasswordScreen from "@/app/input_pages/users/ResetPassword";
import { SCREEN_HEIGHT } from "../app_components/shared";
// import UserWorkoutsScreen from "@/app/UserWorkoutsScreen";
import { TestIDs } from "../utils/constants";
import GymSearchScreen from "@/app/(tabs)/GymSearchScreen";
import { Platform, StyleSheet, View } from "react-native";
import twrnc from "twrnc";
import DailySnapshotScreen from "@/app/DailySnapshot";
import { UserProps } from "@/app/types";
// Screens and props each screen expects...

export type RootStackParamList = {
  HomePage: undefined;
  GymSearchScreen: undefined;
  GymScreen: GymCardProps;
  GymClassScreen: GymClassCardProps;
  WorkoutScreen: {
    id: number;
    owned_by_class: number;
    owner_id: string;
    params_editable: number;
  };
  CreateCompletedWorkoutScreen: WorkoutGroupProps;
  WorkoutDetailScreen: WorkoutCardProps;
  WorkoutNameDetailScreen: WorkoutNameSimpleProps;
  UserWorkoutsScreen: undefined;
  Profile: undefined;
  AuthScreen: undefined;
  Header: undefined;
  DailySnapshotScreen: undefined;
  CreateGymScreen: undefined;
  CreateGymClassScreen: undefined;
  CreateWorkoutGroupScreen: {
    ownedByClass: boolean;
    ownerID?: string;
    // gymClassProps: GymClassCardProps;
  };
  CreateWorkoutScreen: {
    workoutGroupID: string;
    workoutGroupTitle: string;
    schemeType: number;
  };
  HomePageTabs: any;
  StatsScreen: undefined;
  ResetPasswordScreen: undefined;
};

// const Tab = createBottomTabNavigator<RootStackParamList>();

// const Stack = createNativeStackNavigator<RootStackParamList>();

// const tabBarFlex = Platform.OS === "ios" ? 0.12 : 0.09;
// const tabBarMarginBottom = Platform.OS === "ios" ? 12 : 0;

// const tabBarStyle = (tabBarColor: string | undefined) => ({
//   backgroundColor: tabBarColor,
//   flex: tabBarFlex,
//   paddingBottom: 4,
// });

// const tabBarLabel = (
//   labelText: string,
//   focused: boolean,
//   theme: DefaultTheme
// ) => (
//   <XSmallText
//     textStyles={{
//       color: focused ? theme.palette.accent : theme.palette.text,
//       height: Platform.OS === "ios" ? "50%" : "0%",
//     }}
//   >
//     {labelText}
//   </XSmallText>
// );
// const tabBarIcon = (
//   iconName: string,
//   focused: boolean,
//   size: number,
//   theme: DefaultTheme
// ) => (
//   <Icon
//     name={iconName}
//     color={focused ? theme.palette.accent : theme.palette.text}
//     style={{ fontSize: size - 4 }}
//   />
// );

// function HomePageTabs() {
//   const theme = useTheme();
//   const tabBarColor = twrnc.color(`bg-sky-900`);
//   return (
//     <Tab.Navigator>
//       <Tab.Screen
//         name="HomePage"
//         component={GymSearchScreen}
//         options={{
//           headerShown: false,
//           tabBarTestID: TestIDs.HomeTab.name(),
//           tabBarStyle: tabBarStyle(tabBarColor),
//           tabBarItemStyle: {
//             marginBottom: tabBarMarginBottom,
//           },
//           tabBarLabel: ({ color, focused, position }) =>
//             tabBarLabel("Home", focused, theme),
//           tabBarIcon: ({ color, focused, size }) =>
//             tabBarIcon("planet", focused, size, theme),
//         }}
//       />

//       <Tab.Screen
//         name="UserWorkoutsScreen"
//         component={UserWorkoutsScreen}
//         options={{
//           headerShown: false,
//           tabBarTestID: TestIDs.HomeTab.name(),
//           tabBarStyle: tabBarStyle(tabBarColor),
//           tabBarItemStyle: {
//             marginBottom: tabBarMarginBottom,
//           },
//           tabBarLabel: ({ color, focused, position }) =>
//             tabBarLabel("My Workouts", focused, theme),
//           tabBarIcon: ({ color, focused, size }) =>
//             tabBarIcon("barbell-outline", focused, size, theme),
//         }}
//       />

//       <Tab.Screen
//         name="DailySnapshotScreen"
//         component={DailySnapshotScreen}
//         options={{
//           headerShown: false,
//           tabBarTestID: "",
//           tabBarStyle: tabBarStyle(tabBarColor),
//           tabBarItemStyle: {
//             marginBottom: tabBarMarginBottom,
//           },
//           tabBarLabel: ({ color, focused, position }) =>
//             tabBarLabel("Snapshot", focused, theme),
//           tabBarIcon: ({ color, focused, size }) =>
//             tabBarIcon("apps-outline", focused, size, theme),
//         }}
//       />

//       <Tab.Screen
//         name="StatsScreen"
//         component={StatsScreen}
//         options={{
//           headerShown: false,
//           tabBarTestID: TestIDs.HomeTab.name(),
//           tabBarStyle: tabBarStyle(tabBarColor),
//           tabBarItemStyle: {
//             marginBottom: tabBarMarginBottom,
//           },
//           tabBarLabel: ({ color, focused, position }) =>
//             tabBarLabel("Stats", focused, theme),
//           tabBarIcon: ({ color, focused, size }) =>
//             tabBarIcon("stats-chart-outline", focused, size, theme),
//         }}
//       />

//       <Tab.Screen
//         name="Profile"
//         component={Profile}
//         options={{
//           headerShown: false,
//           tabBarTestID: TestIDs.ProfileTab.name(),
//           tabBarStyle: tabBarStyle(tabBarColor),
//           tabBarItemStyle: {
//             marginBottom: tabBarMarginBottom,
//           },
//           tabBarLabel: ({ color, focused, position }) =>
//             tabBarLabel("Profile", focused, theme),
//           tabBarIcon: ({ color, focused, size }) =>
//             tabBarIcon("finger-print", focused, size, theme),
//         }}
//       />
//     </Tab.Navigator>
//   );
// }

// interface RootstackProps {
//   // navref: string;
//   navref: NavigationContainerRefWithCurrent<ReactNavigation.RootParamList>;
//   setShowBackButton(show: boolean): void;
// }

// const RootStack: FunctionComponent<RootstackProps> = (props) => {
//   const theme = useTheme();
//   const headerStyle = {
//     backgroundColor: theme.palette.backgroundColor,
//   };

//   useEffect(() => {
//     // Get the current route name when the component is mounted or the route changes
//     if (!props.navref.current) return;
//     const routeNameUnsub = props.navref.current?.addListener(
//       "state",
//       (state) => {
//         // console.log('Header state: ', props.navref.current?.getCurrentRoute());
//         const cr = props.navref.current?.getCurrentRoute()?.name;
//         const homeRoutes = [
//           "HomePage",
//           "My Workouts",
//           "Snapshot",
//           "Stats",
//           "Profile",
//         ];
//         if (cr && homeRoutes.indexOf(cr) < 0) {
//           // console.log('setShowBackButton(true): ');
//           props.setShowBackButton(true);
//         } else {
//           // console.log('setShowBackButton(false: ');
//           props.setShowBackButton(false);
//         }
//         // setUpdateState(!updateState);
//       }
//     );

//     // Clean up the effect
//     return () => {
//       if (routeNameUnsub) {
//         routeNameUnsub();
//       }
//     };
//   }, []);

//   return (
//     <NavigationContainer ref={props.navref}>
//       <Stack.Navigator
//         screenOptions={{
//           contentStyle: {
//             height: SCREEN_HEIGHT,
//             backgroundColor: theme.palette.backgroundColor,
//             // minHeight: SCREEN_HEIGHT,
//           },

//           headerStyle: headerStyle,
//           headerTintColor: "#fff",
//           headerTitleStyle: {
//             fontWeight: "bold",
//           },
//         }}
//       >
//         <Stack.Screen
//           name="HomePageTabs"
//           component={HomePageTabs}
//           options={{ headerTitle: "", headerShown: false }}
//         />
//         {/* <Stack.Screen
//           name="GymSearchScreen"
//           component={GymSearchScreen}
//           options={{headerTitle: '', headerShown: false}}
//         /> */}
//         <Stack.Screen
//           name="GymScreen"
//           component={GymScreen}
//           options={{ headerTitle: "", headerShown: false }}
//         />
//         <Stack.Screen
//           name="GymClassScreen"
//           component={GymClassScreen}
//           options={{ headerTitle: "", headerShown: false }}
//         />
//         <Stack.Screen
//           name="WorkoutScreen"
//           component={WorkoutScreen}
//           options={{ headerTitle: "", headerShown: false }}
//         />
//         <Stack.Screen
//           name="UserWorkoutsScreen"
//           component={UserWorkoutsScreen}
//           options={{ headerTitle: "", headerShown: false }}
//         />
//         <Stack.Screen
//           name="AuthScreen"
//           component={AuthScreen}
//           options={{ headerTitle: "", headerShown: false }}
//         />
//         <Stack.Screen
//           name="CreateGymScreen"
//           component={CreateGymScreen}
//           options={{ headerTitle: "", headerShown: false }}
//         />
//         <Stack.Screen
//           name="CreateGymClassScreen"
//           component={CreateGymClassScreen}
//           options={{ headerTitle: "", headerShown: false }}
//         />
//         <Stack.Screen
//           name="CreateWorkoutGroupScreen"
//           component={CreateWorkoutGroupScreen}
//           options={{ headerTitle: "", headerShown: false }}
//         />
//         <Stack.Screen
//           name="CreateWorkoutScreen"
//           component={CreateWorkoutScreen}
//           options={{ headerTitle: "", headerShown: false }}
//         />
//         <Stack.Screen
//           name="WorkoutDetailScreen"
//           component={WorkoutDetailScreen}
//           options={{ headerTitle: "", headerShown: false }}
//         />
//         <Stack.Screen
//           name="WorkoutNameDetailScreen"
//           component={WorkoutNameDetailScreen}
//           options={{ headerTitle: "", headerShown: false }}
//         />
//         <Stack.Screen
//           name="CreateCompletedWorkoutScreen"
//           component={CreateCompletedWorkoutScreen}
//           options={{ headerTitle: "", headerShown: false }}
//         />
//         <Stack.Screen
//           name="StatsScreen"
//           component={StatsScreen}
//           options={{ headerTitle: "", headerShown: false }}
//         />
//         <Stack.Screen
//           name="DailySnapshotScreen"
//           component={DailySnapshotScreen}
//           options={{ headerTitle: "", headerShown: false }}
//         />
//         <Stack.Screen
//           name="ResetPasswordScreen"
//           component={ResetPasswordScreen}
//           options={{ headerTitle: "", headerShown: false }}
//         />
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// };

// export default RootStack;
