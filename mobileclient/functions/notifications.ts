import notifee from "@notifee/react-native";
import { ServerCall } from "./serverCalls";

export const showNotification = async (channelId, notificationData) => {
  notifee.displayNotification({
    title: `<p style="color: #4caf50;"><b>${notificationData?.title}</b></p>`,
    subtitle: "",
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

export const handleBackgroundEvent = async (props) => {
  const { type, detail } = props;

  const { notification, pressAction } = detail;

  if (!pressAction) {
    return;
  }
  const serverCall = new ServerCall();

  let notificationId = detail.notification.data?.notificationId;
  let isSnooze = pressAction.id === "snooze";
  if (isSnooze) {
    const snoozeResult = await serverCall.get(
      `direct/notifications/snooze/${notificationId}/123121`
    );
  }
  let isDone = pressAction.id === "done";
  if (isDone) {
    const completeResult = await serverCall.get(
      `direct/notifications/complete/${notificationId}/123121`
    );
  }
  let isDefault = pressAction.id === "default";
  // Remove the notification
  await notifee.cancelNotification(notification.id);
};

export const createChannel = async (
  channelId?: string,
  channelName?: string
) => {
  const createdId = await notifee.createChannel({
    id: channelId ?? "default",
    name: channelName ?? "Default Channel",
  });
  return createdId;
};
