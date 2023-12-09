import React, { useState, useEffect } from "react";
import { Button } from "react-native-paper";

import { MaterialIcons } from "react-native-vector-icons";

import { format, add } from "date-fns";
import useServerCall from "../../hooks/useServerCall";
import { ServerCall } from "../../functions/serverCalls";
import { ViewSingle } from "../../components/Reminder/ViewSingle";

export const AddNewReminder = ({ date, onAdd }) => {
   return (
      <>
         <Button
            icon={() => <MaterialIcons name="add" />}
            mode="Outlined"
            compact={true}
            onPress={() => onAdd()}
         >
            Add New
         </Button>
      </>
   );
};
export default AddNewReminder;
