import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

import {
	getFirestore,
	doc,
	getDoc,
	setDoc,
	addDoc,
	collection,
	query,
	where,
	getDocs,
	updateDoc,
	deleteDoc,
} from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: "AIzaSyAC4cEsmqRUTSNF1VBAiQdsNNNcs4HeWqo",
	authDomain: "infrequent-scheduler.firebaseapp.com",
	projectId: "infrequent-scheduler",
	storageBucket: "infrequent-scheduler.appspot.com",
	messagingSenderId: "9005250937",
	appId: "1:9005250937:web:2133237a6e4d0e7d7e57a8",
	measurementId: "G-DFSJ99XM8Z",
};
initializeApp(firebaseConfig);
export const fbAuth = getAuth();
