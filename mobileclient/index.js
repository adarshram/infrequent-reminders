/*import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
*/

// index.js
import { AppRegistry, Platform } from "react-native";
import messaging from "@react-native-firebase/messaging";
import notifee from "@notifee/react-native";
import App from "./App";
import {
	showNotification,
	createChannel,
	handleBackgroundEvent,
} from "./functions/notifications";
import { registerRootComponent } from "expo";

messaging().setBackgroundMessageHandler(async (remoteMessage) => {
	const channelData = await createChannel();
	const requestedSettings = await requestSettings();
	await showNotification(channelData, remoteMessage.data);
});

function HeadlessCheck({ isHeadless }) {
	if (isHeadless) {
		// App has been launched in the background by iOS, ignore
		return null;
	}

	return <App />;
}

registerRootComponent(HeadlessCheck);
