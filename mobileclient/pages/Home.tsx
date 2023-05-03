import React, { useEffect, useState } from "react";

import { Calendar, CalendarList, Agenda } from "react-native-calendars";
import {
	Image,
	Platform,
	ScrollView,
	Text,
	View,
	ActivityIndicator,
	StyleSheet,
	Pressable,
} from "react-native";
import { Button } from "react-native";

import { format, add } from "date-fns";
import useServerCall from "../hooks/useServerCall";
import { ViewReminder } from "../components/HomeSections/ViewReminder";
import { CreateEditSingleReminder } from "../pages/CreateEditSingleReminder";
import { useIsFocused } from "@react-navigation/native";

export default function Home(props) {
	const { navigation } = props;
	const isFocused = useIsFocused();
	let today = new Date();
	const firstCalendarDate = add(today, { month: -2 });
	const lastCalendarDate = add(today, { years: 2 });
	const [currentMonth, setCurrentMonth] = useState(today);
	const [markedDates, setMarkedDates] = useState({});
	const [selectedDate, setSelectedDate] = useState<Date | bool>(false);

	const [
		remindersForCurrentMonth,
		,
		fetchRemindersForMonthErrors,
		fetchRemindersForMonth,
	] = useServerCall();

	useEffect(() => {
		setMarkedDates({});
		if (currentMonth) {
			fetchRemindersForMonth.post(`user/notifications/fullMonth`, {
				month: format(currentMonth, "yyyy-MM"),
			});
		}
	}, [currentMonth]);
	useEffect(() => {
		if (remindersForCurrentMonth && remindersForCurrentMonth.data) {
			let datesToMark = {};
			let markAttributes = { dotColor: "red", marked: true };

			remindersForCurrentMonth.data.forEach((currentData) => {
				let formattedDate = format(
					new Date(currentData.notification_date),
					"yyyy-MM-dd"
				);
				datesToMark = {
					...datesToMark,
					[formattedDate]: markAttributes,
				};
			});

			setMarkedDates(datesToMark);
		}
	}, [remindersForCurrentMonth]);

	const refreshMonth = () => {
		fetchRemindersForMonth.post(`user/notifications/fullMonth`, {
			month: format(currentMonth, "yyyy-MM"),
		});
	};

	useEffect(() => {
		if (isFocused) {
			fetchRemindersForMonth.post(`user/notifications/fullMonth`, {
				month: format(currentMonth, "yyyy-MM"),
			});
		}
	}, [isFocused]);

	const subtractMonth = () => {
		console.log("i come here!");
	};
	const tomorrow = add(today, { days: 1 });

	const addMonth = () => {};
	const MonthHeader = ({ month }) => {
		const monthText = format(month, "MMMM - yyyy");
		return <Text>{monthText}</Text>;
	};

	return (
		<>
			<Calendar
				// Initially visible month. Default = now
				// Minimum date that can be selected, dates before minDate will be grayed out. Default = undefined
				//minDate={format(firstCalendarDate, "yyyy-MM-dd")}
				// Maximum date that can be selected, dates after maxDate will be grayed out. Default = undefined
				maxDate={format(lastCalendarDate, "yyyy-MM-dd")}
				// Handler which gets executed on day press. Default = undefined
				onDayPress={(day) => {
					setSelectedDate(new Date(day.timestamp));
				}}
				markedDates={markedDates}
				// Handler which gets executed on day long press. Default = undefined
				onDayLongPress={(day) => {
					console.log("selected daylong press", day);
				}}
				// Month format in calendar title. Formatting values: http://arshaw.com/xdate/#Formatting
				monthFormat={"yyyy MM"}
				// Handler which gets executed when visible month changes in calendar. Default = undefined
				onMonthChange={(month) => {
					setCurrentMonth(new Date(month.timestamp));
				}}
				// Hide month navigation arrows. Default = false
				// Replace default arrows with custom ones (direction can be 'left' or 'right')
				// Do not show days of other months in month page. Default = false
				hideExtraDays={false}
				// If hideArrows = false and hideExtraDays = false do not switch month when tapping on greyed out
				// day from another month that is visible in calendar page. Default = false
				disableMonthChange={false}
				// If firstDay=1 week starts from Monday. Note that dayNames and dayNamesShort should still start from Sunday
				firstDay={1}
				// Handler which gets executed when press arrow icon left. It receive a callback can go back month
				onPressArrowLeft={(subtractMonth) => subtractMonth()}
				// Handler which gets executed when press arrow icon right. It receive a callback can go next month
				onPressArrowRight={(addMonth) => addMonth()}
				// Disable all touch events for disabled days. can be override with disableTouchEvent in markedDates
				disableAllTouchEventsForDisabledDays={false}
				// Replace default month and year title with custom one. the function receive a date as parameter
				renderHeader={() => {
					return <MonthHeader month={currentMonth} />;
				}}
				// Enable the option to swipe between months. Default = false
				enableSwipeMonths={true}
			/>
			{selectedDate !== false && (
				<ViewReminder
					date={selectedDate}
					refresh={() => refreshMonth()}
					{...props}
				/>
			)}
		</>
	);
}
