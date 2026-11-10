
import { useState } from "react";

import AdminLayout from "./AdminLayout";

import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "../firebase/firebase";

// =====================================================
// MEMBERS COMPONENT
// =====================================================

const Members = () => {

  // ============================================
  // BASIC INFORMATION
  // ============================================

  const [name, setName] = useState("");
  const [nameBn, setNameBn] = useState("");

  // ============================================
  // MEMBER CATEGORY
  // ============================================

  const [memberCategory, setMemberCategory] =
    useState("executive");

  // ============================================
  // DESIGNATION
  // ============================================

  const [designation, setDesignation] = useState("");
  const [designationBn, setDesignationBn] = useState("");

  // ============================================
  // SHORT INTRODUCTION
  // ============================================

  const [shortBio, setShortBio] = useState("");
  const [shortBioBn, setShortBioBn] = useState("");

  // ============================================
  // MEMBER TYPE
  // ============================================

  const [memberType, setMemberType] = useState("");

  // ============================================
  // PERSONAL INFORMATION
  // ============================================

  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [address, setAddress] = useState("");

  // ============================================
  // PHOTO & STATUS
  // ============================================

  const [photo, setPhoto] = useState<File | null>(null);
  const [status, setStatus] = useState("Active");

  // ============================================
  // MONTHLY SUBSCRIPTION
  // ============================================

  const [monthlyAmount, setMonthlyAmount] = useState("100");

  // ============================================
  // SUBMIT LOADING
  // ============================================

  const [saving, setSaving] = useState(false);

  // =====================================================
  // CLOUDINARY PHOTO UPLOAD
  // =====================================================

  const uploadPhoto = async () => {

    if (!photo) return "";

    // 5MB VALIDATION
    if (photo.size > 5 * 1024 * 1024) {
      throw new Error("Photo size must be less than 5MB.");
    }

    const formData = new FormData();

    formData.append("file", photo);

    formData.append(
      "upload_preset",
      "badokhali_youth_foundation"
    );

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dvpfixfd/image/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    if (!res.ok) {
      throw new Error("Photo upload failed");
    }

    const data = await res.json();

    return data.secure_url || "";
  };

  // =====================================================
  // RESET FORM
  // =====================================================

  const resetForm = () => {

    setName("");
    setNameBn("");

    setMemberCategory("executive");

    setDesignation("");
    setDesignationBn("");

    setShortBio("");
    setShortBioBn("");

    setMemberType("");

    setPhone("");
    setDob("");
    setEmail("");
    setBloodGroup("");
    setAddress("");

    setMonthlyAmount("100");

    setPhoto(null);
    setStatus("Active");

    // RESET FILE INPUT

    const fileInput = document.getElementById(
      "memberPhoto"
    ) as HTMLInputElement | null;

    if (fileInput) {
      fileInput.value = "";
    }
  };

  // =====================================================
  // SUBMIT FORM
  // =====================================================

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {

    e.preventDefault();

    if (saving) return;

    try {

      setSaving(true);

      // ==========================================
      // VALIDATE NAME
      // ==========================================

      if (!name.trim() || !nameBn.trim()) {
        alert("Please enter member name in both languages.");
        return;
      }

      // ==========================================
      // VALIDATE DESIGNATION
      // ONLY FOR EXECUTIVE MEMBERS
      // ==========================================

      if (
        memberCategory === "executive" &&
        (!designation || !designationBn.trim())
      ) {
        alert("Please select and enter member designation.");
        return;
      }

      // ==========================================
      // VALIDATE MEMBER TYPE
      // ==========================================

      if (!memberType) {
        alert("Please select Member Type.");
        return;
      }

      // ==========================================
      // VALIDATE MONTHLY AMOUNT
      // ==========================================

      const amount = Number(monthlyAmount);

      if (!Number.isFinite(amount) || amount <= 0) {
        alert("Please enter a valid monthly subscription amount.");
        return;
      }

      // ==========================================
      // VALIDATE PHOTO SIZE
      // ==========================================

      if (photo && photo.size > 5 * 1024 * 1024) {
        alert("Photo size must be less than 5MB.");
        return;
      }

      // ==========================================
      // UPLOAD PHOTO
      // ==========================================

      const photoUrl = await uploadPhoto();

      // ==========================================
      // SAVE MEMBER TO FIREBASE
      // ==========================================

      await addDoc(collection(db, "members"), {

        // ----------------------------------------
        // NAME
        // ----------------------------------------

        name: name.trim(),
        nameBn: nameBn.trim(),

        // ----------------------------------------
        // MEMBER CATEGORY
        // ----------------------------------------

        memberCategory,

        // ----------------------------------------
        // DESIGNATION
        // ----------------------------------------

        designation:
          memberCategory === "executive"
            ? designation
            : "",

        designationBn:
          memberCategory === "executive"
            ? designationBn.trim()
            : "",

        // ----------------------------------------
        // SHORT INTRODUCTION
        // ----------------------------------------

        shortBio: shortBio.trim(),
        shortBioBn: shortBioBn.trim(),

        // ----------------------------------------
        // MEMBER TYPE
        // ----------------------------------------

        memberType,

        // ----------------------------------------
        // PERSONAL INFORMATION
        // ----------------------------------------

        phone: phone.trim(),

        dateOfBirth: dob,

        email: email.trim(),

        bloodGroup,

        address: address.trim(),

        // ----------------------------------------
        // MONTHLY SUBSCRIPTION
        // ----------------------------------------

        monthlyAmount: amount,

        // ----------------------------------------
        // STATUS
        // ----------------------------------------

        status,

        // ----------------------------------------
        // PHOTO
        // ----------------------------------------

        photo: photoUrl,

        // ----------------------------------------
        // JOINING DATE
        // ----------------------------------------

        joiningDate: new Date().toISOString(),

        // ----------------------------------------
        // CREATED BY
        // ----------------------------------------

        createdBy: auth.currentUser?.email || "",

        // ----------------------------------------
        // TIMESTAMPS
        // ----------------------------------------

        createdAt: serverTimestamp(),

        updatedAt: serverTimestamp(),

      });

      // ==========================================
      // SUCCESS
      // ==========================================

      alert("Member added successfully!");

      // ==========================================
      // RESET FORM
      // ==========================================

      resetForm();

    } catch (error) {

      console.error("Add member error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to save member."
      );

    } finally {

      setSaving(false);

    }
  };

  // =====================================================
  // RETURN
  // =====================================================

  return (

    <AdminLayout>

      <div className="container-fluid">

        {/* ======================================
            PAGE HEADER
        ====================================== */}

        <div className="d-flex justify-content-between align-items-center mb-4">

          <h2>Members</h2>

        </div>

        {/* ======================================
            MEMBER FORM
        ====================================== */}

        <div className="card shadow-sm">

          <div className="card-body">

            <h5 className="mb-4">
              Add New Member
            </h5>

            <form onSubmit={handleSubmit}>

              <div className="row">

                {/* ==================================
                    MEMBER CATEGORY
                ================================== */}

                <div className="col-md-6 mb-3">

                  <label className="form-label fw-semibold">
                    Member Category
                  </label>

                  <select
                    className="form-select"
                    value={memberCategory}
                    onChange={(e) => {

                      const value = e.target.value;

                      setMemberCategory(value);

                      if (value !== "executive") {
                        setDesignation("");
                        setDesignationBn("");
                      }

                    }}
                    required
                  >

                    <option value="executive">
                      Executive Member (কার্যকরী সদস্য)
                    </option>

                    <option value="founder">
                      Founder Member (প্রতিষ্ঠাতা সদস্য)
                    </option>

                    <option value="associate">
                      Associate Member (সহযোগী সদস্য)
                    </option>

                  </select>

                  <small className="text-muted">
                    Select the member's category.
                  </small>

                </div>

                {/* ==================================
                    NAME ENGLISH
                ================================== */}

                <div className="col-md-6 mb-3">

                  <label className="form-label">
                    Full Name (English)
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                    placeholder="Enter full name"
                    required
                  />

                </div>

                {/* ==================================
                    NAME BANGLA
                ================================== */}

                <div className="col-md-6 mb-3">

                  <label className="form-label">
                    Full Name (বাংলা)
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    value={nameBn}
                    onChange={(e) =>
                      setNameBn(e.target.value)
                    }
                    placeholder="বাংলায় নাম লিখুন"
                    required
                  />

                </div>

                {/* ==================================
                    DESIGNATION
                    ONLY EXECUTIVE
                ================================== */}

                {memberCategory === "executive" && (

                  <>

                    <div className="col-md-6 mb-3">

                      <label className="form-label">
                        Designation (English)
                      </label>

                      <select
                        className="form-select"
                        value={designation}
                        onChange={(e) =>
                          setDesignation(e.target.value)
                        }
                        required
                      >

                        <option value="">
                          Select Designation
                        </option>

                        <option>President</option>

                        <option>Vice President</option>

                        <option>General Secretary</option>

                        <option>Joint Secretary</option>

                        <option>Treasurer</option>

                        <option>Legal Secretary</option>

                        <option>Health Secretary</option>

                        <option>Organizing Secretary</option>

                        <option>Social Welfare Secretary</option>

                        <option>Education and Literature Secretary</option>

                        <option>Cultural Secretary</option>

                        <option>Information and Technology Secretary</option>

                        <option>Office Secretary</option>

                        <option>Sports Secretary</option>

                        <option>Publicity and Publication Secretary</option>

                        <option>Women Affairs Secretary</option>

                        <option>Executive Member</option>

                      </select>

                    </div>

                    <div className="col-md-6 mb-3">

                      <label className="form-label">
                        Designation (বাংলা)
                      </label>

                      <input
                        type="text"
                        className="form-control"
                        value={designationBn}
                        onChange={(e) =>
                          setDesignationBn(e.target.value)
                        }
                        placeholder="বাংলায় পদবি লিখুন"
                        required
                      />

                    </div>

                  </>

                )}

                {/* ==================================
                    MEMBER TYPE
                ================================== */}

                <div className="col-md-6 mb-3">

                  <label className="form-label">
                    Member Type
                  </label>

                  <select
                    className="form-select"
                    value={memberType}
                    onChange={(e) =>
                      setMemberType(e.target.value)
                    }
                    required
                  >

                    <option value="">
                      Select Member Type
                    </option>

                    <option value="Executive Member">
                      Executive Member
                    </option>

                    <option value="General Member">
                      General Member
                    </option>

                  </select>

                </div>

                {/* ==================================
                    MONTHLY AMOUNT
                ================================== */}

                <div className="col-md-6 mb-3">

                  <label className="form-label fw-semibold">
                    Monthly Subscription Amount
                  </label>

                  <div className="input-group">

                    <span className="input-group-text">
                      ৳
                    </span>

                    <input
                      type="number"
                      className="form-control"
                      value={monthlyAmount}
                      onChange={(e) =>
                        setMonthlyAmount(e.target.value)
                      }
                      min="1"
                      step="1"
                      placeholder="100"
                      required
                    />

                  </div>

                  <small className="text-muted">
                    Example: ৳100 or ৳300
                  </small>

                </div>

                {/* ==================================
                    SHORT INTRODUCTION ENGLISH
                ================================== */}

                <div className="col-md-6 mb-3">

                  <label className="form-label fw-semibold">
                    Short Introduction (English)
                    <small className="text-muted">
                      {" "} (Optional)
                    </small>
                  </label>

                  <textarea
                    className="form-control"
                    rows={3}
                    value={shortBio}
                    onChange={(e) =>
                      setShortBio(e.target.value)
                    }
                    placeholder="Write a short introduction..."
                  />

                </div>

                {/* ==================================
                    SHORT INTRODUCTION BANGLA
                ================================== */}

                <div className="col-md-6 mb-3">

                  <label className="form-label fw-semibold">
                    সংক্ষিপ্ত পরিচিতি (বাংলা)
                    <small className="text-muted">
                      {" "} (ঐচ্ছিক)
                    </small>
                  </label>

                  <textarea
                    className="form-control"
                    rows={3}
                    value={shortBioBn}
                    onChange={(e) =>
                      setShortBioBn(e.target.value)
                    }
                    placeholder="সদস্যের সংক্ষিপ্ত পরিচিতি লিখুন..."
                  />

                </div>

                {/* ==================================
                    MOBILE
                ================================== */}

                <div className="col-md-6 mb-3">

                  <label className="form-label">
                    Mobile Number
                  </label>

                  <input
                    type="tel"
                    className="form-control"
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value)
                    }
                    placeholder="Enter mobile number"
                    required
                  />

                </div>

                {/* ==================================
                    DATE OF BIRTH
                ================================== */}

                <div className="col-md-6 mb-3">

                  <label className="form-label">
                    Date of Birth
                  </label>

                  <input
                    type="date"
                    className="form-control"
                    value={dob}
                    onChange={(e) =>
                      setDob(e.target.value)
                    }
                    required
                  />

                </div>

                {/* ==================================
                    EMAIL
                ================================== */}

                <div className="col-md-6 mb-3">

                  <label className="form-label">
                    Email <small>(Optional)</small>
                  </label>

                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder="Enter email address"
                  />

                </div>

                {/* ==================================
                    BLOOD GROUP
                ================================== */}

                <div className="col-md-6 mb-3">

                  <label className="form-label">
                    Blood Group
                  </label>

                  <select
                    className="form-select"
                    value={bloodGroup}
                    onChange={(e) =>
                      setBloodGroup(e.target.value)
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
                    <option>Unknown</option>

                  </select>

                </div>

                {/* ==================================
                    ADDRESS
                ================================== */}

                <div className="col-md-6 mb-3">

                  <label className="form-label">
                    Address
                  </label>

                  <textarea
                    className="form-control"
                    rows={3}
                    value={address}
                    onChange={(e) =>
                      setAddress(e.target.value)
                    }
                    placeholder="Enter Address"
                  />

                </div>

                {/* ==================================
                    PHOTO
                ================================== */}

                <div className="col-md-6 mb-3">

                  <label className="form-label">
                    Member Photo
                  </label>

                  <input
                    id="memberPhoto"
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={(e) =>
                      setPhoto(
                        e.target.files
                          ? e.target.files[0]
                          : null
                      )
                    }
                  />

                  <small className="text-muted">
                    Maximum size: 5MB
                  </small>

                  {photo && (
                    <div className="mt-2">

                      <small className="text-success">
                        Selected: {photo.name}
                      </small>

                    </div>
                  )}

                </div>

                {/* ==================================
                    STATUS
                ================================== */}

                <div className="col-md-6 mb-3">

                  <label className="form-label">
                    Status
                  </label>

                  <select
                    className="form-select"
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value)
                    }
                  >

                    <option value="Active">
                      Active
                    </option>

                    <option value="Inactive">
                      Inactive
                    </option>

                  </select>

                </div>

              </div>

              {/* ==================================
                  SAVE BUTTON
              ================================== */}

              <div className="mt-3">

                <button
                  type="submit"
                  className="btn btn-success px-4"
                  disabled={saving}
                >

                  {saving ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      />

                      Saving...

                    </>
                  ) : (
                    <>
                      <i className="bi bi-person-plus-fill me-2" />

                      Save Member
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>

      </div>

    </AdminLayout>

  );

};

export default Members;
