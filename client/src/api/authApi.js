import API from "../api";

export const sendUserRegisterOtp = (payload) =>
    API.post("/auth/register/send-otp", payload);

export const verifyUserRegisterOtp = (payload) =>
    API.post("/auth/register/verify-otp", payload);

export const sendMrRegisterOtp = (formData) =>
    API.post("/auth/mr/register/send-otp", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

export const verifyMrRegisterOtp = (payload) =>
    API.post("/auth/mr/register/verify-otp", payload);

export const sendLoginOtp = (payload) => API.post("/auth/login/send-otp", payload);

export const verifyLoginOtp = (payload) => API.post("/auth/login/verify-otp", payload);

export const getPendingMrRequests = (status = "all") =>
    API.get("/admin/mr-requests", {
        params: {
            status,
        },
    });

export const approveMrRequest = (id) =>
    API.patch(`/admin/mr-requests/${id}/approve`);

export const rejectMrRequest = (id) =>
    API.patch(`/admin/mr-requests/${id}/reject`);

export const updateMrRequest = (id, payload) =>
    API.patch(`/admin/mr-requests/${id}`, payload);

export const deleteMrRequest = (id) =>
    API.delete(`/admin/mr-requests/${id}`);
