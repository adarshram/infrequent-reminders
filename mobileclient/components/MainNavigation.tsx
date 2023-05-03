import * as React from "react";
import { View, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BottomNavigation from "./BottomNavigation";
import { CreateEditSingleReminder } from "../pages/CreateEditSingleReminder";

const Stack = createNativeStackNavigator();

function MainNavigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="BottomNav"
          component={BottomNavigation}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CreateEditSingleReminder"
          component={CreateEditSingleReminder}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default MainNavigation;
