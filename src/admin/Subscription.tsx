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
                <option>2028</option>
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

      
{/* ================= SUBSCRIPTION REPORT MODAL ================= */}

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
            💰 Subscription Report
          </h5>

          <button
            className="btn-close"
            onClick={() => setShowReport(false)}
          />

        </div>


        {/* ================= REPORT VIEW ================= */}

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
              position: "relative",
              overflow: "hidden",
              fontFamily:
                '"Noto Sans Bengali", "Noto Sans", sans-serif',
              boxShadow:
                "0 0 15px rgba(0,0,0,0.15)",
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

              {/* REPORT META */}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "13px",
                  marginBottom: "5mm",
                }}
              >

                <div>
                  <strong>রিপোর্ট:</strong>{" "}
                  Subscription Collection
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
                Monthly Subscription Report
              </h2>


              {/* FILTER INFORMATION */}

              {(filterMonth || filterYear || filterMember) && (
                <div
                  style={{
                    textAlign: "center",
                    fontSize: "12px",
                    marginBottom: "5mm",
                    color: "#555",
                  }}
                >

                  {filterMonth && (
                    <span>
                      Month: <strong>{filterMonth}</strong>
                    </span>
                  )}

                  {filterYear && (
                    <span style={{ marginLeft: "15px" }}>
                      Year: <strong>{filterYear}</strong>
                    </span>
                  )}

                  {filterMember && (
                    <span style={{ marginLeft: "15px" }}>
                      Member:{" "}
                      <strong>
                        {
                          members.find(
                            (member) =>
                              member.id === filterMember
                          )?.name
                        }
                      </strong>
                    </span>
                  )}

                </div>
              )}


              {/* ================= TABLE ================= */}

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
                        textAlign: "center",
                      }}
                    >
                      #
                    </th>

                    <th
                      style={{
                        border: "1px solid #555",
                        padding: "8px 5px",
                        width: "30%",
                        background: "#f0f5f2",
                      }}
                    >
                      Name
                    </th>

                    <th
                      style={{
                        border: "1px solid #555",
                        padding: "8px 5px",
                        width: "25%",
                        background: "#f0f5f2",
                      }}
                    >
                      Designation
                    </th>

                    <th
                      style={{
                        border: "1px solid #555",
                        padding: "8px 5px",
                        width: "18%",
                        background: "#f0f5f2",
                        textAlign: "center",
                      }}
                    >
                      Month
                    </th>

                    <th
                      style={{
                        border: "1px solid #555",
                        padding: "8px 5px",
                        width: "20%",
                        background: "#f0f5f2",
                        textAlign: "right",
                      }}
                    >
                      Amount
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {filteredSubscriptions.length === 0 ? (

                    <tr>

                      <td
                        colSpan={5}
                        style={{
                          border: "1px solid #555",
                          padding: "15px",
                          textAlign: "center",
                        }}
                      >
                        No Subscription Found
                      </td>

                    </tr>

                  ) : (

                    filteredSubscriptions.map(
                      (item, index) => (

                        <tr key={item.id}>

                          <td
                            style={{
                              border: "1px solid #555",
                              padding: "7px 5px",
                              textAlign: "center",
                              verticalAlign: "middle",
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
                            {item.name}
                          </td>

                          <td
                            style={{
                              border: "1px solid #555",
                              padding: "7px 5px",
                              verticalAlign: "middle",
                              wordBreak: "break-word",
                            }}
                          >
                            {item.designation}
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
                            {item.month}-{item.year}
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

                        </tr>

                      )
                    )

                  )}

                </tbody>

              </table>


              {/* ================= TOTAL ================= */}

              <div
                style={{
                  marginTop: "6mm",
                  textAlign: "right",
                  fontSize: "16px",
                  fontWeight: 800,
                }}
              >
                Total Collection : ৳{" "}
                {totalSubscription}
              </div>


              {/* ================= SIGNATURE ================= */}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  marginTop: "12mm",
                  minHeight: "35mm",
                }}
              >

                {/* SEAL + RECEIVED */}

                <div
                  style={{
                    width: "50%",
                    paddingLeft: "10px",
                    position: "relative",
                  }}
                >

                  <img
                    src="/roundseal.png"
                    alt="Office Seal"
                    style={{
                      width: "90px",
                      height: "90px",
                      objectFit: "contain",
                    }}
                  />

                  <div
                    style={{
                      border: "2px solid #0b6ff3",
                      padding: "7px 16px",
                      display: "inline-block",
                      fontSize: "17px",
                      fontWeight: "bold",
                      letterSpacing: "1.5px",
                      color: "#0b6ff3",
                      fontFamily: "Arial, sans-serif",
                      transform: "rotate(-6deg)",
                      opacity: 0.8,
                      borderRadius: "2px",
                      textTransform: "uppercase",
                      marginLeft: "10px",
                    }}
                  >
                    RECEIVED
                  </div>

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
            onClick={downloadReport}
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
