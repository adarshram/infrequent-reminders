after installation generate sha keys and add it to google and then come back and rebuild the app .

npx expo prebuild --clean <--This cleans out whatever is in build gradle etc
npx react-native build-android <-- rebuids the app with native dependencies .
npx eas-cli build --profile development --platform android <--Android build

npx react-native build-android --mode=release <--for building android

cd android && ./gradlew signingReport

Generate a new android debug key under android/app folder. Go to the root folder of your react native app and run the below command.
keytool -list -v -keystore ./android/app/debug.keystore -alias androiddebugkey -storepass android -keypass android

emulator -list-avds
for restarting the emulator fresh
emulator @Pixel_6_Pro_API_33 -wipe-data
for just starting the emulator
psql -h localhost -p 5432 -d infrequent_scheduler -U adarshram -W
Api Live url : https://infrequent-scheduler-api-mjw7y7re7q-uc.a.run.app/

for ios :
npm run ios
to build
npx react-native run-ios
