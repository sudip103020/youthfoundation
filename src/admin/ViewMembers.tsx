import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import AdminLayout from "./AdminLayout";

interface Member {
  id: string;
  name: string;
  nameBn?: string;

  designation: string;
  designationBn?: string;

  memberType: string;
  phone: string;
  dateOfBirth: string;
  bloodGroup: string;
  address: string;
  email: string;
  photo: string;
  status: string;
}

const ViewMembers = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [newPhoto, setNewPhoto] = useState<File | null>(null);

  const fetchMembers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "members"));

      const memberList: Member[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Member, "id">),
      }));

      setMembers(memberList);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this member?",
    );

    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "members", id));

      alert("Member deleted successfully.");

      fetchMembers();
    } catch (error) {
      console.error(error);
      alert("Failed to delete member.");
    }
  };

  const handleEdit = (member: Member) => {
    setSelectedMember(member);
    setShowModal(true);
  };

  const uploadPhoto = async () => {
  if (!newPhoto) return selectedMember?.photo || "";

  const formData = new FormData();
  formData.append("file", newPhoto);
  formData.append("upload_preset", "badokhali_youth_foundation");

  const res = await fetch(
    "https://api.cloudinary.com/v1_1/dvpfixfd/image/upload",
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await res.json();

  return data.secure_url;
};

  const handleUpdate = async () => {
  if (!selectedMember) return;

  try {

    const photoUrl = await uploadPhoto();

    await updateDoc(doc(db, "members", selectedMember.id), {
      name: selectedMember.name,
      nameBn: selectedMember.nameBn || "",
      designation: selectedMember.designation,
      designationBn: selectedMember.designationBn || "",
      memberType: selectedMember.memberType,
      phone: selectedMember.phone,
      bloodGroup: selectedMember.bloodGroup,
      address: selectedMember.address,
      email: selectedMember.email,
      status: selectedMember.status,
      photo: photoUrl,
    });

    alert("Member updated successfully.");

    setShowModal(false);
    setNewPhoto(null);

    fetchMembers();

  } catch (error) {
    console.error(error);
    alert("Failed to update member.");
  }
};

  useEffect(() => {
    fetchMembers();
  }, []);

  return (

    
    <AdminLayout>

        {showModal && selectedMember && (
  <div
    className="modal fade show d-block"
    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
  >
    <div className="modal-dialog modal-lg">
      <div className="modal-content">

        <div className="modal-header">
          <h5>Edit Member</h5>

          <button
            className="btn-close"
            onClick={() => setShowModal(false)}
          />
        </div>

        <div className="modal-body">

          <div className="row">

            <div className="col-md-6 mb-3">
              <label>Name</label>

              <input
                className="form-control"
                value={selectedMember.name}
                onChange={(e) =>
                  setSelectedMember({
                    ...selectedMember,
                    name: e.target.value,
                  })
                }
              />
            </div>

            <div className="col-md-6 mb-3">
  <label>বাংলা নাম</label>

  <input
    className="form-control"
    value={selectedMember.nameBn || ""}
    onChange={(e) =>
      setSelectedMember({
        ...selectedMember,
        nameBn: e.target.value,
      })
    }
    placeholder="বাংলায় নাম লিখুন"
  />
</div>

            <div className="col-md-6 mb-3">
              <label>Designation</label>

              <input
                className="form-control"
                value={selectedMember.designation}
                onChange={(e) =>
                  setSelectedMember({
                    ...selectedMember,
                    designation: e.target.value,
                  })
                }
              />
            </div>

            <div className="col-md-6 mb-3">
  <label>বাংলা পদবি</label>

  <input
    className="form-control"
    value={selectedMember.designationBn || ""}
    onChange={(e) =>
      setSelectedMember({
        ...selectedMember,
        designationBn: e.target.value,
      })
    }
    placeholder="বাংলায় পদবি লিখুন"
  />
</div>

            <div className="col-md-6 mb-3">
              <label>Member Type</label>

              <input
                className="form-control"
                value={selectedMember.memberType}
                onChange={(e) =>
                  setSelectedMember({
                    ...selectedMember,
                    memberType: e.target.value,
                  })
                }
              />
            </div>

            <div className="col-md-6 mb-3">
              <label>Phone</label>

              <input
                className="form-control"
                value={selectedMember.phone}
                onChange={(e) =>
                  setSelectedMember({
                    ...selectedMember,
                    phone: e.target.value,
                  })
                }
              />
            </div>

            <div className="col-md-6 mb-3">
              <label>Blood Group</label>

              <input
                className="form-control"
                value={selectedMember.bloodGroup}
                onChange={(e) =>
                  setSelectedMember({
                    ...selectedMember,
                    bloodGroup: e.target.value,
                  })
                }
              />
            </div>

            <div className="col-md-6 mb-3">
              <label>Status</label>

              <select
                className="form-select"
                value={selectedMember.status}
                onChange={(e) =>
                  setSelectedMember({
                    ...selectedMember,
                    status: e.target.value,
                  })
                }
              >
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>

            <div className="col-md-6 mb-3">
  <label>Photo</label>

  <input
    type="file"
    className="form-control"
    accept="image/*"
    onChange={(e) =>
      setNewPhoto(
        e.target.files ? e.target.files[0] : null
      )
    }
  />

  <div className="mt-2">

    {newPhoto ? (
      <img
        src={URL.createObjectURL(newPhoto)}
        alt="Preview"
        width={80}
        height={80}
        className="rounded-circle"
        style={{ objectFit: "cover" }}
      />
    ) : selectedMember.photo ? (
      <img
        src={selectedMember.photo}
        alt="Member"
        width={80}
        height={80}
        className="rounded-circle"
        style={{ objectFit: "cover" }}
      />
    ) : (
      <span className="text-muted">No Photo</span>
    )}

  </div>
</div>

          </div>

        </div>

        <div className="modal-footer">

          <button
            className="btn btn-secondary"
            onClick={() => setShowModal(false)}
          >
            Cancel
          </button>

          <button
            className="btn btn-success"
            onClick={handleUpdate}
          >
            Update Member
          </button>

        </div>

      </div>
    </div>
  </div>
)}
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>View Members</h2>
        </div>

        <div className="card shadow-sm">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-bordered table-hover align-middle">
                <thead className="table-dark">
                  <tr>
                    <th>#</th>
                    <th>Photo</th>
                    <th>Name</th>
                    <th>Designation</th>
                    <th>Member Type</th>
                    <th>Phone</th>
                    <th>Blood Group</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="text-center">
                        Loading...
                      </td>
                    </tr>
                  ) : members.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center">
                        No Members Found
                      </td>
                    </tr>
                  ) : (
                    members.map((member, index) => (
                      <tr key={member.id}>
                        <td>{index + 1}</td>

                        <td>
                          {member.photo ? (
                            <img
                              src={member.photo}
                              alt={member.name}
                              width="50"
                              height="50"
                              className="rounded-circle"
                            />
                          ) : (
                            <span className="text-muted">No Photo</span>
                          )}
                        </td>

                        <td>{member.name}</td>

                        <td>{member.designation}</td>

                        <td>{member.memberType}</td>

                        <td>{member.phone}</td>

                        <td>{member.bloodGroup}</td>

                        <td>
                          <span
                            className={`badge ${
                              member.status === "Active"
                                ? "bg-success"
                                : "bg-danger"
                            }`}
                          >
                            {member.status}
                          </span>
                        </td>

                        <td>
                          <button
                            className="btn btn-sm btn-primary me-2"
                            onClick={() => handleEdit(member)}
                          >
                            Edit
                          </button>

                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(member.id)}
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
      </div>
    </AdminLayout>
  );
};

export default ViewMembers;
