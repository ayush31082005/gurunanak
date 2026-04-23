import API from "../api";

export const scanReminderImage = (file) => {
    const formData = new FormData();
    formData.append("image", file);

    return API.post("/reminders/scan", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};

export const createReminder = (payload) => API.post("/reminders", payload);

export const getMyReminders = () => API.get("/reminders/my");

export const updateReminder = (reminderId, payload) =>
    API.put(`/reminders/${reminderId}`, payload);

export const deleteReminder = (reminderId) =>
    API.delete(`/reminders/${reminderId}`);

export const toggleReminderStatus = (reminderId) =>
    API.patch(`/reminders/${reminderId}/toggle`);

export const logDoseStatus = (reminderId, payload) =>
    API.patch(`/reminders/${reminderId}/log-dose`, payload);
