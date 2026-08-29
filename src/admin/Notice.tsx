import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import AdminLayout from "./AdminLayout";
import { db } from "../firebase/firebase";

import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

interface Notice {
  id: string;
  title: string;
  description: string;
  publishDate: string;
  priority: string;
  status: string;
}

const Notice = () => {
  const [notices, setNotices] = useState<Notice[]>([]);

  // Add Form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [publishDate, setPublishDate] = useState("");
  const [priority, setPriority] = useState("");
  const [status, setStatus] = useState("Published");

  // Filter
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Edit
  const [showEditModal, setShowEditModal] = useState(false);
  const [editId, setEditId] = useState("");

  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPublishDate, setEditPublishDate] = useState("");
  const [editPriority, setEditPriority] = useState("");
  const [editStatus, setEditStatus] = useState("Published");

  // View Report
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  const reportRef = useRef<HTMLDivElement>(null);

  // ================= FETCH =================

  const fetchNotices = async () => {
    const snapshot = await getDocs(collection(db, "notices"));

    const data: Notice[] = [];

    snapshot.forEach((item) => {
      data.push({
        id: item.id,
        ...(item.data() as Omit<Notice, "id">),
      });
    });

    setNotices(data);
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  // ================= ADD =================

  const addNotice = async () => {
    if (!title || !description || !publishDate) {
      alert("Please fill all required fields");
      return;
    }

    await addDoc(collection(db, "notices"), {
      title,
      description,
      publishDate,
      priority,
      status,
      createdAt: new Date(),
    });

    alert("Notice Added Successfully");

    setTitle("");
    setDescription("");
    setPublishDate("");
    setPriority("");
    setStatus("Published");

    fetchNotices();
  };

  const toBanglaDate = (date: string) => {
    if (!date) return "—";

    const months = [
      "জানুয়ারি",
      "ফেব্রুয়ারি",
      "মার্চ",
      "এপ্রিল",
      "মে",
      "জুন",
      "জুলাই",
      "আগস্ট",
      "সেপ্টেম্বর",
      "অক্টোবর",
      "নভেম্বর",
      "ডিসেম্বর",
    ];

    const [year, month, day] = date.split("-");

    const banglaNumber = (value: string) =>
      value.replace(
        /\d/g,
        (digit) => "০১২৩৪৫৬৭৮৯"[Number(digit)]
      );

    return `${banglaNumber(day)} ${months[Number(month) - 1]} ${banglaNumber(year)}`;
  };

  // ================= DELETE =================

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("Delete this notice?");

    if (!confirmDelete) return;

    await deleteDoc(doc(db, "notices", id));

    fetchNotices();
  };

  // ================= EDIT =================

  const handleEdit = (notice: Notice) => {
    setEditId(notice.id);
    setEditTitle(notice.title);
    setEditDescription(notice.description);
    setEditPublishDate(notice.publishDate);
    setEditPriority(notice.priority);
    setEditStatus(notice.status);

    setShowEditModal(true);
  };

  const updateNotice = async () => {
    if (!editTitle || !editDescription || !editPublishDate) {
      alert("Please fill all fields");
      return;
    }

    await updateDoc(doc(db, "notices", editId), {
      title: editTitle,
      description: editDescription,
      publishDate: editPublishDate,
      priority: editPriority,
      status: editStatus,
    });

    alert("Notice Updated Successfully");

    setShowEditModal(false);

    fetchNotices();
  };

  // ================= VIEW =================

  const handleView = (notice: Notice) => {
    setSelectedNotice(notice);
    setShowViewModal(true);
  };

  // ================= DOWNLOAD REPORT =================

  const downloadReport = async () => {
    if (!reportRef.current || !selectedNotice) return;

    const canvas = await html2canvas(reportRef.current, {
      scale: 3,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const image = canvas.toDataURL("image/png");

    const link = document.createElement("a");

    link.href = image;

    link.download = `Notice-${selectedNotice.publishDate || "Report"}.png`;

    link.click();
  };

  // ================= FILTER =================

  const filteredNotices = notices.filter((item) => {
    return (
      item.title.toLowerCase().includes(search.toLowerCase()) &&
      (filterStatus === "" || item.status === filterStatus)
    );
  });

  return (
    <AdminLayout>
      {/* =====================================================
          EDIT MODAL
      ===================================================== */}

      {showEditModal && (
        <div
          className="modal fade show d-block"
          style={{
            backgroundColor: "rgba(0,0,0,.5)",
            zIndex: 1055,
          }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Edit Notice</h5>

                <button
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                />
              </div>

              <div className="modal-body">
                <input
                  className="form-control mb-3"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Notice Title"
                />

                <div
                  contentEditable
                  suppressContentEditableWarning
                  dangerouslySetInnerHTML={{
                    __html: editDescription,
                  }}
                  onInput={(e) => {
                    setEditDescription(e.currentTarget.innerHTML);
                  }}
                  onPaste={(e) => {
                    e.preventDefault();

                    const html =
                      e.clipboardData.getData("text/html");

                    const text =
                      e.clipboardData.getData("text/plain");

                    if (html) {
                      document.execCommand(
                        "insertHTML",
                        false,
                        html
                      );
                    } else {
                      document.execCommand(
                        "insertText",
                        false,
                        text
                      );
                    }

                    setTimeout(() => {
                      setEditDescription(
                        e.currentTarget.innerHTML
                      );
                    }, 0);
                  }}
                  style={{
                    minHeight: "250px",
                    border: "1px solid #ced4da",
                    borderRadius: "6px",
                    padding: "12px",
                    background: "#fff",
                    outline: "none",
                    overflowY: "auto",
                  }}
                />

                <input
                  type="date"
                  className="form-control mb-3 mt-3"
                  value={editPublishDate}
                  onChange={(e) =>
                    setEditPublishDate(e.target.value)
                  }
                />

                <input
                  type="text"
                  className="form-control mb-3"
                  placeholder="Sarok No"
                  value={editPriority}
                  onChange={(e) =>
                    setEditPriority(e.target.value)
                  }
                />

                <select
                  className="form-select"
                  value={editStatus}
                  onChange={(e) =>
                    setEditStatus(e.target.value)
                  }
                >
                  <option>Published</option>
                  <option>Draft</option>
                </select>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>

                <button
                  className="btn btn-success"
                  onClick={updateNotice}
                >
                  Update Notice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          NOTICE REPORT MODAL
      ===================================================== */}

      {showViewModal && selectedNotice && (
        <div
          className="modal fade show d-block"
          style={{
            backgroundColor: "rgba(0,0,0,0.65)",
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
                  📢 Notice Report
                </h5>

                <button
                  className="btn-close"
                  onClick={() => setShowViewModal(false)}
                />
              </div>

              {/* REPORT AREA */}

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
                    minHeight: "297mm",
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
                  {/* =================================================
                      HEADER
                  ================================================= */}

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

                      {/* ORGANIZATION */}

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
                            fontFamily:
                              "Arial, sans-serif",
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

                  {/* =================================================
                      WATERMARK
                  ================================================= */}

                  <img
                    src="/logo.png"
                    alt=""
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform:
                        "translate(-50%, -50%)",
                      width: "105mm",
                      height: "105mm",
                      objectFit: "contain",
                      opacity: 0.045,
                      pointerEvents: "none",
                      zIndex: 0,
                    }}
                  />

                  {/* =================================================
                      CONTENT
                  ================================================= */}

                  <div
                    style={{
                      position: "relative",
                      zIndex: 2,
                      padding: "8mm 15mm 5mm",
                    }}
                  >




                    {/* TITLE */}



                    {/* NOTICE INFO */}

                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        fontSize: "13px",
                        marginBottom: "8mm",
                      }}
                    >

                      <div>
                        <strong>স্মারক নং:</strong>{" "}
                        {selectedNotice.priority
                          ? selectedNotice.priority
                            .split("-")
                            .map((part) =>
                              part.replace(/\d/g, (digit) => "০১২৩৪৫৬৭৮৯"[Number(digit)])
                            )
                            .join("-")
                          : "—"}
                      </div>

                      <div>
                        <strong>তারিখ:</strong>{" "}
                        {toBanglaDate(selectedNotice.publishDate)}
                      </div>

                    </div>

                    {/* NOTICE TITLE */}

                    <h3
                      style={{
                        textAlign: "center",
                        fontSize: "22px",
                        fontWeight: 800,
                        margin: "0 0 8mm",
                        lineHeight: 1.5,
                      }}
                    >
                      {selectedNotice.title}
                    </h3>

                    {/* DESCRIPTION */}

                    <div
                      className="notice-content"
                      dangerouslySetInnerHTML={{
                        __html:
                          selectedNotice.description,
                      }}
                      style={{
                        fontSize: "15px",
                        lineHeight: 1.9,
                        textAlign: "justify",
                        minHeight: "80mm",
                      }}
                    />

                    {/* =================================================
                        SEAL + SIGNATURE
                    ================================================= */}

                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems: "flex-end",
                        marginTop: "15mm",
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
                          alt="Office Seal"
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
                          lineHeight: 1.7,
                        }}
                      >
                        <div
                          style={{
                            width: "180px",
                            margin:
                              "0 auto 5px",
                            borderTop:
                              "1px solid #222",
                          }}
                        />

                        <strong>
                          সুদীপ কুমার হালদার
                        </strong>

                        <div>সভাপতি</div>

                        <div>
                          বাদোখালী ইয়ুথ ফাউন্ডেশন
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* =================================================
                      FOOTER
                  ================================================= */}

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
                        borderTop:
                          "1px solid #d5d5d5",
                        paddingTop: "8px",
                        textAlign: "center",
                        fontSize: "10px",
                        color: "#888",
                      }}
                    >
                      “This is electronically
                      generated. No signature is
                      required.”
                    </div>

                    {/* FOOTER INFORMATION */}

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent:
                          "space-between",
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
                        <span
                          style={{
                            fontSize: "14px",
                          }}
                        >
                          ☎
                        </span>

                        <div>
                          <div>
                            +8801738126875
                          </div>
                          <div>
                            +8801714597343
                          </div>
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
                        <span
                          style={{
                            fontSize: "14px",
                          }}
                        >
                          📍
                        </span>

                        <div>
                          Badokhali,
                          Mograhat-9300,
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
                        <span
                          style={{
                            fontSize: "14px",
                          }}
                        >
                          ✉
                        </span>

                        <div>
                          badokhaliyouthfoundation
                          @gmail.com
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

              {/* MODAL FOOTER */}

              <div className="modal-footer">
                <button
                  className="btn btn-success"
                  onClick={downloadReport}
                >
                  📥 Download Report
                </button>

                <button
                  className="btn btn-secondary"
                  onClick={() =>
                    setShowViewModal(false)
                  }
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          MAIN PAGE
      ===================================================== */}

      <div className="container-fluid p-4">
        <h3 className="mb-4">
          📢 Notice Management
        </h3>

        {/* ADD NOTICE */}

        <div className="card shadow-sm p-4 mb-4">
          <h5 className="mb-3">
            Add New Notice
          </h5>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label>Notice Title</label>

              <input
                type="text"
                className="form-control"
                placeholder="Enter Notice Title"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
              />
            </div>

            <div className="col-md-3 mb-3">
              <label>Publish Date</label>

              <input
                type="date"
                className="form-control"
                value={publishDate}
                onChange={(e) =>
                  setPublishDate(e.target.value)
                }
              />
            </div>

            <div className="col-md-3 mb-3">
              <label>Sarok No</label>

              <input
                type="text"
                className="form-control"
                placeholder="Enter Sarok No"
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value)
                }
              />
            </div>

            <div className="col-12 mb-3">
              <label>Description</label>

              <div
                contentEditable
                suppressContentEditableWarning
                onInput={(e) => {
                  setDescription(
                    e.currentTarget.innerHTML
                  );
                }}
                onPaste={(e) => {
                  e.preventDefault();

                  const html =
                    e.clipboardData.getData(
                      "text/html"
                    );

                  const text =
                    e.clipboardData.getData(
                      "text/plain"
                    );

                  if (html) {
                    document.execCommand(
                      "insertHTML",
                      false,
                      html
                    );
                  } else {
                    document.execCommand(
                      "insertText",
                      false,
                      text
                    );
                  }

                  setTimeout(() => {
                    setDescription(
                      e.currentTarget.innerHTML
                    );
                  }, 0);
                }}
                style={{
                  minHeight: "250px",
                  border:
                    "1px solid #ced4da",
                  borderRadius: "6px",
                  padding: "12px",
                  background: "#fff",
                  outline: "none",
                  overflowY: "auto",
                }}
              />
            </div>

            <div className="col-md-3 mb-3">
              <label>Status</label>

              <select
                className="form-select"
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value)
                }
              >
                <option>Published</option>
                <option>Draft</option>
              </select>
            </div>

            <div className="col-md-3 d-flex align-items-end">
              <button
                className="btn btn-success w-100"
                onClick={addNotice}
              >
                ➕ Add Notice
              </button>
            </div>
          </div>
        </div>

        {/* FILTER */}

        <div className="card shadow-sm p-3 mb-4">
          <h5 className="mb-3">
            🔍 Search & Filter
          </h5>

          <div className="row">
            <div className="col-md-4">
              <label>Search</label>

              <input
                type="text"
                className="form-control"
                placeholder="Search by title..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />
            </div>

            <div className="col-md-4">
              <label>Status</label>

              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) =>
                  setFilterStatus(e.target.value)
                }
              >
                <option value="">
                  All Status
                </option>
                <option>Published</option>
                <option>Draft</option>
              </select>
            </div>
          </div>
        </div>

        {/* HISTORY */}

        <div className="card shadow-sm">
          <div className="card-header bg-dark text-white">
            <h5 className="mb-0">
              📋 Notice History
            </h5>
          </div>

          <div className="table-responsive">
            <table className="table table-bordered table-hover mb-0">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Publish Date</th>
                  <th>Sarok No</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredNotices.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center"
                    >
                      No Notice Found
                    </td>
                  </tr>
                ) : (
                  filteredNotices.map(
                    (item, index) => (
                      <tr key={item.id}>
                        <td>{index + 1}</td>

                        <td>{item.title}</td>

                        <td>
                          {item.publishDate}
                        </td>

                        <td>
                          {item.priority}
                        </td>

                        <td>
                          <span
                            className={`badge ${item.status ===
                                "Published"
                                ? "bg-success"
                                : "bg-secondary"
                              }`}
                          >
                            {item.status}
                          </span>
                        </td>

                        <td>
                          <button
                            className="btn btn-sm btn-info me-2 text-white"
                            onClick={() =>
                              handleView(item)
                            }
                          >
                            👁 View
                          </button>

                          <button
                            className="btn btn-sm btn-primary me-2"
                            onClick={() =>
                              handleEdit(item)
                            }
                          >
                            Edit
                          </button>

                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() =>
                              handleDelete(item.id)
                            }
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Notice;