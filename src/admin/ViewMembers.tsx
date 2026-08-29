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
import emailjs from "@emailjs/browser";

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

  // Edit modal
  const [showModal, setShowModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [newPhoto, setNewPhoto] = useState<File | null>(null);

  // Email modal
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailMember, setEmailMember] = useState<Member | null>(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);

  // ================= FETCH MEMBERS =================

  const fetchMembers = async () => {
    try {
      setLoading(true);

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

  // ================= DELETE =================

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

  // ================= EDIT =================

  const handleEdit = (member: Member) => {
    setSelectedMember(member);
    setShowModal(true);
  };

  // ================= CLOUDINARY =================

  const uploadPhoto = async () => {
    if (!newPhoto) return selectedMember?.photo || "";

    const formData = new FormData();

    formData.append("file", newPhoto);
    formData.append(
      "upload_preset",
      "badokhali_youth_foundation",
    );

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dvpfixfd/image/upload",
      {
        method: "POST",
        body: formData,
      },
    );

    const data = await res.json();

    return data.secure_url;
  };

  // ================= UPDATE MEMBER =================

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

  // =========================================================
  // EMAIL - OPEN INDIVIDUAL EMAIL MODAL
  // =========================================================

  const handleOpenEmail = (member: Member) => {
    if (!member.email) {
      alert("This member does not have an email address.");
      return;
    }

    setEmailMember(member);
    setEmailSubject("");
    setEmailMessage("");
    setShowEmailModal(true);
  };

  // =========================================================
  // SEND INDIVIDUAL EMAIL
  // =========================================================

  const handleSendEmail = async () => {
    if (!emailMember) return;

    if (!emailSubject.trim()) {
      alert("Please enter email subject.");
      return;
    }

    if (!emailMessage.trim()) {
      alert("Please enter your message.");
      return;
    }

    try {
      setSendingEmail(true);

      await emailjs.send(
        "service_ziqrpvq",
        "template_7mmcol4",
        {
          to_email: emailMember.email,
          to_name: emailMember.name,
          subject: emailSubject,
          message: emailMessage,
        },
        "dkzpDLiexSiWkw_cv",
      );

      alert(`Email sent successfully to ${emailMember.email}`);

      setShowEmailModal(false);
      setEmailMember(null);
      setEmailSubject("");
      setEmailMessage("");
    } catch (error) {
      console.error(error);
      alert("Failed to send email.");
    } finally {
      setSendingEmail(false);
    }
  };

  // =========================================================
  // EMAIL ALL ACTIVE MEMBERS
  // =========================================================

  const handleEmailAllActive = async () => {
    const activeMembers = members.filter(
      (member) =>
        member.status === "Active" &&
        member.email &&
        member.email.trim() !== "",
    );

    if (activeMembers.length === 0) {
      alert("No active members with email addresses found.");
      return;
    }

    const subject = window.prompt(
      `Email will be sent to ${activeMembers.length} active members.\n\nEnter subject:`,
    );

    if (!subject || !subject.trim()) return;

    const message = window.prompt(
      "Enter your message:",
    );

    if (!message || !message.trim()) return;

    const confirmSend = window.confirm(
      `Are you sure you want to send this email to ${activeMembers.length} active members?`,
    );

    if (!confirmSend) return;

    try {
      setSendingEmail(true);

      let successCount = 0;
      let failedCount = 0;

      for (const member of activeMembers) {
        try {
          await emailjs.send(
            "service_ziqrpvq",
            "template_qk3tt6y",
            {
              to_email: member.email,
              to_name: member.name,
              subject: subject,
              message: message,
            },
            "dkzpDLiexSiWkw_cv",
          );

          successCount++;
        } catch (error) {
          console.error(
            `Failed to send email to ${member.email}`,
            error,
          );

          failedCount++;
        }
      }

      alert(
        `Email sending completed.\n\nSuccessful: ${successCount}\nFailed: ${failedCount}`,
      );
    } catch (error) {
      console.error(error);
      alert("Failed to send emails.");
    } finally {
      setSendingEmail(false);
    }
  };

  // ================= USE EFFECT =================

  useEffect(() => {
    fetchMembers();
  }, []);

  return (
    <AdminLayout>
      {/* =====================================================
          EMAIL MODAL
      ===================================================== */}

      {showEmailModal && emailMember && (
        <div
          className="modal fade show d-block"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">

              <div className="modal-header">
                <h5 className="modal-title">
                  📧 Send Email
                </h5>

                <button
                  className="btn-close"
                  onClick={() => setShowEmailModal(false)}
                />
              </div>

              <div className="modal-body">

                {/* To */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    To
                  </label>

                  <input
                    type="email"
                    className="form-control"
                    value={emailMember.email}
                    readOnly
                  />
                </div>

                {/* Member */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Member
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    value={emailMember.name}
                    readOnly
                  />
                </div>

                {/* Subject */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Subject
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter email subject"
                    value={emailSubject}
                    onChange={(e) =>
                      setEmailSubject(e.target.value)
                    }
                  />
                </div>

                {/* Message */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Message
                  </label>

                  <textarea
                    className="form-control"
                    rows={7}
                    placeholder="Write your message..."
                    value={emailMessage}
                    onChange={(e) =>
                      setEmailMessage(e.target.value)
                    }
                  />
                </div>

              </div>

              <div className="modal-footer">

                <button
                  className="btn btn-secondary"
                  onClick={() => setShowEmailModal(false)}
                  disabled={sendingEmail}
                >
                  Cancel
                </button>

                <button
                  className="btn btn-success"
                  onClick={handleSendEmail}
                  disabled={sendingEmail}
                >
                  {sendingEmail
                    ? "Sending..."
                    : "✉️ Send Email"}
                </button>

              </div>

            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          EDIT MODAL
      ===================================================== */}

      {showModal && selectedMember && (
        <div
          className="modal fade show d-block"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
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

                  {/* Name */}
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

                  {/* Bangla Name */}
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

                  {/* Designation */}
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

                  {/* Bangla Designation */}
                  <div className="col-md-6 mb-3">
                    <label>বাংলা পদবি</label>

                    <input
                      className="form-control"
                      value={
                        selectedMember.designationBn || ""
                      }
                      onChange={(e) =>
                        setSelectedMember({
                          ...selectedMember,
                          designationBn: e.target.value,
                        })
                      }
                      placeholder="বাংলায় পদবি লিখুন"
                    />
                  </div>

                  {/* Member Type */}
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

                  {/* Phone */}
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

                  {/* Blood Group */}
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

                  {/* Status */}
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

                  {/* Photo */}
                  <div className="col-md-6 mb-3">
                    <label>Photo</label>

                    <input
                      type="file"
                      className="form-control"
                      accept="image/*"
                      onChange={(e) =>
                        setNewPhoto(
                          e.target.files
                            ? e.target.files[0]
                            : null,
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
                          style={{
                            objectFit: "cover",
                          }}
                        />
                      ) : selectedMember.photo ? (
                        <img
                          src={selectedMember.photo}
                          alt="Member"
                          width={80}
                          height={80}
                          className="rounded-circle"
                          style={{
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <span className="text-muted">
                          No Photo
                        </span>
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

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div className="container-fluid">

        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">

          <h2 className="mb-0">
            View Members
          </h2>

          <button
            className="btn btn-success"
            onClick={handleEmailAllActive}
            disabled={sendingEmail}
          >
            {sendingEmail
              ? "Sending..."
              : "📧 Email All Active Members"}
          </button>

        </div>

        {/* Members Table */}
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
                    <th>Email</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>

                </thead>

                <tbody>

                  {loading ? (
                    <tr>
                      <td
                        colSpan={10}
                        className="text-center"
                      >
                        Loading...
                      </td>
                    </tr>
                  ) : members.length === 0 ? (
                    <tr>
                      <td
                        colSpan={10}
                        className="text-center"
                      >
                        No Members Found
                      </td>
                    </tr>
                  ) : (
                    members.map((member, index) => (
                      <tr key={member.id}>

                        <td>
                          {index + 1}
                        </td>

                        {/* Photo */}
                        <td>
                          {member.photo ? (
                            <img
                              src={member.photo}
                              alt={member.name}
                              width="50"
                              height="50"
                              className="rounded-circle"
                              style={{
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <span className="text-muted">
                              No Photo
                            </span>
                          )}
                        </td>

                        {/* Name */}
                        <td>
                          {member.name}
                        </td>

                        {/* Designation */}
                        <td>
                          {member.designation}
                        </td>

                        {/* Member Type */}
                        <td>
                          {member.memberType}
                        </td>

                        {/* Phone */}
                        <td>
                          {member.phone}
                        </td>

                        {/* Blood */}
                        <td>
                          {member.bloodGroup}
                        </td>

                        {/* Email */}
                        <td>
                          {member.email ? (
                            <span>
                              {member.email}
                            </span>
                          ) : (
                            <span className="text-muted">
                              No Email
                            </span>
                          )}
                        </td>

                        {/* Status */}
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

                        {/* Action */}
                        <td>

                          <button
                            className="btn btn-sm btn-primary me-2 mb-1"
                            onClick={() =>
                              handleEdit(member)
                            }
                          >
                            Edit
                          </button>

                          <button
                            className="btn btn-sm btn-danger me-2 mb-1"
                            onClick={() =>
                              handleDelete(member.id)
                            }
                          >
                            Delete
                          </button>

                          <button
                            className="btn btn-sm btn-success mb-1"
                            onClick={() =>
                              handleOpenEmail(member)
                            }
                            disabled={
                              !member.email ||
                              sendingEmail
                            }
                          >
                            📧 Mail
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

