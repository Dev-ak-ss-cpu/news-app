import "@/app/globals.css";
import Providers from "@/app/Providers";

export const metadata = {
    title: "Admin Dashboard",
    description: "This is dashboard for admin to manage website",
};

export default function AdminLayout({ children }) {
    return (
        <Providers>
            <main>{children}</main>
        </Providers>
    );
}
