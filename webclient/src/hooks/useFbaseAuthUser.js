import {
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  getAuth,
} from 'firebase/auth';

//getByFbaseUserId
const useFbaseAuthUser = (fBaseAuthUser) => {
  const auth = getAuth();

  const googleSignin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const res = await signInWithPopup(auth, provider);
      return res;
    } catch (err) {
      console.log(err.message);
    }
  };

  const emailPassword = {
    signup: async (email, password) => {
      try {
        let created = await createUserWithEmailAndPassword(auth, email, password);
        return created;
      } catch (err) {
        console.log(err);
      }
      return false;
    },
    signin: async (email, password) => {
      try {
        let signedIn = await signInWithEmailAndPassword(auth, email, password);
        return signedIn;
      } catch (err) {
        console.log(err);
      }
      return false;
    },
  };

  return [{ googleSignin: googleSignin, emailPassword }];
};

export default useFbaseAuthUser;
