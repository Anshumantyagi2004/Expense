import { Navigate, Outlet } from "react-router-dom";
import toast from "react-hot-toast";
import { BaseUrl } from "../BaseApi/Api";
import { useEffect, useState, useRef } from "react";

const ProtectedRoute = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const toastShown = useRef(false); 

    useEffect(() => {
        async function fetchMe() {
            try {
                const res = await fetch(BaseUrl + "me", {
                    credentials: "include",
                });

                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                } else {
                    setUser(null);
                }
            } catch (error) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        }

        fetchMe();
    }, []);

    if (loading) {
        return <div className="text-center mt-10">Checking authentication...</div>;
    }

    if (!user) {
        if (!toastShown.current) {
            toast.error("Please login first");
            toastShown.current = true;
        }
        return <Navigate to="/Login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
