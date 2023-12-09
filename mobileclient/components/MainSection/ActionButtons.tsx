import React, { useState } from "react";
import { FAB, Portal, Provider } from "react-native-paper";
export const ActionButtons = ({ navigation }) => {
   const [state, setState] = useState({ open: false });

   const onStateChange = ({ open }) => setState({ open });

   const { open } = state;

   return (
      <FAB.Group
         open={open}
         visible
         style={{ marginBottom: 40 }}
         icon={open ? "calendar-today" : "plus"}
         actions={[
            {
               icon: "reminder",
               label: "Reminder",
               onPress: () => {
                  navigation.navigate("SingleReminder");
               },
            },
            {
               icon: "group",
               label: "Reminder Sets",
               onPress: () => {
                  navigation.navigate("ListReminderSet");
               },
            },
         ]}
         onStateChange={onStateChange}
         onPress={() => {
            if (open) {
            }
         }}
      />
   );
};
