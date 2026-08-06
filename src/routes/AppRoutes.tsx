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
import NoticePage from "../pages/Notice";
import Contact from "../pages/contact";
import DonationPage from "../pages/Donation";
import Adminactivities from "../admin/AdminActivities";





const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* Website */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/activities" element={<Activities />} />
        <Route path="/notice" element={<NoticePage />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/donation" element={<DonationPage />} />


        {/* Admin Login */}
        <Route path="/admin/login" element={<Login />} />


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
              <Subscription />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/donation" 
          element={
            <ProtectedRoute>
              <Donation />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/expense" 
          element={
            <ProtectedRoute>
              <Expense />
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
              <Adminactivities/>
            </ProtectedRoute>
          } 
        />

       

         

      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;