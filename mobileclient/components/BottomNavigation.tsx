import * as React from "react";
import { Text, View, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import { Portal, Provider } from "react-native-paper";
import { ActionButtons as FloatingActionButtons } from "../components/MainSection/ActionButtons";
import ReceiveNotifications from "../components/ReceiveNotifications";
import Profile from "../pages/Profile";
import PendingList from "../pages/PendingList";

import Home from "../pages/Home";

const Tab = createBottomTabNavigator();

type Props = {
  user: string;
};

function SettingsScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Settings!</Text>
    </View>
  );
}

function BottomNavigation({ user, navigation }: Props) {
  return (
    <>
      <ReceiveNotifications navigation={navigation} />
      <Tab.Navigator>
        <Tab.Screen
          name="Home"
          component={Home}
          options={{
            tabBarIcon: () => <Entypo name="home" size={24} color="black" />,
          }}
        />
        <Tab.Screen
          name="Profile"
          component={Profile}
          options={{
            tabBarIcon: () => (
              <MaterialCommunityIcons
                name="face-man-profile"
                size={24}
                color="black"
              />
            ),
          }}
        />
        <Tab.Screen
          name="Pending"
          component={PendingList}
          options={{
            tabBarIcon: () => (
              <MaterialIcons name="pending-actions" size={24} color="black" />
            ),
          }}
        />
      </Tab.Navigator>
      <FloatingActionButtons navigation={navigation} />
    </>
  );
}
export default BottomNavigation;
const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    alignSelf: "center",
    fontSize: 24,
    marginTop: 8,
    marginBottom: 40,
  },
});
