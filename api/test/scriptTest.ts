import { getRepository, getManager } from 'typeorm';
import { expect } from 'chai';
import 'mocha';
import 'dotenv/config';
import {
  getMessagingObject,
  addToCollection,
  getFireStoreDbObject,
  initializeFireBase,
  getAuthenticatedUser,
  getAllAuthenticatedUsers,
} from './../src/utils/firebase';
import { getAllProfiles } from './../src/models/UserVapidKeys';
import { UserProfile } from './../src/entity/UserProfile';
import { createUserInDbFromFireBase } from './../src/models/UserProfile';
import { sendSimpleEmail } from './../src/utils/email';
import { establishDatabaseConnection } from './../src/utils/dataBase';
import { getFirebaseCredentials } from './../src/models/SystemCredentials';

before(async () => {});

const findUserInDb = async (email) => {
  let userProfile = await getRepository(UserProfile).findOne({
    where: { email: email },
  });
  return userProfile;
};

//npm test test\scriptTest.ts -- --grep "create profile for non existent users"
//npm test test\scriptTest.ts -- --grep "test live"
describe('First Test', () => {
  it('test live', async () => {
    await establishDatabaseConnection();
    await initializeFireBase();
    let authenticatedUsers = await getAllAuthenticatedUsers();
    console.log(authenticatedUsers);
  }).timeout(20000);
  it('create profile for non existent users', async () => {
    await establishDatabaseConnection();
    await initializeFireBase();

    let existingUser = await findUserInDb('adarsh@tester1.com');
    if (existingUser) {
      await getRepository(UserProfile).remove(existingUser);
    }

    let authenticatedUsers = await getAllAuthenticatedUsers();
    await Promise.all(
      authenticatedUsers.map(async (currentUser) => {
        let isUserPresent = await findUserInDb(currentUser.email);
        if (!isUserPresent) {
          await createUserInDbFromFireBase(currentUser);
          isUserPresent = await findUserInDb(currentUser.email);
          if (isUserPresent) {
            console.log(isUserPresent);
            let email = 'adarshram@gmail.com'; //isUserPresent.email
            let name =
              isUserPresent.first_name && isUserPresent.first_name !== ''
                ? isUserPresent.first_name
                : isUserPresent.email;
            /*await sendSimpleEmail(
              'adarshram@gmail.com',
              'Update Notification Settings',
              'Dear ' +
                name +
                ' Please login to infrequent-reminders-web.herokuapp.com and enable notifications for your account',
            );*/
          }
        }
      }),
    );
    existingUser = await findUserInDb('adarsh@tester1.com');
    expect(existingUser.email).to.be.equal('adarsh@tester1.com');
  }).timeout(50000);
});
