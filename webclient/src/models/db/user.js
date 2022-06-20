import { getCollectionById, addToCollection, searchCollection } from '../../api/fireBaseUtility';
export default function User() {
	const tableName = 'User';
	//const fields = ['first_name', 'last_name', 'created_at', 'id'];
	const add = async (data) => {
		//verify the user fields here to make sure only known fields are around .
		let id = await addToCollection(tableName, data, data['id']);
		return id;
	};
	const getById = async (id) => {
		//verify the user fields here to make sure only known fields are around .
		let data = await getCollectionById(tableName, id);
		return data;
	};

	const getByUserId = async (data) => {
		let searchResults = await searchCollection(tableName, 'fBaseUserId', '==', data);
		return searchResults;
	};

	return {
		add: add,
		getById: getById,
		getByUserId: getByUserId,
	};
}
