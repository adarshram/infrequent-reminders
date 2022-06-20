import {
	getCollectionById,
	searchCollection,
	addToCollection,
	deleteDocument,
} from '../../api/fireBaseUtility';
export default function UserNotifications() {
	const tableName = 'UserNotifications';
	//const fields = ['subject', 'description', 'frequency', 'notificationDate', 'userReferenceId'];

	const add = async (data) => {
		let id = await addToCollection(tableName, data, data['id']);
		return id;
	};
	const getById = async (id) => {
		let data = await getCollectionById(tableName, id);
		return data;
	};
	const deleteRow = async (id) => {
		let data = await getCollectionById(tableName, id);
		return data;
	};

	const getByUserId = async (data) => {
		let searchResults = await searchCollection(tableName, 'userReferenceId', '==', data);
		console.log(searchResults);
		return searchResults;
	};
	const deleteById = async (id) => {
		let result = deleteDocument(tableName, id);
		return result;
	};

	return {
		add: add,
		getById: getById,
		deleteRow: deleteRow,
		getByUserId: getByUserId,
		deleteById: deleteById,
	};
}
