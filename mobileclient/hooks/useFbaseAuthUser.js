import { GoogleSignin } from "@react-native-google-signin/google-signin";

import { useState, useEffect } from "react";
import auth from "@react-native-firebase/auth";

const useFbaseAuthUser = () => {
  //const currentUser = auth().currentUser;
  const [user, setUser] = useState(null);
  const [errors, setErrors] = useState([]);
  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        "9005250937-so25979rq35r6pnmi8lanj5vmof0bd8v.apps.googleusercontent.com",
      androidClientId:
        "9005250937-7ni9k3og63ce5hukrmrd65h47f71qdu4.apps.googleusercontent.com",
    });
    const onAuthStateChanged = async (authUser) => {
      if (!auth().currentUser) {
        setUser(false);
        return;
      }
      const idTokenResult = await auth().currentUser.getIdTokenResult();
      let userWithToken = await auth().currentUser;
      userWithToken.accessToken = idTokenResult.token;
      setUser(userWithToken);
    };
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  const signInWithEmailAndPassword = async (emailInput, passwordInput) => {
    if (!emailInput || emailInput === "") {
      return false;
    }
    try {
      const authValue = await auth().signInWithEmailAndPassword(
        emailInput,
        passwordInput
      );
      return authValue;
    } catch (e) {
      setAndClearError(e.message);
      return false;
    }
    return false;
  };
  const googleSignin = async () => {
    await GoogleSignin.hasPlayServices({
      showPlayServicesUpdateDialog: true,
    });

    // Sign-in the user with the credential
    try {
      const { idToken } = await GoogleSignin.signIn();

      // Create a Google credential with the token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const authValue = auth().signInWithCredential(googleCredential);

      return authValue;
    } catch (e) {
      console.log(e);
      return false;
    }
  };
  const hasText = (source, search) => {
    return source.indexOf(search) !== -1;
  };
  const clearErrorsInSeconds = (seconds) => {
    setTimeout(
      () => {
        setErrors([]);
      },
      seconds ? seconds * 1000 : 1000
    );
  };
  const setAndClearError = (message) => {
    setErrors([message]);
    clearErrorsInSeconds(3);
  };

  const logOut = async () => {
    try {
      await auth().signOut();
    } catch (err) {
      if (hasText(err.message, "Firebase: Error (auth/invalid-email).")) {
        setAndClearError("Invalid Email");
        return;
      }
      if (hasText(err.message, "auth/wrong-password")) {
        setAndClearError("Invalid Password");
        return;
      }

      setAndClearError(err.message);
      console.log(err.message);
    }
    return false;
  };

  return [
    {
      googleSignin: googleSignin,
      signInWithEmailAndPassword: signInWithEmailAndPassword,
      logOut: logOut,
    },
    user,
    errors,
  ];
};

export default useFbaseAuthUser;
