import React, { useEffect, useRef, useState, useContext } from "react";
import { UserContext } from "../models/UserContext";
import { REACT_APP_DEV_MODE, REACT_APP_PROD_MODE } from "@env";

const baseUrl =
  process.env.NODE_ENV == "development"
    ? REACT_APP_DEV_MODE
    : REACT_APP_PROD_MODE;

interface SecureCallOptions {
  endPoint: string;
  options: string;
  body?: null | any;
}

const fetchCallData = async (user, callOptions, callBody) => {
  let fetchOptions;
  let endPointUrl = baseUrl + callOptions.endPoint;
  if (callOptions.options === "get") {
    endPointUrl = callbody ? `${endPointUrl}/${callBody}` : endPointUrl;
    fetchOptions = {
      method: "get",
      headers: new Headers({
        Authorization: `Bearer ${user.accessToken}`,
        Accept: "application/json",
      }),
      body: null,
    };
    if (callBody) {
      endPointUrl = `${endPointUrl}/${callBody}`;
    }
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
    let callResults = await fetch(endPointUrl, fetchOptions);
    let jsonResults = await callResults.json();
    return [true, jsonResults, false];
  } catch (e) {
    console.error(e);
    return [false, false, e.message];
  }
};
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
    const fetchFunction = async () => {
      setLoading(true);
      let [success, callResults, error] = await fetchCallData(
        user,
        callOptions,
        callBody
      );
      if (success) {
        setResults(callResults);
      }
      if (!success) {
        setErrors([error]);
      }
      setLoading(false);
      setFetchNow(false);
    };
    if (fetchNow) {
      fetchFunction();
    }
  }, [callOptions, fetchNow, callBody]);

  const refetch = async (body = false) => {
    const fetchFunction = async () => {
      setLoading(true);
      setFetchNow(false);
      let [success, callResults, error] = await fetchCallData(
        user,
        callOptions,
        body
      );
      if (success) {
        setResults(callResults);
      }
      if (!success) {
        setErrors([error]);
        setResults({});
      }
      setLoading(false);
      setFetchNow(false);
    };
    await fetchFunction();
  };

  return [results, loading, errors, refetch];
};

export default useSecureCall;
