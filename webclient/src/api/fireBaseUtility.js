import { initializeApp } from 'firebase/app';
//import { getAuth } from 'firebase/auth';

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
} from 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: 'AIzaSyAC4cEsmqRUTSNF1VBAiQdsNNNcs4HeWqo',
	authDomain: 'infrequent-scheduler.firebaseapp.com',
	projectId: 'infrequent-scheduler',
	storageBucket: 'infrequent-scheduler.appspot.com',
	messagingSenderId: '9005250937',
	appId: '1:9005250937:web:2133237a6e4d0e7d7e57a8',
	measurementId: 'G-DFSJ99XM8Z',
};
let fireStoreObject;
export const initializeFireBase = () => {
	initializeApp(firebaseConfig);
	fireStoreObject = getFirestore();
};

export const addToCollection = async (collectionName, data, id) => {
	let inserted;
	if (id) {
		await setDoc(doc(fireStoreObject, collectionName, `${id}`), data);
		const docRef = getDocRef(collectionName, id);
		inserted = await getDoc(docRef);
		return inserted.id;
	}
	if (!id) {
		inserted = await addDoc(collection(fireStoreObject, collectionName), data);
		return inserted.id;
	}
	return false;
};

export const updateCollection = async (collectionName, data, id) => {
	const docRef = getDocRef(collectionName, id);
	let docSnap = await getDoc(docRef);

	if (!docSnap.exists()) {
		return false;
	}

	await updateDoc(docRef, {
		...data,
	});
	docSnap = await getDoc(docRef);
	return docSnap.data();
};

export const getDocRef = (collectionName, id) => {
	return doc(fireStoreObject, collectionName, id);
};

export const getCollectionById = async (collectionName, id) => {
	const docRef = getDocRef(collectionName, id);
	const docSnap = await getDoc(docRef);

	if (docSnap.exists()) {
		return {
			id: docSnap.id,
			data: docSnap.data(),
		};
	}
	return false;
};

export const searchCollection = async (collectionName, field, compare, value) => {
	const collectionRef = collection(fireStoreObject, collectionName);
	const q = query(collectionRef, where(field, compare, value));
	const querySnapshot = await getDocs(q);
	let results = [];
	querySnapshot.forEach((doc) => {
		results.push({
			id: doc.id,
			data: doc.data(),
		});
	});
	return results;
};

export const deleteDocument = async (collectionName, id) => {
	await deleteDoc(doc(fireStoreObject, collectionName, id));
	return true;
};
