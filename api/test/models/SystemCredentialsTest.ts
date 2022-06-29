import { getRepository, getManager } from 'typeorm';
import {
  getById,
  deleteById,
  deleteByColumn,
  whereByColumns,
} from './../../src/models/genericModel';

import { getFirebaseCredentials } from './../../src/models/SystemCredentials';

import { expect } from 'chai';
import 'mocha';
import { createConnection } from 'typeorm';
import { getTime } from 'date-fns';
before(async () => {
  await createConnection();
});

describe('First Test', () => {
  it('where by columns', async () => {
    const results = await getFirebaseCredentials();
    expect(results.type).to.be.equal('service_account');
  });
});
