import React, { useEffect, useState, useContext } from "react";
import { CreateEditSingle } from "../components/Reminder/CreateEditSingle";
import { UserContext } from "../models/UserContext";
import useServerCall from "../hooks/useServerCall";
import { Surface, Text, Card } from "react-native-paper";
import { format, add } from "date-fns";
import { ViewListNotifications } from "../components/ViewListNotifications";

export const PendingList = ({ navigation, route }) => {
	const signedInUser = useContext(UserContext);
	const [pendingData, pendingLoading, pendingErrors, pendingNotification] =
		useServerCall();

	const fetchPendingNotifications = () => {
		pendingNotification.get("user/notifications/pending");
	};
	const hasPendingInitialized = pendingData === null && !pendingLoading;
	if (hasPendingInitialized) {
		fetchPendingNotifications();
	}

	const pendingNotifications =
		pendingData?.data && pendingData.data.length ? pendingData.data : [];

	return (
		<>
			<Text>Pending Notifications</Text>
			<ViewListNotifications
				notifications={pendingNotifications}
				navigation={navigation}
				route={route}
				refresh={() => {
					fetchPendingNotifications();
				}}
			/>
		</>
	);
};
export default PendingList;
