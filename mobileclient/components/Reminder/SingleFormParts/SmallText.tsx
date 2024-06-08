import React, { useEffect, useState, useContext } from "react";
import { StyleSheet } from "react-native";
import { Surface, TextInput } from "react-native-paper";

const styles = StyleSheet.create({
	smallTextSurface: {
		padding: 1,
		marginLeft: "2%",
		width: "25%",
	},
});
export const SmallText = ({ frequency, onChange }) => {
	return (
		<Surface style={styles.smallTextSurface} elevation="0">
			<TextInput
				label="Repeat Frequency"
				mode="outlined"
				value={frequency ?? 1}
				onChangeText={(text) => onChange(text)}
				maxLength={3}
				keyboardType="numeric"
			/>
		</Surface>
	);
};
export default SmallText;
