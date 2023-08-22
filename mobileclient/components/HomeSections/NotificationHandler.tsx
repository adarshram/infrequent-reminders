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
import * as Notifications from "expo-notifications";

import messaging from "@react-native-firebase/messaging";
const getAllowed = async () => {
   //POST_NOTIFICATIONS
   let finalStatus = false;
   try {
      const { status: existingStatus } =
         await Notifications.getPermissionsAsync();
      finalStatus = existingStatus;
      if (existingStatus !== "granted") {
         const { status: existingStatus } =
            await Notifications.requestPermissionsAsync();
         finalStatus = existingStatus;
      }
      if (finalStatus !== "granted") {
         //alert("Failed to get notification Permission");
         return false;
      }
      return finalStatus === "granted";
   } catch (e) {
      console.log(e);
      return false;
   }
   return finalStatus === "granted";
};
export const NotificationHandler = ({ navigation, date, refresh }) => {
   const [todaysReminders, setTodaysReminders] = useState([]);
   const [prevDate, setPrevDate] = useState(date ?? null);
   const [saveDevicesData, , , saveDevices] = useServerCall();
   const [fireBaseToken, setFireBaseToken] = useState(null);
   const [listOfDevices, setListOfDevices] = useState([]);
   const [notificationAllowed, setNotificationAllowed] = useState(false);

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
               isIos: false,
               isAndroid: false,
            };
            if (Platform.OS === "ios") {
               currentDevice = { ...currentDevice, isIos: true };
            }
            if (Platform.OS === "android") {
               currentDevice = { ...currentDevice, isAndroid: true };
            }
            devices.push(currentDevice);
         }
         setListOfDevices(devices);
      }
   }, [fireBaseToken, notificationListData]);

   useEffect(() => {
      let mount = true;
      const fetchToken = async () => {
         const isNotificationAllowed = await getAllowed();

         setNotificationAllowed(isNotificationAllowed);
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
            current.isMobile = true;
            if (Platform.OS === "ios") {
               current.isIos = true;
               current.isAndroid = false;
            }
            if (Platform.OS === "android") {
               current.isIos = false;
               current.isAndroid = true;
            }
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
   if (!notificationAllowed) {
      return <Text>Notification Not Allowed On Device</Text>;
   }
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
