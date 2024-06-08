import { useState, useEffect } from "react";

const usePageLoader = (auth) => {
  const [userData, setUserData] = useState(null);

  const loading = userData === null;
  useEffect(() => {
    let stateChangedSubscription = () => {};
    if (auth) {
      stateChangedSubscription = auth.onAuthStateChanged(function (user) {
        if (user) {
          console.log(user);
        }
        setUserData(user ? user : false);
      });
    }

    return () => {
      if (stateChangedSubscription) {
        stateChangedSubscription();
      }
    };
  }, [auth]);

  return [userData, loading];
};

export default usePageLoader;
