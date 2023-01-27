import React, { useEffect, useRef, useState, useContext } from "react";
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
import { TextInput, Button, Banner, Appbar } from "react-native-paper";

import { UserContext } from "../models/UserContext";
import useSecureCall from "../hooks/useSecureCall";
import { Form, ProfileFormInput } from "../components/Profile/Form";

interface ProfileSaveData {
	first_name: string;
	last_name: string;
	email: string;
}
export default function Profile() {
	const signedInUser = useContext(UserContext);
	const { user, actions } = signedInUser;
	const [formInput, setFormInput] = useState<ProfileFormInput>(
		undefined as ProfileFormInput
	);

	const [results, loading, errors, refetch] = useSecureCall({
		endPoint: "user/profile",
		options: "get",
	});

	useEffect(() => {
		if (results && results.data) {
			setFormInput({
				id: results.data.id,
				email: results.data.email,
				first_name: results.data.first_name ?? "",
				last_name: results.data.last_name ?? "",
			});
		}
	}, [results]);
	const [saveResults, , saveErrors, saveCall] = useSecureCall(
		{
			endPoint: "user/profile/save",
			options: "post",
		},
		false
	);

	const onSave = async (saveBody: ProfileSaveData) => {
		saveCall(saveBody);
	};

	return (
		<View>
			<Appbar.Header>
				<Appbar.Content title="Edit Profile" />
			</Appbar.Header>

			{saveResults && saveResults.success && (
				<SucessBanner message={`Saved Successfully`} />
			)}
			<Form inputData={formInput} onSave={onSave} />
			<Button icon="logout" mode="contained" onPress={actions.logOut}>
				Logout
			</Button>
		</View>
	);
}

const SucessBanner = ({ message }) => {
	const [visible, setVisible] = useState(true);
	if (!message) {
		return "";
	}
	useEffect(() => {
		setTimeout(() => setVisible(false), 5000);
		return () => {
			setVisible(true);
		};
	}, []);
	return (
		<Banner
			visible={visible}
			actions={[
				{
					label: "Close",
					onPress: () => setVisible(false),
				},
			]}
		>
			{message}
		</Banner>
	);
};
