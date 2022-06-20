import { getUserProfileWithId, saveVapidKeyForUser } from './../src/models/userProfile';

import { expect } from 'chai';
import 'mocha';

/*describe('First Test', () => {
  it('should return adarshram', async () => {
    const result = await getUserProfileWithId('83zkNxe3BtSpXsFgxrDgw49ktWj2');
    expect(result.email).to.equal('adarshram@gmail.com');
  });
});

describe('First Test', () => {
  it('should return adarshram', async () => {
    const result = await getUserProfileWithId('83zkNxe3BtSpXsFgxrDgw49ktWj2');
    expect(result.email).to.equal('adarshram@gmail.com');
  });
  
});*/

describe('Save Vapid Key', () => {
  it('should save in firebase', async () => {
    const result = await saveVapidKeyForUser(
      '83zkNxe3BtSpXsFgxrDgw49ktWj2',
      'ePXJ_xfJS4qzn6UX9Kig43:APA91bEzEZroPXGYik7zQuqT9DcdN7cPLy2WeEskMSH2ECWIpBKzhiyDrjO8nw0LpfVpn7vpBJ6DDKksjwquBz6rF_GSJ51jSRwNSsgxA5EyQb_12kyMBxLUSUycTlecmQSpfjsHH1nt',
    );
    console.log(result);
  });
});
