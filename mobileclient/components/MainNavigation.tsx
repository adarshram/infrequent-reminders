import * as React from "react";
import { View, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BottomNavigation from "./BottomNavigation";
import { SingleReminder } from "../pages/SingleReminder";
import { ListReminderSet } from "../pages/ListReminderSet";
import { SingleReminderSet } from "../pages/SingleReminderSet";

import { ViewReminderDetails } from "../pages/ViewReminderDetails";

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
          name="SingleReminder"
          component={SingleReminder}
          options={{ title: "Create Reminder" }}
        />
        <Stack.Screen
          name="ViewReminderDetails"
          title="View Reminder Details"
          component={ViewReminderDetails}
        />

        <Stack.Screen
          name="ListReminderSet"
          options={{ title: "Reminder Sets" }}
          component={ListReminderSet}
        />
        <Stack.Screen
          name="SingleReminderSet"
          options={{ title: "View/Edit Reminder Sets" }}
          component={SingleReminderSet}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default MainNavigation;
