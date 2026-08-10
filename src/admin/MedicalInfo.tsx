import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { db } from "../firebase/firebase";
import AdminLayout from "./AdminLayout";

import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

interface MedicalInfo {
  id: string;
  name: string;
  phone?: string;
  photo?: string;
  bloodGroup: string;
  weight?: string;
  height?: string;
  bloodPressure?: string;
  oxygen?: string;
  pulse?: string;
  note?: string;
  createdAt?: any;
}

// ===============================
// CLOUDINARY CONFIG
// ===============================

const CLOUDINARY_CLOUD_NAME = "dvpfixfd";
const CLOUDINARY_UPLOAD_PRESET = "badokhali_youth_foundation";

const MedicalInfo = () => {
  const [medicalInfos, setMedicalInfos] = useState<MedicalInfo[]>([]);

  // ===============================
  // FORM
  // ===============================

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [photo, setPhoto] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [bloodPressure, setBloodPressure] = useState("");
  const [oxygen, setOxygen] = useState("");
  const [pulse, setPulse] = useState("");
  const [note, setNote] = useState("");

  // Selected photo
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  // Upload loading
  const [uploading, setUploading] = useState(false);

  // Edit mode
  const [editingId, setEditingId] = useState<string | null>(null);

  // ===============================
  // FILTER
  // ===============================

  const [filterBloodGroup, setFilterBloodGroup] = useState("");
  const [search, setSearch] = useState("");

  // ===============================
  // PAGINATION
  // ===============================

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // ===============================
  // REPORT
  // ===============================

  const [showReport, setShowReport] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  // ===============================
  // FETCH
  // ===============================

  const fetchMedicalInfos = async () => {
    try {
      const q = query(
        collection(db, "medicalInfo"),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);

      const data: MedicalInfo[] = [];

      snapshot.forEach((item) => {
        data.push({
          id: item.id,
          ...(item.data() as Omit<MedicalInfo, "id">),
        });
      });

      setMedicalInfos(data);
    } catch (error) {
      console.error(
        "Error fetching medical information:",
        error
      );
    }
  };

  useEffect(() => {
    fetchMedicalInfos();
  }, []);

  // ===============================
  // UPLOAD PHOTO TO CLOUDINARY
  // ===============================

  const uploadPhoto = async (file: File) => {
  try {
    setUploading(true);

    const formData = new FormData();

    formData.append("file", file);
    formData.append(
      "upload_preset",
      CLOUDINARY_UPLOAD_PRESET
    );

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Cloudinary Error:", data);

      throw new Error(
        data?.error?.message || "Photo upload failed"
      );
    }

    return data.secure_url;

  } catch (error) {
    console.error("Cloudinary upload error:", error);

    alert("Photo upload failed");

    return "";
  } finally {
    setUploading(false);
  }
};

  // ===============================
  // PHOTO SELECT
  // ===============================

  const handlePhotoChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Maximum 5 MB
    if (file.size > 5 * 1024 * 1024) {
      alert("Photo size must be less than 5MB");
      return;
    }

    // Only image
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    setPhotoFile(file);
  };

  // ===============================
  // RESET FORM
  // ===============================

  const resetForm = () => {
    setName("");
    setPhone("");
    setPhoto("");
    setBloodGroup("");
    setWeight("");
    setHeight("");
    setBloodPressure("");
    setOxygen("");
    setPulse("");
    setNote("");
    setPhotoFile(null);
    setEditingId(null);
  };

  // ===============================
  // ADD / UPDATE
  // ===============================

  const saveMedicalInfo = async () => {
    if (!name.trim()) {
      alert("Name is required");
      return;
    }

    if (!bloodGroup) {
      alert("Blood Group is required");
      return;
    }

    try {
      let photoUrl = photo;

      // Upload new photo if selected
      if (photoFile) {
        const uploadedUrl = await uploadPhoto(photoFile);

        if (!uploadedUrl) {
          return;
        }

        photoUrl = uploadedUrl;
      }

      // ===============================
      // UPDATE
      // ===============================

      if (editingId) {
        await updateDoc(
          doc(db, "medicalInfo", editingId),
          {
            name: name.trim(),
            phone: phone.trim(),
            photo: photoUrl,
            bloodGroup,
            weight: weight.trim(),
            height: height.trim(),
            bloodPressure: bloodPressure.trim(),
            oxygen: oxygen.trim(),
            pulse: pulse.trim(),
            note: note.trim(),
            updatedAt: serverTimestamp(),
          }
        );

        alert(
          "Medical Information Updated Successfully"
        );
      }

      // ===============================
      // ADD
      // ===============================

      else {
        await addDoc(
          collection(db, "medicalInfo"),
          {
            name: name.trim(),
            phone: phone.trim(),
            photo: photoUrl,
            bloodGroup,
            weight: weight.trim(),
            height: height.trim(),
            bloodPressure: bloodPressure.trim(),
            oxygen: oxygen.trim(),
            pulse: pulse.trim(),
            note: note.trim(),
            createdAt: serverTimestamp(),
          }
        );

        alert(
          "Medical Information Added Successfully"
        );
      }

      resetForm();

      await fetchMedicalInfos();
    } catch (error) {
      console.error(error);

      alert(
        editingId
          ? "Failed to update medical information"
          : "Failed to add medical information"
      );
    }
  };

  // ===============================
  // EDIT
  // ===============================

  const handleEdit = (item: MedicalInfo) => {
    setEditingId(item.id);

    setName(item.name || "");
    setPhone(item.phone || "");
    setPhoto(item.photo || "");
    setBloodGroup(item.bloodGroup || "");
    setWeight(item.weight || "");
    setHeight(item.height || "");
    setBloodPressure(item.bloodPressure || "");
    setOxygen(item.oxygen || "");
    setPulse(item.pulse || "");
    setNote(item.note || "");

    setPhotoFile(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ===============================
  // DELETE
  // ===============================

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(
      "Delete this medical information?"
    );

    if (!confirmDelete) return;

    try {
      await deleteDoc(
        doc(db, "medicalInfo", id)
      );

      alert("Deleted Successfully");

      await fetchMedicalInfos();
    } catch (error) {
      console.error(error);

      alert("Failed to delete");
    }
  };

  // ===============================
  // FILTER
  // ===============================

  const filteredMedicalInfos =
    medicalInfos.filter((item) => {
      const searchText = search.toLowerCase();

      const matchSearch =
        item.name
          .toLowerCase()
          .includes(searchText) ||
        (item.phone || "")
          .toLowerCase()
          .includes(searchText);

      const matchBloodGroup =
        filterBloodGroup === "" ||
        item.bloodGroup === filterBloodGroup;

      return (
        matchSearch &&
        matchBloodGroup
      );
    });

  // ===============================
  // PAGINATION
  // ===============================

  const indexOfLastItem =
    currentPage * itemsPerPage;

  const indexOfFirstItem =
    indexOfLastItem - itemsPerPage;

  const currentMedicalInfos =
    filteredMedicalInfos.slice(
      indexOfFirstItem,
      indexOfLastItem
    );

  const totalPages = Math.ceil(
    filteredMedicalInfos.length /
      itemsPerPage
  );

  // ===============================
  // DOWNLOAD REPORT
  // ===============================

  const downloadReport = async () => {
    if (!reportRef.current) return;

    const canvas = await html2canvas(
      reportRef.current,
      {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff",
      }
    );

    const image =
      canvas.toDataURL("image/png");

    const link =
      document.createElement("a");

    link.href = image;

    link.download = `Medical-Report-${
      filterBloodGroup || "All"
    }.png`;

    link.click();
  };

  // ===============================
  // RETURN
  // ===============================

  return (
    <AdminLayout>

      <div className="container-fluid p-4">

        <h3 className="mb-4">
          🩺 Medical Information
        </h3>

        {/* ===============================
            ADD / EDIT FORM
        =============================== */}

        <div className="card shadow-sm p-3 mb-4">

          <h5 className="mb-3">

            {editingId
              ? "✏️ Edit Medical Information"
              : "➕ Add Medical Information"}

          </h5>

          <div className="row g-3">

            {/* NAME */}

            <div className="col-md-4">

              <label className="form-label">
                Name{" "}
                <span className="text-danger">
                  *
                </span>
              </label>

              <input
                type="text"
                className="form-control"
                placeholder="Enter Name"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
              />

            </div>

            {/* PHONE */}

            <div className="col-md-4">

              <label className="form-label">
                Mobile Number
              </label>

              <input
                type="text"
                className="form-control"
                placeholder="01XXXXXXXXX"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value)
                }
              />

            </div>

            {/* PHOTO */}

            <div className="col-md-4">

              <label className="form-label">
                Photo
              </label>

              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={handlePhotoChange}
              />

              {photoFile && (
                <small className="text-success">
                  Selected: {photoFile.name}
                </small>
              )}

              {photo && !photoFile && (
                <div className="mt-2">

                  <img
                    src={photo}
                    alt="Current"
                    width="60"
                    height="60"
                    style={{
                      objectFit: "cover",
                      borderRadius: "50%",
                    }}
                  />

                  <small className="ms-2 text-muted">
                    Current Photo
                  </small>

                </div>
              )}

            </div>

            {/* BLOOD GROUP */}

            <div className="col-md-3">

              <label className="form-label">
                Blood Group{" "}
                <span className="text-danger">
                  *
                </span>
              </label>

              <select
                className="form-select"
                value={bloodGroup}
                onChange={(e) =>
                  setBloodGroup(
                    e.target.value
                  )
                }
              >

                <option value="">
                  Select Blood Group
                </option>

                <option>A+</option>
                <option>A-</option>
                <option>B+</option>
                <option>B-</option>
                <option>AB+</option>
                <option>AB-</option>
                <option>O+</option>
                <option>O-</option>

              </select>

            </div>

            {/* WEIGHT */}

            <div className="col-md-3">

              <label className="form-label">
                Weight (KG)
              </label>

              <input
                type="number"
                className="form-control"
                placeholder="60"
                value={weight}
                onChange={(e) =>
                  setWeight(e.target.value)
                }
              />

            </div>

            {/* HEIGHT */}

            <div className="col-md-3">

              <label className="form-label">
                Height (CM)
              </label>

              <input
                type="number"
                className="form-control"
                placeholder="165"
                value={height}
                onChange={(e) =>
                  setHeight(e.target.value)
                }
              />

            </div>

            {/* BP */}

            <div className="col-md-3">

              <label className="form-label">
                Blood Pressure
              </label>

              <input
                type="text"
                className="form-control"
                placeholder="120/80"
                value={bloodPressure}
                onChange={(e) =>
                  setBloodPressure(
                    e.target.value
                  )
                }
              />

            </div>

            {/* OXYGEN */}

            <div className="col-md-3">

              <label className="form-label">
                Oxygen Rate (SpO₂)
              </label>

              <input
                type="number"
                className="form-control"
                placeholder="98"
                value={oxygen}
                onChange={(e) =>
                  setOxygen(e.target.value)
                }
              />

            </div>

            {/* PULSE */}

            <div className="col-md-3">

              <label className="form-label">
                Heartbeat / Pulse
              </label>

              <input
                type="number"
                className="form-control"
                placeholder="72"
                value={pulse}
                onChange={(e) =>
                  setPulse(e.target.value)
                }
              />

            </div>

            {/* NOTE */}

            <div className="col-md-6">

              <label className="form-label">
                Note
              </label>

              <input
                type="text"
                className="form-control"
                placeholder="Optional note"
                value={note}
                onChange={(e) =>
                  setNote(e.target.value)
                }
              />

            </div>

          </div>

          {/* BUTTONS */}

          <div className="mt-3">

            <button
              className="btn btn-success me-2"
              onClick={saveMedicalInfo}
              disabled={uploading}
            >

              {uploading
                ? "Uploading Photo..."
                : editingId
                ? "💾 Update Information"
                : "➕ Add Medical Information"}

            </button>

            {editingId && (

              <button
                className="btn btn-secondary"
                onClick={resetForm}
              >
                Cancel Edit
              </button>

            )}

          </div>

        </div>

        {/* ===============================
            STATISTICS
        =============================== */}

        <div className="row mb-4">

          <div className="col-md-4">

            <div className="card bg-primary text-white shadow-sm">

              <div className="card-body">

                <h6>
                  Total People
                </h6>

                <h3>
                  {filteredMedicalInfos.length}
                </h3>

              </div>

            </div>

          </div>

          <div className="col-md-4">

            <div className="card bg-danger text-white shadow-sm">

              <div className="card-body">

                <h6>
                  Blood Group Filter
                </h6>

                <h3>
                  {filterBloodGroup || "All"}
                </h3>

              </div>

            </div>

          </div>

        </div>

        {/* ===============================
            FILTER
        =============================== */}

        <div className="card p-3 mb-4">

          <h5>
            🔍 Medical Information Filter
          </h5>

          <div className="row g-3">

            <div className="col-md-4">

              <label className="form-label">
                Search
              </label>

              <input
                type="text"
                className="form-control"
                placeholder="Search name or mobile..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />

            </div>

            <div className="col-md-4">

              <label className="form-label">
                Blood Group
              </label>

              <select
                className="form-select"
                value={filterBloodGroup}
                onChange={(e) => {
                  setFilterBloodGroup(
                    e.target.value
                  );

                  setCurrentPage(1);
                }}
              >

                <option value="">
                  All Blood Group
                </option>

                <option>A+</option>
                <option>A-</option>
                <option>B+</option>
                <option>B-</option>
                <option>AB+</option>
                <option>AB-</option>
                <option>O+</option>
                <option>O-</option>

              </select>

            </div>

            <div className="col-md-4 d-flex align-items-end">

              <button
                className="btn btn-primary w-100"
                onClick={() =>
                  setShowReport(true)
                }
              >
                👁 View Report
              </button>

            </div>

          </div>

        </div>

        {/* ===============================
            HISTORY TABLE
        =============================== */}

        <h5>
          Medical Information History
        </h5>

        <div className="table-responsive">

          <table className="table table-bordered table-hover">

            <thead className="table-dark">

              <tr>

                <th>#</th>
                <th>Photo</th>
                <th>Name</th>
                <th>Mobile</th>
                <th>Blood Group</th>
                <th>Weight</th>
                <th>Height</th>
                <th>BP</th>
                <th>SpO₂</th>
                <th>Pulse</th>
                <th>Action</th>

              </tr>

            </thead>

            <tbody>

              {currentMedicalInfos.length === 0 ? (

                <tr>

                  <td
                    colSpan={11}
                    className="text-center"
                  >
                    No Medical Information Found
                  </td>

                </tr>

              ) : (

                currentMedicalInfos.map(
                  (item, index) => (

                    <tr key={item.id}>

                      <td>
                        {indexOfFirstItem + index + 1}
                      </td>

                      <td>

                        {item.photo ? (

                          <img
                            src={item.photo}
                            alt={item.name}
                            width="45"
                            height="45"
                            style={{
                              objectFit: "cover",
                              borderRadius: "50%",
                            }}
                          />

                        ) : (

                          <span>
                            👤
                          </span>

                        )}

                      </td>

                      <td>
                        {item.name}
                      </td>

                      <td>
                        {item.phone || "-"}
                      </td>

                      <td>

                        <span className="badge bg-danger">

                          {item.bloodGroup}

                        </span>

                      </td>

                      <td>

                        {item.weight
                          ? `${item.weight} kg`
                          : "-"}

                      </td>

                      <td>

                        {item.height
                          ? `${item.height} cm`
                          : "-"}

                      </td>

                      <td>
                        {item.bloodPressure || "-"}
                      </td>

                      <td>

                        {item.oxygen
                          ? `${item.oxygen}%`
                          : "-"}

                      </td>

                      <td>

                        {item.pulse
                          ? `${item.pulse} BPM`
                          : "-"}

                      </td>

                      <td>

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
                            handleDelete(
                              item.id
                            )
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

        {/* ===============================
            PAGINATION
        =============================== */}

        {totalPages > 0 && (

          <div className="d-flex justify-content-center mt-3">

            <button
              className="btn btn-outline-primary me-2"
              disabled={
                currentPage === 1
              }
              onClick={() =>
                setCurrentPage(
                  currentPage - 1
                )
              }
            >
              Previous
            </button>

            <span className="align-self-center px-3">

              Page {currentPage} of{" "}
              {totalPages}

            </span>

            <button
              className="btn btn-outline-primary ms-2"
              disabled={
                currentPage === totalPages
              }
              onClick={() =>
                setCurrentPage(
                  currentPage + 1
                )
              }
            >
              Next
            </button>

          </div>

        )}

        {/* ===============================
            REPORT MODAL
        =============================== */}

        {showReport && (

          <div
            className="modal fade show d-block"
            style={{
              backgroundColor:
                "rgba(0,0,0,0.5)",
            }}
          >

            <div className="modal-dialog modal-xl">

              <div className="modal-content">

                <div className="modal-header">

                  <h5 className="modal-title">
                    Medical Information Report
                  </h5>

                  <button
                    className="btn-close"
                    onClick={() =>
                      setShowReport(false)
                    }
                  />

                </div>

                <div
                  ref={reportRef}
                  className="modal-body"
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    background: "#fff",
                    padding: "25px",
                  }}
                >

                  <img
                    src="/logo.png"
                    alt="Watermark"
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform:
                        "translate(-50%, -50%)",
                      width: "420px",
                      opacity: 0.12,
                      filter:
                        "grayscale(100%)",
                      zIndex: 0,
                      pointerEvents:
                        "none",
                    }}
                  />

                  <div
                    style={{
                      position: "relative",
                      zIndex: 1,
                    }}
                  >

                    <div className="text-center mb-4">

                      <img
                        src="/logo.png"
                        width="80"
                        alt="Logo"
                      />

                      <h3>
                        Badokhali Youth Foundation
                      </h3>

                      <p>
                        Badokhali, Mograhat, Bagerhat
                      </p>

                      <h5>
                        Medical Information Report
                      </h5>

                    </div>

                    <table className="table table-bordered">

                      <thead className="table-light">

                        <tr>

                          <th>#</th>
                          <th>Name</th>
                          <th>Mobile</th>
                          <th>Blood Group</th>
                          <th>Weight</th>
                          <th>Height</th>
                          <th>BP</th>
                          <th>SpO₂</th>
                          <th>Pulse</th>

                        </tr>

                      </thead>

                      <tbody>

                        {filteredMedicalInfos.map(
                          (item, index) => (

                            <tr key={item.id}>

                              <td>
                                {index + 1}
                              </td>

                              <td>
                                {item.name}
                              </td>

                              <td>
                                {item.phone || "-"}
                              </td>

                              <td>
                                {item.bloodGroup}
                              </td>

                              <td>
                                {item.weight
                                  ? `${item.weight} kg`
                                  : "-"}
                              </td>

                              <td>
                                {item.height
                                  ? `${item.height} cm`
                                  : "-"}
                              </td>

                              <td>
                                {item.bloodPressure ||
                                  "-"}
                              </td>

                              <td>
                                {item.oxygen
                                  ? `${item.oxygen}%`
                                  : "-"}
                              </td>

                              <td>
                                {item.pulse
                                  ? `${item.pulse} BPM`
                                  : "-"}
                              </td>

                            </tr>

                          )
                        )}

                      </tbody>

                    </table>

                    <h5 className="text-end mt-4">

                      Total People:{" "}
                      {filteredMedicalInfos.length}

                    </h5>

                    <div className="row mt-5">

                      <div className="col-md-6">

                        <img
                          src="/roundseal.png"
                          alt="Office Seal"
                          width="120"
                          height="120"
                          style={{
                            objectFit:
                              "contain",
                          }}
                        />

                      </div>

                      <div className="col-md-6 text-end">

                        Piyas Halder
                        <br />
                        Health Secretary
                        <br />
                        Badokhali Youth Foundation

                      </div>

                    </div>

                    <p
                      className="mb-0 mt-3"
                      style={{
                        fontSize: "12px",
                        color: "#777",
                      }}
                    >
                      This report is digitally
                      generated and does not
                      require a physical signature.
                    </p>

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
                    onClick={() =>
                      setShowReport(false)
                    }
                  >
                    Close
                  </button>

                </div>

              </div>

            </div>

          </div>

        )}

      </div>

    </AdminLayout>
  );
};

export default MedicalInfo;