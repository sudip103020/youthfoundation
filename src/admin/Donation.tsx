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

interface Donation {
  id: string;
  donorName: string;
  phone: string;
  address: string;
  amount: string;
  paymentMethod: string;
  purpose: string;
  donationDate: string;
  remarks: string;
}

const Donation = () => {
  const [donations, setDonations] = useState<Donation[]>([]);

  // Add Form

  const [donorName, setDonorName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [purpose, setPurpose] = useState("");
  const [donationDate, setDonationDate] = useState("");
  const [remarks, setRemarks] = useState("");

  // Filter

  const [searchName, setSearchName] = useState("");
  const [filterMethod, setFilterMethod] = useState("");

  const [showReport, setShowReport] = useState(false);

  // Fetch Donation

  const fetchDonations = async () => {
    const snapshot = await getDocs(collection(db, "donations"));

    const data: Donation[] = [];

    snapshot.forEach((item) => {
      data.push({
        id: item.id,
        ...(item.data() as Omit<Donation, "id">),
      });
    });

    setDonations(data);
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  // Add Donation

  const addDonation = async () => {
    if (!donorName || !amount || !donationDate) {
      alert("Donor Name, Amount and Date required");
      return;
    }

    await addDoc(collection(db, "donations"), {
      donorName,
      phone,
      address,
      amount,
      paymentMethod,
      purpose,
      donationDate,
      remarks,
      createdAt: new Date(),
    });

    alert("Donation Added Successfully");

    setDonorName("");
    setPhone("");
    setAddress("");
    setAmount("");
    setPurpose("");
    setDonationDate("");
    setRemarks("");
    setPaymentMethod("Cash");

    fetchDonations();
  };

  // Delete Donation

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(
      "Delete this donation?"
    );

    if (!confirmDelete) return;

    await deleteDoc(doc(db, "donations", id));

    fetchDonations();
  };

  // Filter

  const filteredDonations = donations.filter((item) => {
    return (
      (searchName === "" ||
        item.donorName
          .toLowerCase()
          .includes(searchName.toLowerCase())) &&
      (filterMethod === "" ||
        item.paymentMethod === filterMethod)
    );
  });

  const totalDonation = filteredDonations.reduce(
    (sum, item) => sum + Number(item.amount),
    0
  );

  return (
    <AdminLayout>
      <div className="container-fluid p-4">
        <h3 className="mb-4">
          🎁 Donation Management
        </h3>
        {/* Add Donation */}

<div className="card shadow-sm p-3 mb-4">
  <h5>Add New Donation</h5>

  <div className="row g-3">
    <div className="col-md-4">
      <label>Donor Name</label>
      <input
        type="text"
        className="form-control"
        placeholder="Enter Donor Name"
        value={donorName}
        onChange={(e) => setDonorName(e.target.value)}
      />
    </div>

    <div className="col-md-4">
      <label>Phone</label>
      <input
        type="text"
        className="form-control"
        placeholder="01XXXXXXXXX"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
    </div>

    <div className="col-md-4">
      <label>Address</label>
      <input
        type="text"
        className="form-control"
        placeholder="Address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />
    </div>

    <div className="col-md-3">
      <label>Donation Amount</label>
      <input
        type="number"
        className="form-control"
        placeholder="1000"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
    </div>

    <div className="col-md-3">
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

    <div className="col-md-3">
      <label>Donation Date</label>
      <input
        type="date"
        className="form-control"
        value={donationDate}
        onChange={(e) => setDonationDate(e.target.value)}
      />
    </div>

    <div className="col-md-3">
      <label>Purpose</label>
      <input
        type="text"
        className="form-control"
        placeholder="General Fund"
        value={purpose}
        onChange={(e) => setPurpose(e.target.value)}
      />
    </div>

    <div className="col-md-12">
      <label>Remarks</label>
      <textarea
        className="form-control"
        rows={3}
        placeholder="Remarks (Optional)"
        value={remarks}
        onChange={(e) => setRemarks(e.target.value)}
      />
    </div>
  </div>

  <button
    className="btn btn-success mt-3"
    onClick={addDonation}
  >
    ➕ Save Donation
  </button>
</div>

{/* Summary */}

<div className="row mb-4">
  <div className="col-md-4">
    <div className="card bg-success text-white shadow-sm">
      <div className="card-body">
        <h6>Total Donation</h6>
        <h3>৳ {totalDonation}</h3>
      </div>
    </div>
  </div>

  <div className="col-md-4">
    <div className="card bg-primary text-white shadow-sm">
      <div className="card-body">
        <h6>Total Donors</h6>
        <h3>{filteredDonations.length}</h3>
      </div>
    </div>
  </div>

  
</div>

{/* Filter */}

<div className="card p-3 mb-4">
  <h5>🔍 Filter Donation</h5>

  <div className="row">
    <div className="col-md-6">
      <label>Search Donor</label>
      <input
        type="text"
        className="form-control"
        placeholder="Search by Name"
        value={searchName}
        onChange={(e) => setSearchName(e.target.value)}
      />
    </div>

    <div className="col-md-4">
      <label>Payment Method</label>
      <select
        className="form-select"
        value={filterMethod}
        onChange={(e) =>
          setFilterMethod(e.target.value)
        }
      >
        <option value="">All</option>
        <option>Cash</option>
        <option>bKash</option>
        <option>Nagad</option>
        <option>Rocket</option>
        <option>Bank Transfer</option>
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
          <h5 className="modal-title">Donation Report</h5>

          <button
            className="btn-close"
            onClick={() => setShowReport(false)}
          ></button>
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
              opacity: 0.1,
              zIndex: 0,
            }}
          />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div className="text-center mb-4">
              <img src="/logo.png" width="80" alt="Logo" />

              <h3>Badokhali Youth Foundation</h3>

              <p>Badokhali, Mograhat, Bagerhat</p>

              <h5>Donation Report</h5>
            </div>

            <table className="table table-bordered">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Donor</th>
                  <th>Phone</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {filteredDonations.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>{item.donorName}</td>
                    <td>{item.phone}</td>
                    <td>৳ {item.amount}</td>
                    <td>{item.paymentMethod}</td>
                    <td>{item.donationDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h5 className="text-end">
              Total Donation : ৳ {totalDonation}
            </h5>

            <div className="row mt-5">
              <div className="col-md-6">
                <img
                  src="/roundseal.png"
                  width="120"
                  alt="Seal"
                />
              </div>

              <div className="col-md-6 text-end">
                <br />
                <br />
                _______________________
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

{/* Donation History */}

<div className="card shadow-sm">
  <div className="card-header bg-dark text-white">
    <h5 className="mb-0">Donation History</h5>
  </div>

  <div className="table-responsive">
    <table className="table table-bordered table-hover mb-0">
      <thead className="table-dark">
        <tr>
          <th>#</th>
          <th>Donor</th>
          <th>Phone</th>
          <th>Amount</th>
          <th>Method</th>
          <th>Purpose</th>
          <th>Date</th>
          <th>Action</th>
        </tr>
      </thead>

      <tbody>
        {filteredDonations.length === 0 ? (
          <tr>
            <td colSpan={8} className="text-center">
              No Donation Found
            </td>
          </tr>
        ) : (
          filteredDonations.map((item, index) => (
            <tr key={item.id}>
              <td>{index + 1}</td>

              <td>{item.donorName}</td>

              <td>{item.phone}</td>

              <td>৳ {item.amount}</td>

              <td>{item.paymentMethod}</td>

              <td>{item.purpose}</td>

              <td>{item.donationDate}</td>

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

export default Donation;   