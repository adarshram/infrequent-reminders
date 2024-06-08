import React, { useState } from "react";
import { FAB, Portal, Provider } from "react-native-paper";
//https://pictogrammers.com/library/mdi/
/*
{
               icon: "paw",
               onPress: () => {
                  navigation.navigate("tbd");
               },
            },
*/
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
                  navigation.navigate("SingleReminder");
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
