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
import { ServerCall } from "../../functions/serverCalls";
import { ViewSingle } from "../../components/Reminder/ViewSingle";
import AddNewReminder from "../../components/HomeSections/AddNewReminder";

export const ViewReminder = (props) => {
   const { navigation, date, refresh } = props;
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
   const serverCall = new ServerCall();
   if (date && remindersForDate === null && !remindersLoading) {
      fetchRemindersForDate.post("user/notifications/listByDate", {
         date: format(date, "yyyy-MM-dd"),
      });
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
      const snoozeResult = await serverCall.get(
         `direct/notifications/snooze/${reminder.id}/123121`
      );

      fetchRemindersForDate.post("user/notifications/listByDate", {
         date: format(date, "yyyy-MM-dd"),
      });

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

   const onAddClick = () => {
      navigation.navigate("SingleReminder", {
         prefilledDate: format(date, "yyyy-MM-dd"),
      });
   };

   //<AddNewReminder date={selectedDate} />
   return (
      <>
         <AddNewReminder date={date} onAdd={() => onAddClick()} />

         <SafeAreaView
            style={{
               flex: 0,
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
                        navigation.navigate("SingleReminder", {
                           reminderId: reminder.id,
                        });
                     }}
                     onView={(reminder) => {
                        navigation.navigate("ViewReminderDetails", {
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
