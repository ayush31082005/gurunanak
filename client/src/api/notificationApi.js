import API from "../api";

export const getMrNotifications = () => API.get("/notifications/mr");

export const markMrNotificationAsRead = (notificationId) =>
    API.patch(`/notifications/mr/${notificationId}/read`);
