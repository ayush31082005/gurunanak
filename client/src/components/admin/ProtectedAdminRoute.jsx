import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import API from "../../api";

const ProtectedAdminRoute = () => {
    const location = useLocation();
    const token = localStorage.getItem("token");
    const [authState, setAuthState] = useState(() => {
        const storedUser = JSON.parse(localStorage.getItem("user") || "null");

        return {
            loading: !!token,
            user: storedUser,
            shouldLogin: !token,
        };
    });

    useEffect(() => {
        if (!token) {
            setAuthState({
                loading: false,
                user: null,
                shouldLogin: true,
            });
            return;
        }

        let isMounted = true;

        const validateAdminAccess = async () => {
            try {
                const { data } = await API.get("/auth/me");

                if (!isMounted) {
                    return;
                }

                const nextUser = data.user;
                localStorage.setItem("user", JSON.stringify(nextUser));

                setAuthState({
                    loading: false,
                    user: nextUser,
                    shouldLogin: false,
                });
            } catch (error) {
                if (!isMounted) {
                    return;
                }

                localStorage.removeItem("token");
                localStorage.removeItem("user");

                setAuthState({
                    loading: false,
                    user: null,
                    shouldLogin: true,
                });
            }
        };

        validateAdminAccess();

        return () => {
            isMounted = false;
        };
    }, [token]);

    if (authState.loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
                <p className="text-sm font-medium text-slate-500">Checking admin access...</p>
            </div>
        );
    }

    if (authState.shouldLogin) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    if (authState.user?.role !== "admin") {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedAdminRoute;
