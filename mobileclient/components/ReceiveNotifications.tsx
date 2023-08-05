import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import messaging from "@react-native-firebase/messaging";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import notifee from "@notifee/react-native";
import useServerCall from "../hooks/useServerCall";
import {
  showNotification,
  createChannel,
  handleBackgroundEvent,
} from "../functions/notifications";

function RecieveNotifications({ navigation }) {
  const [channelId, setChannelId] = useState(false);
  const [snoozeData, , , snoozeNotification] = useServerCall();
  const [completeData, , , completeNotification] = useServerCall();

  const temp = {
    collapseKey: "com.infrequentscheduler.remindertest",
    data: { notificationMessage: "Test From node server" },
    from: "9005250937",
    messageId: "0:1683719015634256%251c4bd7251c4bd7",
    notification: {
      android: {},
      body: "Test From node server",
      title: "You have a Notification",
    },
    sentTime: 1683719015613,
    ttl: 86400,
  };

  const create = async () => {
    const createdId = await notifee.createChannel({
      id: "default",
      name: "Default Channel",
    });

    setChannelId(createdId);
    let remoteMessage = await messaging().getInitialNotification();
  };
  useEffect(() => {
    create();
  }, []);
  useEffect(() => {
    if (channelId) {
      // Assume a message-notification contains a "type" property in the data payload of the screen to open

      try {
        messaging().onMessage(async (remoteMessage) => {
          navigation.navigate("CreateEditSingleReminder");
        });

        messaging().onNotificationOpenedApp(async (remoteMessage) => {
          navigation.navigate("CreateEditSingleReminder");
        });
      } catch (err) {
        console.log(err);
      }
    }
  }, [channelId]);
  return "";
}

export default RecieveNotifications;
