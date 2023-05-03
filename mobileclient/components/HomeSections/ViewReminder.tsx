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
import useSecureCall from "../../hooks/useSecureCall";
import { ViewSingle } from "../../components/Reminder/ViewSingle";

export const ViewReminder = ({ navigation, date, refresh }) => {
   const [todaysReminders, setTodaysReminders] = useState([]);
   const [prevDate, setPrevDate] = useState(date ?? null);
   const [
      remindersForDate,
      remindersLoading,
      remindersErrors,
      fetchRemindersForDate,
   ] = useServerCall();

   const [, , , deleteNotification] = useServerCall();
   const [snoozeData, , , snoozeNotification] = useServerCall();
   const [completeData, , , completeNotification] = useServerCall();

   if (date && remindersForDate === null && !remindersLoading) {
   }

   useEffect(() => {
      setTodaysReminders([]);
      if (
         remindersForDate &&
         remindersForDate.data &&
         remindersForDate.data.results &&
         remindersForDate.data.results.length
      ) {
         setTodaysReminders(remindersForDate.data.results);
      }
   }, [remindersForDate]);

   const hasDateChanged = prevDate !== date;
   if (hasDateChanged) {
      fetchRemindersForDate.post("user/notifications/listByDate", {
         date: format(date, "yyyy-MM-dd"),
      });
      setPrevDate(date);
   }

   const onSnooze = async (reminder) => {
      await snoozeNotification.get(`user/notifications/snooze/${reminder.id}`);

      fetchRemindersForDate.post("user/notifications/listByDate", {
         date: format(date, "yyyy-MM-dd"),
      });
      console.log(refresh);
      refresh();
   };

   const onComplete = async (reminder) => {
      await completeNotification.get(
         `user/notifications/complete/${reminder.id}`
      );

      fetchRemindersForDate.post("user/notifications/listByDate", {
         date: format(date, "yyyy-MM-dd"),
      });
      refresh();
   };
   const onDelete = async (reminder) => {
      await deleteNotification.post("user/notifications/delete", {
         id: reminder.id,
      });
      refresh();
      fetchRemindersForDate.post("user/notifications/listByDate", {
         date: format(date, "yyyy-MM-dd"),
      });
   };

   return (
      <>
         <Text>View Reminders for {format(date, "MM/dd/yyyy")}</Text>
         <SafeAreaView
            style={{
               flex: 1,
               marginTop: 0,
            }}
         >
            <FlatList
               data={todaysReminders}
               renderItem={({ item }) => (
                  <ViewSingle
                     reminder={item}
                     onSnooze={(reminder) => onSnooze(reminder)}
                     onComplete={(reminder) => onComplete(reminder)}
                     onDelete={(reminder) => onDelete(reminder)}
                     onEdit={(reminder) => {
                        navigation.navigate("CreateEditSingleReminder", {
                           reminderId: reminder.id,
                        });
                     }}
                  />
               )}
               keyExtractor={(reminder) => reminder.id}
            />
         </SafeAreaView>
      </>
   );
};
