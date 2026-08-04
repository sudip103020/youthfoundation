import type { ReactNode } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

interface Props {
  children: ReactNode;
}

const AdminLayout = ({ children }: Props) => {
  return (
    <div className="d-flex">

      <Sidebar />

      <div className="flex-grow-1">

        <Header />

        <div className="p-4">
          {children}
        </div>

      </div>

    </div>
  );
};

export default AdminLayout;