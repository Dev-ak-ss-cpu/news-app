"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { verifyAuth } from "@/app/utils/auth";

export default function AuthMiddleware({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isChecking, setIsChecking] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const isAuth = await verifyAuth();
            
            if (!isAuth) {
                if (typeof window !== 'undefined') {
                    localStorage.removeItem("userData");
                }
                router.push("/admin");
                setIsAuthenticated(false);
            } else {
                setIsAuthenticated(true);
            }
            
            setIsChecking(false);
        };

        checkAuth();
    }, [router, pathname]);

    if (isChecking) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Checking authentication...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return <>{children}</>;
}
