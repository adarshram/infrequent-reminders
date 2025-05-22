import { snoozeNotifications, complete } from '../../src/controllers/directController';
import { getRepository } from 'typeorm';
import * as UserNotificationsModel from '../../src/models/UserNotifications';
import { UserNotifications } from '../../src/entity/UserNotifications';
import { successResponse, errorResponse } from '../../src/responses';

jest.mock('typeorm', () => ({
  ...jest.requireActual('typeorm'),
  getRepository: jest.fn(),
}));
jest.mock('../../src/models/UserNotifications');

// Common mock setup
const mockRequest = (params = {}, body = {}, user = { uid: 'test-uid' }) => ({
  params,
  body,
  locals: { user },
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


describe('DirectController - ID Validation & Core Logic', () => {
  let req: any;
  let res: any;
  const mockNotification = { id: 1, user_id: 'test-uid', subject: 'Test' } as UserNotifications;

  beforeEach(() => {
    jest.clearAllMocks();
    res = mockResponse();
    // Setup mock for getRepository findOne
    (getRepository as jest.Mock).mockReturnValue({
      findOne: jest.fn().mockResolvedValue(mockNotification),
    });
  });

  // --- snoozeNotifications ---
  describe('snoozeNotifications', () => {
    it('should return errorResponse if params.id is non-numeric', async () => {
      req = mockRequest({ id: 'abc' });
      await snoozeNotifications(req, res);
      expect(errorResponse).toHaveBeenCalledWith(res, 'Invalid ID parameter: Must be a number.', 400);
      expect(getRepository(UserNotifications).findOne).not.toHaveBeenCalled();
    });

    it('should proceed normally if params.id is numeric and notification is found', async () => {
      req = mockRequest({ id: '1' });
      (UserNotificationsModel.snoozeNotification as jest.Mock).mockResolvedValue(true);
      await snoozeNotifications(req, res);
      expect(getRepository(UserNotifications).findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(UserNotificationsModel.snoozeNotification).toHaveBeenCalledWith(mockNotification);
      expect(successResponse).toHaveBeenCalledWith(res, true);
    });
  });

  // --- complete ---
  describe('complete', () => {
    it('should return errorResponse if params.id is non-numeric', async () => {
      req = mockRequest({ id: 'xyz' });
      await complete(req, res);
      expect(errorResponse).toHaveBeenCalledWith(res, 'Invalid ID parameter: Must be a number.', 400);
      expect(getRepository(UserNotifications).findOne).not.toHaveBeenCalled();
    });

    it('should proceed normally if params.id is numeric and notification is found', async () => {
      req = mockRequest({ id: '2' });
      (UserNotificationsModel.completeNotification as jest.Mock).mockResolvedValue(true);
      await complete(req, res);
      expect(getRepository(UserNotifications).findOne).toHaveBeenCalledWith({ where: { id: 2 } });
      expect(UserNotificationsModel.completeNotification).toHaveBeenCalledWith(mockNotification);
      expect(successResponse).toHaveBeenCalledWith(res, true);
    });

    it('should return errorResponse if findOne throws', async () => {
      req = mockRequest({ id: '1' });
      const dbError = new Error('Database findOne error');
      (getRepository(UserNotifications).findOne as jest.Mock).mockRejectedValue(dbError);
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await complete(req, res);

      expect(console.error).toHaveBeenCalledWith('Error fetching notification in complete:', dbError);
      expect(errorResponse).toHaveBeenCalledWith(res, 'Database error while fetching notification.');
      (console.error as jest.Mock).mockRestore();
    });

    it('should return errorResponse if findOne returns undefined', async () => {
      req = mockRequest({ id: '999' }); // Non-existent ID
      (getRepository(UserNotifications).findOne as jest.Mock).mockResolvedValue(undefined);
      
      await complete(req, res);
      
      expect(errorResponse).toHaveBeenCalledWith(res, 'Notification not found with the provided ID.');
    });

    it('should return errorResponse if completeNotification model call throws', async () => {
      req = mockRequest({ id: '1' });
      // findOne succeeds and returns mockNotification (from beforeEach)
      const modelError = new Error('Model complete error');
      (UserNotificationsModel.completeNotification as jest.Mock).mockRejectedValue(modelError);
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await complete(req, res);

      expect(UserNotificationsModel.completeNotification).toHaveBeenCalledWith(mockNotification);
      expect(console.error).toHaveBeenCalledWith('Error during complete operation:', modelError);
      expect(errorResponse).toHaveBeenCalledWith(res, 'An error occurred while completing the notification.');
      (console.error as jest.Mock).mockRestore();
    });
    
    it('should return errorResponse if completeNotification model call returns falsy', async () => {
      req = mockRequest({ id: '1' });
      // findOne succeeds and returns mockNotification (from beforeEach)
      (UserNotificationsModel.completeNotification as jest.Mock).mockResolvedValue(false); // Simulate failure

      await complete(req, res);

      expect(UserNotificationsModel.completeNotification).toHaveBeenCalledWith(mockNotification);
      expect(errorResponse).toHaveBeenCalledWith(res, 'Unable to complete notification.');
    });
  });
  
  // --- snoozeNotifications (Refactor tests) ---
  describe('snoozeNotifications - Refactored Error Handling', () => {
     it('should return errorResponse if findOne throws', async () => {
      req = mockRequest({ id: '1' });
      const dbError = new Error('Database findOne error');
      (getRepository(UserNotifications).findOne as jest.Mock).mockRejectedValue(dbError);
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await snoozeNotifications(req, res);

      expect(console.error).toHaveBeenCalledWith('Error fetching notification in snoozeNotifications:', dbError);
      expect(errorResponse).toHaveBeenCalledWith(res, 'Database error while fetching notification.');
      (console.error as jest.Mock).mockRestore();
    });

    it('should return errorResponse if findOne returns undefined', async () => {
      req = mockRequest({ id: '999' }); // Non-existent ID
      (getRepository(UserNotifications).findOne as jest.Mock).mockResolvedValue(undefined);
      
      await snoozeNotifications(req, res);
      
      expect(errorResponse).toHaveBeenCalledWith(res, 'Notification not found with the provided ID.');
    });

    it('should return errorResponse if snoozeNotification model call throws', async () => {
      req = mockRequest({ id: '1' });
      // findOne succeeds and returns mockNotification (from beforeEach)
      const modelError = new Error('Model snooze error');
      (UserNotificationsModel.snoozeNotification as jest.Mock).mockRejectedValue(modelError);
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await snoozeNotifications(req, res);

      expect(UserNotificationsModel.snoozeNotification).toHaveBeenCalledWith(mockNotification);
      expect(console.error).toHaveBeenCalledWith('Error during snooze operation:', modelError);
      expect(errorResponse).toHaveBeenCalledWith(res, 'An error occurred while snoozing the notification.');
      (console.error as jest.Mock).mockRestore();
    });

    it('should return errorResponse if snoozeNotification model call returns falsy', async () => {
      req = mockRequest({ id: '1' });
      // findOne succeeds and returns mockNotification (from beforeEach)
      (UserNotificationsModel.snoozeNotification as jest.Mock).mockResolvedValue(false); // Simulate failure

      await snoozeNotifications(req, res);

      expect(UserNotificationsModel.snoozeNotification).toHaveBeenCalledWith(mockNotification);
      expect(errorResponse).toHaveBeenCalledWith(res, 'Unable to snooze notification.');
    });
  });
});
