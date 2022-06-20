import {
  getCollectionById,
  searchCollection,
  addToCollection,
  deleteDocument,
} from '../api/fireBaseUtility';

const useFbaseDb = (dbName) => {
  const tableName = dbName;

  const add = async (data) => {
    let id = await addToCollection(tableName, data, data['id']);
    return id;
  };

  const getById = async (id) => {
    let data = await getCollectionById(tableName, id);
    return data;
  };
  const getByFbaseUserId = async (data) => {
    let searchResults = await searchCollection(tableName, 'fBaseUserId', '==', data);
    return searchResults;
  };

  const getByUserId = async (data) => {
    let searchResults = await searchCollection(tableName, 'userReferenceId', '==', data);
    return searchResults;
  };
  const deleteById = async (id) => {
    let result = deleteDocument(tableName, id);
    return result;
  };

  return [
    {
      add: add,
      getById: getById,
      getByUserId: getByUserId,
      getByFbaseUserId: getByFbaseUserId,
      deleteById: deleteById,
    },
  ];
};

export default useFbaseDb;
