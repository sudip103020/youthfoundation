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
  dateOfBirth?: string;
  gender?: string;
  currentAddress?: string;
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
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [currentAddress, setCurrentAddress] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [bloodPressure, setBloodPressure] = useState("");
  const [oxygen, setOxygen] = useState("");
  const [pulse, setPulse] = useState("");
  const [note, setNote] = useState("");

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

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
  // FETCH MEDICAL INFO
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
  // CLOUDINARY UPLOAD
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
          data?.error?.message ||
            "Photo upload failed"
        );
      }

      return data.secure_url;
    } catch (error) {
      console.error(
        "Cloudinary upload error:",
        error
      );

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

    if (file.size > 5 * 1024 * 1024) {
      alert("Photo size must be less than 5MB");
      return;
    }

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
    setDateOfBirth("");
    setGender("");
    setCurrentAddress("");
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

      if (photoFile) {
        const uploadedUrl =
          await uploadPhoto(photoFile);

        if (!uploadedUrl) {
          return;
        }

        photoUrl = uploadedUrl;
      }

      if (editingId) {
        await updateDoc(
          doc(db, "medicalInfo", editingId),
          {
            name: name.trim(),
            phone: phone.trim(),
            photo: photoUrl,
            bloodGroup,
            dateOfBirth: dateOfBirth || "",
            gender: gender || "",
            currentAddress:
              currentAddress.trim(),
            weight: weight.trim(),
            height: height.trim(),
            bloodPressure:
              bloodPressure.trim(),
            oxygen: oxygen.trim(),
            pulse: pulse.trim(),
            note: note.trim(),
            updatedAt: serverTimestamp(),
          }
        );

        alert(
          "Medical Information Updated Successfully"
        );
      } else {
        await addDoc(
          collection(db, "medicalInfo"),
          {
            name: name.trim(),
            phone: phone.trim(),
            photo: photoUrl,
            bloodGroup,
            dateOfBirth: dateOfBirth || "",
            gender: gender || "",
            currentAddress:
              currentAddress.trim(),
            weight: weight.trim(),
            height: height.trim(),
            bloodPressure:
              bloodPressure.trim(),
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
    setDateOfBirth(
      item.dateOfBirth || ""
    );
    setGender(item.gender || "");
    setCurrentAddress(
      item.currentAddress || ""
    );
    setWeight(item.weight || "");
    setHeight(item.height || "");
    setBloodPressure(
      item.bloodPressure || ""
    );
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
      const searchText =
        search.toLowerCase().trim();

      const matchSearch =
        item.name
          .toLowerCase()
          .includes(searchText) ||
        (item.phone || "")
          .toLowerCase()
          .includes(searchText);

      const matchBloodGroup =
        filterBloodGroup === "" ||
        item.bloodGroup ===
          filterBloodGroup;

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

    try {
      const canvas =
        await html2canvas(
          reportRef.current,
          {
            scale: 3,
            useCORS: true,
            allowTaint: true,
            backgroundColor:
              "#ffffff",
            logging: false,
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
    } catch (error) {
      console.error(
        "Report download error:",
        error
      );

      alert(
        "Failed to download report"
      );
    }
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
                onChange={
                  handlePhotoChange
                }
              />

              {photoFile && (
                <small className="text-success">
                  Selected:{" "}
                  {photoFile.name}
                </small>
              )}

              {photo &&
                !photoFile && (
                  <div className="mt-2">

                    <img
                      src={photo}
                      alt="Current"
                      width="60"
                      height="60"
                      style={{
                        objectFit:
                          "cover",
                        borderRadius:
                          "50%",
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

            {/* DATE OF BIRTH */}

            <div className="col-md-3">

              <label className="form-label">
                Date of Birth
              </label>

              <input
                type="date"
                className="form-control"
                value={dateOfBirth}
                onChange={(e) =>
                  setDateOfBirth(
                    e.target.value
                  )
                }
              />

            </div>

            {/* GENDER */}

            <div className="col-md-3">

              <label className="form-label">
                Gender
              </label>

              <select
                className="form-select"
                value={gender}
                onChange={(e) =>
                  setGender(
                    e.target.value
                  )
                }
              >

                <option value="">
                  Select Gender
                </option>

                <option value="Male">
                  Male
                </option>

                <option value="Female">
                  Female
                </option>

                <option value="Other">
                  Other
                </option>

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
                  setWeight(
                    e.target.value
                  )
                }
              />

            </div>

            {/* CURRENT ADDRESS */}

            <div className="col-md-6">

              <label className="form-label">
                Current Address
              </label>

              <textarea
                className="form-control"
                rows={2}
                placeholder="Enter Current Address"
                value={
                  currentAddress
                }
                onChange={(e) =>
                  setCurrentAddress(
                    e.target.value
                  )
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
                  setHeight(
                    e.target.value
                  )
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
                value={
                  bloodPressure
                }
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
                  setOxygen(
                    e.target.value
                  )
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
                  setPulse(
                    e.target.value
                  )
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
                  setNote(
                    e.target.value
                  )
                }
              />

            </div>

          </div>

          <div className="mt-3">

            <button
              className="btn btn-success me-2"
              onClick={
                saveMedicalInfo
              }
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
                  {
                    filteredMedicalInfos.length
                  }
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
                  {
                    filterBloodGroup ||
                    "All"
                  }
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
                  setSearch(
                    e.target.value
                  );

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
                value={
                  filterBloodGroup
                }
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

        {/* =========================================================
            MEDICAL REPORT MODAL
        ========================================================= */}

        {showReport && (

          <div
            className="modal fade show d-block"
            style={{
              backgroundColor:
                "rgba(0,0,0,0.6)",
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
                    🩺 Medical Information Report
                  </h5>

                  <button
                    className="btn-close"
                    onClick={() =>
                      setShowReport(
                        false
                      )
                    }
                  />

                </div>

                {/* REPORT AREA */}

                <div
                  className="modal-body"
                  style={{
                    padding: "20px",
                    overflowX: "auto",
                    background:
                      "#eeeeee",
                  }}
                >

                  {/* ===============================
                      A4 REPORT
                  =============================== */}

                  <div
                    ref={reportRef}
                    style={{
                      width: "210mm",
                      minWidth: "210mm",
                      margin: "0 auto",
                      background:
                        "#ffffff",
                      position:
                        "relative",
                      overflow:
                        "hidden",
                      fontFamily:
                        '"Noto Sans Bengali", "Noto Sans", sans-serif',
                      boxShadow:
                        "0 0 15px rgba(0,0,0,0.15)",
                    }}
                  >

                    {/* ===============================
                        HEADER
                    =============================== */}

                    <div
                      style={{
                        height: "43mm",
                        background:
                          "linear-gradient(100deg, #08aeea 0%, #078dbb 35%, #075f7d 65%, #101c31 100%)",
                        color:
                          "#ffffff",
                        position:
                          "relative",
                        overflow:
                          "hidden",
                      }}
                    >

                      <div
                        style={{
                          height: "36mm",
                          position:
                            "relative",
                          display:
                            "flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "center",
                        }}
                      >

                        {/* LOGO */}

                        <div
                          style={{
                            position:
                              "absolute",
                            left: "28mm",
                            top: "50%",
                            transform:
                              "translateY(-50%)",
                            width:
                              "18mm",
                            height:
                              "18mm",
                            background:
                              "#ffffff",
                            borderRadius:
                              "50%",
                            display:
                              "flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "center",
                          }}
                        >

                          <img
                            src="/logo.png"
                            alt="Badokhali Youth Foundation"
                            crossOrigin="anonymous"
                            style={{
                              width:
                                "100%",
                              height:
                                "100%",
                              objectFit:
                                "contain",
                              borderRadius:
                                "50%",
                            }}
                          />

                        </div>

                        {/* ORGANIZATION NAME */}

                        <div
                          style={{
                            textAlign:
                              "center",
                            marginTop:
                              "2mm",
                          }}
                        >

                          <div
                            style={{
                              fontSize:
                                "35px",
                              fontWeight:
                                800,
                              lineHeight:
                                1.2,
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            বাদোখালী ইয়ুথ ফাউন্ডেশন
                          </div>

                          <div
                            style={{
                              fontFamily:
                                "Arial, sans-serif",
                              fontSize:
                                "25px",
                              fontWeight:
                                700,
                              lineHeight:
                                1.2,
                              marginTop:
                                "2px",
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            Badokhali Youth Foundation
                          </div>

                        </div>

                        {/* SLOGAN */}

                        <div
                          style={{
                            position:
                              "absolute",
                            right:
                              "11mm",
                            top:
                              "3mm",
                            fontSize:
                              "10px",
                            fontWeight:
                              500,
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          তারুণ্যের স্পন্দন, সেবার বন্ধন
                        </div>

                      </div>

                      {/* HEADER DESIGN */}

                      <div
                        style={{
                          position:
                            "absolute",
                          left: 0,
                          right: 0,
                          bottom: 0,
                          height:
                            "7mm",
                          display:
                            "flex",
                          background:
                            "#ffffff",
                        }}
                      >

                        <div
                          style={{
                            width:
                              "31%",
                            background:
                              "linear-gradient(90deg, #12324a, #087b9e)",
                          }}
                        />

                        <div
                          style={{
                            width:
                              "38%",
                            background:
                              "#08aeea",
                            clipPath:
                              "polygon(8% 0, 92% 0, 84% 100%, 16% 100%)",
                          }}
                        />

                        <div
                          style={{
                            width:
                              "31%",
                            background:
                              "linear-gradient(90deg, #087b9e, #12324a)",
                          }}
                        />

                      </div>

                    </div>

                    {/* ===============================
                        WATERMARK
                    =============================== */}

                    <img
                      src="/logo.png"
                      alt=""
                      crossOrigin="anonymous"
                      style={{
                        position:
                          "absolute",
                        top: "50%",
                        left: "50%",
                        transform:
                          "translate(-50%, -50%)",
                        width:
                          "105mm",
                        height:
                          "105mm",
                        objectFit:
                          "contain",
                        opacity: 0.045,
                        pointerEvents:
                          "none",
                        zIndex: 0,
                      }}
                    />

                    {/* ===============================
                        CONTENT
                    =============================== */}

                    <div
                      style={{
                        position:
                          "relative",
                        zIndex: 2,
                        padding:
                          "8mm 15mm 5mm",
                      }}
                    >

                      {/* REPORT META */}

                      <div
                        style={{
                          display:
                            "flex",
                          justifyContent:
                            "space-between",
                          fontSize:
                            "13px",
                          marginBottom:
                            "5mm",
                        }}
                      >

                        <div>
                          <strong>
                            রিপোর্ট:
                          </strong>{" "}
                          Medical Information
                        </div>

                        <div>
                          <strong>
                            তারিখ:
                          </strong>{" "}
                          {new Date().toLocaleDateString(
                            "en-GB"
                          )}
                        </div>

                      </div>

                      {/* TITLE */}

                      <h2
                        style={{
                          textAlign:
                            "center",
                          fontSize:
                            "23px",
                          fontWeight:
                            800,
                          textDecoration:
                            "underline",
                          textUnderlineOffset:
                            "5px",
                          margin:
                            "0 0 7mm",
                        }}
                      >
                        Medical Information Report
                      </h2>

                      {/* FILTER INFORMATION */}

                      {(search ||
                        filterBloodGroup) && (

                        <div
                          style={{
                            textAlign:
                              "center",
                            fontSize:
                              "12px",
                            marginBottom:
                              "5mm",
                            color:
                              "#555",
                          }}
                        >

                          {search && (
                            <span>
                              Search:{" "}
                              <strong>
                                {search}
                              </strong>
                            </span>
                          )}

                          {filterBloodGroup && (
                            <span
                              style={{
                                marginLeft:
                                  "15px",
                              }}
                            >
                              Blood Group:{" "}
                              <strong>
                                {
                                  filterBloodGroup
                                }
                              </strong>
                            </span>
                          )}

                        </div>

                      )}

                      {/* ===============================
                          MEDICAL TABLE
                      =============================== */}

                      <table
                        style={{
                          width: "100%",
                          borderCollapse:
                            "collapse",
                          tableLayout:
                            "fixed",
                          fontSize:
                            "9px",
                        }}
                      >

                        <thead>

                          <tr>

                            <th
                              style={{
                                border:
                                  "1px solid #555",
                                padding:
                                  "6px 2px",
                                width:
                                  "4%",
                                background:
                                  "#f0f5f2",
                                textAlign:
                                  "center",
                              }}
                            >
                              #
                            </th>

                            <th
                              style={{
                                border:
                                  "1px solid #555",
                                padding:
                                  "6px 2px",
                                width:
                                  "13%",
                                background:
                                  "#f0f5f2",
                              }}
                            >
                              Name
                            </th>

                            <th
                              style={{
                                border:
                                  "1px solid #555",
                                padding:
                                  "6px 2px",
                                width:
                                  "11%",
                                background:
                                  "#f0f5f2",
                                textAlign:
                                  "center",
                              }}
                            >
                              Mobile
                            </th>

                            <th
                              style={{
                                border:
                                  "1px solid #555",
                                padding:
                                  "6px 2px",
                                width:
                                  "7%",
                                background:
                                  "#f0f5f2",
                                textAlign:
                                  "center",
                              }}
                            >
                              Blood
                            </th>

                            <th
                              style={{
                                border:
                                  "1px solid #555",
                                padding:
                                  "6px 2px",
                                width:
                                  "10%",
                                background:
                                  "#f0f5f2",
                                textAlign:
                                  "center",
                              }}
                            >
                              DOB
                            </th>

                            <th
                              style={{
                                border:
                                  "1px solid #555",
                                padding:
                                  "6px 2px",
                                width:
                                  "7%",
                                background:
                                  "#f0f5f2",
                                textAlign:
                                  "center",
                              }}
                            >
                              Gender
                            </th>

                            <th
                              style={{
                                border:
                                  "1px solid #555",
                                padding:
                                  "6px 2px",
                                width:
                                  "17%",
                                background:
                                  "#f0f5f2",
                                textAlign:
                                  "center",
                              }}
                            >
                              Current Address
                            </th>

                            <th
                              style={{
                                border:
                                  "1px solid #555",
                                padding:
                                  "6px 2px",
                                width:
                                  "8%",
                                background:
                                  "#f0f5f2",
                                textAlign:
                                  "center",
                              }}
                            >
                              Weight
                            </th>

                            <th
                              style={{
                                border:
                                  "1px solid #555",
                                padding:
                                  "6px 2px",
                                width:
                                  "8%",
                                background:
                                  "#f0f5f2",
                                textAlign:
                                  "center",
                              }}
                            >
                              Height
                            </th>

                            <th
                              style={{
                                border:
                                  "1px solid #555",
                                padding:
                                  "6px 2px",
                                width:
                                  "7%",
                                background:
                                  "#f0f5f2",
                                textAlign:
                                  "center",
                              }}
                            >
                              BP
                            </th>

                            <th
                              style={{
                                border:
                                  "1px solid #555",
                                padding:
                                  "6px 2px",
                                width:
                                  "4%",
                                background:
                                  "#f0f5f2",
                                textAlign:
                                  "center",
                              }}
                            >
                              SpO₂
                            </th>

                            <th
                              style={{
                                border:
                                  "1px solid #555",
                                padding:
                                  "6px 2px",
                                width:
                                  "4%",
                                background:
                                  "#f0f5f2",
                                textAlign:
                                  "center",
                              }}
                            >
                              Pulse
                            </th>

                          </tr>

                        </thead>

                        <tbody>

                          {filteredMedicalInfos.length ===
                          0 ? (

                            <tr>

                              <td
                                colSpan={
                                  12
                                }
                                style={{
                                  border:
                                    "1px solid #555",
                                  padding:
                                    "15px",
                                  textAlign:
                                    "center",
                                }}
                              >
                                No Medical Information Found
                              </td>

                            </tr>

                          ) : (

                            filteredMedicalInfos.map(
                              (
                                item,
                                index
                              ) => (

                                <tr
                                  key={
                                    item.id
                                  }
                                >

                                  <td
                                    style={{
                                      border:
                                        "1px solid #555",
                                      padding:
                                        "5px 2px",
                                      textAlign:
                                        "center",
                                      verticalAlign:
                                        "middle",
                                    }}
                                  >
                                    {
                                      index +
                                      1
                                    }
                                  </td>

                                  <td
                                    style={{
                                      border:
                                        "1px solid #555",
                                      padding:
                                        "5px 2px",
                                      verticalAlign:
                                        "middle",
                                      wordBreak:
                                        "break-word",
                                    }}
                                  >
                                    {
                                      item.name
                                    }
                                  </td>

                                  <td
                                    style={{
                                      border:
                                        "1px solid #555",
                                      padding:
                                        "5px 2px",
                                      textAlign:
                                        "center",
                                      verticalAlign:
                                        "middle",
                                      whiteSpace:
                                        "nowrap",
                                    }}
                                  >
                                    {
                                      item.phone ||
                                      "-"
                                    }
                                  </td>

                                  <td
                                    style={{
                                      border:
                                        "1px solid #555",
                                      padding:
                                        "5px 2px",
                                      textAlign:
                                        "center",
                                      verticalAlign:
                                        "middle",
                                      fontWeight:
                                        700,
                                      color:
                                        "#dc3545",
                                    }}
                                  >
                                    {
                                      item.bloodGroup
                                    }
                                  </td>

                                  <td
                                    style={{
                                      border:
                                        "1px solid #555",
                                      padding:
                                        "5px 2px",
                                      textAlign:
                                        "center",
                                      verticalAlign:
                                        "middle",
                                      whiteSpace:
                                        "nowrap",
                                    }}
                                  >
                                    {
                                      item.dateOfBirth ||
                                      "-"
                                    }
                                  </td>

                                  <td
                                    style={{
                                      border:
                                        "1px solid #555",
                                      padding:
                                        "5px 2px",
                                      textAlign:
                                        "center",
                                      verticalAlign:
                                        "middle",
                                    }}
                                  >
                                    {
                                      item.gender ||
                                      "-"
                                    }
                                  </td>

                                  <td
                                    style={{
                                      border:
                                        "1px solid #555",
                                      padding:
                                        "5px 2px",
                                      verticalAlign:
                                        "middle",
                                      wordBreak:
                                        "break-word",
                                    }}
                                  >
                                    {
                                      item.currentAddress ||
                                      "-"
                                    }
                                  </td>

                                  <td
                                    style={{
                                      border:
                                        "1px solid #555",
                                      padding:
                                        "5px 2px",
                                      textAlign:
                                        "center",
                                      verticalAlign:
                                        "middle",
                                      whiteSpace:
                                        "nowrap",
                                    }}
                                  >
                                    {item.weight
                                      ? `${item.weight} kg`
                                      : "-"}
                                  </td>

                                  <td
                                    style={{
                                      border:
                                        "1px solid #555",
                                      padding:
                                        "5px 2px",
                                      textAlign:
                                        "center",
                                      verticalAlign:
                                        "middle",
                                      whiteSpace:
                                        "nowrap",
                                    }}
                                  >
                                    {item.height
                                      ? `${item.height} cm`
                                      : "-"}
                                  </td>

                                  <td
                                    style={{
                                      border:
                                        "1px solid #555",
                                      padding:
                                        "5px 2px",
                                      textAlign:
                                        "center",
                                      verticalAlign:
                                        "middle",
                                      whiteSpace:
                                        "nowrap",
                                    }}
                                  >
                                    {
                                      item.bloodPressure ||
                                      "-"
                                    }
                                  </td>

                                  <td
                                    style={{
                                      border:
                                        "1px solid #555",
                                      padding:
                                        "5px 2px",
                                      textAlign:
                                        "center",
                                      verticalAlign:
                                        "middle",
                                      whiteSpace:
                                        "nowrap",
                                    }}
                                  >
                                    {item.oxygen
                                      ? `${item.oxygen}%`
                                      : "-"}
                                  </td>

                                  <td
                                    style={{
                                      border:
                                        "1px solid #555",
                                      padding:
                                        "5px 2px",
                                      textAlign:
                                        "center",
                                      verticalAlign:
                                        "middle",
                                      whiteSpace:
                                        "nowrap",
                                    }}
                                  >
                                    {
                                      item.pulse ||
                                      "-"
                                    }
                                  </td>

                                </tr>

                              )
                            )

                          )}

                        </tbody>

                      </table>

                      {/* ===============================
                          NOTE INFORMATION
                      =============================== */}

                      {filteredMedicalInfos.some(
                        (item) =>
                          item.note
                      ) && (

                        <div
                          style={{
                            marginTop:
                              "5mm",
                            fontSize:
                              "11px",
                          }}
                        >

                          <strong>
                            Note:
                          </strong>

                          <div
                            style={{
                              marginTop:
                                "3px",
                            }}
                          >

                            {filteredMedicalInfos
                              .filter(
                                (
                                  item
                                ) =>
                                  item.note
                              )
                              .map(
                                (
                                  item
                                ) => (

                                  <div
                                    key={
                                      item.id
                                    }
                                  >
                                    •{" "}
                                    {
                                      item.name
                                    }
                                    :{" "}
                                    {
                                      item.note
                                    }
                                  </div>

                                )
                              )}

                          </div>

                        </div>

                      )}

                      {/* ===============================
                          TOTAL
                      =============================== */}

                      <div
                        style={{
                          marginTop:
                            "6mm",
                          textAlign:
                            "right",
                          fontSize:
                            "16px",
                          fontWeight:
                            800,
                        }}
                      >
                        Total People :{" "}
                        {
                          filteredMedicalInfos.length
                        }
                      </div>

                      {/* ===============================
                          SIGNATURE
                      =============================== */}

                      <div
                        style={{
                          display:
                            "flex",
                          justifyContent:
                            "space-between",
                          alignItems:
                            "flex-end",
                          marginTop:
                            "12mm",
                          minHeight:
                            "35mm",
                        }}
                      >

                        {/* SEAL */}

                        <div
                          style={{
                            width:
                              "50%",
                            paddingLeft:
                              "10px",
                            position:
                              "relative",
                          }}
                        >

                          <img
                            src="/roundseal.png"
                            alt="Office Seal"
                            crossOrigin="anonymous"
                            style={{
                              width:
                                "90px",
                              height:
                                "90px",
                              objectFit:
                                "contain",
                            }}
                          />

                          <div
                            style={{
                              border:
                                "2px solid #0b6ff3",
                              padding:
                                "7px 16px",
                              display:
                                "inline-block",
                              fontSize:
                                "17px",
                              fontWeight:
                                "bold",
                              letterSpacing:
                                "1.5px",
                              color:
                                "#0b6ff3",
                              fontFamily:
                                "Arial, sans-serif",
                              transform:
                                "rotate(-6deg)",
                              opacity:
                                0.8,
                              borderRadius:
                                "2px",
                              textTransform:
                                "uppercase",
                              marginLeft:
                                "10px",
                            }}
                          >
                            VERIFIED
                          </div>

                        </div>

                        {/* SIGNATURE */}

                        <div
                          style={{
                            width:
                              "50%",
                            textAlign:
                              "center",
                            fontSize:
                              "13px",
                          }}
                        >

                          <div
                            style={{
                              width:
                                "180px",
                              margin:
                                "0 auto 5px",
                              borderTop:
                                "1px solid #222",
                            }}
                          />

                          <strong>
                            Piyas Halder
                          </strong>

                          <div>
                            Health Secretary
                          </div>

                          <div>
                            Badokhali Youth Foundation
                          </div>

                        </div>

                      </div>

                    </div>

                    {/* ===============================
                        FOOTER
                    =============================== */}

                    <div
                      style={{
                        position:
                          "relative",
                        zIndex: 2,
                        padding:
                          "3mm 15mm 0",
                        background:
                          "#ffffff",
                      }}
                    >

                      {/* ELECTRONIC NOTICE */}

                      <div
                        style={{
                          borderTop:
                            "1px solid #d5d5d5",
                          paddingTop:
                            "8px",
                          textAlign:
                            "center",
                          fontSize:
                            "10px",
                          color:
                            "#888",
                        }}
                      >
                        “This is electronically generated. No signature is required.”
                      </div>

                      {/* FOOTER INFORMATION */}

                      <div
                        style={{
                          display:
                            "flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "space-between",
                          gap:
                            "8mm",
                          marginTop:
                            "4mm",
                        }}
                      >

                        {/* PHONE */}

                        <div
                          style={{
                            display:
                              "flex",
                            gap: "5px",
                            fontSize:
                              "9.5px",
                            lineHeight:
                              1.5,
                          }}
                        >

                          <span
                            style={{
                              fontSize:
                                "14px",
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
                            display:
                              "flex",
                            gap: "5px",
                            fontSize:
                              "9.5px",
                            lineHeight:
                              1.5,
                          }}
                        >

                          <span
                            style={{
                              fontSize:
                                "14px",
                            }}
                          >
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
                            display:
                              "flex",
                            gap: "5px",
                            fontSize:
                              "9.5px",
                            lineHeight:
                              1.5,
                          }}
                        >

                          <span
                            style={{
                              fontSize:
                                "14px",
                            }}
                          >
                            ✉
                          </span>

                          <div
                            style={{
                              wordBreak:
                                "break-word",
                            }}
                          >
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
                            crossOrigin="anonymous"
                            style={{
                              width:
                                "20mm",
                              height:
                                "20mm",
                              objectFit:
                                "contain",
                            }}
                          />

                        </div>

                      </div>

                      {/* FOOTER DESIGN */}

                      <div
                        style={{
                          height:
                            "12mm",
                          marginTop:
                            "4mm",
                          position:
                            "relative",
                          overflow:
                            "hidden",
                        }}
                      >

                        <div
                          style={{
                            position:
                              "absolute",
                            left: 0,
                            top: 0,
                            width:
                              "35%",
                            height:
                              "4px",
                            background:
                              "#292929",
                          }}
                        />

                        <div
                          style={{
                            position:
                              "absolute",
                            left:
                              "27%",
                            right:
                              "27%",
                            top: 0,
                            bottom: 0,
                            background:
                              "#08aeea",
                            clipPath:
                              "polygon(13% 0, 87% 0, 74% 100%, 26% 100%)",
                          }}
                        />

                        <div
                          style={{
                            position:
                              "absolute",
                            right: 0,
                            top: 0,
                            width:
                              "28%",
                            height:
                              "4px",
                            background:
                              "#292929",
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
                    onClick={
                      downloadReport
                    }
                  >
                    📥 Download Report
                  </button>

                  <button
                    className="btn btn-secondary"
                    onClick={() =>
                      setShowReport(
                        false
                      )
                    }
                  >
                    Close
                  </button>

                </div>

              </div>

            </div>

          </div>

        )}

        {/* ===============================
            HISTORY
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
                <th>Date of Birth</th>
                <th>Gender</th>
                <th>Current Address</th>
                <th>Weight</th>
                <th>Height</th>
                <th>BP</th>
                <th>SpO₂</th>
                <th>Pulse</th>
                <th>Action</th>

              </tr>

            </thead>

            <tbody>

              {currentMedicalInfos.length ===
              0 ? (

                <tr>

                  <td
                    colSpan={14}
                    className="text-center"
                  >
                    No Medical Information Found
                  </td>

                </tr>

              ) : (

                currentMedicalInfos.map(
                  (
                    item,
                    index
                  ) => (

                    <tr
                      key={item.id}
                    >

                      <td>
                        {
                          indexOfFirstItem +
                          index +
                          1
                        }
                      </td>

                      <td>

                        {item.photo ? (

                          <img
                            src={
                              item.photo
                            }
                            alt={
                              item.name
                            }
                            width="45"
                            height="45"
                            style={{
                              objectFit:
                                "cover",
                              borderRadius:
                                "50%",
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
                        {
                          item.phone ||
                          "-"
                        }
                      </td>

                      <td>

                        <span className="badge bg-danger">
                          {
                            item.bloodGroup
                          }
                        </span>

                      </td>

                      <td>
                        {
                          item.dateOfBirth ||
                          "-"
                        }
                      </td>

                      <td>
                        {
                          item.gender ||
                          "-"
                        }
                      </td>

                      <td
                        style={{
                          minWidth:
                            "220px",
                        }}
                      >
                        {
                          item.currentAddress ||
                          "-"
                        }
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
                        {
                          item.bloodPressure ||
                          "-"
                        }
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

                      <td
                        style={{
                          whiteSpace:
                            "nowrap",
                        }}
                      >

                        <button
                          className="btn btn-sm btn-primary me-2"
                          onClick={() =>
                            handleEdit(
                              item
                            )
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
                currentPage ===
                1
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
              Page{" "}
              {currentPage} of{" "}
              {totalPages}
            </span>

            <button
              className="btn btn-outline-primary ms-2"
              disabled={
                currentPage ===
                totalPages
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

      </div>

    </AdminLayout>
  );
};

export default MedicalInfo;