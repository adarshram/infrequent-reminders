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
               icon: "plus",
               onPress: () => {
                  navigation.navigate("Create Edit Single Reminder");
               },
            },
            {
               icon: "star",
               label: "Star",
               onPress: () => console.log("Pressed star"),
            },
            {
               icon: "email",
               label: "Email",
               onPress: () => console.log("Pressed email"),
            },
            {
               icon: "bell",
               label: "Remind",
               onPress: () => console.log("Pressed notifications"),
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
