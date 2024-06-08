import React, { useEffect, useState, useContext } from "react";

import { StyleSheet, View, Text, SafeAreaView, Platform } from "react-native";
import { TextInput, SegmentedButtons, Divider } from "react-native-paper";
import {
	Button,
	Dialog,
	Portal,
	Surface,
	ToggleButton,
	Menu,
	RadioButton,
} from "react-native-paper";
import DropDown from "react-native-paper-dropdown";
import { NativeSingleSelect } from "../../Base/Selects";

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	smallTextSurface: {
		padding: 1,
		marginLeft: "2%",
		width: "25%",
	},
	textDivider: {
		padding: 2,
	},
	formInputSurface: {
		padding: 1,
		width: "95%",
		alignItems: "flex-start",
	},
	customOptions: {
		alignItems: "flex-start",
		width: 7,
		maxWidth: 7,
	},
	customSegmentButton: {
		borderRadius: 0,
		width: "10%",
		flex: 1,
		borderStyle: "solid",
	},
});

export const BaseOptions = ({ frequencyType, frequency, onChange }) => {
	const [value, setValue] = useState("");
	const [isCustom, setIsCustom] = useState(false);
	const [localFrequency, setLocalFrequency] = useState(frequency);
	const [localFrequencyType, setLocalFrequencyType] = useState(frequencyType);

	useEffect(() => {
		if (frequency) {
			setLocalFrequency(frequency);
		}
		if (frequencyType) {
			setLocalFrequencyType(frequencyType);
		}
	}, [frequency, frequencyType]);

	const onTypeChange = (v: string) => {
		setValue(v);
		setIsCustom(false);
		const isAdvanced = v === "a";
		if (isAdvanced) {
			setIsCustom(true);
		}
		if (!isAdvanced) {
			onChange({
				frequencyType: v,
				frequency: `1`,
			});
		}
	};
	const onCustomChange = (v) => {
		onChange(v);
		setIsCustom(false);
	};

	useEffect(() => {
		if (frequencyType) {
			let fType = "a";
			if (frequencyType === "w" || frequencyType === "m") {
				fType = frequencyType;
			}
			setValue(fType);
		}
	}, [frequencyType]);

	return (
		<>
			{isCustom && (
				<CustomDateDialog
					onClose={() => setIsCustom(false)}
					show={true}
					localFrequency={localFrequency}
					localFrequencyType={localFrequencyType}
					setLocalFrequency={setLocalFrequency}
					setLocalFrequencyType={setLocalFrequencyType}
					onSuccess={(v) => {
						onCustomChange(v);
					}}
				/>
			)}

			<SegmentedButtons
				value={value}
				onValueChange={onTypeChange}
				style={{ width: "95%", padding: 1, marginLeft: "2%" }}
				buttons={[
					{
						value: "w",
						label: "Weekly",
					},
					{
						value: "m",
						label: "Monthly",
					},
					{
						value: "a",
						label: "Advanced",
					},
				]}
			/>
		</>
	);
};

export const CustomDateDialog = ({
	show,
	onClose,
	localFrequency,
	localFrequencyType,
	setLocalFrequency,
	setLocalFrequencyType,
	onSuccess,
}) => {
	const [visible, setVisible] = useState(show);
	const onOkPress = () => {
		onSuccess({
			frequency: localFrequency,
			frequencyType: localFrequencyType,
		});
	};
	const hideDialog = () => setVisible(false);
	const validateAndSetType = (fq: string) => {
		if (fq === "d" && localFrequency < 5) {
			setLocalFrequency(`5`);
		}
		setLocalFrequencyType(fq);
	};
	const validateAndSetFrequency = (d: string) => {
		if (localFrequencyType === "d" && d < 5 && d !== "") {
			setLocalFrequency(`5`);
			return;
		}
		setLocalFrequency(d);
	};
	return (
		<Portal>
			<Dialog visible={visible} onDismiss={hideDialog}>
				<Dialog.Content>
					<InputData
						localFrequency={localFrequency}
						localFrequencyType={localFrequencyType}
						setLocalFrequency={(d) => validateAndSetFrequency(d)}
						setLocalFrequencyType={(fq) => validateAndSetType(fq)}
					/>
				</Dialog.Content>
				<Dialog.Actions>
					<Button
						onPress={() => {
							setVisible(false);
							onClose();
						}}
					>
						Cancel
					</Button>
					<Button onPress={() => onOkPress()} mode="contained-tonal">
						Ok
					</Button>
				</Dialog.Actions>
			</Dialog>
		</Portal>
	);
};

const InputData = ({
	localFrequency,
	localFrequencyType,
	setLocalFrequency,
	setLocalFrequencyType,
}) => {
	return (
		<>
			<Surface
				style={{
					flexDirection: "column",
					marginBottom: 20,
				}}
				elevation="0"
			>
				<View style={{ marginTop: 25, marginRight: 4 }}>
					<Text>Every</Text>
				</View>
				<View
					style={{
						padding: 1,
						marginRight: 5,
						minWidth: 70,
					}}
				>
					<TextInput
						label="Frequency"
						mode="flat"
						value={`${localFrequency}`}
						maxLength={3}
						keyboardType="numeric"
						onChangeText={(text) => setLocalFrequency(text)}
					/>
				</View>
				<View style={{ flexDirection: "row", padding: 4 }}>
					<RadioButton.Group
						onValueChange={(newValue) =>
							setLocalFrequencyType(newValue)
						}
						value={localFrequencyType}
					>
						<View>
							<Text>Days</Text>
							<RadioButton value="d" />
						</View>
						<View>
							<Text>Months</Text>
							<RadioButton value="m" />
						</View>
						<View>
							<Text>Weeks</Text>
							<RadioButton value="w" />
						</View>
						<View>
							<Text>Years</Text>
							<RadioButton value="y" />
						</View>
					</RadioButton.Group>
				</View>
				{/*<NativeSingleSelect
					items={[
						{
							value: "d",
							label: "Days",
						},
						{
							value: "w",
							label: "Weeks",
						},
						{
							value: "m",
							label: "Months",
						},
						{
							value: "y",
							label: "Years",
						},
					]}
					selectedValue={localFrequencyType}
					onSelect={(v) => console.log(v)}
					extraStyle={{ marginTop: 6 }}
					iconStyles={{
						top: 16,
						right: 12,
					}}
				/>*/}
			</Surface>
		</>
	);
};
