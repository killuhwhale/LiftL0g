import { lightenHexColor } from "@/src/app_components/shared";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Icon from "react-native-vector-icons/Ionicons";
import { Tabs } from "expo-router";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import twrnc from "twrnc";

const FONTSIZE = 10;
const ICONSIZE = 27;

export default function TabLayout() {
  const theme = useTheme();
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          paddingBottom: 0,
          maxHeight: "8%",
        },
        tabBarLabelStyle: { fontWeight: "condensedBold" },
        tabBarActiveTintColor: theme.palette.primary.main,
        tabBarActiveBackgroundColor: theme.palette.backgroundColor,

        tabBarInactiveTintColor: twrnc.color("bg-slate-400"),
        tabBarInactiveBackgroundColor: twrnc.color("bg-slate-900"),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Workouts",
          tabBarLabelStyle: {
            fontSize: FONTSIZE,
            fontWeight: "bold",
          },

          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome
              size={ICONSIZE}
              name="home"
              color={focused ? theme.palette.primary.main : color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="StatsScreen"
        options={{
          title: "Stats",
          tabBarLabelStyle: {
            fontSize: FONTSIZE,
            fontWeight: "bold",
          },
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome
              size={ICONSIZE}
              name="signal"
              color={focused ? theme.palette.primary.main : color}
            />
          ),
        }}
      />
      {/* <Tabs.Screen
          name="DailySnapshot"
          options={{
            title: "Daily",
            headerShown: false,
            tabBarIcon: ({ color }) => (
              <FontAwesome size={28} name="terminal" color={color} />
            ),
          }}
        /> */}
      <Tabs.Screen
        name="Profile"
        options={{
          title: "Profile",
          tabBarLabelStyle: {
            fontSize: FONTSIZE,
            fontWeight: "bold",
          },
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome
              size={ICONSIZE}
              name="user-circle-o"
              color={focused ? theme.palette.primary.main : color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="PersonalCoach"
        options={{
          title: "Coach",
          tabBarLabelStyle: {
            fontSize: FONTSIZE,
            fontWeight: "bold",
          },
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Icon
              size={ICONSIZE}
              name={focused ? "person" : "person-outline"}
              color={focused ? theme.palette.primary.main : color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="GymSearchScreen"
        options={{
          href: null, // Allows file to remain in (tabs) and be a route but not appear in the Tab Bar
        }}
      />
    </Tabs>
  );
}
