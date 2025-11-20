import "@/app/globals.css";

export const metadata = {
    title: "Admin Dashboard",
    description: "This is dashboard for admin to manage website",
};

export default function AdminLayout({ children }) {
    return (
        <main >{children}</main>
    );
}
