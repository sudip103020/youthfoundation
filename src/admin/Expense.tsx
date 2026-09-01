import { useEffect, useState, useRef } from "react";
import html2canvas from "html2canvas";
import { db } from "../firebase/firebase";
import AdminLayout from "./AdminLayout";

import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
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
  const reportRef = useRef<HTMLDivElement>(null);

  // Add Form

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Office");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [expenseDate, setExpenseDate] = useState("");
  const [remarks, setRemarks] = useState("");
  const [editId, setEditId] = useState("");

  // Filter

  const [searchTitle, setSearchTitle] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [showReport, setShowReport] = useState(false);

  

  const [filterMonth, setFilterMonth] = useState("");

const [filterYear, setFilterYear] = useState("");

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

    if (editId) {
      await updateDoc(doc(db, "expenses", editId), {
        title,
        category,
        amount,
        paymentMethod,
        expenseDate,
        remarks,
      });

      alert("Expense Updated Successfully");
      setEditId("");
    } else {
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
    }

    

    setTitle("");
    setCategory("Office");
    setAmount("");
    setPaymentMethod("Cash");
    setExpenseDate("");
    setRemarks("");
    setEditId("");

    fetchExpenses();
  };

  // Delete Expense

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("Delete this expense?");

    if (!confirmDelete) return;

    await deleteDoc(doc(db, "expenses", id));

    fetchExpenses();
  };

  // Filter

    const filteredExpenses = expenses.filter((item) => {
    const expenseMonth = item.expenseDate
      ? item.expenseDate.substring(5, 7)
      : "";

    const expenseYear = item.expenseDate
      ? item.expenseDate.substring(0, 4)
      : "";

    return (
      (searchTitle === "" ||
        item.title.toLowerCase().includes(searchTitle.toLowerCase())) &&
      (filterCategory === "" || item.category === filterCategory) &&
      (filterMonth === "" || expenseMonth === filterMonth) &&
      (filterYear === "" || expenseYear === filterYear)
    );
  });

  const totalExpense = filteredExpenses.reduce(
    (sum, item) => sum + Number(item.amount),
    0,
  );

  const downloadExpenseReport = async () => {
  if (!reportRef.current) return;

  const canvas = await html2canvas(reportRef.current, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
  });

  const image = canvas.toDataURL("image/png");

  const link = document.createElement("a");
  link.href = image;
  link.download = "Expense-Report.png";
  link.click();
};

  return (
    <AdminLayout>
      <div className="container-fluid p-4">
        <h3 className="mb-4">💸 Expense Management</h3>
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
            className={`btn ${editId ? "btn-warning" : "btn-danger"} mt-3`}
            onClick={addExpense}
          >
            {editId ? "✏ Update Expense" : "➕ Save Expense"}
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

              {/* Filter */}

        <div className="card shadow-sm p-3 mb-4">
          <h5>🔍 Expense Filter</h5>

          <div className="row g-3">

            {/* Search */}
            <div className="col-md-3">
              <label>Search Expense</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search by Title"
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
              />
            </div>

            {/* Category */}
            <div className="col-md-3">
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

            {/* Month */}
            <div className="col-md-2">
              <label>Month</label>

              <select
                className="form-select"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
              >
                <option value="">All Months</option>
                <option value="01">January</option>
                <option value="02">February</option>
                <option value="03">March</option>
                <option value="04">April</option>
                <option value="05">May</option>
                <option value="06">June</option>
                <option value="07">July</option>
                <option value="08">August</option>
                <option value="09">September</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
              </select>
            </div>

            {/* Year */}
            <div className="col-md-2">
              <label>Year</label>

              <select
                className="form-select"
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
              >
                <option value="">All Years</option>

                {Array.from(
                  new Set(
                    expenses
                      .map((item) => item.expenseDate?.substring(0, 4))
                      .filter(Boolean)
                  )
                )
                  .sort((a, b) => Number(b) - Number(a))
                  .map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
              </select>
            </div>

            {/* Report */}
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

    
{/* ================= EXPENSE REPORT MODAL ================= */}

{showReport && (
  <div
    className="modal fade show d-block"
    style={{
      backgroundColor: "rgba(0,0,0,0.6)",
      zIndex: 1055,
    }}
  >
    <div
      className="modal-dialog modal-xl modal-dialog-centered"
      style={{
        maxWidth: "95%",
      }}
    >
      <div className="modal-content">

        {/* MODAL HEADER */}
        <div className="modal-header">
          <h5 className="modal-title">
            💸 Expense Report
          </h5>

          <button
            className="btn-close"
            onClick={() => setShowReport(false)}
          />
        </div>


        {/* ================= REPORT AREA ================= */}

        <div
          className="modal-body"
          style={{
            padding: "20px",
            overflowX: "auto",
            background: "#eeeeee",
          }}
        >

          <div
            ref={reportRef}
            style={{
              width: "210mm",
              minWidth: "210mm",
              margin: "0 auto",
              background: "#ffffff",
              fontFamily: '"Noto Sans Bengali", "Noto Sans", sans-serif',
              boxShadow: "0 0 15px rgba(0,0,0,0.15)",
              position: "relative",
              overflow: "hidden",
            }}
          >

            {/* ================= HEADER ================= */}

            <div
              style={{
                height: "43mm",
                background:
                  "linear-gradient(100deg, #08aeea 0%, #078dbb 35%, #075f7d 65%, #101c31 100%)",
                color: "#ffffff",
                position: "relative",
                overflow: "hidden",
              }}
            >

              {/* HEADER MAIN */}

              <div
                style={{
                  height: "36mm",
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >

                {/* LOGO */}

                <div
                  style={{
                    position: "absolute",
                    left: "28mm",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "18mm",
                    height: "18mm",
                    background: "#ffffff",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <img
                    src="/logo.png"
                    alt="Badokhali Youth Foundation"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      borderRadius: "50%",
                    }}
                  />
                </div>


                {/* ORGANIZATION NAME */}

                <div
                  style={{
                    textAlign: "center",
                    marginTop: "2mm",
                  }}
                >

                  <div
                    style={{
                      fontSize: "35px",
                      fontWeight: 800,
                      lineHeight: 1.2,
                      whiteSpace: "nowrap",
                    }}
                  >
                    বাদোখালী ইয়ুথ ফাউন্ডেশন
                  </div>

                  <div
                    style={{
                      fontFamily: "Arial, sans-serif",
                      fontSize: "25px",
                      fontWeight: 700,
                      lineHeight: 1.2,
                      marginTop: "2px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Badokhali Youth Foundation
                  </div>

                </div>


                {/* SLOGAN */}

                <div
                  style={{
                    position: "absolute",
                    right: "11mm",
                    top: "3mm",
                    fontSize: "10px",
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                  }}
                >
                  তারুণ্যের স্পন্দন, সেবার বন্ধন
                </div>

              </div>


              {/* HEADER DESIGN */}

              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: "7mm",
                  display: "flex",
                  background: "#ffffff",
                }}
              >

                <div
                  style={{
                    width: "31%",
                    background:
                      "linear-gradient(90deg, #12324a, #087b9e)",
                  }}
                />

                <div
                  style={{
                    width: "38%",
                    background: "#08aeea",
                    clipPath:
                      "polygon(8% 0, 92% 0, 84% 100%, 16% 100%)",
                  }}
                />

                <div
                  style={{
                    width: "31%",
                    background:
                      "linear-gradient(90deg, #087b9e, #12324a)",
                  }}
                />

              </div>

            </div>


            {/* ================= WATERMARK ================= */}

            <img
              src="/logo.png"
              alt=""
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "105mm",
                height: "105mm",
                objectFit: "contain",
                opacity: 0.045,
                pointerEvents: "none",
                zIndex: 0,
              }}
            />


            {/* ================= CONTENT ================= */}

            <div
              style={{
                position: "relative",
                zIndex: 2,
                padding: "8mm 15mm 5mm",
              }}
            >

              {/* META */}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "13px",
                  marginBottom: "5mm",
                }}
              >

                <div>
                  <strong>রিপোর্ট:</strong> Expense Report
                </div>

                <div>
                  <strong>তারিখ:</strong>{" "}
                  {new Date().toLocaleDateString("en-GB")}
                </div>

              </div>


              {/* TITLE */}

              <h2
                style={{
                  textAlign: "center",
                  fontSize: "23px",
                  fontWeight: 800,
                  textDecoration: "underline",
                  textUnderlineOffset: "5px",
                  margin: "0 0 7mm",
                }}
              >
                Expense Report
              </h2>


              {/* TABLE */}

              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  tableLayout: "fixed",
                  fontSize: "12px",
                }}
              >

                <thead>

                  <tr>

                    <th
                      style={{
                        border: "1px solid #555",
                        padding: "8px 5px",
                        width: "7%",
                        background: "#f0f5f2",
                      }}
                    >
                      #
                    </th>

                    <th
                      style={{
                        border: "1px solid #555",
                        padding: "8px 5px",
                        width: "27%",
                        background: "#f0f5f2",
                      }}
                    >
                      Title
                    </th>

                    <th
                      style={{
                        border: "1px solid #555",
                        padding: "8px 5px",
                        width: "16%",
                        background: "#f0f5f2",
                      }}
                    >
                      Category
                    </th>

                    <th
                      style={{
                        border: "1px solid #555",
                        padding: "8px 5px",
                        width: "15%",
                        background: "#f0f5f2",
                      }}
                    >
                      Amount
                    </th>

                    <th
                      style={{
                        border: "1px solid #555",
                        padding: "8px 5px",
                        width: "17%",
                        background: "#f0f5f2",
                      }}
                    >
                      Method
                    </th>

                    <th
                      style={{
                        border: "1px solid #555",
                        padding: "8px 5px",
                        width: "18%",
                        background: "#f0f5f2",
                      }}
                    >
                      Date
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {filteredExpenses.map((item, index) => (

                    <tr key={item.id}>

                      <td
                        style={{
                          border: "1px solid #555",
                          padding: "7px 5px",
                          textAlign: "center",
                          verticalAlign: "middle",
                          wordBreak: "break-word",
                        }}
                      >
                        {index + 1}
                      </td>

                      <td
                        style={{
                          border: "1px solid #555",
                          padding: "7px 5px",
                          verticalAlign: "middle",
                          wordBreak: "break-word",
                        }}
                      >
                        {item.title}
                      </td>

                      <td
                        style={{
                          border: "1px solid #555",
                          padding: "7px 5px",
                          textAlign: "center",
                          verticalAlign: "middle",
                          wordBreak: "break-word",
                        }}
                      >
                        {item.category}
                      </td>

                      <td
                        style={{
                          border: "1px solid #555",
                          padding: "7px 5px",
                          textAlign: "right",
                          verticalAlign: "middle",
                          whiteSpace: "nowrap",
                        }}
                      >
                        ৳ {item.amount}
                      </td>

                      <td
                        style={{
                          border: "1px solid #555",
                          padding: "7px 5px",
                          textAlign: "center",
                          verticalAlign: "middle",
                          wordBreak: "break-word",
                        }}
                      >
                        {item.paymentMethod}
                      </td>

                      <td
                        style={{
                          border: "1px solid #555",
                          padding: "7px 5px",
                          textAlign: "center",
                          verticalAlign: "middle",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.expenseDate}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>


              {/* TOTAL */}

              <div
                style={{
                  marginTop: "6mm",
                  textAlign: "right",
                  fontSize: "16px",
                  fontWeight: 800,
                }}
              >
                Total Expense : ৳ {totalExpense}
              </div>


              {/* SIGNATURE AREA */}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  marginTop: "12mm",
                  minHeight: "35mm",
                }}
              >

                {/* SEAL */}

                <div
                  style={{
                    width: "50%",
                    paddingLeft: "10px",
                  }}
                >
                  <img
                    src="/roundseal.png"
                    alt="Official Seal"
                    style={{
                      width: "90px",
                      height: "90px",
                      objectFit: "contain",
                    }}
                  />
                </div>


                {/* SIGNATURE */}

                <div
                  style={{
                    width: "50%",
                    textAlign: "center",
                    fontSize: "13px",
                  }}
                >

                  <div
                    style={{
                      width: "180px",
                      margin: "0 auto 5px",
                      borderTop: "1px solid #222",
                    }}
                  />

                  <strong>
                    Suman Roy
                  </strong>

                  <div>
                    Treasurer
                  </div>

                  <div>
                    Badokhali Youth Foundation
                  </div>

                </div>

              </div>

            </div>


            {/* ================= FOOTER ================= */}

            <div
              style={{
                position: "relative",
                zIndex: 2,
                padding: "3mm 15mm 0",
                background: "#ffffff",
              }}
            >

              {/* ELECTRONIC NOTICE */}

              <div
                style={{
                  borderTop: "1px solid #d5d5d5",
                  paddingTop: "8px",
                  textAlign: "center",
                  fontSize: "10px",
                  color: "#888",
                }}
              >
                “This is electronically generated. No signature is required.”
              </div>


              {/* FOOTER INFORMATION */}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "8mm",
                  marginTop: "4mm",
                }}
              >

                {/* PHONE */}

                <div
                  style={{
                    display: "flex",
                    gap: "5px",
                    fontSize: "9.5px",
                    lineHeight: 1.5,
                  }}
                >

                  <span style={{ fontSize: "14px" }}>
                    ☎
                  </span>

                  <div>
                    <div>+8801738126875</div>
                    <div>+8801714597343</div>
                  </div>

                </div>


                {/* ADDRESS */}

                <div
                  style={{
                    display: "flex",
                    gap: "5px",
                    fontSize: "9.5px",
                    lineHeight: 1.5,
                  }}
                >

                  <span style={{ fontSize: "14px" }}>
                    📍
                  </span>

                  <div>
                    Badokhali, Mograhat-9300,
                    <br />
                    Bagerhat
                  </div>

                </div>


                {/* EMAIL */}

                <div
                  style={{
                    display: "flex",
                    gap: "5px",
                    fontSize: "9.5px",
                    lineHeight: 1.5,
                  }}
                >

                  <span style={{ fontSize: "14px" }}>
                    ✉
                  </span>

                  <div>
                    badokhaliyouthfoundation@gmail.com
                    <br />
                    youtube.com/@badokhaliyyouthfoundation
                  </div>

                </div>


                {/* QR */}

                <div>
                  <img
                    src="/qr-code.jpeg"
                    alt="QR Code"
                    style={{
                      width: "20mm",
                      height: "20mm",
                      objectFit: "contain",
                    }}
                  />
                </div>

              </div>


              {/* FOOTER DESIGN */}

              <div
                style={{
                  height: "12mm",
                  marginTop: "4mm",
                  position: "relative",
                  overflow: "hidden",
                }}
              >

                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: "35%",
                    height: "4px",
                    background: "#292929",
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    left: "27%",
                    right: "27%",
                    top: 0,
                    bottom: 0,
                    background: "#08aeea",
                    clipPath:
                      "polygon(13% 0, 87% 0, 74% 100%, 26% 100%)",
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: 0,
                    width: "28%",
                    height: "4px",
                    background: "#292929",
                  }}
                />

              </div>

            </div>

          </div>

        </div>


        {/* ================= MODAL FOOTER ================= */}

        <div className="modal-footer">

          <button
            className="btn btn-success"
            onClick={downloadExpenseReport}
          >
            📥 Download Report
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
                        <button
                          className="btn btn-sm btn-primary me-2"
                          onClick={() => {
                            setEditId(item.id);
                            setTitle(item.title);
                            setCategory(item.category);
                            setAmount(item.amount);
                            setPaymentMethod(item.paymentMethod);
                            setExpenseDate(item.expenseDate);
                            setRemarks(item.remarks);
                          }}
                        >
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
