import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native";
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

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { Home } from "./components/Home";
import { Appearance } from "react-native";

const theme = {
  ...DefaultTheme,
  mode: "adaptive",
  dark: Appearance.getColorScheme() === "dark",
};
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
  console.log(theme);
  return (
    <SafeAreaProvider>
      <UserContext.Provider value={userContextObject}>
        {!loggedInUser ? (
          <Login />
        ) : (
          <>
            <PaperProvider theme={theme}>
              <Portal>
                <MainNavigation />
                <Text>Already Logged In as {loggedInUser.email}</Text>
              </Portal>
            </PaperProvider>
          </>
        )}
      </UserContext.Provider>
    </SafeAreaProvider>
  );
};

export default App;
