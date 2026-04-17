import API from "../api";

export const getPublicProducts = (params = {}) => API.get("/products", { params });

export const getMyProducts = () => API.get("/products/mine");

export const createProduct = (payload) =>
    API.post("/products", payload, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

export const updateProduct = (id, payload) =>
    API.put(`/products/${id}`, payload, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

export const deleteProduct = (id) => API.delete(`/products/${id}`);

export const getAdminProducts = (params = {}) => API.get("/admin/products", { params });

export const approveProduct = (id) => API.patch(`/admin/products/${id}/approve`);

export const rejectProduct = (id) => API.patch(`/admin/products/${id}/reject`);
