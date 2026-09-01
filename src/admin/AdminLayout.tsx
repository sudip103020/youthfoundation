import type { ReactNode } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

interface Props {
  children: ReactNode;
}

const AdminLayout = ({ children }: Props) => {
  return (
    <div className="admin-layout">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Area */}
      <main className="admin-main-content">

        {/* Header */}
        <Header />

        {/* Page Content */}
        <div className="admin-page-content">
          {children}
        </div>

      </main>

    </div>
  );
};

export default AdminLayout;

