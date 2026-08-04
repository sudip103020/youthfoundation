import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import { db } from "../firebase/firebase";

import { collection, getDocs } from "firebase/firestore";

const Dashboard = () => {
  const [totalMembers, setTotalMembers] = useState(0);
  const [totalSubscription, setTotalSubscription] = useState(0);
  const [totalDonation, setTotalDonation] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);

  const loadDashboard = async () => {
    // Members
    const memberSnapshot = await getDocs(
      collection(db, "members")
    );

    setTotalMembers(memberSnapshot.size);

    // Subscription
    const subscriptionSnapshot = await getDocs(
      collection(db, "subscriptions")
    );

    let subscriptionTotal = 0;

    subscriptionSnapshot.forEach((item) => {
      subscriptionTotal += Number(
        item.data().amount || 0
      );
    });

    setTotalSubscription(subscriptionTotal);

    // Donation
    const donationSnapshot = await getDocs(
      collection(db, "donations")
    );

    let donationTotal = 0;

    donationSnapshot.forEach((item) => {
      donationTotal += Number(
        item.data().amount || 0
      );
    });

    setTotalDonation(donationTotal);

    // Expense
    const expenseSnapshot = await getDocs(
      collection(db, "expenses")
    );

    let expenseTotal = 0;

    expenseSnapshot.forEach((item) => {
      expenseTotal += Number(
        item.data().amount || 0
      );
    });

    setTotalExpense(expenseTotal);
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const totalIncome =
    totalSubscription + totalDonation;

  const currentBalance =
    totalIncome - totalExpense;

  return (
    <AdminLayout>
      <div className="container-fluid p-4">

        <h3 className="mb-4">
          📊 Dashboard
        </h3>
        {/* Summary Cards */}

<div className="row g-4">

  {/* Members */}
  <div className="col-lg-4 col-md-6">
    <div className="card shadow-sm border-0 bg-primary text-white">
      <div className="card-body text-center py-4">
        <i className="bi bi-people-fill fs-1"></i>

        <h6 className="mt-3">Total Members</h6>

        <h2>{totalMembers}</h2>
      </div>
    </div>
  </div>

  {/* Subscription */}
  <div className="col-lg-4 col-md-6">
    <div className="card shadow-sm border-0 bg-success text-white">
      <div className="card-body text-center py-4">
        <i className="bi bi-wallet2 fs-1"></i>

        <h6 className="mt-3">Total Subscription</h6>

        <h2>৳ {totalSubscription.toLocaleString()}</h2>
      </div>
    </div>
  </div>

  {/* Donation */}
  <div className="col-lg-4 col-md-6">
    <div className="card shadow-sm border-0 bg-info text-white">
      <div className="card-body text-center py-4">
        <i className="bi bi-gift-fill fs-1"></i>

        <h6 className="mt-3">Total Donation</h6>

        <h2>৳ {totalDonation.toLocaleString()}</h2>
      </div>
    </div>
  </div>

  {/* Expense */}
  <div className="col-lg-4 col-md-6">
    <div className="card shadow-sm border-0 bg-danger text-white">
      <div className="card-body text-center py-4">
        <i className="bi bi-cash-stack fs-1"></i>

        <h6 className="mt-3">Total Expense</h6>

        <h2>৳ {totalExpense.toLocaleString()}</h2>
      </div>
    </div>
  </div>

  {/* Income */}
  <div className="col-lg-4 col-md-6">
    <div className="card shadow-sm border-0 bg-dark text-white">
      <div className="card-body text-center py-4">
        <i className="bi bi-graph-up-arrow fs-1"></i>

        <h6 className="mt-3">Total Income</h6>

        <h2>৳ {totalIncome.toLocaleString()}</h2>
      </div>
    </div>
  </div>

  {/* Balance */}
  <div className="col-lg-4 col-md-6">
    <div
      className={`card shadow-sm border-0 ${
        currentBalance >= 0
          ? "bg-warning"
          : "bg-secondary text-white"
      }`}
    >
      <div className="card-body text-center py-4">
        <i className="bi bi-bank fs-1"></i>

        <h6 className="mt-3">Current Balance</h6>

        <h2>৳ {currentBalance.toLocaleString()}</h2>
      </div>
    </div>
  </div>

</div>
{/* Welcome Card */}

<div className="card shadow-sm border-0 mt-4">
  <div className="card-body text-center py-5">

    <img
      src="/logo.png"
      alt="Logo"
      width="90"
      className="mb-3"
    />

    <h2 className="fw-bold text-success">
      Badokhali Youth Foundation
    </h2>

    <p className="text-muted fs-5">
      Foundation Management System
    </p>

    <hr />

    <h5 className="mt-4">
      Welcome to Admin Dashboard 👋
    </h5>

    <p className="text-muted mb-0">
      Manage Members, Subscriptions, Donations,
      Expenses and Reports from one place.
    </p>

  </div>
</div>

</div>
</AdminLayout>
);
};

export default Dashboard;