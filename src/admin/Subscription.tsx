import { useEffect, useState } from "react";
import { useRef } from "react";
import html2canvas from "html2canvas";
import { db } from "../firebase/firebase";
import AdminLayout from "./AdminLayout";

import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

interface Member {
  id: string;
  name: string;
  designation: string;
  phone: string;
}

interface Subscription {
  id: string;
  memberId: string;
  name: string;
  designation: string;
  phone: string;
  month: string;
  year: string;
  amount: string;
}

const Subscription = () => {
  const [members, setMembers] = useState<Member[]>([]);

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  // Add Form

  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedMember, setSelectedMember] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 15;

  // Filter

  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterMember, setFilterMember] = useState("");

  const [showReport, setShowReport] = useState(false);

  const reportRef = useRef<HTMLDivElement>(null);

  // Fetch Members

  const fetchMembers = async () => {
    const snapshot = await getDocs(collection(db, "members"));

    const data: Member[] = [];

    snapshot.forEach((item) => {
      data.push({
        id: item.id,

        ...(item.data() as Omit<Member, "id">),
      });
    });

    setMembers(data);
  };

  // Fetch Subscription

  const fetchSubscriptions = async () => {
  const q = query(
    collection(db, "subscriptions"),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  const data: Subscription[] = [];

  snapshot.forEach((item) => {
    data.push({
      id: item.id,
      ...(item.data() as Omit<Subscription, "id">),
    });
  });

  setSubscriptions(data);
};

  useEffect(() => {
    fetchMembers();

    fetchSubscriptions();
  }, []);

  // Add Subscription

  const addSubscription = async () => {
    const member = members.find((item) => item.id === selectedMember);

    if (!member) {
      alert("Please select member");

      return;
    }

    if (!month || !year || !amount) {
      alert("Month, Year and Amount required");

      return;
    }

    await addDoc(collection(db, "subscriptions"), {
  memberId: member.id,
  name: member.name,
  designation: member.designation,
  phone: member.phone,
  month,
  year,
  amount,
  createdAt: serverTimestamp(),
});

    alert("Subscription Added");

    setAmount("");

    setSelectedMember("");

    fetchSubscriptions();
  };

  // Delete

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("Delete this subscription?");

    if (!confirmDelete) return;

    await deleteDoc(doc(db, "subscriptions", id));

    fetchSubscriptions();
  };

  // Filter Data

  const filteredSubscriptions = subscriptions.filter((item) => {
    return (
      (filterMonth === "" || item.month === filterMonth) &&
      (filterYear === "" || item.year === filterYear) &&
      (filterMember === "" || item.memberId === filterMember)
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
const indexOfFirstItem = indexOfLastItem - itemsPerPage;

const currentSubscriptions = filteredSubscriptions.slice(
  indexOfFirstItem,
  indexOfLastItem
);

const totalPages = Math.ceil(
  filteredSubscriptions.length / itemsPerPage
);

  const totalSubscription = filteredSubscriptions.reduce(
    (sum, item) => sum + Number(item.amount),
    0
  );

  const downloadReport = async () => {
    if (!reportRef.current) return;

    const canvas = await html2canvas(reportRef.current, {
      scale: 3,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const image = canvas.toDataURL("image/png");

    const link = document.createElement("a");
    link.href = image;
    link.download = `Subscription-${filterMonth || "All"}-${filterYear || "All"}.png`;
    link.click();
  };

  return (
    <AdminLayout>
      <div className="container-fluid p-4">
        <h3 className="mb-4">💰 Monthly Subscription</h3>

        {/* Add Subscription */}

        <div className="card shadow-sm p-3 mb-4">
          <h5>Add Member Chanda</h5>

          <div className="row">
            <div className="col-md-3">
              <label>Month</label>

              <select
                className="form-select"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              >
                <option value="">Select Month</option>

                <option>January</option>
                <option>February</option>
                <option>March</option>
                <option>April</option>
                <option>May</option>
                <option>June</option>
                <option>July</option>
                <option>August</option>
                <option>September</option>
                <option>October</option>
                <option>November</option>
                <option>December</option>
              </select>
            </div>

            <div className="col-md-3">
              <label>Year</label>

              <select
                className="form-select"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              >
                <option value="">Select Year</option>

                <option>2026</option>
                <option>2027</option>
              </select>
            </div>

            <div className="col-md-3">
              <label>Member</label>

              <select
                className="form-select"
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
              >
                <option value="">Select Member</option>

                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} - {member.designation}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <label>Amount</label>

              <input
                type="number"
                className="form-control"
                placeholder="300"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          <button className="btn btn-success mt-3" onClick={addSubscription}>
            ➕ Add Chanda
          </button>
        </div>



        <div className="row mb-4">
          <div className="col-md-4">
            <div className="card bg-success text-white shadow-sm">
              <div className="card-body">
                <h6>Total Subscription</h6>
                <h3>৳ {totalSubscription}</h3>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card bg-primary text-white shadow-sm">
              <div className="card-body">
                <h6>Count</h6>
                <h3>{filteredSubscriptions.length}</h3>
              </div>
            </div>
          </div>


        </div>

        {/* Filter */}

        <div className="card p-3 mb-4">
          <h5>🔍 Subscription Filter</h5>

          <div className="row">
            <div className="col-md-3">
              <label>Month</label>

              <select
                className="form-select"
                onChange={(e) => setFilterMonth(e.target.value)}
              >
                <option value="">All Month</option>

                <option>January</option>
                <option>February</option>
                <option>March</option>
                <option>April</option>
                <option>May</option>
                <option>June</option>
                <option>July</option>
                <option>August</option>
                <option>September</option>
                <option>October</option>
                <option>November</option>
                <option>December</option>
              </select>
            </div>

            <div className="col-md-3">
              <label>Year</label>

              <select
                className="form-select"
                onChange={(e) => setFilterYear(e.target.value)}
              >
                <option value="">All Year</option>


                <option>2026</option>
                <option>2027</option>
              </select>
            </div>

            <div className="col-md-3">
              <label>Member</label>

              <select
                className="form-select"
                onChange={(e) => setFilterMember(e.target.value)}
              >
                <option value="">All Member</option>

                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3 d-flex align-items-end">
              <button
                className="btn btn-primary w-100"
                onClick={() => setShowReport(true)}
              >
                👁 View Report
              </button>
            </div>
          </div>
        </div>

        {showReport && (
          <div
            className="modal fade show d-block"
            style={{
              backgroundColor: "rgba(0,0,0,0.5)",
            }}
          >
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <button
                    className="btn-close"
                    onClick={() => setShowReport(false)}
                  ></button>
                </div>

                <div
                  ref={reportRef}
                  className="modal-body"
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    background: "#fff",
                    padding: "20px",
                  }}
                >
                  {/* Background Watermark Logo */}

                  <img
                    src="/logo.png"
                    alt="Watermark"
                    style={{
                      position: "absolute",
                      top: "55%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: "420px",
                      opacity: 0.15,
                      filter: "grayscale(100%)",
                      zIndex: 2,
                      pointerEvents: "none",
                    }}
                  />

                  {/* Report Content */}

                  <div
                    style={{
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    {/* Header */}

                    <div className="text-center mb-4">
                      <img src="/logo.png" width="80" alt="Logo" />

                      <h3>Badokhali Youth Foundation</h3>

                      <p>Badokhali, Mograhat, Bagerhat</p>
                    </div>

                    {/* Table */}

                    <table className="table table-bordered">
                      <thead className="table-light">
                        <tr>
                          <th>Name</th>

                          <th>Designation</th>

                          <th>Month</th>

                          <th>Amount</th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredSubscriptions.map((item) => (
                          <tr key={item.id}>
                            <td>{item.name}</td>

                            <td>{item.designation}</td>

                            <td>
                              {item.month}-{item.year}
                            </td>

                            <td>৳ {item.amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Total */}

                    <h5 className="text-end mt-4">
                      Total Collection: ৳{" "}
                      {filteredSubscriptions.reduce(
                        (total, item) => total + Number(item.amount),
                        0,
                      )}
                    </h5>

                    {/* Seal & Signature */}

                    <div className="row mt-5">
                      {/* Left Seal */}

                      <div className="col-md-6 text-start">
                        <img
                          src="/roundseal.png"
                          alt="Office Seal"
                          width="120"
                          height="120"
                          style={{
                            objectFit: "contain",
                          }}
                        />


                      </div>

                      {/* Right Signature */}

                      <div className="col-md-6 text-end">
                        <br />
                        <br />
                        <br />
                        ____________________
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
                    className="btn btn-success"
                    onClick={downloadReport}
                  >
                    📥 Download Image
                  </button>

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
        {/* History */}

        <h5>Subscription History</h5>

        <table className="table table-bordered table-hover">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Designation</th>
              <th>Mobile</th>
              <th>Month</th>
              <th>Amount</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {currentSubscriptions.map((item, index) => (
              <tr key={item.id}>
                <td>{indexOfFirstItem + index + 1}</td>

                <td>{item.name}</td>

                <td>{item.designation}</td>

                <td>{item.phone}</td>

                <td>
                  {item.month} - {item.year}
                </td>

                <td>৳ {item.amount}</td>

                <td>
                  <button className="btn btn-sm btn-primary me-2">Edit</button>

                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(item.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="d-flex justify-content-center mt-3">
  <button
    className="btn btn-outline-primary me-2"
    disabled={currentPage === 1}
    onClick={() => setCurrentPage(currentPage - 1)}
  >
    Previous
  </button>

  <span className="align-self-center px-3">
    Page {currentPage} of {totalPages}
  </span>

  <button
    className="btn btn-outline-primary ms-2"
    disabled={currentPage === totalPages}
    onClick={() => setCurrentPage(currentPage + 1)}
  >
    Next
  </button>
</div>
      </div>
    </AdminLayout>
  );
};

export default Subscription;
