import { useEffect, useState } from "react";
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
  const [priority, setPriority] = useState("Normal");
  const [status, setStatus] = useState("Published");

  // Filter

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  // Edit Notice

  const [showEditModal, setShowEditModal] = useState(false);
  const [editId, setEditId] = useState("");

  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPublishDate, setEditPublishDate] = useState("");
  const [editPriority, setEditPriority] = useState("Normal");
  const [editStatus, setEditStatus] = useState("Published");

  // View Notice

  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  // Fetch Notices

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

  // Add Notice

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
    setPriority("Normal");
    setStatus("Published");

    fetchNotices();
  };

  // Delete Notice

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("Delete this notice?");

    if (!confirmDelete) return;

    await deleteDoc(doc(db, "notices", id));

    fetchNotices();
  };

  const handleEdit = (notice: Notice) => {
    setEditId(notice.id);
    setEditTitle(notice.title);
    setEditDescription(notice.description);
    setEditPublishDate(notice.publishDate);
    setEditPriority(notice.priority);
    setEditStatus(notice.status);

    setShowEditModal(true);
  };

  const handleView = (notice: Notice) => {
    setSelectedNotice(notice);
    setShowViewModal(true);
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

  // Filter 

  const filteredNotices = notices.filter((item) => {
    return (
      item.title.toLowerCase().includes(search.toLowerCase()) &&
    
      (filterStatus === "" || item.status === filterStatus)
    );
  });

  return (
    <AdminLayout>
      {showEditModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,.5)" }}
        >
          <div className="modal-dialog">
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

                <textarea
                  className="form-control mb-3"
                  rows={4}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />

                <input
                  type="date"
                  className="form-control mb-3"
                  value={editPublishDate}
                  onChange={(e) => setEditPublishDate(e.target.value)}
                />

                <input
                  type="text"
                  className="form-control mb-3"
                  placeholder="sarok No"
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value)}
                />

                <select
                  className="form-select"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
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

                <button className="btn btn-success" onClick={updateNotice}>
                  Update Notice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showViewModal && selectedNotice && (
        <div
          className="modal fade show d-block"
          style={{
            backgroundColor: "rgba(0,0,0,.5)",
          }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5>📢 Notice Details</h5>

                <button
                  className="btn-close btn-close-white"
                  onClick={() => setShowViewModal(false)}
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
                    opacity: 0.1,
                    filter: "grayscale(100%)",
                    zIndex: 0,
                    pointerEvents: "none",
                  }}
                />

                <div style={{ position: "relative", zIndex: 1 }}>
                  {/* Header */}
                  <div className="text-center mb-4">
                    <img src="/logo.png" alt="Logo" width="80" />

                    <h3 className="fw-bold mt-2">বাদোখালী ইয়ুথ ফাউন্ডেশন</h3>

                    <p className="mb-1">বাদোখালী, মগরাহাট,বাগেরহাট</p>

                    <hr />
                  </div>

                  {/* Notice Table */}

                  {selectedNotice && (
                    <>
                      <h3 className="text-center fw-bold">
                        {selectedNotice.title}
                      </h3>
                      <p className="mt-4">
                        <strong>তারিখ:</strong> {selectedNotice.publishDate}
                      </p>

                      <p className="mt-4">
                        <strong>সারক নং:</strong> {selectedNotice.priority}
                      </p>

                      <div
                        style={{
                          whiteSpace: "pre-wrap",
                          fontSize: "14px",
                          lineHeight: "1.8",
                        }}
                      >
                        {selectedNotice.description}
                      </div>
                    </>
                  )}

                  {/* Seal & Signature */}
                  <div className="row mt-5">
                    <div className="col-md-6 text-start">
                      <img
                        src="/roundseal.png"
                        alt="Seal"
                        width="120"
                        height="120"
                        style={{ objectFit: "contain" }}
                      />
                    </div>

                    <div className="col-md-6 text-end">
                      <br />
                      <br />
                      <br />
                                স্বাক্ষরিত    
                      <br />
                      <strong>সুদীপ কুমার হালদার</strong>
                      <br />
                      সভাপতি
                      <br />
                      বাদোখালী ইয়ুথ ফাউন্ডেশন
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowViewModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="container-fluid p-4">
        <h3 className="mb-4">📢 Notice Management</h3>

        {/* Add Notice */}

        <div className="card shadow-sm p-4 mb-4">
          <h5 className="mb-3">Add New Notice</h5>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label>Notice Title</label>

              <input
                type="text"
                className="form-control"
                placeholder="Enter Notice Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="col-md-3 mb-3">
              <label>Publish Date</label>

              <input
                type="date"
                className="form-control"
                value={publishDate}
                onChange={(e) => setPublishDate(e.target.value)}
              />
            </div>

            <div className="col-md-3 mb-3">
              <label>Sarok No</label>

              <input
                type="text"
                className="form-control"
                placeholder="Enter Sarok No"
                
                onChange={(e) => setPriority(e.target.value)}
              />
            </div>

            <div className="col-12 mb-3">
              <label>Description</label>

              <textarea
                className="form-control"
                rows={4}
                placeholder="Write Notice..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="col-md-3 mb-3">
              <label>Status</label>

              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option>Published</option>
                <option>Draft</option>
              </select>
            </div>

            <div className="col-md-3 d-flex align-items-end">
              <button className="btn btn-success w-100" onClick={addNotice}>
                ➕ Add Notice
              </button>
            </div>
          </div>
        </div>
        {/* Filter */}

        <div className="card shadow-sm p-3 mb-4">
          <h5 className="mb-3">🔍 Search & Filter</h5>

          <div className="row">
            <div className="col-md-4">
              <label>Search</label>

              <input
                type="text"
                className="form-control"
                placeholder="Search by title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="col-md-4">
              <label>Status</label>

              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All Status</option>
                <option>Published</option>
                <option>Draft</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notice History */}

        <div className="card shadow-sm">
          <div className="card-header bg-dark text-white">
            <h5 className="mb-0">📋 Notice History</h5>
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
                    <td colSpan={6} className="text-center">
                      No Notice Found
                    </td>
                  </tr>
                ) : (
                  filteredNotices.map((item, index) => (
                    <tr key={item.id}>
                      <td>{index + 1}</td>

                      <td>{item.title}</td>

                      <td>{item.publishDate}</td>

                      <td>
                        <span
                          className={`badge ${
                            item.priority === "Urgent"
                              ? "bg-danger"
                              : item.priority === "Important"
                                ? "bg-warning text-dark"
                                : "bg-primary"
                          }`}
                        >
                          {item.priority}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`badge ${
                            item.status === "Published"
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
                          onClick={() => handleView(item)}
                        >
                          👁 View
                        </button>

                        <button
                          className="btn btn-sm btn-primary me-2"
                          onClick={() => handleEdit(item)}
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

export default Notice;
