import {
  pendingNotifications,
  upcomingNotifications,
  save,
  showLog,
  show,
  snoozeNotifications as snoozeUserNotification, // Renamed to avoid conflict
  markNotificationComplete,
} from '../../src/controllers/userNotifications';
import * as UserNotificationsModel from '../../src/models/UserNotifications';
import * as NotificationLogModel from '../../src/models/NotificationLog';
import MetaNotificationsClass from '../../src/models/MetaNotifications';
import { successResponse, errorResponse } from '../../src/responses';

jest.mock('../../src/models/UserNotifications');
jest.mock('../../src/models/NotificationLog');
jest.mock('../../src/models/MetaNotifications');


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

// Mocking responses.ts functions - ensure this is at the top level or properly scoped
// jest.mock('../../src/responses', () => ({
//   successResponse: jest.fn((res, data) => res.json({ success: true, data })),
//   errorResponse: jest.fn((res, message) => res.status(400).json({ error: true, message })),
// }));


describe('UserNotifications Controller - Notification Listing', () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    jest.clearAllMocks();
    res = mockResponse();
    req = mockRequest(); // Default mock request
  });

  // --- pendingNotifications ---
  describe('pendingNotifications', () => {
    it('should return successResponse with an empty array when model returns an empty array', async () => {
      (UserNotificationsModel.getPendingNotifications as jest.Mock).mockResolvedValue([]);
      await pendingNotifications(req, res);
      expect(UserNotificationsModel.getPendingNotifications).toHaveBeenCalledWith('test-uid');
      expect(successResponse).toHaveBeenCalledWith(res, []);
      expect(errorResponse).not.toHaveBeenCalled();
    });

    it('should return errorResponse when model returns null (simulating fetch error)', async () => {
      (UserNotificationsModel.getPendingNotifications as jest.Mock).mockResolvedValue(null);
      await pendingNotifications(req, res);
      expect(UserNotificationsModel.getPendingNotifications).toHaveBeenCalledWith('test-uid');
      expect(errorResponse).toHaveBeenCalledWith(res, 'Error fetching pending notifications');
      expect(successResponse).not.toHaveBeenCalled();
    });
     it('should return successResponse with data when model returns data', async () => {
      const mockData = [{ id: 1, subject: 'Pending' }];
      (UserNotificationsModel.getPendingNotifications as jest.Mock).mockResolvedValue(mockData);
      await pendingNotifications(req, res);
      expect(successResponse).toHaveBeenCalledWith(res, mockData);
    });
  });

  // --- upcomingNotifications ---
  describe('upcomingNotifications', () => {
    it('should return successResponse with an empty array when model returns an empty array', async () => {
      (UserNotificationsModel.getNotificationsForThisWeek as jest.Mock).mockResolvedValue([]);
      await upcomingNotifications(req, res);
      expect(UserNotificationsModel.getNotificationsForThisWeek).toHaveBeenCalledWith('test-uid');
      expect(successResponse).toHaveBeenCalledWith(res, []);
      expect(errorResponse).not.toHaveBeenCalled();
    });

    it('should return errorResponse when model returns null (simulating fetch error)', async () => {
      (UserNotificationsModel.getNotificationsForThisWeek as jest.Mock).mockResolvedValue(null);
      await upcomingNotifications(req, res);
      expect(UserNotificationsModel.getNotificationsForThisWeek).toHaveBeenCalledWith('test-uid');
      expect(errorResponse).toHaveBeenCalledWith(res, 'Error fetching upcoming notifications');
      expect(successResponse).not.toHaveBeenCalled();
    });

    it('should return successResponse with data when model returns data', async () => {
      const mockData = [{ id: 1, subject: 'Upcoming' }];
      (UserNotificationsModel.getNotificationsForThisWeek as jest.Mock).mockResolvedValue(mockData);
      await upcomingNotifications(req, res);
      expect(successResponse).toHaveBeenCalledWith(res, mockData);
    });
  });
});

describe('UserNotifications Controller - getMostSnoozed', () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    jest.clearAllMocks();
    res = mockResponse();
    // Ensure fBaseUser is on res.locals for this controller
    req = mockRequest({}, {}, { uid: 'test-user-uid' }); 
  });

  // Test 1: Successful retrieval.
  it('should call successResponse with notification data when model returns data', async () => {
    const mockSnoozedNotification = {
      id: 1,
      subject: 'Most Snoozed',
      description: 'This is it.',
      snooze_count: 10,
    };
    // Need to import getMostSnoozed from the controller to test it
    const { getMostSnoozed } = require('../../src/controllers/userNotifications');
    // Mock the aliased model import
    (UserNotificationsModel.getMostSnoozedNotificationModel as jest.Mock).mockResolvedValue(mockSnoozedNotification);

    await getMostSnoozed(req, res);

    expect(UserNotificationsModel.getMostSnoozedNotificationModel).toHaveBeenCalledWith('test-user-uid');
    expect(successResponse).toHaveBeenCalledWith(res, mockSnoozedNotification);
    expect(errorResponse).not.toHaveBeenCalled();
  });

  // Test 2: No snoozed notification found (model returns null).
  it('should call successResponse with null when model returns null', async () => {
    const { getMostSnoozed } = require('../../src/controllers/userNotifications');
    (UserNotificationsModel.getMostSnoozedNotificationModel as jest.Mock).mockResolvedValue(null);
    
    await getMostSnoozed(req, res);

    expect(UserNotificationsModel.getMostSnoozedNotificationModel).toHaveBeenCalledWith('test-user-uid');
    expect(successResponse).toHaveBeenCalledWith(res, null);
    expect(errorResponse).not.toHaveBeenCalled();
  });

  // Test 3: Model function throws an error.
  it('should call errorResponse and console.error when model throws an error', async () => {
    const { getMostSnoozed } = require('../../src/controllers/userNotifications');
    const mockError = new Error('Database exploded');
    (UserNotificationsModel.getMostSnoozedNotificationModel as jest.Mock).mockRejectedValue(mockError);
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Spy and suppress

    await getMostSnoozed(req, res);

    expect(UserNotificationsModel.getMostSnoozedNotificationModel).toHaveBeenCalledWith('test-user-uid');
    expect(errorResponse).toHaveBeenCalledWith(res, 'An error occurred while fetching the most snoozed notification.');
    expect(console.error).toHaveBeenCalledWith('Error in getMostSnoozed controller:', mockError);
    expect(successResponse).not.toHaveBeenCalled();
    
    (console.error as jest.Mock).mockRestore(); // Restore console.error
  });
   it('should return errorResponse if fBaseUser or fBaseUser.uid is missing', async () => {
    const { getMostSnoozed } = require('../../src/controllers/userNotifications');
    // Scenario 1: fBaseUser is missing
    req.locals.user = undefined; 
    await getMostSnoozed(req, res);
    expect(errorResponse).toHaveBeenCalledWith(res, 'User not authenticated.');

    // Reset mocks and req for scenario 2
    (errorResponse as jest.Mock).mockClear();
    req.locals.user = { uid: undefined }; // fBaseUser.uid is missing
    
    await getMostSnoozed(req, res);
    expect(errorResponse).toHaveBeenCalledWith(res, 'User not authenticated.');
  });
});

describe('UserNotifications Controller - Save Function ID Handling', () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    jest.clearAllMocks();
    res = mockResponse();
  });

  const validBody = {
    subject: 'Test Subject',
    description: 'Test Description',
    frequency_type: 'daily',
    frequency: '1',
    notification_date: new Date().toISOString(),
    is_active: true,
    is_anchored: false,
    anchor_number: 0,
  };

  it('should call createNotificationsForUser with a numeric ID if a valid numeric string id is provided', async () => {
    req = mockRequest({}, { ...validBody, id: '123' });
    (UserNotificationsModel.createNotificationsForUser as jest.Mock).mockResolvedValue({ id: 123, ...validBody });

    await save(req, res);

    expect(UserNotificationsModel.createNotificationsForUser).toHaveBeenCalledWith(expect.objectContaining({
      id: 123, // Expect numeric ID
      user_id: 'test-uid',
    }));
    expect(successResponse).toHaveBeenCalled();
  });

  it('should call createNotificationsForUser with id: false if id is not provided', async () => {
    req = mockRequest({}, { ...validBody, id: undefined }); // id not provided
    (UserNotificationsModel.createNotificationsForUser as jest.Mock).mockResolvedValue({ id: 1, ...validBody });


    await save(req, res);

    expect(UserNotificationsModel.createNotificationsForUser).toHaveBeenCalledWith(expect.objectContaining({
      id: false, // Expect false for new entity
      user_id: 'test-uid',
    }));
    expect(successResponse).toHaveBeenCalled();
  });
  
  it('should call createNotificationsForUser with id: false if id is an empty string', async () => {
    req = mockRequest({}, { ...validBody, id: '' }); 
    (UserNotificationsModel.createNotificationsForUser as jest.Mock).mockResolvedValue({ id: 1, ...validBody });

    await save(req, res);

    expect(UserNotificationsModel.createNotificationsForUser).toHaveBeenCalledWith(expect.objectContaining({
      id: false, 
    }));
    expect(successResponse).toHaveBeenCalled();
  });
  
  it('should call createNotificationsForUser with id: false if id is null', async () => {
    req = mockRequest({}, { ...validBody, id: null }); 
    (UserNotificationsModel.createNotificationsForUser as jest.Mock).mockResolvedValue({ id: 1, ...validBody });

    await save(req, res);

    expect(UserNotificationsModel.createNotificationsForUser).toHaveBeenCalledWith(expect.objectContaining({
      id: false, 
    }));
    expect(successResponse).toHaveBeenCalled();
  });


  it('should return an errorResponse if a non-numeric id is provided', async () => {
    req = mockRequest({}, { ...validBody, id: 'abc' });

    await save(req, res);

    expect(UserNotificationsModel.createNotificationsForUser).not.toHaveBeenCalled();
    expect(errorResponse).toHaveBeenCalledWith(res, 'Invalid ID: Must be a number.', 400);
  });
  
  it('should return successResponse when createNotificationsForUser is successful', async () => {
    req = mockRequest({}, { ...validBody, id: '1' });
    const mockResult = { id: 1, ...validBody };
    (UserNotificationsModel.createNotificationsForUser as jest.Mock).mockResolvedValue(mockResult);

    await save(req, res);

    expect(successResponse).toHaveBeenCalledWith(res, mockResult);
  });

  it('should return errorResponse when createNotificationsForUser returns falsy', async () => {
    req = mockRequest({}, { ...validBody, id: '1' });
    (UserNotificationsModel.createNotificationsForUser as jest.Mock).mockResolvedValue(null); // Simulate failure

    await save(req, res);

    expect(errorResponse).toHaveBeenCalledWith(res, 'Unable to insert');
  });
});

describe('UserNotifications Controller - ID Validation & Error Reporting (Part 4 & 5)', () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    jest.clearAllMocks();
    res = mockResponse();
     // Reset MetaNotificationsClass mock behavior for each test
    (MetaNotificationsClass as jest.Mock).mockImplementation(() => ({
      setUserId: jest.fn(),
      getSnoozeAndCompletedCount: jest.fn().mockResolvedValue({ snooze_count: 0, completed_count: 0 }),
    }));
  });

  // --- ID Validation for params.id ---
  const functionsToTestWithParamId = [
    { name: 'showLog', func: showLog, modelMock: NotificationLogModel.getNotificationLogForId },
    { name: 'show', func: show, modelMock: UserNotificationsModel.getNotificationById },
    { name: 'snoozeUserNotification', func: snoozeUserNotification, modelMock: UserNotificationsModel.snoozeNotification },
    { name: 'markNotificationComplete', func: markNotificationComplete, modelMock: UserNotificationsModel.completeNotification },
  ];

  functionsToTestWithParamId.forEach(({ name, func, modelMock }) => {
    describe(name, () => {
      it('should return errorResponse if params.id is non-numeric', async () => {
        req = mockRequest({ id: 'abc' });
        await func(req, res);
        expect(errorResponse).toHaveBeenCalledWith(res, 'Invalid ID parameter: Must be a number.', 400);
        if (modelMock) { // Some functions might not call a model directly if ID is invalid
          expect(modelMock).not.toHaveBeenCalled();
        }
      });

      it('should proceed normally if params.id is numeric (mocking model success)', async () => {
        req = mockRequest({ id: '1' });
        if (modelMock) {
          (modelMock as jest.Mock).mockResolvedValue({ id: 1 }); // Generic success
           if (name === 'show') { // Special case for 'show' due to MetaNotificationsClass
            (UserNotificationsModel.getNotificationById as jest.Mock).mockResolvedValue({ id: 1, user_id: 'test-uid' });
          }
        }
        
        await func(req, res);
        // We are not testing the full success path here, just that it bypasses the ID error
        // and that the errorResponse for invalid ID was NOT called for this case.
        // A more specific success check would require detailed mocking for each function's positive path.
        const errorCalls = (errorResponse as jest.Mock).mock.calls;
        const invalidIdError = errorCalls.find(call => call[1] === 'Invalid ID parameter: Must be a number.');
        expect(invalidIdError).toBeUndefined();

        if (modelMock) {
           expect(modelMock).toHaveBeenCalledWith(1, 'test-uid'); 
        }
      });
    });
  });

  // --- Error Reporting for showLog and show (Part 5) ---
  describe('showLog - Error Reporting', () => {
    it('should call console.error and specific errorResponse when getNotificationLogForId throws', async () => {
      req = mockRequest({ id: '1' });
      const error = new Error('DB Failure');
      (NotificationLogModel.getNotificationLogForId as jest.Mock).mockRejectedValue(error);
      jest.spyOn(console, 'error').mockImplementation(() => {}); // Spy on console.error

      await showLog(req, res);

      expect(console.error).toHaveBeenCalledWith('Error in showLog:', error);
      expect(errorResponse).toHaveBeenCalledWith(res, `Failed to retrieve notification log: ${error.message || 'Internal server error'}`);
      (console.error as jest.Mock).mockRestore();
    });
    it('should return errorResponse with "No Log Details Found" when model returns null', async () => {
      req = mockRequest({ id: '1' });
      (NotificationLogModel.getNotificationLogForId as jest.Mock).mockResolvedValue(null);
      await showLog(req, res);
      expect(errorResponse).toHaveBeenCalledWith(res, 'No Log Details Found');
    });
  });

  describe('show - Error Reporting', () => {
    it('should call console.error and specific errorResponse when getNotificationById throws', async () => {
      req = mockRequest({ id: '1' });
      const error = new Error('DB Failure');
      (UserNotificationsModel.getNotificationById as jest.Mock).mockRejectedValue(error);
      jest.spyOn(console, 'error').mockImplementation(() => {}); // Spy on console.error

      await show(req, res);

      expect(console.error).toHaveBeenCalledWith('Error in show:', error);
      expect(errorResponse).toHaveBeenCalledWith(res, `Failed to retrieve notification details: ${error.message || 'Internal server error'}`);
      (console.error as jest.Mock).mockRestore();
    });
     it('should return errorResponse with "No Details Found" when model returns null', async () => {
      req = mockRequest({ id: '1' });
      (UserNotificationsModel.getNotificationById as jest.Mock).mockResolvedValue(null);
      await show(req, res);
      expect(errorResponse).toHaveBeenCalledWith(res, 'No Details Found');
    });
  });
});
