import { getManager, getRepository } from 'typeorm';
import { UserNotifications } from '../../src/entity/UserNotifications';
import { MetaNotifications } from '../../src/entity/MetaNotifications';
import { getMostSnoozedNotification } from '../../src/models/UserNotifications';

// Mock TypeORM
jest.mock('typeorm', () => {
  const actualTypeOrm = jest.requireActual('typeorm');
  return {
    ...actualTypeOrm,
    getManager: jest.fn(),
    getRepository: jest.fn(),
  };
});

describe('UserNotifications Model - getMostSnoozedNotification', () => {
  let mockQueryBuilder: any;
  let mockFindOne: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockQueryBuilder = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      getRawOne: jest.fn(),
    };
    (getManager as jest.Mock).mockReturnValue({
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    });

    mockFindOne = jest.fn();
    (getRepository as jest.Mock).mockReturnValue({
      findOne: mockFindOne,
    });
  });

  // Test 1: Basic case - one notification clearly most snoozed.
  it('should return the most snoozed notification with details', async () => {
    const userId = 'user1';
    const rawSnoozeData = { raw_notification_id: 101, total_snoozes: '5' };
    const notificationDetails = {
      id: 101,
      subject: 'Test Subject',
      description: 'Test Description',
      user_id: userId,
    } as UserNotifications;

    mockQueryBuilder.getRawOne.mockResolvedValue(rawSnoozeData);
    mockFindOne.mockResolvedValue(notificationDetails);

    const result = await getMostSnoozedNotification(userId);

    expect(getManager().createQueryBuilder).toHaveBeenCalledWith(MetaNotifications, 'meta');
    expect(mockQueryBuilder.where).toHaveBeenCalledWith('meta.user_id = :userId', { userId });
    expect(mockQueryBuilder.getRawOne).toHaveBeenCalled();
    expect(getRepository(UserNotifications).findOne).toHaveBeenCalledWith({ where: { id: 101, user_id: userId } });
    expect(result).toEqual({
      id: 101,
      subject: 'Test Subject',
      description: 'Test Description',
      snooze_count: 5,
    });
  });

  // Test 2: No snoozed notifications found for the user.
  it('should return null if getRawOne returns no data (no snoozed notifications)', async () => {
    const userId = 'user2';
    mockQueryBuilder.getRawOne.mockResolvedValue(null);

    const result = await getMostSnoozedNotification(userId);

    expect(result).toBeNull();
    expect(mockFindOne).not.toHaveBeenCalled();
  });
  
  it('should return null if getRawOne returns no raw_notification_id', async () => {
    const userId = 'user-no-id';
    mockQueryBuilder.getRawOne.mockResolvedValue({ total_snoozes: '5' }); // Missing raw_notification_id

    const result = await getMostSnoozedNotification(userId);
    expect(result).toBeNull();
  });


  // Test 3: Notification found in meta_notifications but not in user_notifications.
  it('should return null if notification details are not found for the most snoozed ID', async () => {
    const userId = 'user3';
    const rawSnoozeData = { raw_notification_id: 102, total_snoozes: '3' };
    mockQueryBuilder.getRawOne.mockResolvedValue(rawSnoozeData);
    mockFindOne.mockResolvedValue(null); // Simulate notification not found
    jest.spyOn(console, 'warn').mockImplementation(() => {}); // Suppress console.warn

    const result = await getMostSnoozedNotification(userId);

    expect(result).toBeNull();
    expect(console.warn).toHaveBeenCalledWith(
      `Notification details not found for ID: ${rawSnoozeData.raw_notification_id} and user: ${userId}, though it was the most snoozed.`
    );
    (console.warn as jest.Mock).mockRestore();
  });

  // Test 4: Snooze count is zero.
  it('should return null if the highest total_snoozes is "0"', async () => {
    const userId = 'user4';
    const rawSnoozeData = { raw_notification_id: 103, total_snoozes: '0' };
    mockQueryBuilder.getRawOne.mockResolvedValue(rawSnoozeData);

    const result = await getMostSnoozedNotification(userId);

    expect(result).toBeNull();
    expect(mockFindOne).not.toHaveBeenCalled();
  });

  // Test 5: Tie in snooze counts (optional).
  it('should return one notification if there is a tie (LIMIT 1 behavior)', async () => {
    // This test is essentially the same as Test 1, as the query itself handles the tie.
    // We just ensure it returns *a* valid notification.
    const userId = 'user5';
    const rawSnoozeData = { raw_notification_id: 104, total_snoozes: '10' }; // Assume this is one of the tied ones
    const notificationDetails = {
      id: 104,
      subject: 'Tied Subject',
      description: 'Tied Description',
      user_id: userId,
    } as UserNotifications;

    mockQueryBuilder.getRawOne.mockResolvedValue(rawSnoozeData);
    mockFindOne.mockResolvedValue(notificationDetails);

    const result = await getMostSnoozedNotification(userId);

    expect(result).toEqual({
      id: 104,
      subject: 'Tied Subject',
      description: 'Tied Description',
      snooze_count: 10,
    });
  });
});
