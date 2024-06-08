run
npm install .
Copy the google google-services.json file .
Make the env file and point it to the server url .

npx expo prebuild --clean - run it once if it fails its fine move on to the next step .

Generate a new android debug key under android/app folder. Go to the root folder of your react native app and run the below command.
keytool -list -v -keystore ./android/app/debug.keystore -alias androiddebugkey -storepass android -keypass android

Run the Gradle signing report
cd android && ./gradlew signingReport

//Build the app for dev .
npx react-native build-android

once this completes run
npm start .
make sure emulator is running in a different terminal .

Emulator Commands :
emulator -list-avds
for restarting the emulator fresh
emulator @Pixel_6_Pro_API_33 -wipe-data

For Generating the production apk :

npx react-native build-android --mode=release

TroubleShooting :
//Clear cache on expo if env file variables are stuck and build the app again
expo start --clear
npx react-native build-android
