import React, { useState, useEffect } from "react";
import {
   Image,
   Platform,
   ScrollView,
   Text,
   View,
   ActivityIndicator,
   StyleSheet,
   Pressable,
   FlatList,
   SafeAreaView,
} from "react-native";
import { format, add } from "date-fns";
import useServerCall from "../../hooks/useServerCall";
import { TextInput, Switch, Snackbar, HelperText } from "react-native-paper";

import messaging from "@react-native-firebase/messaging";

export const NotificationHandler = ({ navigation, date, refresh }) => {
   const [todaysReminders, setTodaysReminders] = useState([]);
   const [prevDate, setPrevDate] = useState(date ?? null);
   const [saveDevicesData, , , saveDevices] = useServerCall();
   const [fireBaseToken, setFireBaseToken] = useState(null);
   const [listOfDevices, setListOfDevices] = useState([]);
   const [notificationListData, notificationListLoading, , deviceListCaller] =
      useServerCall();

   if (
      fireBaseToken &&
      notificationListData === null &&
      !notificationListLoading
   ) {
      deviceListCaller.get("user/notificationDevices/list");
   }

   useEffect(() => {
      if (fireBaseToken && notificationListData !== null) {
         let devices = notificationListData?.data?.devices
            ? notificationListData.data.devices
            : [];
         let findVapidKey = fireBaseToken;
         let found = devices.find((v) => v.vapidKey === findVapidKey);

         if (!found) {
            let currentDevice = {
               enabled: false,
               name: "Mobile App",
               vapidKey: fireBaseToken,
               isMobile: true,
               isAndroid: true,
            };
            devices.push(currentDevice);
         }
         setListOfDevices(devices);
      }
   }, [fireBaseToken, notificationListData]);

   useEffect(() => {
      let mount = true;
      const fetchToken = async () => {
         if (fireBaseToken === null) {
            let token = await getTokenFromFireBase();
            if (mount) {
               setFireBaseToken(token);
            }
         }
      };
      fetchToken();
      return () => {
         mount = false;
      };
   }, [fireBaseToken]);

   const enableThisDevice = async (enabled, deviceData) => {
      const updatedListOfDevices = listOfDevices.map((current) => {
         const isCurrentDevice = current.vapidKey === deviceData.vapidKey;
         if (isCurrentDevice) {
            current.enabled = enabled;
         }
         return current;
      });
      await saveDevices.post("user/notificationDevices/saveDevices", {
         deviceList: updatedListOfDevices,
      });
   };
   //refresh list on save
   useEffect(() => {
      if (saveDevicesData) {
         deviceListCaller.get("user/notificationDevices/list");
      }
   }, [saveDevicesData]);

   return (
      <>
         {listOfDevices.map((v, key) => (
            <React.Fragment key={key}>
               {v.vapidKey === fireBaseToken && (
                  <>
                     <Text>
                        Notifications{" "}
                        <Switch
                           value={v.enabled}
                           onValueChange={(val) => enableThisDevice(val, v)}
                        />
                     </Text>
                  </>
               )}
            </React.Fragment>
         ))}
      </>
   );
};
const getTokenFromFireBase = async () => {
   await messaging().registerDeviceForRemoteMessages();
   const token = await messaging().getToken();
   return token;
};
