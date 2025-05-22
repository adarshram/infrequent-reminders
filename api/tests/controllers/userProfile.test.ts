import {
  notificationList,
  getNotificationPreference,
  deleteNotificationPreference,
  saveNotificationDevices, // Added for completeness, though not explicitly in Part 5 focus
  saveNotificationPreference, // Added for completeness
  view as viewProfile,
  save as saveProfile,
} from '../../src/controllers/userProfile';
import * as UserVapidKeysModel from '../../src/models/UserVapidKeys';
import * as UserProfileModel from '../../src/models/UserProfile'; // Assuming this is the correct path
import { UserProfile } from '../../src/entity/UserProfile';
import { getManager } from 'typeorm';

import { successResponse, errorResponse } from '../../src/responses';

jest.mock('../../src/models/UserVapidKeys');
jest.mock('../../src/models/UserProfile');
jest.mock('typeorm', () => ({
  ...jest.requireActual('typeorm'),
  getManager: jest.fn(),
  getRepository: jest.fn(),
}));

// Common mock setup
const mockRequest = (params = {}, body = {}, user = { uid: 'test-uid', name: 'Test User', email: 'test@example.com' }) => ({
  params,
  body,
  locals: { user }, // fBaseUser is in locals.user
});

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res;
};

// Mocking responses.ts functions
// jest.mock('../../src/responses', () => ({
//   successResponse: jest.fn((res, data) => res.json({ success: true, data })),
//   errorResponse: jest.fn((res, message) => res.status(400).json({ error: true, message })),
// }));

describe('UserProfile Controller - Error Reporting & Core Logic', () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    jest.clearAllMocks();
    res = mockResponse();
    req = mockRequest(); // Default request
  });

  // --- notificationList ---
  describe('notificationList', () => {
    it('should return successResponse with userKeys[0] if keys are found', async () => {
      const mockKeys = [{ key: 'key1' }, { key: 'key2' }];
      (UserVapidKeysModel.getKeysForUser as jest.Mock).mockResolvedValue(mockKeys);
      await notificationList(req, res);
      expect(successResponse).toHaveBeenCalledWith(res, mockKeys[0]);
    });
    
    it('should return successResponse with an empty array if getKeysForUser returns empty array', async () => {
      (UserVapidKeysModel.getKeysForUser as jest.Mock).mockResolvedValue([]);
      await notificationList(req, res);
      expect(successResponse).toHaveBeenCalledWith(res, []);
    });

    it('should return successResponse with an empty array if getKeysForUser returns null', async () => {
      (UserVapidKeysModel.getKeysForUser as jest.Mock).mockResolvedValue(null);
      await notificationList(req, res);
      expect(successResponse).toHaveBeenCalledWith(res, []);
    });
  });

  // --- getNotificationPreference ---
  describe('getNotificationPreference', () => {
     it('should return successResponse with vapidKeys if found', async () => {
      req = mockRequest({}, { vapidKey: 'testKey' });
      const mockVapidKeys = [{ user_id: 'test-uid', vapidKey: 'testKey' }];
      (UserProfileModel.searchVapidKeyForUser as jest.Mock).mockResolvedValue(mockVapidKeys);
      await getNotificationPreference(req, res);
      expect(successResponse).toHaveBeenCalledWith(res, mockVapidKeys);
    });
    
    it('should return successResponse with an empty array if searchVapidKeyForUser returns null', async () => {
      req = mockRequest({}, { vapidKey: 'testKey' });
      (UserProfileModel.searchVapidKeyForUser as jest.Mock).mockResolvedValue(null);
      await getNotificationPreference(req, res);
      expect(successResponse).toHaveBeenCalledWith(res, []);
    });

    it('should return successResponse with an empty array if searchVapidKeyForUser returns an empty array', async () => {
      req = mockRequest({}, { vapidKey: 'testKey' });
      (UserProfileModel.searchVapidKeyForUser as jest.Mock).mockResolvedValue([]);
      await getNotificationPreference(req, res);
      expect(successResponse).toHaveBeenCalledWith(res, []);
    });

    it('should handle exceptions from searchVapidKeyForUser', async () => {
      req = mockRequest({}, { vapidKey: 'testKey' });
      const error = new Error('DB Read Failed');
      (UserProfileModel.searchVapidKeyForUser as jest.Mock).mockRejectedValue(error);
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await getNotificationPreference(req, res);

      expect(console.error).toHaveBeenCalledWith('Error in getNotificationPreference for user:', 'test-uid', 'vapidKey:', 'testKey', error);
      expect(errorResponse).toHaveBeenCalledWith(res, 'An unexpected error occurred while fetching notification preferences.');
      (console.error as jest.Mock).mockRestore();
    });
  });

  // --- deleteNotificationPreference ---
  describe('deleteNotificationPreference', () => {
    it('should return 404 if searchVapidKeyForUser returns null (key not found)', async () => {
      req = mockRequest({}, { vapidKey: 'nonexistentKey' });
      (UserProfileModel.searchVapidKeyForUser as jest.Mock).mockResolvedValue(null);
      
      await deleteNotificationPreference(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: true, message: 'Notification preference not found to delete.' });
    });

    it('should return 404 if searchVapidKeyForUser returns an empty array', async () => {
      req = mockRequest({}, { vapidKey: 'nonexistentKey' });
      (UserProfileModel.searchVapidKeyForUser as jest.Mock).mockResolvedValue([]);
      
      await deleteNotificationPreference(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: true, message: 'Notification preference not found to delete.' });
    });

    it('should return successResponse if deletion is successful', async () => {
      req = mockRequest({}, { vapidKey: 'existingKey' });
      (UserProfileModel.searchVapidKeyForUser as jest.Mock).mockResolvedValue([{ vapidKey: 'existingKey' }]); // Key exists
      (UserProfileModel.deleteVapidKeyForUser as jest.Mock).mockResolvedValue(true); // Deletion successful
      
      await deleteNotificationPreference(req, res);
      
      expect(successResponse).toHaveBeenCalledWith(res, { message: 'Notification preference deleted successfully.' });
    });
    
    it('should return errorResponse if deleteVapidKeyForUser returns falsy (deletion failed)', async () => {
        req = mockRequest({}, { vapidKey: 'existingKey' });
        (UserProfileModel.searchVapidKeyForUser as jest.Mock).mockResolvedValue([{ vapidKey: 'existingKey' }]);
        (UserProfileModel.deleteVapidKeyForUser as jest.Mock).mockResolvedValue(false); // Deletion failed
        jest.spyOn(console, 'error').mockImplementation(() => {});

        await deleteNotificationPreference(req, res);

        expect(console.error).toHaveBeenCalledWith('Error in deleteNotificationPreference: deleteVapidKeyForUser returned falsy for user:', 'test-uid', 'vapidKey:', 'existingKey');
        expect(errorResponse).toHaveBeenCalledWith(res, 'Failed to delete notification preference.');
        (console.error as jest.Mock).mockRestore();
    });


    it('should handle exceptions from deleteVapidKeyForUser', async () => {
        req = mockRequest({}, { vapidKey: 'existingKey' });
        (UserProfileModel.searchVapidKeyForUser as jest.Mock).mockResolvedValue([{ vapidKey: 'existingKey' }]);
        const error = new Error('DB Write Failed');
        (UserProfileModel.deleteVapidKeyForUser as jest.Mock).mockRejectedValue(error);
        jest.spyOn(console, 'error').mockImplementation(() => {});

        await deleteNotificationPreference(req, res);

        expect(console.error).toHaveBeenCalledWith('Exception in deleteNotificationPreference for user:', 'test-uid', 'vapidKey:', 'existingKey', error);
        expect(errorResponse).toHaveBeenCalledWith(res, 'An unexpected error occurred while deleting notification preference.');
        (console.error as jest.Mock).mockRestore();
    });
     it('should return error if vapidKey is not provided for deletion', async () => {
      req = mockRequest({}, { vapidKey: '' }); // Empty vapidKey
      await deleteNotificationPreference(req, res);
      expect(errorResponse).toHaveBeenCalledWith(res, 'No Vapid Key provided for deletion.');
    });
  });
});
