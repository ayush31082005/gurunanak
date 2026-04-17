import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import API from "../../api";

const getRedirectPathForRole = (role) => {
    if (role === "admin") {
        return "/admin/dashboard";
    }

    if (role === "mr") {
        return "/mr-dashboard";
    }

    return "/user-dashboard";
};

const ProtectedRoleRoute = ({ allowedRoles = [] }) => {
    const location = useLocation();
    const token = localStorage.getItem("token");
    const [authState, setAuthState] = useState(() => {
        let storedUser = null;

        try {
            storedUser = JSON.parse(localStorage.getItem("user") || "null");
        } catch (error) {
            storedUser = null;
        }

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

        const validateAccess = async () => {
            try {
                const { data } = await API.get("/auth/me");

                if (!isMounted) {
                    return;
                }

                localStorage.setItem("user", JSON.stringify(data.user));

                setAuthState({
                    loading: false,
                    user: data.user,
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

        validateAccess();

        return () => {
            isMounted = false;
        };
    }, [token]);

    if (authState.loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
                <p className="text-sm font-medium text-slate-500">Checking access...</p>
            </div>
        );
    }

    if (authState.shouldLogin) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    if (!allowedRoles.includes(authState.user?.role)) {
        return <Navigate to={getRedirectPathForRole(authState.user?.role)} replace />;
    }

    return <Outlet />;
};

export default ProtectedRoleRoute;
