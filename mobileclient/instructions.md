after installation generate sha keys and add it to google and then come back and rebuild the app .

npx expo prebuild --clean <--This cleans out whatever is in build gradle etc
npx react-native run-android <-- rebuids the app with native dependencies .
npx eas-cli build --profile development --platform android <--Android build

cd android && ./gradlew signingReport

Generate a new android debug key under android/app folder. Go to the root folder of your react native app and run the below command.
keytool -list -v -keystore ./android/app/debug.keystore -alias androiddebugkey -storepass android -keypass android

emulator -list-avds
for restarting the emulator fresh
emulator @Copy1_of_Pixel_2_API_31 -wipe-data
psql -h localhost -p 5432 -d infrequent_scheduler -U adarshram -W
