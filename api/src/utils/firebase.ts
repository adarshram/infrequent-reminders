import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getMessaging } from 'firebase-admin/messaging';
import 'dotenv/config';

import { getFirestore } from 'firebase-admin/firestore';
import { getFirebaseCredentials } from '../models/SystemCredentials';

let fireBase = undefined;
let fireStoreDbObject: boolean | any;
export const initializeFireBase = async () => {
  const serviceAccount = await getFirebaseCredentials();
  let serviceAccount1 = serviceAccount as unknown as string;

  const firebaseConfig = {
    apiKey: 'AIzaSyAC4cEsmqRUTSNF1VBAiQdsNNNcs4HeWqo',
    authDomain: 'infrequent-scheduler.firebaseapp.com',
    projectId: 'infrequent-scheduler',
    storageBucket: 'infrequent-scheduler.appspot.com',
    messagingSenderId: '9005250937',
    appId: '1:9005250937:web:2133237a6e4d0e7d7e57a8',
    measurementId: 'G-DFSJ99XM8Z',
    credential: cert(serviceAccount1),
  };
  fireBase = initializeApp(firebaseConfig);
};

export const getAuthenticatedUser = async (idToken: string) => {
  if (!fireBase) {
    await initializeFireBase();
  }
  let authenticatedResults = await getAuth(fireBase).verifyIdToken(idToken);
  return authenticatedResults;
};
export const getAllAuthenticatedUsers = async () => {
  if (!fireBase) {
    await initializeFireBase();
  }
  let listUsersResults = await getAuth().listUsers();
  let allUsers = listUsersResults.users.map((current) => {
    return current;
  });
  return allUsers;
};
export const getMessagingObject = async (): Promise<any> => {
  if (!fireBase) {
    await initializeFireBase();
  }
  let messagingObject = await getMessaging(fireBase);
  return messagingObject;
};

export const addToCollection = async (
  collectionName: string,
  data: any,
  id: string | number | boolean,
): Promise<any> => {
  const fireStoreDbObject = getFirestore();
  let docRef;
  if (typeof id === 'boolean') {
    docRef = fireStoreDbObject.collection(collectionName).doc();
  }
  if (typeof id == 'string') {
    docRef = fireStoreDbObject.collection(collectionName).doc(id);
  }
  let ins = await docRef.set(data);
  return ins;
};

export const getFireStoreDbObject = () => {
  if (!fireStoreDbObject) {
    fireStoreDbObject = getFirestore();
  }
  return fireStoreDbObject;
};

export const updateCollection = async (collectionName, data, id) => {};

export const getDocRef = (collectionName, id) => {};

export const getCollectionById = async (collectionName, id) => {};

export const searchCollection = async (collectionName, field, compare, value) => {};

export const deleteDocument = async (collectionName, id) => {};
