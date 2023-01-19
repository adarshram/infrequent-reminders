after installation generate sha keys and add it to google and then come back and rebuild the app .

npx expo prebuild --clean <--This cleans out whatever is in build gradle etc
npx react-native run-android <-- rebuids the app with native dependencies .
npx eas-cli build --profile development --platform android <--Android build

cd android && ./gradlew signingReport
SHA1: 63:11:54:3A:BC:8F:CC:25:30:10:18:D1:85:0D:89:EE:BA:B4:E3:EF
SHA-256: 02:7E:99:26:25:8A:4A:62:AC:7A:3E:36:9A:E6:62:FE:A8:A9:53:FB:82:73:04:27:F0:4B:45:E6:A1:1D:B4:F0

SHA1: 5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
SHA256: FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C
Signature algorithm name: SHA1withRSA (weak)

Generate a new android debug key under android/app folder. Go to the root folder of your react native app and run the below command.
keytool -list -v -keystore ./android/app/debug.keystore -alias androiddebugkey -storepass android -keypass android

emulator -list-avds
for restarting the emulator fresh
emulator @Copy1_of_Pixel_2_API_31 -wipe-data
