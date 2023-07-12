import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import messaging from "@react-native-firebase/messaging";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import notifee from "@notifee/react-native";
import useServerCall from "../hooks/useServerCall";

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
  const myCustomNotification = async (notificationData) => {
    if (!channelId) {
      setTimeout(
        (notificationData) => myCustomNotification(notificationData),
        1000
      );
      return;
    }

    notifee.displayNotification({
      title: `<p style="color: #4caf50;"><b>${notificationData?.title}</b></p>`,
      subtitle: "&#129395;",
      body: `${notificationData?.body}`,
      data: notificationData,
      android: {
        pressAction: {
          id: "default",
        },
        channelId,
        color: "#4caf50",
        actions: [
          {
            title: "<button>Snooze</button>",
            pressAction: {
              id: "snooze",
              notificationId: notificationData?.notificationId,
            },
          },
          {
            title: "<button>Done</button>",
            pressAction: { id: "done" },
          },
        ],
      },
    });
  };

  const handleUserEvent = async (props) => {
    const { type, detail } = props;

    const { notification, pressAction } = detail;

    if (!pressAction) {
      return;
    }
    let notificationId = detail.notification.data?.notificationId;
    let isSnooze = pressAction.id === "snooze";
    if (isSnooze) {
      await snoozeNotification.get(
        `user/notifications/snooze/${notificationId}`
      );
    }
    let isDone = pressAction.id === "done";
    if (isDone) {
      await completeNotification.get(
        `user/notifications/complete/${notificationId}`
      );
    }
    let isDefault = pressAction.id === "default";
    if (isDefault) {
      navigation.navigate("ViewReminderDetails", {
        reminderId: notificationId,
      });
    }

    // Remove the notification
    await notifee.cancelNotification(notification.id);
  };
  notifee.onBackgroundEvent(async (props) => {
    await handleUserEvent(props);
  });
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
          console.log("onMessage");
          console.log(remoteMessage);
          //navigation.navigate("CreateEditSingleReminder");
        });
        messaging().setBackgroundMessageHandler(async (remoteMessage) => {
          await create();
          console.log(remoteMessage);
          myCustomNotification(remoteMessage.data);
        });
        messaging().onNotificationOpenedApp(async (remoteMessage) => {
          console.log("on notification opened app");
          console.log(remoteMessage);
          //navigation.navigate("CreateEditSingleReminder");
        });
      } catch (err) {
        console.log(err);
      }
    }
  }, [channelId]);
  return "";
}

export default RecieveNotifications;
