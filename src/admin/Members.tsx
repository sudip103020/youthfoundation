import { useState } from "react";
import AdminLayout from "./AdminLayout";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";

const Members = () => {
  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const [memberType, setMemberType] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [address, setAddress] = useState("");
 // const [photo, setPhoto] = useState<File | null>(null);
  const [status, setStatus] = useState("Active");

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    await addDoc(collection(db, "members"), {
      name,
      designation,
      memberType,
      phone,
      dateOfBirth: dob,
      bloodGroup,
      address,
      email,
      status,

      // Photo পরে Storage-এ Upload করব
      photo: "",

      joiningDate: new Date().toISOString(),

      createdBy: auth.currentUser?.email || "",

      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    alert("Member added successfully!");

    // Reset Form
    setName("");
    setDesignation("");
    setMemberType("");
    setPhone("");
    setDob("");
    setBloodGroup("");
    setAddress("");
    setEmail("");
    
    setStatus("Active");

  } catch (error) {
    console.error(error);
    alert("Failed to save member.");
  }
};

  return (
    <AdminLayout>
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Members</h2>
        </div>

        <div className="card shadow-sm">
          <div className="card-body">
            <h5 className="mb-4">Add New Member</h5>

            <form onSubmit={handleSubmit}>
              <div className="row">
                {/* Full Name */}
                <div className="col-md-6 mb-3">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                {/* Designation */}
                <div className="col-md-6 mb-3">
                  <label className="form-label">Designation</label>

                  <select
                    className="form-select"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    required
                  >
                    <option value="">Select Designation</option>
                    <option>President</option>
                    <option>Vice President</option>
                    <option>General Secretary</option>
                    <option>Joint Secretary</option>
                    <option>Treasurer</option>
                    <option>Legal Secretary</option>
                    <option>Health Secretary</option>
                    <option>Organizing Secretary</option>
                    <option>Social Service Secretary</option>
                    <option>Education and Literature Secretary</option>
                    <option>Cultural Secretary</option>
                    <option>Information and Technology Secretary</option>
                    <option>Office Secretary</option>
                    <option>Sports Secretary</option>
                    <option>Publicity and Publication Secretary</option>
                  </select>
                </div>

                {/* Member Type */}
                <div className="col-md-6 mb-3">
                  <label className="form-label">Member Type</label>

                  <select
                    className="form-select"
                    value={memberType}
                    onChange={(e) => setMemberType(e.target.value)}
                    required
                  >
                    <option value="">Select Member Type</option>
                    
                    <option>Executive Member</option>
                    <option>General Member</option>
                    
                  </select>
                </div>

                {/* Mobile */}
                <div className="col-md-6 mb-3">
                  <label className="form-label">Mobile Number</label>
                  <input
                    type="text"
                    className="form-control"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>

                {/* Date of Birth */}
                <div className="col-md-6 mb-3">
                  <label className="form-label">Date of Birth</label>
                  <input
                    type="date"
                    className="form-control"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    required
                  />
                </div>

                {/* Email */}
                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    Email <small>(Optional)</small>
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {/* Blood Group */}
                <div className="col-md-6 mb-3">
                  <label className="form-label">Blood Group</label>

                  <select
                    className="form-select"
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                  >
                    <option value="">Select Blood Group</option>
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

                {/* Address */}
                <div className="col-md-6 mb-3">
                  <label className="form-label">Address</label>

                  <textarea
                    className="form-control"
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter Address"
                  />
                </div>

                {/* Photo */}
                {/* <div className="col-md-6 mb-3">
                  <label className="form-label">
                    Photo <small>(Optional)</small>
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={(e) =>
                      setPhoto(e.target.files ? e.target.files[0] : null)
                    }
                  />
                </div> */}

                {/* Status */}
                <div className="col-md-6 mb-3">
                  <label className="form-label">Status</label>

                  <select
                    className="form-select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn btn-success">
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
