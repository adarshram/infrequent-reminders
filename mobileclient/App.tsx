import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native";
import { LoginForm } from "./components/LoginForm";
import NotificationPage from "./pages/NotificationPage";
import Login from "./pages/Login";
import useFbaseAuthUser from "./hooks/useFbaseAuthUser";
import { UserContext } from "./models/UserContext";
import { Button, BottomNavigation, Text } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { Home } from "./components/Home";

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
  const [index, setIndex] = useState<number>(0);

  const [routes] = useState([
    {
      key: "music",
      title: "Favorites",
      focusedIcon: "heart",
      unfocusedIcon: "heart-outline",
    },
    { key: "albums", title: "Albums", focusedIcon: "album" },
    { key: "recents", title: "Recents", focusedIcon: "history" },
    {
      key: "notifications",
      title: "Notifications",
      focusedIcon: "bell",
      unfocusedIcon: "bell-outline",
    },
  ]);

  const MusicRoute = () => <Text>Music</Text>;

  const AlbumsRoute = () => <Text>Albums</Text>;

  const RecentsRoute = () => <Text>Recents</Text>;

  const NotificationsRoute = () => <Text>Notifications</Text>;

  const renderScene = BottomNavigation.SceneMap({
    music: MusicRoute,
    albums: AlbumsRoute,
    recents: RecentsRoute,
    notifications: NotificationsRoute,
  });
  return (
    <SafeAreaProvider>
      <UserContext.Provider value={userContextObject}>
        {!loggedInUser ? (
          <Login />
        ) : (
          <>
            <Text>Already Logged In as {loggedInUser.email}</Text>
            <Button icon="logout" mode="contained" onPress={logOut}>
              Logout
            </Button>
            <BottomNavigation
              navigationState={{ index, routes }}
              onIndexChange={setIndex}
              renderScene={renderScene}
            />
          </>
        )}
      </UserContext.Provider>
    </SafeAreaProvider>
  );
};

export default App;
