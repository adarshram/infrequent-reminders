import { getRepository, getManager } from 'typeorm';
import { expect } from 'chai';
import 'mocha';
import 'dotenv/config';

import { establishDatabaseConnection } from './../src/utils/dataBase';
import { getFirebaseCredentials } from './../src/models/SystemCredentials';

before(function (done) {
  this.timeout(10000);
  (async () => {
    await establishDatabaseConnection();
  })().then(done);
});

describe('First Test', () => {
  it('testing connection', async () => {
    const results = await getFirebaseCredentials();
    expect(results.type).to.be.equal('service_account');
  });
});
