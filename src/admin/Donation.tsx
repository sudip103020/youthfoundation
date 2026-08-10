
import { useEffect, useState } from "react";
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
const CLOUDINARY_UPLOAD_PRESET = "badokhali_youth_foundation";

const Donation = () => {
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

      // Latest first
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

  const uploadPhoto = async (
    file: File
  ) => {
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
        throw new Error(
          "Photo upload failed"
        );
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
    // Name mandatory
    if (!donorName.trim()) {
      alert("Donor Name is required");
      return;
    }

    // Donation Type mandatory
    if (!donationType) {
      alert("Donation Type is required");
      return;
    }

    // Cash হলে amount mandatory
    if (
      donationType === "Cash" &&
      !amount.trim()
    ) {
      alert(
        "Amount is required for Cash donation"
      );
      return;
    }

    // Others হলে details mandatory
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

      // New photo upload
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

        // Cash হলে amount থাকবে
        amount:
          donationType === "Cash"
            ? amount.trim()
            : "",

        donationType,

        // Others হলে details থাকবে
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

      // ===============================
      // UPDATE
      // ===============================

      if (editingId) {
        await updateDoc(
          doc(
            db,
            "donations",
            editingId
          ),
          {
            ...donationData,
            updatedAt:
              serverTimestamp(),
          }
        );

        alert(
          "Donation Updated Successfully"
        );
      }

      // ===============================
      // ADD
      // ===============================

      else {
        await addDoc(
          collection(db, "donations"),
          {
            ...donationData,
            createdAt:
              serverTimestamp(),
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

  const handleEdit = (
    item: Donation
  ) => {
    setEditingId(item.id);

    setDonorName(
      item.donorName || ""
    );

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

  const handleDelete = async (
    id: string
  ) => {
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

            {/* DONOR NAME */}

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

            {/* PHONE */}

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

            {/* ADDRESS */}

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

            {/* DONATION TYPE */}

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

                  // Type change করলে
                  // পুরোনো value clear
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

            {/* CASH AMOUNT */}

            {donationType ===
              "Cash" && (

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

            {/* OTHER DONATION */}

            {donationType ===
              "Others" && (

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

            {/* PAYMENT METHOD */}

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

                <option>
                  Cash
                </option>

                <option>
                  bKash
                </option>

                <option>
                  Nagad
                </option>

                <option>
                  Rocket
                </option>

                <option>
                  Bank Transfer
                </option>

              </select>

            </div>

            {/* DONATION DATE */}

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

            {/* PURPOSE */}

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

            {/* PHOTO */}

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

              {/* Existing Photo */}

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

            {/* REMARKS */}

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

          {/* BUTTONS */}

          <div className="mt-3">

            <button
              className="btn btn-success me-2"
              onClick={
                saveDonation
              }
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
                onClick={
                  resetForm
                }
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

                <option>
                  Cash
                </option>

                <option>
                  bKash
                </option>

                <option>
                  Nagad
                </option>

                <option>
                  Rocket
                </option>

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

                {filteredDonations.length ===
                0 ? (

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

                      <tr
                        key={item.id}
                      >

                        <td>
                          {index + 1}
                        </td>

                        {/* PHOTO */}

                        <td>

                          {item.photo ? (

                            <img
                              src={
                                item.photo
                              }
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
                          {
                            item.donorName
                          }
                        </td>

                        <td>
                          {
                            item.phone ||
                            "-"
                          }
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
                          "Cash" ? (

                            <>
                              ৳{" "}
                              {
                                item.amount ||
                                "0"
                              }
                            </>

                          ) : (

                            item.otherDetails ||
                            "-"

                          )}

                        </td>

                        <td>
                          {
                            item.paymentMethod
                          }
                        </td>

                        <td>
                          {
                            item.purpose ||
                            "-"
                          }
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

        </div>

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
                    Donation Report
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

                <div
                  className="modal-body"
                  style={{
                    position:
                      "relative",
                    overflow:
                      "hidden",
                  }}
                >

                  {/* WATERMARK */}

                  <img
                    src="/logo.png"
                    alt="Watermark"
                    style={{
                      position:
                        "absolute",
                      top: "50%",
                      left: "50%",
                      transform:
                        "translate(-50%, -50%)",
                      width: "420px",
                      opacity: 0.1,
                      zIndex: 0,
                    }}
                  />

                  <div
                    style={{
                      position:
                        "relative",
                      zIndex: 1,
                    }}
                  >

                    {/* HEADER */}

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
                        Donation Report
                      </h5>

                    </div>

                    {/* REPORT TABLE */}

                    <div className="table-responsive">

                      <table className="table table-bordered">

                        <thead className="table-light">

                          <tr>

                            <th>
                              #
                            </th>

                            <th>
                              Photo
                            </th>

                            <th>
                              Donor
                            </th>

                            <th>
                              Phone
                            </th>

                            <th>
                              Type
                            </th>

                            <th>
                              Amount / Details
                            </th>

                            <th>
                              Method
                            </th>

                            <th>
                              Date
                            </th>

                          </tr>

                        </thead>

                        <tbody>

                          {filteredDonations.map(
                            (
                              item,
                              index
                            ) => (

                              <tr
                                key={
                                  item.id
                                }
                              >

                                <td>
                                  {
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
                                        item.donorName
                                      }
                                      width="40"
                                      height="40"
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

                                <td>
                                  {
                                    item.donorName
                                  }
                                </td>

                                <td>
                                  {
                                    item.phone ||
                                    "-"
                                  }
                                </td>

                                <td>
                                  {
                                    item.donationType
                                  }
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
                                  {
                                    item.donationDate ||
                                    "-"
                                  }
                                </td>

                              </tr>

                            )
                          )}

                        </tbody>

                      </table>

                    </div>

                    <h5 className="text-end">

                      Total Cash Donation :
                      ৳{" "}
                      {totalDonation}

                    </h5>

                    {/* FOOTER */}

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

      </div>

    </AdminLayout>
  );
};

export default Donation;

