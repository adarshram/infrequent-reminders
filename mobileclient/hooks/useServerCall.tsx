import React, { useEffect, useRef, useState, useContext } from "react";
import { UserContext } from "../models/UserContext";
const baseUrl = "http://192.168.5.129:3050/";

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
      setData(null);
      const options = {
        method,
        headers: new Headers({
          Authorization: `Bearer ${user.accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        }),
        body: body ? JSON.stringify(body) : null,
      };
      const requestUrl = `${baseUrl}${url}`;
      const response = await fetch(requestUrl, options);

      const responseData = await response.json();

      setData(responseData);

      if (!response.ok) {
        throw new Error(responseData.message || "Something went wrong!");
      }
    } catch (error) {
      setError(error.message);
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
      await sendRequest(url, "GET");
    },
    post: async (url, body) => {
      await sendRequest(url, "POST", body);
    },
  };

  return [data, isLoading, error, requester];
}

export default useServerCall;
