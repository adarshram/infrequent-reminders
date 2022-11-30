import { getRepository, getManager } from 'typeorm';
import { SystemCredentials } from '../entity/SystemCredentials';
import { getById, deleteById, whereByColumns, ResponseColumn } from '../models/GenericModel';
interface ColumnValue {
	column: string;
	value: string | number | boolean;
}
interface FireBaseCredentials {
	type: string;
	project_id: string;
	private_key_id: string;
	private_key: string;
	client_email: string;
	client_id: string;
	auth_uri: string;
	token_uri: string;
	auth_provider_x509_cert_url: string;
	client_x509_cert_url: string;
}

export const getFirebaseCredentials = async (): Promise<FireBaseCredentials> => {
	let credentials = await getCredentialsByKey('firebase_credentials');
	let settingsValue = undefined;
	if (!credentials) {
		return settingsValue;
	}
	settingsValue = JSON.parse(credentials.settings_json_value);
	return settingsValue;
};

export const getCredentialsByKey = async (credentialsKey: string): Promise<SystemCredentials> => {
	let whereConstraints = {
		settings_key: credentialsKey,
	};
	let credentials = await getRepository(SystemCredentials).findOne({
		where: whereConstraints,
	});
	return credentials;
};
