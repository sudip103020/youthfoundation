import { useEffect, useState, useRef } from "react";
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
  serverTimestamp,
} from "firebase/firestore";

interface Donation {
  id: string;
  donorName: string;
  phone?: string;
  address?: string;
  amount?: string;
  donationType: string;
  otherDetails?: string;
  paymentMethod: string;
  purpose?: string;
  donationDate?: string;
  remarks?: string;
  photo?: string;
  createdAt?: any;
  updatedAt?: any;
}

// ===============================
// CLOUDINARY
// ===============================

const CLOUDINARY_CLOUD_NAME = "dvpfixfd";
const CLOUDINARY_UPLOAD_PRESET =
  "badokhali_youth_foundation";

const Donation = () => {
  const reportRef = useRef<HTMLDivElement>(null);

  const [donations, setDonations] = useState<Donation[]>([]);

  // ===============================
  // FORM
  // ===============================

  const [donorName, setDonorName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");

  const [donationType, setDonationType] =
    useState("Cash");

  const [otherDetails, setOtherDetails] =
    useState("");

  const [paymentMethod, setPaymentMethod] =
    useState("Cash");

  const [purpose, setPurpose] = useState("");
  const [donationDate, setDonationDate] =
    useState("");

  const [remarks, setRemarks] = useState("");
  const [photo, setPhoto] = useState("");

  const [photoFile, setPhotoFile] =
    useState<File | null>(null);

  // Edit
  const [editingId, setEditingId] =
    useState<string | null>(null);

  // Upload
  const [uploading, setUploading] =
    useState(false);

  // ===============================
  // FILTER
  // ===============================

  const [searchName, setSearchName] =
    useState("");

  const [filterMethod, setFilterMethod] =
    useState("");

  const [showReport, setShowReport] =
    useState(false);

  // ===============================
  // FETCH DONATIONS
  // ===============================

  const fetchDonations = async () => {
    try {
      const snapshot = await getDocs(
        collection(db, "donations")
      );

      const data: Donation[] = [];

      snapshot.forEach((item) => {
        data.push({
          id: item.id,
          ...(item.data() as Omit<
            Donation,
            "id"
          >),
        });
      });

      data.sort((a, b) => {
        const aTime =
          a.createdAt?.seconds || 0;

        const bTime =
          b.createdAt?.seconds || 0;

        return bTime - aTime;
      });

      setDonations(data);
    } catch (error) {
      console.error(
        "Error fetching donations:",
        error
      );
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  // ===============================
  // PHOTO SELECT
  // ===============================

  const handlePhotoChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Photo size must be less than 5MB");
      return;
    }

    setPhotoFile(file);
  };

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

      if (!response.ok) {
        throw new Error("Photo upload failed");
      }

      const data = await response.json();

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
  // RESET FORM
  // ===============================

  const resetForm = () => {
    setDonorName("");
    setPhone("");
    setAddress("");
    setAmount("");
    setDonationType("Cash");
    setOtherDetails("");
    setPaymentMethod("Cash");
    setPurpose("");
    setDonationDate("");
    setRemarks("");
    setPhoto("");
    setPhotoFile(null);
    setEditingId(null);
  };

  // ===============================
  // ADD / UPDATE DONATION
  // ===============================

  const saveDonation = async () => {
    if (!donorName.trim()) {
      alert("Donor Name is required");
      return;
    }

    if (!donationType) {
      alert("Donation Type is required");
      return;
    }

    if (
      donationType === "Cash" &&
      !amount.trim()
    ) {
      alert(
        "Amount is required for Cash donation"
      );
      return;
    }

    if (
      donationType === "Others" &&
      !otherDetails.trim()
    ) {
      alert(
        "Please enter donation details"
      );
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

      const donationData = {
        donorName: donorName.trim(),
        phone: phone.trim(),
        address: address.trim(),

        amount:
          donationType === "Cash"
            ? amount.trim()
            : "",

        donationType,

        otherDetails:
          donationType === "Others"
            ? otherDetails.trim()
            : "",

        paymentMethod,
        purpose: purpose.trim(),
        donationDate,
        remarks: remarks.trim(),
        photo: photoUrl,
      };

      if (editingId) {
        await updateDoc(
          doc(db, "donations", editingId),
          {
            ...donationData,
            updatedAt: serverTimestamp(),
          }
        );

        alert(
          "Donation Updated Successfully"
        );
      } else {
        await addDoc(
          collection(db, "donations"),
          {
            ...donationData,
            createdAt: serverTimestamp(),
          }
        );

        alert(
          "Donation Added Successfully"
        );
      }

      resetForm();

      await fetchDonations();
    } catch (error) {
      console.error(error);

      alert(
        editingId
          ? "Failed to update donation"
          : "Failed to add donation"
      );
    }
  };

  // ===============================
  // EDIT
  // ===============================

  const handleEdit = (item: Donation) => {
    setEditingId(item.id);

    setDonorName(item.donorName || "");
    setPhone(item.phone || "");
    setAddress(item.address || "");
    setAmount(item.amount || "");

    setDonationType(
      item.donationType || "Cash"
    );

    setOtherDetails(
      item.otherDetails || ""
    );

    setPaymentMethod(
      item.paymentMethod || "Cash"
    );

    setPurpose(item.purpose || "");

    setDonationDate(
      item.donationDate || ""
    );

    setRemarks(item.remarks || "");
    setPhoto(item.photo || "");
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
    const confirmDelete =
      window.confirm(
        "Delete this donation?"
      );

    if (!confirmDelete) return;

    try {
      await deleteDoc(
        doc(db, "donations", id)
      );

      alert("Deleted Successfully");

      await fetchDonations();
    } catch (error) {
      console.error(error);

      alert("Failed to delete");
    }
  };

  // ===============================
  // DOWNLOAD REPORT
  // ===============================

  const downloadReport = async () => {
    if (!reportRef.current) return;

    try {
      const canvas = await html2canvas(
        reportRef.current,
        {
          scale: 3,
          useCORS: true,
          allowTaint: false,
          backgroundColor: "#ffffff",
          logging: false,
        }
      );

      const image =
        canvas.toDataURL("image/png");

      const link =
        document.createElement("a");

      link.href = image;

      link.download =
        `Donation-Report-${
          searchName || "All"
        }-${
          filterMethod || "All"
        }.png`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error(
        "Report download failed:",
        error
      );

      alert(
        "Failed to download report"
      );
    }
  };

  // ===============================
  // FILTER
  // ===============================

  const filteredDonations =
    donations.filter((item) => {
      return (
        (searchName === "" ||
          item.donorName
            .toLowerCase()
            .includes(
              searchName.toLowerCase()
            )) &&
        (filterMethod === "" ||
          item.paymentMethod ===
            filterMethod)
      );
    });

  // ===============================
  // TOTAL CASH DONATION
  // ===============================

  const totalDonation =
    filteredDonations.reduce(
      (sum, item) =>
        sum + Number(item.amount || 0),
      0
    );

  return (
    <AdminLayout>
      <div className="container-fluid p-4">

        <h3 className="mb-4">
          🎁 Donation Management
        </h3>

        {/* ===============================
            ADD / EDIT DONATION
        =============================== */}

        <div className="card shadow-sm p-3 mb-4">

          <h5 className="mb-3">
            {editingId
              ? "✏️ Edit Donation"
              : "➕ Add New Donation"}
          </h5>

          <div className="row g-3">

            <div className="col-md-4">
              <label className="form-label">
                Donor Name{" "}
                <span className="text-danger">
                  *
                </span>
              </label>

              <input
                type="text"
                className="form-control"
                placeholder="Enter Donor Name"
                value={donorName}
                onChange={(e) =>
                  setDonorName(
                    e.target.value
                  )
                }
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">
                Phone
              </label>

              <input
                type="text"
                className="form-control"
                placeholder="01XXXXXXXXX"
                value={phone}
                onChange={(e) =>
                  setPhone(
                    e.target.value
                  )
                }
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">
                Address
              </label>

              <input
                type="text"
                className="form-control"
                placeholder="Address"
                value={address}
                onChange={(e) =>
                  setAddress(
                    e.target.value
                  )
                }
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">
                Donation Type{" "}
                <span className="text-danger">
                  *
                </span>
              </label>

              <select
                className="form-select"
                value={donationType}
                onChange={(e) => {
                  setDonationType(
                    e.target.value
                  );

                  setAmount("");
                  setOtherDetails("");
                }}
              >
                <option value="Cash">
                  Cash
                </option>

                <option value="Others">
                  Others
                </option>
              </select>
            </div>

            {donationType === "Cash" && (
              <div className="col-md-3">
                <label className="form-label">
                  Donation Amount{" "}
                  <span className="text-danger">
                    *
                  </span>
                </label>

                <input
                  type="number"
                  min="0"
                  className="form-control"
                  placeholder="1000"
                  value={amount}
                  onChange={(e) =>
                    setAmount(
                      e.target.value
                    )
                  }
                />
              </div>
            )}

            {donationType === "Others" && (
              <div className="col-md-3">
                <label className="form-label">
                  Donation Details{" "}
                  <span className="text-danger">
                    *
                  </span>
                </label>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Example: Clothes, Food, Medicine"
                  value={otherDetails}
                  onChange={(e) =>
                    setOtherDetails(
                      e.target.value
                    )
                  }
                />
              </div>
            )}

            <div className="col-md-3">
              <label className="form-label">
                Payment Method
              </label>

              <select
                className="form-select"
                value={paymentMethod}
                onChange={(e) =>
                  setPaymentMethod(
                    e.target.value
                  )
                }
              >
                <option>Cash</option>
                <option>bKash</option>
                <option>Nagad</option>
                <option>Rocket</option>
                <option>
                  Bank Transfer
                </option>
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label">
                Donation Date
              </label>

              <input
                type="date"
                className="form-control"
                value={donationDate}
                onChange={(e) =>
                  setDonationDate(
                    e.target.value
                  )
                }
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">
                Purpose
              </label>

              <input
                type="text"
                className="form-control"
                placeholder="General Fund"
                value={purpose}
                onChange={(e) =>
                  setPurpose(
                    e.target.value
                  )
                }
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">
                Donor Photo
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

            <div className="col-md-8">
              <label className="form-label">
                Remarks
              </label>

              <textarea
                className="form-control"
                rows={3}
                placeholder="Remarks (Optional)"
                value={remarks}
                onChange={(e) =>
                  setRemarks(
                    e.target.value
                  )
                }
              />
            </div>

          </div>

          <div className="mt-3">

            <button
              className="btn btn-success me-2"
              onClick={saveDonation}
              disabled={uploading}
            >
              {uploading
                ? "Uploading Photo..."
                : editingId
                ? "💾 Update Donation"
                : "➕ Save Donation"}
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
            SUMMARY
        =============================== */}

        <div className="row mb-4">

          <div className="col-md-4">
            <div className="card bg-success text-white shadow-sm">
              <div className="card-body">
                <h6>
                  Total Cash Donation
                </h6>

                <h3>
                  ৳ {totalDonation}
                </h3>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card bg-primary text-white shadow-sm">
              <div className="card-body">
                <h6>
                  Total Donations
                </h6>

                <h3>
                  {filteredDonations.length}
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
            🔍 Filter Donation
          </h5>

          <div className="row g-3">

            <div className="col-md-6">
              <label className="form-label">
                Search Donor
              </label>

              <input
                type="text"
                className="form-control"
                placeholder="Search by Name"
                value={searchName}
                onChange={(e) =>
                  setSearchName(
                    e.target.value
                  )
                }
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">
                Payment Method
              </label>

              <select
                className="form-select"
                value={filterMethod}
                onChange={(e) =>
                  setFilterMethod(
                    e.target.value
                  )
                }
              >
                <option value="">
                  All
                </option>

                <option>Cash</option>
                <option>bKash</option>
                <option>Nagad</option>
                <option>Rocket</option>
                <option>
                  Bank Transfer
                </option>
              </select>
            </div>

            <div className="col-md-2 d-flex align-items-end">
              <button
                className="btn btn-primary w-100"
                onClick={() =>
                  setShowReport(true)
                }
              >
                👁 Report
              </button>
            </div>

          </div>
        </div>

        {/* ===============================
            DONATION HISTORY
        =============================== */}

        <div className="card shadow-sm">

          <div className="card-header bg-dark text-white">
            <h5 className="mb-0">
              Donation History
            </h5>
          </div>

          <div className="table-responsive">

            <table className="table table-bordered table-hover mb-0">

              <thead className="table-dark">

                <tr>
                  <th>#</th>
                  <th>Photo</th>
                  <th>Donor</th>
                  <th>Phone</th>
                  <th>Type</th>
                  <th>Amount / Details</th>
                  <th>Method</th>
                  <th>Purpose</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>

              </thead>

              <tbody>

                {filteredDonations.length === 0 ? (

                  <tr>
                    <td
                      colSpan={10}
                      className="text-center"
                    >
                      No Donation Found
                    </td>
                  </tr>

                ) : (

                  filteredDonations.map(
                    (item, index) => (

                      <tr key={item.id}>

                        <td>
                          {index + 1}
                        </td>

                        <td>
                          {item.photo ? (
                            <img
                              src={item.photo}
                              alt={
                                item.donorName
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
                          {item.donorName}
                        </td>

                        <td>
                          {item.phone || "-"}
                        </td>

                        <td>
                          <span
                            className={`badge ${
                              item.donationType ===
                              "Cash"
                                ? "bg-success"
                                : "bg-info"
                            }`}
                          >
                            {
                              item.donationType
                            }
                          </span>
                        </td>

                        <td>
                          {item.donationType ===
                          "Cash"
                            ? `৳ ${
                                item.amount ||
                                "0"
                              }`
                            : item.otherDetails ||
                              "-"}
                        </td>

                        <td>
                          {
                            item.paymentMethod
                          }
                        </td>

                        <td>
                          {item.purpose || "-"}
                        </td>

                        <td>
                          {
                            item.donationDate ||
                            "-"
                          }
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
        </div>

        {/* =========================================================
            DONATION REPORT MODAL
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
                maxWidth: "1100px",
              }}
            >

              <div className="modal-content">

                {/* ===============================
                    MODAL HEADER
                =============================== */}

                <div className="modal-header">

                  <h5 className="modal-title">
                    📄 Donation Report
                  </h5>

                  <button
                    className="btn-close"
                    onClick={() =>
                      setShowReport(false)
                    }
                  />

                </div>

                {/* ===============================
                    REPORT AREA
                =============================== */}

                <div
                  className="modal-body"
                  style={{
                    background: "#eeeeee",
                    padding: "25px",
                    overflowX: "auto",
                  }}
                >

                  <div
                    ref={reportRef}
                    style={{
                      width: "210mm",
                      minHeight: "297mm",
                      margin: "0 auto",
                      background: "#ffffff",
                      position: "relative",
                      overflow: "hidden",
                      boxSizing: "border-box",
                      fontFamily:
                        '"Noto Sans Bengali", "Noto Sans", Arial, sans-serif',
                      color: "#222",
                      boxShadow:
                        "0 0 15px rgba(0,0,0,0.15)",
                    }}
                  >

                    {/* =================================================
                        NEW EXPENSE STYLE HEADER
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
                            transform:
                              "translateY(-50%)",
                            width: "18mm",
                            height: "18mm",
                            background:
                              "#ffffff",
                            borderRadius:
                              "50%",
                            display: "flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "center",
                            padding: "2px",
                          }}
                        >

                          <img
                            src="/logo.png"
                            alt="Badokhali Youth Foundation"
                            crossOrigin="anonymous"
                            style={{
                              width: "100%",
                              height: "100%",
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
                            textAlign: "center",
                            marginTop: "2mm",
                          }}
                        >

                          <div
                            style={{
                              fontSize: "35px",
                              fontWeight: 800,
                              lineHeight: 1.2,
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
                              fontSize: "25px",
                              fontWeight: 700,
                              lineHeight: 1.2,
                              marginTop: "2px",
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
                            right: "11mm",
                            top: "3mm",
                            fontSize: "10px",
                            fontWeight: 500,
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
                          height: "7mm",
                          display: "flex",
                          background:
                            "#ffffff",
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
                            background:
                              "#08aeea",
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

                    {/* ===============================
                        WATERMARK
                    =============================== */}

                    <img
                      src="/logo.png"
                      alt="Watermark"
                      crossOrigin="anonymous"
                      style={{
                        position:
                          "absolute",
                        top: "50%",
                        left: "50%",
                        transform:
                          "translate(-50%, -50%)",
                        width: "105mm",
                        height: "105mm",
                        objectFit:
                          "contain",
                        opacity: 0.045,
                        filter:
                          "grayscale(100%)",
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

                      {/* REPORT INFO */}

                      <div
                        style={{
                          display: "flex",
                          justifyContent:
                            "space-between",
                          fontSize: "13px",
                          marginBottom:
                            "5mm",
                        }}
                      >

                        <div>
                          <strong>
                            রিপোর্ট:
                          </strong>{" "}
                          Donation Collection
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
                          fontSize: "23px",
                          fontWeight: 800,
                          textDecoration:
                            "underline",
                          textUnderlineOffset:
                            "5px",
                          margin:
                            "0 0 7mm",
                        }}
                      >
                        Donation Report
                      </h2>

                      {/* FILTER INFO */}

                      {(searchName ||
                        filterMethod) && (

                        <div
                          style={{
                            border:
                              "1px solid #ccc",
                            padding:
                              "8px 12px",
                            marginBottom:
                              "15px",
                            fontSize:
                              "13px",
                            background:
                              "#f8f9fa",
                          }}
                        >

                          <strong>
                            Filter Applied:
                          </strong>{" "}

                          {searchName && (
                            <>
                              Donor:{" "}
                              <strong>
                                {searchName}
                              </strong>
                            </>
                          )}

                          {searchName &&
                            filterMethod && (
                              <>
                                {" "}
                                &nbsp; | &nbsp;
                              </>
                            )}

                          {filterMethod && (
                            <>
                              Payment Method:{" "}
                              <strong>
                                {
                                  filterMethod
                                }
                              </strong>
                            </>
                          )}

                        </div>
                      )}

                      {/* ===============================
                          TABLE
                      =============================== */}

                      <table
                        style={{
                          width: "100%",
                          borderCollapse:
                            "collapse",
                          fontSize: "11px",
                          tableLayout:
                            "fixed",
                        }}
                      >

                        <thead>

                          <tr
                            style={{
                              background:
                                "#f1f1f1",
                            }}
                          >

                            <th
                              style={{
                                border:
                                  "1px solid #222",
                                padding:
                                  "7px 4px",
                                width:
                                  "30px",
                              }}
                            >
                              #
                            </th>

                            <th
                              style={{
                                border:
                                  "1px solid #222",
                                padding:
                                  "7px 4px",
                                width:
                                  "50px",
                              }}
                            >
                              Photo
                            </th>

                            <th
                              style={{
                                border:
                                  "1px solid #222",
                                padding:
                                  "7px 5px",
                                width:
                                  "105px",
                              }}
                            >
                              Donor
                            </th>

                            <th
                              style={{
                                border:
                                  "1px solid #222",
                                padding:
                                  "7px 5px",
                                width:
                                  "90px",
                              }}
                            >
                              Phone
                            </th>

                            <th
                              style={{
                                border:
                                  "1px solid #222",
                                padding:
                                  "7px 5px",
                                width:
                                  "65px",
                              }}
                            >
                              Type
                            </th>

                            <th
                              style={{
                                border:
                                  "1px solid #222",
                                padding:
                                  "7px 5px",
                                width:
                                  "120px",
                              }}
                            >
                              Amount / Details
                            </th>

                            <th
                              style={{
                                border:
                                  "1px solid #222",
                                padding:
                                  "7px 5px",
                                width:
                                  "85px",
                              }}
                            >
                              Method
                            </th>

                            <th
                              style={{
                                border:
                                  "1px solid #222",
                                padding:
                                  "7px 5px",
                                width:
                                  "90px",
                              }}
                            >
                              Purpose
                            </th>

                            <th
                              style={{
                                border:
                                  "1px solid #222",
                                padding:
                                  "7px 5px",
                                width:
                                  "75px",
                              }}
                            >
                              Date
                            </th>

                          </tr>

                        </thead>

                        <tbody>

                          {filteredDonations.length ===
                          0 ? (

                            <tr>

                              <td
                                colSpan={9}
                                style={{
                                  border:
                                    "1px solid #222",
                                  textAlign:
                                    "center",
                                  padding:
                                    "20px",
                                }}
                              >
                                No Donation Found
                              </td>

                            </tr>

                          ) : (

                            filteredDonations.map(
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
                                        "1px solid #222",
                                      padding:
                                        "6px 4px",
                                      textAlign:
                                        "center",
                                    }}
                                  >
                                    {index + 1}
                                  </td>

                                  <td
                                    style={{
                                      border:
                                        "1px solid #222",
                                      padding:
                                        "4px",
                                      textAlign:
                                        "center",
                                    }}
                                  >

                                    {item.photo ? (

                                      <img
                                        src={
                                          item.photo
                                        }
                                        alt={
                                          item.donorName
                                        }
                                        crossOrigin="anonymous"
                                        width="35"
                                        height="35"
                                        style={{
                                          objectFit:
                                            "cover",
                                          borderRadius:
                                            "50%",
                                        }}
                                      />

                                    ) : (
                                      "👤"
                                    )}

                                  </td>

                                  <td
                                    style={{
                                      border:
                                        "1px solid #222",
                                      padding:
                                        "6px 5px",
                                      wordBreak:
                                        "break-word",
                                    }}
                                  >
                                    {
                                      item.donorName
                                    }
                                  </td>

                                  <td
                                    style={{
                                      border:
                                        "1px solid #222",
                                      padding:
                                        "6px 5px",
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
                                        "1px solid #222",
                                      padding:
                                        "6px 5px",
                                      textAlign:
                                        "center",
                                    }}
                                  >
                                    {
                                      item.donationType
                                    }
                                  </td>

                                  <td
                                    style={{
                                      border:
                                        "1px solid #222",
                                      padding:
                                        "6px 5px",
                                      wordBreak:
                                        "break-word",
                                    }}
                                  >
                                    {item.donationType ===
                                    "Cash"
                                      ? `৳ ${
                                          item.amount ||
                                          "0"
                                        }`
                                      : item.otherDetails ||
                                        "-"}
                                  </td>

                                  <td
                                    style={{
                                      border:
                                        "1px solid #222",
                                      padding:
                                        "6px 5px",
                                    }}
                                  >
                                    {
                                      item.paymentMethod
                                    }
                                  </td>

                                  <td
                                    style={{
                                      border:
                                        "1px solid #222",
                                      padding:
                                        "6px 5px",
                                      wordBreak:
                                        "break-word",
                                    }}
                                  >
                                    {
                                      item.purpose ||
                                      "-"
                                    }
                                  </td>

                                  <td
                                    style={{
                                      border:
                                        "1px solid #222",
                                      padding:
                                        "6px 5px",
                                      textAlign:
                                        "center",
                                    }}
                                  >
                                    {
                                      item.donationDate ||
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
                          SUMMARY
                      =============================== */}

                      <div
                        style={{
                          display: "flex",
                          justifyContent:
                            "flex-end",
                          marginTop:
                            "18px",
                        }}
                      >

                        <div
                          style={{
                            width:
                              "260px",
                            borderTop:
                              "2px solid #222",
                            borderBottom:
                              "1px solid #222",
                            padding:
                              "8px 0",
                            fontSize:
                              "14px",
                          }}
                        >

                          <div
                            style={{
                              display:
                                "flex",
                              justifyContent:
                                "space-between",
                            }}
                          >

                            <strong>
                              Total Cash Donation:
                            </strong>

                            <strong>
                              ৳{" "}
                              {
                                totalDonation
                              }
                            </strong>

                          </div>

                        </div>

                      </div>

                      {/* ===============================
                          SIGNATURE / SEAL
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

                        {/* LEFT */}

                        <div
                          style={{
                            width: "50%",
                            paddingLeft:
                              "10px",
                            display:
                              "flex",
                            alignItems:
                              "center",
                            gap: "10px",
                          }}
                        >

                          <img
                            src="/roundseal.png"
                            alt="Seal"
                            width="90"
                            height="90"
                            style={{
                              objectFit:
                                "contain",
                            }}
                          />

                          <div
                            style={{
                              display:
                                "inline-block",
                              border:
                                "2px solid #0b6ff3",
                              padding:
                                "5px 12px",
                              fontSize:
                                "13px",
                              fontWeight:
                                "bold",
                              color:
                                "#0b6ff3",
                              transform:
                                "rotate(-6deg)",
                              opacity: 0.8,
                            }}
                          >
                            RECEIVED
                          </div>

                        </div>

                        {/* RIGHT */}

                        <div
                          style={{
                            width: "50%",
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

                    {/* =================================================
                        NEW EXPENSE STYLE FOOTER
                    ================================================= */}

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
                          gap: "8mm",
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

                {/* ===============================
                    MODAL FOOTER
                =============================== */}

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

export default Donation;