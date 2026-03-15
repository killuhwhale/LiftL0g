import { Stack, useRouter, useSegments } from "expo-router";
import React, { useEffect, useState } from "react";
import "react-native-gesture-handler";

import Uploady from "@rpldy/native-uploady";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { DefaultTheme, ThemeProvider } from "styled-components/native";

// Your imports
import FullScreenSpinner from "@/src/app_components/Spinner";
import { getThemePreference } from "@/src/utils/tokenUtils";
import twrnc from "twrnc";
import Header from "../src/app_components/Header/header";
import { apiSlice, useGetProfileViewQuery } from "../src/redux/api/apiSlice";
import { store } from "../src/redux/store";
import auth from "../src/utils/auth";
import { BASEURL } from "../src/utils/constants";

import mobileAds from 'react-native-google-mobile-ads';

const primaryColor = twrnc.color("bg-blue-600");
// const secondaryColor = twrnc.color('bg-emerald-900');
const secondaryColor = twrnc.color("bg-rose-900");
const tertiaryColor = twrnc.color("bg-violet-500");

const d_accent = twrnc.color("bg-sky-400");
const d_text = twrnc.color("bg-slate-50");
const d_lightGray = twrnc.color("bg-slate-300");
const d_gray = twrnc.color("bg-slate-500");
const d_darkGray = twrnc.color("bg-slate-700");
const d_background = twrnc.color("bg-slate-900");

const l_text = "#283618";
const l_lightGray = "#a8dadc";
const l_gray = "#457b9d";
const l_darkGray = "#1d3557";
const l_background = "#f1faee";

interface ThemeMap {
  [key: string]: DefaultTheme;
}

const DarkTheme: DefaultTheme = {
  borderRadius: "8px",
  palette: {
    primary: {
      main: "#005aff",
      contrastText: "#fff",
    },
    secondary: {
      main: secondaryColor!,
      contrastText: "#fff",
    },
    tertiary: {
      main: tertiaryColor!,
      contrastText: "#fff",
    },
    accent: d_accent!,
    transparent: "#34353578",
    black: "black",
    white: "white",
    text: d_text!,
    backgroundColor: d_background!,
    lightGray: d_lightGray!,
    gray: d_gray!,
    darkGray: d_darkGray!,
    IP_Btn_bg: "#005aff",
    IP_Clickable_bg: "#0F9D58",
    IP_Label_bg: "#1e1e1e",
    IP_Swipe_bg: "#00a896",
    IP_TextInput_bg: "#121212",
    AWE_Blue: "#4285F4",
    AWE_Red: "#DB4437",
    AWE_Yellow: "#F4B400",
    AWE_Green: "#00d1b2", // #00d1b2 => looks good in gradient... (OG: #0F9D58)
  },
};

const FeminineTheme: DefaultTheme = {
  borderRadius: "8px",
  palette: {
    primary: {
      main: "#D069B4", // Pink
      contrastText: "#fff",
    },
    secondary: {
      main: "#f7c9a7", // Light Gold (soft gold tone)
      contrastText: "#fff",
    },
    tertiary: {
      main: "#ff7f7f", // Soft Coral (complementary warm tone)
      contrastText: "#fff",
    },
    accent: d_accent!,
    transparent: "#34353578",
    black: "black",
    white: "white",
    text: d_text!,
    backgroundColor: d_background!,
    lightGray: d_lightGray!,
    gray: d_gray!,
    darkGray: d_darkGray!,
    IP_Btn_bg: "#f1a7c2", // Rose Pink button background
    IP_Clickable_bg: "#FF69B4", // Light Gold clickable background
    IP_Label_bg: "#1e1e1e",
    IP_Swipe_bg: "#ff7f7f", // Soft Coral swipe background
    IP_TextInput_bg: "#121212",
    AWE_Blue: "#6a8bff", // Softer, more feminine blue
    AWE_Red: "#e76a7b", // Softer, pink-tinged red
    AWE_Yellow: "#f4c200", // Softened, warmer yellow (a bit of gold)
    AWE_Green: "#8A00C4", // Awesome Purple
  },
};

const DEFAULT_USER_THEME = "DARK";
const THEMES: ThemeMap = {
  [DEFAULT_USER_THEME]: DarkTheme,
  FEM: FeminineTheme,
};

SplashScreen.preventAutoHideAsync();

// Bot Update

function AppNavigation({ showBackButton, setUserTheme }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [registeredWithAuth, setRegisteredWithAuth] = useState(false);

  const router = useRouter();
  const segments = useSegments();

  const {
    data: profileData,
    isLoading: isUserLoading,
    error: userError,
  } = useGetProfileViewQuery("");

  useEffect(() => {
    const checkUser = async () => {
      try {
        if (profileData && profileData.user) {
          setLoggedIn(true);
        } else {
          setLoggedIn(false);
        }
      } catch (err) {
        setLoggedIn(false);
      }
      setRegisteredWithAuth(true);
    };

    auth.listenLogout(() => {
      setLoggedIn(false);
    });

    auth.listenLogin((isLogged, msg) => {
      if (isLogged) {
        store.dispatch(
          apiSlice.util.invalidateTags([
            "Gyms", "UserGyms", "User", "UserAuth", "GymClasses",
            "GymClassWorkoutGroups", "UserWorkoutGroups",
            "WorkoutGroupWorkouts", "Coaches", "Members",
            "GymFavs", "GymClassFavs",
          ])
        );
        setLoggedIn(true);
      }
    }, "logInKey");

    if (!isUserLoading) {
      checkUser();
    }
  }, [isUserLoading, profileData]);

  // EXPO ROUTER REDIRECT LOGIC
  useEffect(() => {
    if (isUserLoading || !registeredWithAuth) return;

    // Check if the user is currently on the AuthScreen route
    const inAuthGroup = segments[0] === "AuthScreen";

    if (!loggedIn && !inAuthGroup) {
      // If not logged in and not on AuthScreen, redirect to AuthScreen
      router.replace("/AuthScreen");
    } else if (loggedIn && inAuthGroup) {
      // If logged in but sitting on the AuthScreen, redirect to the main tabs
      router.replace("/(tabs)");
    }
  }, [loggedIn, segments, isUserLoading, registeredWithAuth]);

  if (isUserLoading || !registeredWithAuth) {
    return <FullScreenSpinner />;
  }

  return (
    <View style={{ flex: 1, width: "100%" }}>
      <Header showBackButton={showBackButton} toggleState={setUserTheme} />
      
      {/* The Stack automatically reads your file system. 
        It will load AuthScreen.tsx, home.tsx, etc. automatically. 
      */}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="AuthScreen" options={{ headerShown: false }} />
        {/* You do not need to list every screen here unless you are customizing its specific options */}
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  const [showBackButton, setShowBackButton] = useState(false);
  const [userTheme, setUserTheme] = useState("DARK"); // DEFAULT_USER_THEME
  const [userThemeLoading, setUserThemeLoading] = useState(true);
  
  useEffect(() => {
    // Initialize the Google Mobile Ads SDK
    mobileAds()
      .initialize()
      .then(adapterStatuses => {
        console.log('AdMob SDK Initialized', adapterStatuses);
      })
      .catch(error => {
        console.error('AdMob Initialization Error', error);
      });
  }, []);

  const [fontsLoaded] = useFonts({
    "SpaceMono-Regular": require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    const getThemePref = async () => {
      const themePrefrence = await getThemePreference("DARK");
      setUserTheme(themePrefrence);
      setUserThemeLoading(false);
    };

    getThemePref();
  }, []);

  if (!fontsLoaded || userThemeLoading) {
    return null;
  }

  // Assuming THEMES is defined above as in your original code
  const currentTheme = userTheme ? THEMES[userTheme] : THEMES["DARK"];

  return (
    <View style={{ height: "100%", width: "100%", backgroundColor: "red" }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: currentTheme.palette.backgroundColor, paddingBottom: 0 }}>
        <Provider store={store}>
          <ThemeProvider theme={currentTheme}>
            <Uploady destination={{ url: `${BASEURL}` }}>
              <GestureHandlerRootView style={{ flex: 1 }}>
                
                {/* Render the Navigation Component */}
                <AppNavigation 
                  showBackButton={showBackButton} 
                  setUserTheme={setUserTheme} 
                />

              </GestureHandlerRootView>
            </Uploady>
          </ThemeProvider>
        </Provider>
      </SafeAreaView>
    </View>
  );
}
