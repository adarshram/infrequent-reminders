import React, { useEffect, useRef, useState, useContext } from "react";
import { UserContext } from "../models/UserContext";
const baseUrl = "http://192.168.5.129:3050/";

interface SecureCallOptions {
  endPoint: string;
  options: string;
  body?: null | any;
}

const useSecureCall = (callOptions: SecureCallOptions, callNow?: bool) => {
  const signedInUser = useContext(UserContext);
  const [fetchNow, setFetchNow] = useState<bool>(
    callNow === false ? false : true
  );
  const { user } = signedInUser;

  const [results, setResults] = useState<bool | object>(false);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState<bool>(false);
  const [callBody, setCallBody] = useState<any>(false);
  useEffect(() => {
    if (fetchNow) {
      const fetchFunction = async () => {
        let fetchOptions;
        if (callOptions.options === "get") {
          fetchOptions = {
            method: "get",
            headers: new Headers({
              Authorization: `Bearer ${user.accessToken}`,
              Accept: "application/json",
            }),
            body: null,
          };
        }
        if (callOptions.options === "post" && callBody) {
          fetchOptions = {
            method: "post",
            headers: new Headers({
              Authorization: `Bearer ${user.accessToken}`,
              Accept: "application/json",
              "Content-Type": "application/json",
            }),
            body: JSON.stringify(callBody),
          };
        }
        try {
          setLoading(true);
          let endPointUrl = baseUrl + callOptions.endPoint;

          let callResults = await fetch(endPointUrl, fetchOptions);

          //console.log(await callResults.text());
          let jsonResults = await callResults.json();
          setResults(jsonResults);
        } catch (e) {
          setResults({});
          setErrors([e.message]);
          console.error(e);
        }
        setLoading(false);
        setFetchNow(false);
        setCallBody(false);
      };
      fetchFunction();
    }
  }, [callOptions, fetchNow, callBody]);
  const refetch = (body = false) => {
    setCallBody(body ? body : false);
    setFetchNow(true);
  };

  return [results, loading, errors, refetch];
};

export default useSecureCall;
