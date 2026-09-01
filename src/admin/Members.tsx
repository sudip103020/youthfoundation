import { useState } from "react";
import AdminLayout from "./AdminLayout";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";

const Members = () => {
  const [name, setName] = useState("");
  const [nameBn, setNameBn] = useState("");

  const [designation, setDesignation] = useState("");
  const [designationBn, setDesignationBn] = useState("");

  const [memberType, setMemberType] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [address, setAddress] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [status, setStatus] = useState("Active");

  // ============================================
  // MONTHLY SUBSCRIPTION AMOUNT
  // ============================================

  const [monthlyAmount, setMonthlyAmount] = useState("100");

  // ============================================
  // SUBMIT
  // ============================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // ==========================================
      // VALIDATE MONTHLY AMOUNT
      // ==========================================

      const amount = Number(monthlyAmount);

      if (!amount || amount <= 0) {
        alert("Please enter a valid monthly subscription amount.");
        return;
      }

      // ==========================================
      // UPLOAD PHOTO
      // ==========================================

      const photoUrl = await uploadPhoto();

      // ==========================================
      // SAVE MEMBER
      // ==========================================

      await addDoc(collection(db, "members"), {
        // ----------------------------------------
        // NAME
        // ----------------------------------------

        name,
        nameBn,

        // ----------------------------------------
        // DESIGNATION
        // ----------------------------------------

        designation,
        designationBn,

        // ----------------------------------------
        // MEMBER TYPE
        // ----------------------------------------

        memberType,

        // ----------------------------------------
        // PERSONAL INFORMATION
        // ----------------------------------------

        phone,
        dateOfBirth: dob,
        bloodGroup,
        address,
        email,

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

      alert("Member added successfully!");

      // ==========================================
      // RESET FORM
      // ==========================================

      setName("");
      setNameBn("");

      setDesignation("");
      setDesignationBn("");

      setMemberType("");

      setPhone("");
      setDob("");
      setBloodGroup("");
      setAddress("");
      setEmail("");

      setMonthlyAmount("100");

      setPhoto(null);
      setStatus("Active");

      // Reset file input visually
      const fileInput = document.getElementById(
        "memberPhoto"
      ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = "";
      }

    } catch (error) {
      console.error("Add member error:", error);

      alert("Failed to save member.");
    }
  };

  // ============================================
  // CLOUDINARY PHOTO UPLOAD
  // ============================================

  const uploadPhoto = async () => {
    if (!photo) return "";

    // 5MB validation
    if (photo.size > 5 * 1024 * 1024) {
      alert("Photo size must be less than 5MB.");
      throw new Error("Photo too large");
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

  // ============================================
  // RETURN
  // ============================================

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
                    NAME
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
                    required
                  />

                </div>

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
                ================================== */}

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
                    <option>Social Service Secretary</option>
                    <option>
                      Education and Literature Secretary
                    </option>
                    <option>Cultural Secretary</option>
                    <option>
                      Information and Technology Secretary
                    </option>
                    <option>Office Secretary</option>
                    <option>Sports Secretary</option>
                    <option>
                      Publicity and Publication Secretary
                    </option>

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

                    <option>
                      Executive Member
                    </option>

                    <option>
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
                        setMonthlyAmount(
                          e.target.value
                        )
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
                    MOBILE
                ================================== */}

                <div className="col-md-6 mb-3">

                  <label className="form-label">
                    Mobile Number
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value)
                    }
                    required
                  />

                </div>

                {/* ==================================
                    DOB
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

                    <option>
                      Active
                    </option>

                    <option>
                      Inactive
                    </option>

                  </select>

                </div>

              </div>

              {/* ==================================
                  SAVE BUTTON
              ================================== */}

              <button
                type="submit"
                className="btn btn-success"
              >
                Save Member
              </button>

            </form>

          </div>

        </div>

      </div>
    </AdminLayout>
  );
};

export default Members;