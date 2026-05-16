import AdminSidebar from "@/components/admin/AdminSidebar";

export const metadata = { title: { default: "Admin", template: "%s | RoboZed Admin" } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <AdminSidebar />
      <div style={{ flex: 1, overflow: "auto" }}>{children}</div>
    </div>
  );
}
