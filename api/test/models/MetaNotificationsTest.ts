import { getRepository, getManager } from 'typeorm';
import { MetaNotifications } from './../../src/models/MetaNotifications';
import { expect } from 'chai';
import 'mocha';
import { createConnection } from 'typeorm';
import { getTime } from 'date-fns';
before(async () => {
  await createConnection();
});

describe('First Test', () => {
  it('should link existing reminder and delete', async () => {});
});
