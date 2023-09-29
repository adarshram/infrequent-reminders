import { useState, useEffect, useRef } from "react";
import { AppState } from "react-native";
const useOnAppForeground = (auth) => {
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        appState.current = nextAppState;
      }

      appState.current = nextAppState;
      setAppStateVisible(appState.current);
    });

    return () => {
      subscription.remove();
    };
  }, []);
  const isActive = appStateVisible === "active";
  //console.log(appStateVisible);
  return [isActive, appState.current];
};

export default useOnAppForeground;
