import {
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  getAuth,
} from 'firebase/auth';
import { useState } from 'react';

//getByFbaseUserId
const useFbaseAuthUser = (fBaseAuthUser) => {
  const auth = getAuth();
  const [errors, setErrors] = useState([]);
  const googleSignin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const res = await signInWithPopup(auth, provider);
      return res;
    } catch (err) {
      console.log(err.message);
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
      seconds ? seconds * 1000 : 1000,
    );
  };
  const setAndClearError = (message) => {
    setErrors([message]);
    clearErrorsInSeconds(3);
  };
  const emailPassword = {
    signup: async (email, password) => {
      try {
        let created = await createUserWithEmailAndPassword(auth, email, password);
        return created;
      } catch (err) {
        if (hasText(err.message, 'Error (auth/email-already-in-use)')) {
          setAndClearError('Email Already In Use');

          return;
        }
        setAndClearError(err.message);
      }
      return false;
    },
    signin: async (email, password) => {
      try {
        let signedIn = await signInWithEmailAndPassword(auth, email, password);
        return signedIn;
      } catch (err) {
        if (hasText(err.message, 'Firebase: Error (auth/invalid-email).')) {
          setAndClearError('Invalid Email');
          return;
        }
        if (hasText(err.message, 'auth/wrong-password')) {
          setAndClearError('Invalid Password');
          return;
        }

        setAndClearError(err.message);
        console.log(err.message);
      }
      return false;
    },
  };

  return [{ googleSignin: googleSignin, emailPassword }, errors];
};

export default useFbaseAuthUser;
