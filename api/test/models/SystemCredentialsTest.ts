import { getRepository, getManager } from 'typeorm';
import {
  getById,
  deleteById,
  deleteByColumn,
  whereByColumns,
} from './../../src/models/genericModel';

import { getFirebaseCredentials, getCredentialsByKey } from './../../src/models/SystemCredentials';

import { expect } from 'chai';
import 'mocha';
import { establishDatabaseConnection } from './../../src/utils/dataBase';
import { getTime } from 'date-fns';

before(async () => {});
/// npm test test\models\SystemCredentialsTest.ts -- --grep "where by key"
/// npm test test\models\SystemCredentialsTest.ts -- --grep "firebase"

describe('First Test', () => {
  it('firebase', async () => {
    await establishDatabaseConnection();
    const results = await getFirebaseCredentials();
    expect(results.type).to.be.equal('service_account');
  }).timeout(10000);
  it('where by key', async () => {
    await establishDatabaseConnection();
    const results = await getCredentialsByKey('base_url');
    expect(results.settings_key).to.be.equal('base_url');
  }).timeout(20000);
});
