import * as userProfile from '../controllers/userProfile';
import * as userNotifications from '../controllers/userNotifications';
import * as reminderSet from '../controllers/reminderSet';
import { successResponse, errorResponse } from '../responses';
import { authRoute } from '../middleware';
export const attachPublicRoutes = (app: any): void => {
  //app.post('/authentication/guest', authentication.createGuestAccount);
};

export const attachPrivateRoutes = (app: any): void => {
  app.get('/user/profile', authRoute, userProfile.view);
  app.post('/user/profile/save', authRoute, userProfile.save);
  app.post('/user/notificationPreference/save', authRoute, userProfile.saveNotificationPreference);
  app.post('/user/notificationPreference/show', authRoute, userProfile.getNotificationPreference);
  app.post(
    '/user/notificationPreference/delete',
    authRoute,
    userProfile.deleteNotificationPreference,
  );

  app.post('/user/notifications/save', authRoute, userNotifications.save);
  app.post('/user/notifications/list', authRoute, userNotifications.list);
  app.get('/user/notifications/show/:id', authRoute, userNotifications.show);
  app.post('/user/notifications/delete', authRoute, userNotifications.deleteRow);
  app.get('/user/notifications/pending', authRoute, userNotifications.pendingNotifications);

  app.get('/user/notifications/snooze/:id', authRoute, userNotifications.snoozeNotifications);
  app.get(
    '/user/notifications/complete/:id',
    authRoute,
    userNotifications.markNotificationComplete,
  );
  app.get(
    '/user/notifications/pending/count',
    authRoute,
    userNotifications.pendingNotificationCount,
  );

  //reminder set
  app.post('/user/reminderSet/save', authRoute, reminderSet.saveSet);
  app.get('/user/reminderSet/get/:id', authRoute, reminderSet.getFullSet);
  app.get(
    '/user/reminderSet/deleteNotification/:user_notification_id',
    authRoute,
    async (req: Request, res: Response) => {
      await handleRoute(req, res, reminderSet.deleteNotificationFromSetWithId);
    },
  );

  app.get('/user/reminderSet/list', authRoute, async (req: Request, res: Response) => {
    await handleRoute(req, res, reminderSet.getReminderSetList);
  });
  app.get('/user/reminderSet/deleteSet/:id', authRoute, async (req: Request, res: Response) => {
    await handleRoute(req, res, reminderSet.deleteNotificationSetById);
  });
};

export const handleRoute = async (req: Request, res: Response, routeFunction: any) => {
  try {
    await routeFunction(req, res);
  } catch (e) {
    console.log(e.message ?? 'Problem with route');
    return;
  }
};
