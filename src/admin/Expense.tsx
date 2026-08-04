import { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import AdminLayout from "./AdminLayout";

import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

interface Expense {
  id: string;
  title: string;
  category: string;
  amount: string;
  paymentMethod: string;
  expenseDate: string;
  remarks: string;
}

const Expense = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Add Form

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Office");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [expenseDate, setExpenseDate] = useState("");
  const [remarks, setRemarks] = useState("");

  // Filter

  const [searchTitle, setSearchTitle] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [showReport, setShowReport] = useState(false);

  // Fetch Expenses

  const fetchExpenses = async () => {
    const snapshot = await getDocs(collection(db, "expenses"));

    const data: Expense[] = [];

    snapshot.forEach((item) => {
      data.push({
        id: item.id,
        ...(item.data() as Omit<Expense, "id">),
      });
    });

    setExpenses(data);
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // Add Expense

  const addExpense = async () => {
    if (!title || !amount || !expenseDate) {
      alert("Title, Amount and Date required");
      return;
    }

    await addDoc(collection(db, "expenses"), {
      title,
      category,
      amount,
      paymentMethod,
      expenseDate,
      remarks,
      createdAt: new Date(),
    });

    alert("Expense Added Successfully");

    setTitle("");
    setCategory("Office");
    setAmount("");
    setPaymentMethod("Cash");
    setExpenseDate("");
    setRemarks("");

    fetchExpenses();
  };

  // Delete Expense

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(
      "Delete this expense?"
    );

    if (!confirmDelete) return;

    await deleteDoc(doc(db, "expenses", id));

    fetchExpenses();
  };

  // Filter

  const filteredExpenses = expenses.filter((item) => {
    return (
      (searchTitle === "" ||
        item.title
          .toLowerCase()
          .includes(searchTitle.toLowerCase())) &&
      (filterCategory === "" ||
        item.category === filterCategory)
    );
  });

  const totalExpense = filteredExpenses.reduce(
    (sum, item) => sum + Number(item.amount),
    0
  );

  return (
    <AdminLayout>
      <div className="container-fluid p-4">
        <h3 className="mb-4">
          💸 Expense Management
        </h3>
        {/* Add Expense */}

<div className="card shadow-sm p-3 mb-4">
  <h5>Add New Expense</h5>

  <div className="row g-3">
    <div className="col-md-4">
      <label>Expense Title</label>
      <input
        type="text"
        className="form-control"
        placeholder="e.g. Office Rent"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
    </div>

    <div className="col-md-4">
      <label>Category</label>
      <select
        className="form-select"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option>Office</option>
        <option>Education</option>
        <option>Medical</option>
        <option>Relief</option>
        <option>Event</option>
        <option>Travel</option>
        <option>Food</option>
        <option>Maintenance</option>
        <option>Others</option>
      </select>
    </div>

    <div className="col-md-4">
      <label>Amount</label>
      <input
        type="number"
        className="form-control"
        placeholder="1000"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
    </div>

    <div className="col-md-4">
      <label>Payment Method</label>
      <select
        className="form-select"
        value={paymentMethod}
        onChange={(e) => setPaymentMethod(e.target.value)}
      >
        <option>Cash</option>
        <option>bKash</option>
        <option>Nagad</option>
        <option>Rocket</option>
        <option>Bank Transfer</option>
      </select>
    </div>

    <div className="col-md-4">
      <label>Expense Date</label>
      <input
        type="date"
        className="form-control"
        value={expenseDate}
        onChange={(e) => setExpenseDate(e.target.value)}
      />
    </div>

    <div className="col-md-4">
      <label>Remarks</label>
      <input
        type="text"
        className="form-control"
        placeholder="Optional"
        value={remarks}
        onChange={(e) => setRemarks(e.target.value)}
      />
    </div>
  </div>

  <button
    className="btn btn-danger mt-3"
    onClick={addExpense}
  >
    ➕ Save Expense
  </button>
</div>

{/* Summary Cards */}

<div className="row mb-4">
  <div className="col-md-4">
    <div className="card bg-danger text-white shadow-sm">
      <div className="card-body text-center">
        <h6>Total Expense</h6>
        <h3>৳ {totalExpense}</h3>
      </div>
    </div>
  </div>

  <div className="col-md-4">
    <div className="card bg-primary text-white shadow-sm">
      <div className="card-body text-center">
        <h6>Total Transactions</h6>
        <h3>{filteredExpenses.length}</h3>
      </div>
    </div>
  </div>

</div>

{/* Filter */}

<div className="card shadow-sm p-3 mb-4">
  <h5>🔍 Expense Filter</h5>

  <div className="row">
    <div className="col-md-5">
      <label>Search Expense</label>
      <input
        type="text"
        className="form-control"
        placeholder="Search by Title"
        value={searchTitle}
        onChange={(e) => setSearchTitle(e.target.value)}
      />
    </div>

    <div className="col-md-5">
      <label>Category</label>
      <select
        className="form-select"
        value={filterCategory}
        onChange={(e) => setFilterCategory(e.target.value)}
      >
        <option value="">All Category</option>
        <option>Office</option>
        <option>Education</option>
        <option>Medical</option>
        <option>Relief</option>
        <option>Event</option>
        <option>Travel</option>
        <option>Food</option>
        <option>Maintenance</option>
        <option>Others</option>
      </select>
    </div>

    <div className="col-md-2 d-flex align-items-end">
      <button
        className="btn btn-primary w-100"
        onClick={() => setShowReport(true)}
      >
        👁 Report
      </button>
    </div>
  </div>
</div>
{/* Report Modal */}

{showReport && (
  <div
    className="modal fade show d-block"
    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
  >
    <div className="modal-dialog modal-lg">
      <div className="modal-content">

        <div className="modal-header">
          <h5 className="modal-title">Expense Report</h5>

          <button
            className="btn-close"
            onClick={() => setShowReport(false)}
          />
        </div>

        <div
          className="modal-body"
          style={{
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Watermark */}

          <img
            src="/logo.png"
            alt="Watermark"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "420px",
              opacity: 0.12,
              zIndex: 0,
            }}
          />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div className="text-center mb-4">
              <img src="/logo.png" width="80" alt="Logo" />

              <h3>Badokhali Youth Foundation</h3>

              <p>Badokhali, Mograhat, Bagerhat</p>

              <h5>Expense Report</h5>
            </div>

            <table className="table table-bordered">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {filteredExpenses.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>{item.title}</td>
                    <td>{item.category}</td>
                    <td>৳ {item.amount}</td>
                    <td>{item.paymentMethod}</td>
                    <td>{item.expenseDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h5 className="text-end mt-4">
              Total Expense : ৳ {totalExpense}
            </h5>

            <div className="row mt-5">
              <div className="col-md-6">
                <img
                  src="/roundseal.png"
                  alt="Office Seal"
                  width="120"
                />
              </div>

              <div className="col-md-6 text-end">
                <br />
                <br />
                _______________________
                <br />
                Suman Roy
                <br />
                Treasurer
                <br />
                Badokhali Youth Foundation
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="btn btn-secondary"
            onClick={() => setShowReport(false)}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
)}

{/* Expense History */}

<div className="card shadow-sm">
  <div className="card-header bg-dark text-white">
    <h5 className="mb-0">Expense History</h5>
  </div>

  <div className="table-responsive">
    <table className="table table-bordered table-hover mb-0">
      <thead className="table-dark">
        <tr>
          <th>#</th>
          <th>Title</th>
          <th>Category</th>
          <th>Amount</th>
          <th>Payment</th>
          <th>Date</th>
          <th>Remarks</th>
          <th>Action</th>
        </tr>
      </thead>

      <tbody>
        {filteredExpenses.length === 0 ? (
          <tr>
            <td colSpan={8} className="text-center">
              No Expense Found
            </td>
          </tr>
        ) : (
          filteredExpenses.map((item, index) => (
            <tr key={item.id}>
              <td>{index + 1}</td>

              <td>{item.title}</td>

              <td>{item.category}</td>

              <td>৳ {item.amount}</td>

              <td>{item.paymentMethod}</td>

              <td>{item.expenseDate}</td>

              <td>{item.remarks}</td>

              <td>
                <button className="btn btn-sm btn-primary me-2">
                  Edit
                </button>

                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(item.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
</div>

</div>
</AdminLayout>
);
};

export default Expense;