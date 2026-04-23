import Notification from "../models/Notification.js";

export const getMrNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ mrId: req.user._id })
            .sort({ createdAt: -1 })
            .lean();

        const unreadCount = notifications.filter(
            (notification) => !notification.isRead
        ).length;

        return res.status(200).json({
            success: true,
            count: notifications.length,
            unreadCount,
            notifications,
        });
    } catch (error) {
        console.error("Get MR notifications error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch notifications",
        });
    }
};

export const markMrNotificationAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            {
                _id: req.params.id,
                mrId: req.user._id,
            },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Notification marked as read",
            notification,
        });
    } catch (error) {
        console.error("Mark MR notification as read error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update notification",
        });
    }
};
