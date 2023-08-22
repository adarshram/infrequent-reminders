import React, { useEffect, useState } from "react";
import { SafeAreaView, Platform } from "react-native";
import { LoginForm } from "./components/LoginForm";
import MainNavigation from "./components/MainNavigation";

import NotificationPage from "./pages/NotificationPage";

import Login from "./pages/Login";
import useFbaseAuthUser from "./hooks/useFbaseAuthUser";
import { UserContext } from "./models/UserContext";

import { Button, Text } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  DefaultTheme,
  FAB,
  Portal,
  Provider as PaperProvider,
} from "react-native-paper";
import notifee from "@notifee/react-native";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { Home } from "./components/Home";
import { NotificationHandler } from "./components/HomeSections/NotificationHandler";
import messaging from "@react-native-firebase/messaging";

import { Appearance } from "react-native";

import {
  showNotification,
  createChannel,
  handleBackgroundEvent,
} from "./functions/notifications";

const theme = {
  ...DefaultTheme,
  mode: "adaptive",
  dark: Appearance.getColorScheme() === "dark",
};
const requestSettings = async () => {
  const requestedSettings = await notifee.requestPermission();
};

notifee.onBackgroundEvent(async (props) => {
  console.log("background");
  await handleBackgroundEvent(props);
});

const App = () => {
  const [
    { googleSignin, signInWithEmailAndPassword, logOut: logOut },
    loggedInUser,
    authErrors,
  ] = useFbaseAuthUser();

  const userContextObject = {
    user: loggedInUser,
    actions: {
      googleSignin: googleSignin,
      signInWithEmailAndPassword: signInWithEmailAndPassword,
      logOut: logOut,
    },
    authErrors: authErrors ? authErrors : [],
  };

  if (loggedInUser === null) {
    return <Text>loading</Text>;
  }
  return (
    <SafeAreaProvider>
      <UserContext.Provider value={userContextObject}>
        <>
          {!loggedInUser ? (
            <Login />
          ) : (
            <>
              <PaperProvider theme={theme}>
                <Portal>
                  <NotificationHandler />
                  <MainNavigation />
                </Portal>
              </PaperProvider>
            </>
          )}
        </>
      </UserContext.Provider>
    </SafeAreaProvider>
  );
};

export default App;
