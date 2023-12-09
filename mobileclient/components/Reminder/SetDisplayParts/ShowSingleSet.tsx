import React, { useEffect, useState, useContext } from "react";
import { List, Button, Dialog } from "react-native-paper";
import { StyleSheet, View, Text, SafeAreaView } from "react-native";

import { MaterialIcons } from "react-native-vector-icons";
type AlertMetaData = {
	title: string;
	content: string;
};
const ShowSingleSet: React.FC<{
	reminderSet: ReminderSet;
	onDelete: (reminderToDelete: ReminderSet) => void;
	onEdit: (reminderToEdit: ReminderSet) => void;
}> = ({ reminderSet, onDelete, onEdit }) => {
	const [showAlert, setShowAlert] = useState(true);
	const [alertData, setAlertData] = useState<AlertMetaData | null>(null);

	if (!reminderSet) {
		return <></>;
	}
	const pressDelete = () => {
		setShowAlert(true);
		setAlertData({
			title: "Confirm Delete",
			content: "This Action will Permanently Delete the Set",
		});
	};
	const pressEdit = () => {
		onEdit(reminderSet);
	};
	const onConfirmDelete = () => {
		setShowAlert(false);
		onDelete(reminderSet);
	};

	return (
		<>
			{showAlert && alertData !== null && (
				<Dialog
					visible={showAlert}
					onDismiss={() => setShowAlert(false)}
				>
					<Dialog.Title>{alertData.title}</Dialog.Title>
					<Dialog.Content>
						<Text variant="bodyMedium">{alertData.content}</Text>
					</Dialog.Content>
					<Dialog.Actions>
						<Button
							mode="contained"
							onPress={() => onConfirmDelete()}
							labelStyle="gray"
						>
							Confirm
						</Button>
						<Button onPress={() => setShowAlert(false)}>
							Cancel
						</Button>
					</Dialog.Actions>
				</Dialog>
			)}
			<List.Item
				title={reminderSet.subject}
				description={`${reminderSet.no_sets} reminders in set`}
				left={(props) => <List.Icon {...props} icon="repeat" />}
				right={(props) => (
					<>
						<Button
							icon={() => <MaterialIcons name="delete" />}
							mode="Outlined"
							compact={true}
							onPress={() => pressDelete()}
						></Button>
						<Button
							icon={() => <MaterialIcons name="edit" />}
							mode="Outlined"
							compact={true}
							onPress={() => pressEdit()}
						></Button>
					</>
				)}
			/>
		</>
	);
};
export default ShowSingleSet;
