import React, { useEffect, useState, useContext } from "react";
import { StyleSheet, View, Text } from "react-native";
import { Surface, TextInput } from "react-native-paper";
import { MaterialIcons } from "react-native-vector-icons";

const styles = StyleSheet.create({
	repeatDescription: {
		padding: 1,
		justifyContent: "center",
		width: "100%",
		display: "flex",
		flexDirection: "row",
	},
});

const RepeatDescription = ({ frequencyType, frequency }) => {
	let frequencyText = "Week";
	if (frequencyType === "y") {
		frequencyText = frequency > 1 ? "Years" : "Year";
	}
	if (frequencyType === "w") {
		frequencyText = frequency > 1 ? "Weeks" : "Week";
	}
	if (frequencyType === "m") {
		frequencyText = frequency > 1 ? "Months" : "Month";
	}
	if (frequencyType === "d") {
		frequencyText = frequency > 1 ? "Days" : "Day";
	}
	return (
		<View style={styles.repeatDescription}>
			<MaterialIcons name="repeat" />
			<Text>
				{frequency} {frequencyText}
			</Text>
		</View>
	);
};

export default RepeatDescription;
