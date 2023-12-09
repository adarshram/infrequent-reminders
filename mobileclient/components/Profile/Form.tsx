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
import { TextInput, Button, Snackbar, HelperText } from "react-native-paper";
//import { AntDesign } from "@expo/vector-icons";
export interface ProfileFormInput {
	email: string;
	first_name: string;
	id?: number | null;
}

interface Props {
	inputData: ProfileFormInput;
	onSave: any;
}

export const Form = (props: Props) => {
	const { inputData, onSave } = props;
	const [errors, setErrors] = useState([]);
	const [formData, setFormData] = useState<ProfileFormInput>({
		email: "",
		first_name: "",
		last_name: "",
		id: "",
	});
	useEffect(() => {
		if (inputData) {
			setFormData(inputData);
		}
	}, [inputData]);
	const onChange = (key, value) => {
		setFormData({
			...formData,
			[key]: value,
		});
	};
	const validateOnSave = () => {
		let validated = true;
		let validateErrors = [];
		if (formData.first_name === "") {
			validateErrors = [...validateErrors, "First name is required"];
			validated = false;
		}
		if (formData.last_name === "") {
			validateErrors = [...validateErrors, "Last name is required"];
			validated = false;
		}
		if (formData.email === "" || !validateEmail(formData.email)) {
			validateErrors = [...validateErrors, "Email is not valid"];
			validated = false;
		}
		setErrors(validateErrors);

		return validated;
	};

	const validateEmail = (text) => {
		let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
		return reg.test(text);
	};
	const handleSubmit = () => {
		if (validateOnSave()) {
			onSave(formData);
		}
	};
	//const saveButton = <AntDesign name="save" size={24} color="black" />;
	const saveButton = <></>;
	return (
		<>
			<ErrorMessagesDisplay errors={errors} />
			<TextInput
				label="Email"
				value={formData.email}
				onChangeText={(text) => {
					onChange("email", text);
				}}
				testID="email"
			/>
			<TextInput
				label="First Name"
				value={formData.first_name}
				onChangeText={(text) => onChange("first_name", text)}
				testID="first_name"
			/>
			<TextInput
				label="Last Name"
				value={formData.last_name}
				onChangeText={(text) => onChange("last_name", text)}
				testID="last_name"
			/>

			<Button
				icon={saveButton}
				mode="contained"
				onPress={handleSubmit}
				testID="submit_form"
			>
				Submit
			</Button>
		</>
	);
};

const ErrorMessagesDisplay = ({ errors }) => {
	if (!errors || errors.length < 1) {
		return "";
	}
	return (
		<>
			{errors.map((error, k) => (
				<HelperText key={k} type="error" visible={true}>
					{error}
				</HelperText>
			))}
		</>
	);
};
const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "space-between",
	},
});

/*
import { AntDesign } from "@expo/vector-icons";
<AntDesign name="save" size={24} color="black" />
*/
