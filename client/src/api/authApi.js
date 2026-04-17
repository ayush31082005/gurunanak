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

export const getPendingMrRequests = () => API.get("/auth/admin/mr-requests");

export const approveMrRequest = (id) =>
    API.patch(`/auth/admin/mr-requests/${id}/approve`);

export const rejectMrRequest = (id) =>
    API.patch(`/auth/admin/mr-requests/${id}/reject`);
