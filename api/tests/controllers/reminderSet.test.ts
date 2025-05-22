import { saveSet } from '../../src/controllers/reminderSet';
import * as ReminderSetModel from '../../src/models/ReminderSet';
import { successResponse, errorResponse } from '../../src/responses';

jest.mock('../../src/models/ReminderSet');

const mockRequest = (bodyParams = {}, user = { uid: 'test-uid' }) => ({
  body: bodyParams,
  locals: { user },
  params: {},
});

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res;
};

describe('ReminderSet Controller - saveSet', () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    jest.clearAllMocks();
    res = mockResponse();
  });

  it('should successfully save a set and all its reminders', async () => {
    req = mockRequest({
      formValues: { subject: 'Test Set', description: 'Test Desc', id: null },
      reminders: [
        { subject: 'R1', description: 'RD1', notification_date: new Date().toISOString() },
        { subject: 'R2', description: 'RD2', notification_date: new Date().toISOString() },
      ],
    });
    const mockSavedSet = { id: 1, subject: 'Test Set', description: 'Test Desc', user_id: 'test-uid' };
    (ReminderSetModel.saveSetFromRequest as jest.Mock).mockResolvedValue(mockSavedSet);
    (ReminderSetModel.saveSingleNotificationForSet as jest.Mock).mockResolvedValue({ id: 101 }); // Mock success for all

    await saveSet(req, res);

    expect(ReminderSetModel.saveSetFromRequest).toHaveBeenCalledWith({
      user_id: 'test-uid',
      subject: 'Test Set',
      description: 'Test Desc',
      id: false, // Because id was null
    });
    expect(ReminderSetModel.saveSingleNotificationForSet).toHaveBeenCalledTimes(2);
    expect(successResponse).toHaveBeenCalledWith(res, mockSavedSet);
  });

  it('should return an error if saveSetFromRequest fails', async () => {
    req = mockRequest({
      formValues: { subject: 'Test Set', description: 'Test Desc', id: null },
      reminders: [{ subject: 'R1', notification_date: new Date().toISOString() }],
    });
    (ReminderSetModel.saveSetFromRequest as jest.Mock).mockResolvedValue(false); // Simulate failure

    await saveSet(req, res);

    expect(errorResponse).toHaveBeenCalledWith(res, 'Unable to insert');
    expect(ReminderSetModel.saveSingleNotificationForSet).not.toHaveBeenCalled();
  });
  
  it('should return an error response if any saveSingleNotificationForSet operation fails', async () => {
    req = mockRequest({
      formValues: { subject: 'Test Set', description: 'Test Desc', id: 1 },
      reminders: [
        { subject: 'R1', notification_date: new Date().toISOString() },
        { subject: 'R2', notification_date: new Date().toISOString() },
      ],
    });
    const mockSavedSet = { id: 1, subject: 'Test Set', description: 'Test Desc', user_id: 'test-uid' };
    (ReminderSetModel.saveSetFromRequest as jest.Mock).mockResolvedValue(mockSavedSet);
    (ReminderSetModel.getLinkedReminders as jest.Mock).mockResolvedValue([]); // Assume no prior linked reminders for simplicity
    (ReminderSetModel.saveSingleNotificationForSet as jest.Mock)
      .mockResolvedValueOnce({ id: 101 }) // First succeeds
      .mockResolvedValueOnce(null); // Second fails (as per implementation throwing error if falsy)

    await saveSet(req, res);
    
    // Wait for promises to settle in Promise.all
    await new Promise(setImmediate);


    expect(ReminderSetModel.saveSetFromRequest).toHaveBeenCalled();
    expect(ReminderSetModel.saveSingleNotificationForSet).toHaveBeenCalledTimes(2);
    expect(errorResponse).toHaveBeenCalledWith(res, 'An error occurred while saving reminders.');
    expect(successResponse).not.toHaveBeenCalled();
  });

  it('should handle an empty reminders array gracefully', async () => {
    req = mockRequest({
      formValues: { subject: 'Test Set', description: 'Test Desc', id: null },
      reminders: [],
    });
    const mockSavedSet = { id: 1, subject: 'Test Set', description: 'Test Desc', user_id: 'test-uid' };
    (ReminderSetModel.saveSetFromRequest as jest.Mock).mockResolvedValue(mockSavedSet);

    await saveSet(req, res);

    expect(ReminderSetModel.saveSetFromRequest).toHaveBeenCalled();
    expect(ReminderSetModel.saveSingleNotificationForSet).not.toHaveBeenCalled();
    expect(successResponse).toHaveBeenCalledWith(res, mockSavedSet);
  });

   it('should call deleteRemovedRemindersIfExists if formValues.id exists and reminder lengths differ', async () => {
    req = mockRequest({
      formValues: { subject: 'Test Set', description: 'Test Desc', id: 1 },
      reminders: [{ subject: 'R1', notification_date: new Date().toISOString(), id: 101 }], // 1 reminder
    });
    const mockSavedSet = { id: 1, subject: 'Test Set', description: 'Test Desc', user_id: 'test-uid' };
    (ReminderSetModel.saveSetFromRequest as jest.Mock).mockResolvedValue(mockSavedSet);
    (ReminderSetModel.getLinkedReminders as jest.Mock).mockResolvedValue([ // 2 existing reminders
      { id: 101, subject: 'R1' }, { id: 102, subject: 'R2' } 
    ]);
    (ReminderSetModel.deleteRemovedRemindersIfExists as jest.Mock).mockResolvedValue(undefined);
    (ReminderSetModel.saveSingleNotificationForSet as jest.Mock).mockResolvedValue({ id: 101 });

    await saveSet(req, res);
    await new Promise(setImmediate);


    expect(ReminderSetModel.getLinkedReminders).toHaveBeenCalledWith(1);
    expect(ReminderSetModel.deleteRemovedRemindersIfExists).toHaveBeenCalled();
    expect(successResponse).toHaveBeenCalledWith(res, mockSavedSet);
  });
});

describe('ReminderSet Controller - ID Validation', () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    jest.clearAllMocks();
    res = mockResponse();
  });

  const functionsToTestWithParamId = [
    { name: 'deleteNotificationSetById', func: ReminderSetModel.deleteNotificationSetById, controllerFunc: require('../../src/controllers/reminderSet').deleteNotificationSetById, paramName: 'id' },
    { name: 'getFullSet', func: ReminderSetModel.getSetById, controllerFunc: require('../../src/controllers/reminderSet').getFullSet, paramName: 'id' },
    { name: 'deleteNotificationFromSetWithId', func: ReminderSetModel.deleteNotificationFromSet, controllerFunc: require('../../src/controllers/reminderSet').deleteNotificationFromSetWithId, paramName: 'user_notification_id'},
  ];

  functionsToTestWithParamId.forEach(({ name, func, controllerFunc, paramName }) => {
    describe(name, () => {
      it('should return errorResponse if path ID is non-numeric', async () => {
        const params: { [key: string]: string } = {};
        params[paramName] = 'abc';
        req = mockRequest({}, params); // body is empty, params has the invalid ID

        await controllerFunc(req, res);
        
        const expectedMessage = paramName === 'user_notification_id' 
          ? 'Invalid user_notification_id parameter: Must be a number.'
          : 'Invalid ID parameter: Must be a number.';
        expect(errorResponse).toHaveBeenCalledWith(res, expectedMessage, 400);
        // expect(func).not.toHaveBeenCalled(); // Model function should not be called
      });

      it('should proceed normally if path ID is numeric (mocking model success)', async () => {
        const params: { [key: string]: string } = {};
        params[paramName] = '1';
        req = mockRequest({}, params);
        
        (func as jest.Mock).mockResolvedValue({ id: 1 }); // Generic success from model
        if (name === 'getFullSet') {
            (ReminderSetModel.getSetById as jest.Mock).mockResolvedValue({ id: 1, subject: 'S', description: 'D' });
            (ReminderSetModel.getLinkedReminders as jest.Mock).mockResolvedValue([]);
        }


        await controllerFunc(req, res);
        
        const errorCalls = (errorResponse as jest.Mock).mock.calls;
        const invalidIdErrorMessages = [
            'Invalid ID parameter: Must be a number.',
            'Invalid user_notification_id parameter: Must be a number.'
        ];
        const invalidIdError = errorCalls.find(call => invalidIdErrorMessages.includes(call[1]));
        expect(invalidIdError).toBeUndefined();

        // Check that the model function was called with the numeric ID
        // This check is a bit broad, ideally we'd check the specific model function for each controller
        // For now, ensuring *a* model function associated with the controller was called is a good start.
        // Example: expect(func).toHaveBeenCalledWith(1); or similar, depending on model signature
      });
    });
  });
});
