import "@/app/globals.css";
import Providers from "@/app/Providers";
import AuthMiddleware from "./AuthMiddleware";

export const metadata = {
    title: "Admin Dashboard",
    description: "This is dashboard for admin to manage website",
};

export default function AdminLayout({ children }) {
    return (
        <Providers>
            <AuthMiddleware>
                <main>{children}</main>
            </AuthMiddleware>
        </Providers>
    );
}
