import RNPickerSelect from "react-native-picker-select";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Platform } from "react-native";

export const NativeSingleSelect = ({
	items,
	selectedValue,
	onSelect,
	extraStyle,
	iconStyles,
	label,
}) => {
	const style = extraStyle ? extraStyle : {};
	const pickerSelectStyles = StyleSheet.create({
		inputIOS: {
			fontSize: 20,
			paddingVertical: 12,
			paddingHorizontal: 10,
			borderWidth: 1,
			borderColor: "purple",
			borderRadius: 4,
			color: "black",
			paddingRight: 50, // to ensure the text is never behind the icon
			...style,
		},
		inputAndroid: {
			fontSize: 16,
			paddingHorizontal: 10,
			paddingVertical: 8,
			borderWidth: 0.5,
			borderColor: "purple",
			borderRadius: 8,
			color: "black",
			paddingRight: 30, // to ensure the text is never behind the icon
			...style,
		},
	});
	const placeholder = {
		label: label ? label : "Select",
		icon: "camera",
		value: null,
		color: "#9EA0A4",
	};
	const defaultItems = [
		{ label: "Football", value: "football" },
		{ label: "Baseball", value: "baseball" },
		{ label: "Hockey", value: "hockey" },
	];
	const iconStyle = iconStyles
		? iconStyles
		: {
				top: 10,
				right: 12,
		  };

	return (
		<RNPickerSelect
			placeholder={placeholder}
			value={selectedValue ?? ""}
			onValueChange={(v) => {
				onSelect(v);
			}}
			items={items ? items : defaultItems}
			style={{
				...pickerSelectStyles,
				iconContainer: iconStyle,
			}}
			blurOnSubmit={false}
			Icon={() => {
				return (
					<Ionicons
						name="caret-down-circle-outline"
						size={24}
						color="black"
					/>
				);
			}}
		/>
	);
};
