import React, { useEffect, useRef, useState, useContext } from "react";
import { UserContext } from "../models/UserContext";
import { ServerCall } from "../functions/serverCalls";
import { REACT_APP_DEV_MODE, REACT_APP_PROD_MODE } from "@env";
const baseUrl =
  process.env.NODE_ENV == "development"
    ? REACT_APP_DEV_MODE
    : REACT_APP_PROD_MODE;

function useServerCall(initialUrl = false, initialData = null) {
  const [url, setUrl] = useState(initialUrl ?? false);
  const [data, setData] = useState(initialData);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState([]);
  const signedInUser = useContext(UserContext);
  const { user } = signedInUser;

  const sendRequest = async (url, method = "GET", body = null) => {
    if (!url) {
      return;
    }
    setLoading(true);
    try {
      const serverCall = new ServerCall();
      setData(null);
      serverCall.setBearerHeader(user.accessToken);
      const requestUrl = `${baseUrl}${url}`;
      if (method === "GET" || method === "get") {
        const response = await serverCall.get(url);
        if (!response) {
          setData(false);
          throw new Error("Something went wrong!");
        }
        const responseData = await response.json();
        setData(responseData);
      }
      if (method === "POST" || method === "post") {
        const response = await serverCall.post(url, body);
        if (!response) {
          setData(false);
          throw new Error("Something went wrong!");
        }
        const responseData = await response.json();
        setData(responseData);
      }
    } catch (error) {
      setError(error.message);
      console.log(error);
      setData(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    sendRequest(url);
  }, [url]);

  const requester = {
    get: async (url) => {
      return await sendRequest(url, "GET");
    },
    post: async (url, body) => {
      return await sendRequest(url, "POST", body);
    },
  };

  return [data, isLoading, error, requester];
}

export default useServerCall;
