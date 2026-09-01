import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import About from "../pages/About";
import Activities from "../components/activities";
import Login from "../admin/Login";
import Dashboard from "../admin/Dashboard";
import Members from "../admin/Members";
import ViewMembers from "../admin/ViewMembers";
import ProtectedRoute from "../admin/ProtectedRoute";
import Subscription from "../admin/Subscription";
import Donation from "../admin/Donation";
import Expense from "../admin/Expense";
import Notice from "../admin/Notice";
import Settings from "../admin/Settings";
import NoticePage from "../pages/Notice";
import Contact from "../pages/contact";
import DonationPage from "../pages/Donation";
import Adminactivities from "../admin/AdminActivities";
import RoleRoute from "../admin/RoleRoute";
import Feedback from "../pages/Feedback";
import MedicalInfo from "../admin/MedicalInfo";
import DonorList from "../pages/DonorList";
import MedicalList from "../pages/MedicalList";
import MainLayout from "../layouts/MainLayout";
import Report from "../components/report";
import Reportacc from "../components/ReportPadaccount"
import EmergencyNumbers from "../admin/EmergencyNumbers";
import EmergencyNumberspublic from "../pages/EmergencyNumbers";
import Bikaspayment from "../pages/bikaspayment";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* Website */}
        {/* Website */}
<Route element={<MainLayout />}>
  <Route path="/" element={<Home />} />
  <Route path="/about" element={<About />} />
  <Route path="/activities" element={<Activities />} />
  <Route path="/notice" element={<NoticePage />} />
  <Route path="/contact" element={<Contact />} />
  <Route path="/donation" element={<DonationPage />} />
  <Route path="/feedback" element={<Feedback />} />
  <Route path="/donors" element={<DonorList />} />
  <Route path="/medical" element={<MedicalList />} />
  <Route path="/admin/login" element={<Login />} />
  <Route path="/report" element={<Report />} />
  <Route path="/reportacc" element={<Reportacc />} />
  <Route path="/emergency" element={<EmergencyNumberspublic />} />
   <Route path="/bikaspayment" element={<Bikaspayment />} />
</Route>


        {/* Admin Login */}
        


        {/* Protected Admin */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/members"
          element={
            <ProtectedRoute>
              <Members />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/viewmembers"
          element={
            <ProtectedRoute>
              <ViewMembers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/subscription"
          element={
            <ProtectedRoute>
              <RoleRoute roles={["admin", "account"]}>
                <Subscription />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/donation"
          element={
            <ProtectedRoute>
              <RoleRoute roles={["admin"]}>
                <Donation />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/expense"
          element={
            <ProtectedRoute>
              <RoleRoute roles={["admin", "account"]}>
                <Expense />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/notice"
          element={
            <ProtectedRoute>
              <Notice />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/adminactivities"
          element={
            <ProtectedRoute>
              <Adminactivities />
            </ProtectedRoute>
          }
        />


        <Route
          path="/admin/medical-info"
          element={
            <RoleRoute roles={["admin", "editor"]}>
              <MedicalInfo />
            </RoleRoute>
          }
        />

         <Route
          path="/admin/emergency-numbers"
          element={
            <RoleRoute roles={["admin", "editor"]}>
              <EmergencyNumbers />
            </RoleRoute>
          }
        />




      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;