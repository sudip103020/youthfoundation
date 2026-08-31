import { useEffect, useState } from "react";

import {
  collection,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  addDoc,
  serverTimestamp,
 
  onSnapshot,
  writeBatch,
} from "firebase/firestore";

import { db, auth } from "../firebase/firebase";
import AdminLayout from "./AdminLayout";
import emailjs from "@emailjs/browser";

interface Member {
  id: string;
  uid?: string;

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

interface ChatMessage {
  id: string;

  senderId: string;
  senderName: string;

  receiverId: string;
  receiverName: string;

  message: string;

  createdAt?: any;

  read?: boolean;
}

const ViewMembers = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // EDIT MODAL
  // =====================================================

  const [showModal, setShowModal] = useState(false);

  const [selectedMember, setSelectedMember] =
    useState<Member | null>(null);

  const [newPhoto, setNewPhoto] =
    useState<File | null>(null);

  // =====================================================
  // EMAIL MODAL
  // =====================================================

  const [showEmailModal, setShowEmailModal] =
    useState(false);

  const [emailMember, setEmailMember] =
    useState<Member | null>(null);

  const [emailSubject, setEmailSubject] =
    useState("");

  const [emailMessage, setEmailMessage] =
    useState("");

  const [sendingEmail, setSendingEmail] =
    useState(false);

  // =====================================================
  // WHATSAPP STYLE CHAT
  // =====================================================

  const [showChatModal, setShowChatModal] =
    useState(false);

  const [chatMember, setChatMember] =
    useState<Member | null>(null);

  const [chatMessages, setChatMessages] =
    useState<ChatMessage[]>([]);

  const [chatText, setChatText] =
    useState("");

  const [sendingChat, setSendingChat] =
    useState(false);

  const [loadingChat, setLoadingChat] =
    useState(false);

  const [chatUnsubscribe, setChatUnsubscribe] =
    useState<(() => void) | null>(null);

  // =====================================================
  // EMAILJS CONFIG
  // =====================================================

  const EMAIL_SERVICE_ID = "service_15u2r1b";

  const EMAIL_TEMPLATE_ID = "template_8vj8tfo";

  const EMAIL_PUBLIC_KEY = "IInLpgQj3HTN0jIv5";

  // =====================================================
  // FETCH MEMBERS
  // =====================================================

  const fetchMembers = async () => {
    try {
      setLoading(true);

      const querySnapshot = await getDocs(
        collection(db, "members")
      );

      const memberList: Member[] =
        querySnapshot.docs.map((memberDoc) => ({
          id: memberDoc.id,
          ...(memberDoc.data() as Omit<Member, "id">),
        }));

      setMembers(memberList);
    } catch (error) {
      console.error(
        "Fetch members error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // DELETE MEMBER
  // =====================================================

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this member?"
    );

    if (!confirmDelete) return;

    try {
      await deleteDoc(
        doc(db, "members", id)
      );

      alert(
        "Member deleted successfully."
      );

      await fetchMembers();
    } catch (error) {
      console.error(
        "Delete error:",
        error
      );

      alert(
        "Failed to delete member."
      );
    }
  };

  // =====================================================
  // EDIT MEMBER
  // =====================================================

  const handleEdit = (member: Member) => {
    setSelectedMember(member);
    setNewPhoto(null);
    setShowModal(true);
  };

  // =====================================================
  // CLOUDINARY UPLOAD
  // =====================================================

  const uploadPhoto = async () => {
    if (!newPhoto) {
      return selectedMember?.photo || "";
    }

    const formData = new FormData();

    formData.append(
      "file",
      newPhoto
    );

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
      throw new Error(
        "Cloudinary upload failed."
      );
    }

    const data = await res.json();

    return data.secure_url;
  };

  // =====================================================
  // UPDATE MEMBER
  // =====================================================

  const handleUpdate = async () => {
    if (!selectedMember) return;

    try {
      const photoUrl =
        await uploadPhoto();

      await updateDoc(
        doc(
          db,
          "members",
          selectedMember.id
        ),
        {
          name: selectedMember.name,

          nameBn:
            selectedMember.nameBn || "",

          designation:
            selectedMember.designation,

          designationBn:
            selectedMember.designationBn || "",

          memberType:
            selectedMember.memberType,

          phone:
            selectedMember.phone,

          bloodGroup:
            selectedMember.bloodGroup,

          address:
            selectedMember.address,

          email:
            selectedMember.email,

          status:
            selectedMember.status,

          photo:
            photoUrl,
        }
      );

      alert(
        "Member updated successfully."
      );

      setShowModal(false);
      setSelectedMember(null);
      setNewPhoto(null);

      await fetchMembers();
    } catch (error) {
      console.error(
        "Update error:",
        error
      );

      alert(
        "Failed to update member."
      );
    }
  };

  // =====================================================
  // OPEN EMAIL
  // =====================================================

  const handleOpenEmail = (
    member: Member
  ) => {
    if (
      !member.email ||
      !member.email.trim()
    ) {
      alert(
        "This member does not have an email address."
      );

      return;
    }

    setEmailMember(member);
    setEmailSubject("");
    setEmailMessage("");
    setShowEmailModal(true);
  };

  // =====================================================
  // SEND EMAIL
  // =====================================================

  const handleSendEmail = async () => {
    if (!emailMember) return;

    if (!emailSubject.trim()) {
      alert(
        "Please enter email subject."
      );

      return;
    }

    if (!emailMessage.trim()) {
      alert(
        "Please enter your message."
      );

      return;
    }

    try {
      setSendingEmail(true);

      const templateParams = {
        to_email:
          emailMember.email.trim(),

        to_name:
          emailMember.name || "",

        subject:
          emailSubject.trim(),

        message:
          emailMessage.trim(),

        name:
          "Badhokhali Youth Foundation",

        email:
          "badhokhaliyouthfoundation@gmail.com",
      };

      const response =
        await emailjs.send(
          EMAIL_SERVICE_ID,
          EMAIL_TEMPLATE_ID,
          templateParams,
          {
            publicKey:
              EMAIL_PUBLIC_KEY,
          }
        );

      console.log(
        "EmailJS Response:",
        response
      );

      alert(
        `Email sent successfully to ${emailMember.email}`
      );

      setShowEmailModal(false);
      setEmailMember(null);
      setEmailSubject("");
      setEmailMessage("");
    } catch (error: any) {
      console.error(
        "EmailJS Individual Error:",
        error
      );

      alert(
        `Failed to send email.\n\n${
          error?.text ||
          error?.message ||
          "Unknown EmailJS error"
        }`
      );
    } finally {
      setSendingEmail(false);
    }
  };

  // =====================================================
  // EMAIL ALL ACTIVE MEMBERS
  // =====================================================

  const handleEmailAllActive =
    async () => {
      const activeMembers =
        members.filter(
          (member) =>
            member.status === "Active" &&
            member.email &&
            member.email.trim() !== ""
        );

      if (
        activeMembers.length === 0
      ) {
        alert(
          "No active members with email addresses found."
        );

        return;
      }

      const subject =
        window.prompt(
          `Email will be sent to ${activeMembers.length} active members.\n\nEnter subject:`
        );

      if (
        !subject ||
        !subject.trim()
      ) {
        return;
      }

      const message =
        window.prompt(
          "Enter your message:"
        );

      if (
        !message ||
        !message.trim()
      ) {
        return;
      }

      const confirmSend =
        window.confirm(
          `Are you sure you want to send this email to ${activeMembers.length} active members?`
        );

      if (!confirmSend) return;

      try {
        setSendingEmail(true);

        let successCount = 0;
        let failedCount = 0;

        for (
          const member of activeMembers
        ) {
          try {
            const templateParams = {
              to_email:
                member.email.trim(),

              to_name:
                member.name || "",

              subject:
                subject.trim(),

              message:
                message.trim(),

              name:
                "Badhokhali Youth Foundation",

              email:
                "badhokhaliyouthfoundation@gmail.com",
            };

            await emailjs.send(
              EMAIL_SERVICE_ID,
              EMAIL_TEMPLATE_ID,
              templateParams,
              {
                publicKey:
                  EMAIL_PUBLIC_KEY,
              }
            );

            successCount++;

            await new Promise(
              (resolve) =>
                setTimeout(
                  resolve,
                  1100
                )
            );
          } catch (error) {
            console.error(
              `Failed to send email to ${member.email}`,
              error
            );

            failedCount++;
          }
        }

        alert(
          `Email sending completed.\n\nSuccessful: ${successCount}\nFailed: ${failedCount}`
        );
      } catch (error) {
        console.error(
          "Email All Active Error:",
          error
        );

        alert(
          "Failed to send emails."
        );
      } finally {
        setSendingEmail(false);
      }
    };

  // =====================================================
  // CREATE CONVERSATION ID
  // =====================================================

  const getConversationId = (
    uid1: string,
    uid2: string
  ) => {
    return [uid1, uid2]
      .sort()
      .join("_");
  };

  // =====================================================
  // OPEN WHATSAPP STYLE CHAT
  // =====================================================

 // =====================================================
// OPEN WHATSAPP STYLE CHAT
// =====================================================

const handleOpenChat = async (
  member: Member
) => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    alert("You are not logged in.");
    return;
  }

  if (!member.uid) {
    alert(
      "This member does not have a Firebase User ID."
    );
    return;
  }

  // Stop previous listener
  if (chatUnsubscribe) {
    chatUnsubscribe();
    setChatUnsubscribe(null);
  }

  setChatMember(member);
  setChatMessages([]);
  setChatText("");
  setShowChatModal(true);
  setLoadingChat(true);

  const conversationId = getConversationId(
    currentUser.uid,
    member.uid
  );

  console.log(
    "Opening conversation:",
    conversationId
  );

  try {
    const messagesRef = collection(
      db,
      "conversations",
      conversationId,
      "messages"
    );

    // =================================================
    // FIRST LOAD
    // =================================================

    const firstSnapshot = await getDocs(
      messagesRef
    );

    console.log(
      "Messages found:",
      firstSnapshot.size
    );

    const firstMessageList: ChatMessage[] =
      firstSnapshot.docs.map(
        (messageDoc) => ({
          id: messageDoc.id,
          ...(messageDoc.data() as Omit<
            ChatMessage,
            "id"
          >),
        })
      );

    // OLD → NEW
    firstMessageList.sort(
      (a, b) => {
        const timeA =
          a.createdAt?.toMillis?.() || 0;

        const timeB =
          b.createdAt?.toMillis?.() || 0;

        return timeA - timeB;
      }
    );

    setChatMessages(
      firstMessageList
    );

    setLoadingChat(false);

    // Mark received messages as read
    markMessagesAsRead(
      conversationId,
      firstMessageList,
      currentUser.uid
    );

    // =================================================
    // REAL-TIME LISTENER
    // =================================================

    const unsubscribe = onSnapshot(
      messagesRef,
      (snapshot) => {
        console.log(
          "Realtime messages:",
          snapshot.size
        );

        const messageList: ChatMessage[] =
          snapshot.docs.map(
            (messageDoc) => ({
              id: messageDoc.id,
              ...(messageDoc.data() as Omit<
                ChatMessage,
                "id"
              >),
            })
          );

        // OLD → NEW
        messageList.sort(
          (a, b) => {
            const timeA =
              a.createdAt?.toMillis?.() || 0;

            const timeB =
              b.createdAt?.toMillis?.() || 0;

            return timeA - timeB;
          }
        );

        setChatMessages(
          messageList
        );

        setLoadingChat(false);

        markMessagesAsRead(
          conversationId,
          messageList,
          currentUser.uid
        );
      },
      (error) => {
        console.error(
          "Realtime chat error:",
          error
        );

        setLoadingChat(false);

        alert(
          `Chat error: ${
            error.message ||
            "Unable to load conversation."
          }`
        );
      }
    );

    setChatUnsubscribe(
      () => unsubscribe()
    );
  } catch (error: any) {
    console.error(
      "Initial chat load error:",
      error
    );

    setLoadingChat(false);
    setChatMessages([]);

    alert(
      `Unable to load conversation.\n\n${
        error?.message ||
        "Please check Firestore Rules."
      }`
    );
  }
};

  // =====================================================
  // MARK MESSAGES AS READ
  // =====================================================

  const markMessagesAsRead =
    async (
      conversationId: string,
      messageList: ChatMessage[],
      currentUserId: string
    ) => {
      try {
        const unreadMessages =
          messageList.filter(
            (message) =>
              message.receiverId ===
                currentUserId &&
              message.read !== true
          );

        if (
          unreadMessages.length === 0
        ) {
          return;
        }

        const batch =
          writeBatch(db);

        unreadMessages.forEach(
          (message) => {
            const messageRef =
              doc(
                db,
                "conversations",
                conversationId,
                "messages",
                message.id
              );

            batch.update(
              messageRef,
              {
                read: true,
              }
            );
          }
        );

        await batch.commit();
      } catch (error) {
        console.error(
          "Mark messages read error:",
          error
        );
      }
    };

  // =====================================================
  // SEND CHAT MESSAGE
  // =====================================================

  const handleSendChat =
    async () => {
      const currentUser =
        auth.currentUser;

      if (!currentUser) {
        alert(
          "You are not logged in."
        );

        return;
      }

      if (!chatMember) {
        return;
      }

      if (!chatMember.uid) {
        alert(
          "Member User ID not found."
        );

        return;
      }

      if (!chatText.trim()) {
        return;
      }

      try {
        setSendingChat(true);

        const conversationId =
          getConversationId(
            currentUser.uid,
            chatMember.uid
          );

        const messagesRef =
          collection(
            db,
            "conversations",
            conversationId,
            "messages"
          );

        await addDoc(
          messagesRef,
          {
            senderId:
              currentUser.uid,

            senderName:
              "Badhokhali Youth Foundation",

            receiverId:
              chatMember.uid,

            receiverName:
              chatMember.name || "",

            message:
              chatText.trim(),

            createdAt:
              serverTimestamp(),

            read: false,
          }
        );

        setChatText("");
      } catch (error) {
        console.error(
          "Send conversation message error:",
          error
        );

        alert(
          "Failed to send message. Please try again."
        );
      } finally {
        setSendingChat(false);
      }
    };

  // =====================================================
  // CLOSE CHAT
  // =====================================================

  const closeChat = () => {
    if (chatUnsubscribe) {
      chatUnsubscribe();
      setChatUnsubscribe(null);
    }

    setShowChatModal(false);
    setChatMember(null);
    setChatMessages([]);
    setChatText("");
    setLoadingChat(false);
  };

  // =====================================================
  // ENTER KEY SEND
  // =====================================================

  const handleChatKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (
      e.key === "Enter" &&
      !e.shiftKey
    ) {
      e.preventDefault();

      if (
        chatText.trim() &&
        !sendingChat
      ) {
        handleSendChat();
      }
    }
  };



 useEffect(() => {
  fetchMembers();
}, []);

  // =====================================================
  // RETURN
  // =====================================================

  return (
    <AdminLayout>

      {/* =================================================
          WHATSAPP STYLE CHAT MODAL
      ================================================= */}

      {showChatModal &&
        chatMember && (
          <div
            className="position-fixed top-0 start-0 w-100 h-100"
            style={{
              backgroundColor:
                "rgba(0,0,0,0.65)",
              zIndex: 9999,
            }}
          >

            <div
              className="position-absolute top-50 start-50 translate-middle bg-white shadow-lg"
              style={{
                width:
                  "min(95%, 900px)",
                height:
                  "min(90vh, 750px)",
                borderRadius:
                  "14px",
                overflow:
                  "hidden",
                display:
                  "flex",
                flexDirection:
                  "column",
              }}
            >

              {/* =========================================
                  CHAT HEADER
              ========================================= */}

              <div
                className="d-flex align-items-center justify-content-between px-3 py-2"
                style={{
                  background:
                    "#075E54",
                  color:
                    "#fff",
                  minHeight:
                    "72px",
                }}
              >

                <div className="d-flex align-items-center">

                  <button
                    type="button"
                    className="btn btn-link text-white fs-4 me-2 p-0"
                    onClick={
                      closeChat
                    }
                  >
                    ←
                  </button>

                  {chatMember.photo ? (
                    <img
                      src={
                        chatMember.photo
                      }
                      alt={
                        chatMember.name
                      }
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius:
                          "50%",
                        objectFit:
                          "cover",
                        border:
                          "2px solid rgba(255,255,255,0.5)",
                      }}
                    />
                  ) : (
                    <div
                      className="d-flex align-items-center justify-content-center"
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius:
                          "50%",
                        background:
                          "#128C7E",
                        fontSize:
                          "22px",
                      }}
                    >
                      👤
                    </div>
                  )}

                  <div className="ms-3">

                    <div
                      className="fw-bold"
                      style={{
                        fontSize:
                          "16px",
                      }}
                    >
                      {chatMember.name}
                    </div>

                    <small
                      style={{
                        opacity:
                          0.8,
                      }}
                    >
                      {chatMember.designation ||
                        "Member"}
                    </small>

                  </div>

                </div>

                <button
                  type="button"
                  className="btn btn-link text-white fs-4 p-0"
                  onClick={
                    closeChat
                  }
                >
                  ×
                </button>

              </div>

              {/* =========================================
                  CHAT BODY
              ========================================= */}

              <div
                className="flex-grow-1 overflow-auto p-3"
                style={{
                  background:
                    "#efeae2",
                  backgroundImage:
                    "radial-gradient(rgba(0,0,0,0.035) 1px, transparent 1px)",
                  backgroundSize:
                    "18px 18px",
                }}
              >

                {loadingChat ? (

                  <div
                    className="h-100 d-flex align-items-center justify-content-center"
                  >
                    <div className="text-center">

                      <div
                        className="spinner-border text-success mb-3"
                        role="status"
                      />

                      <div className="text-muted">
                        Loading conversation...
                      </div>

                    </div>
                  </div>

                ) : chatMessages.length === 0 ? (

                  <div
                    className="h-100 d-flex align-items-center justify-content-center"
                  >

                    <div
                      className="text-center bg-white shadow-sm p-4"
                      style={{
                        borderRadius:
                          "12px",
                        maxWidth:
                          "360px",
                      }}
                    >

                      <div
                        style={{
                          fontSize:
                            "50px",
                        }}
                      >
                        💬
                      </div>

                      <h6 className="mt-2">
                        No messages yet
                      </h6>

                      <p className="text-muted small mb-0">
                        Start a conversation with{" "}
                        {chatMember.name}.
                      </p>

                    </div>

                  </div>

                ) : (

                  <div>

                   {chatMessages.map((message) => {
  const isMe =
    message.senderId === auth.currentUser?.uid;

  return (
    <div
      key={message.id}
      className={`d-flex mb-3 ${
        isMe
          ? "justify-content-end"
          : "justify-content-start"
      }`}
    >
      <div
        style={{
          maxWidth: "75%",
          minWidth: "80px",
          padding: "10px 14px",
          borderRadius: isMe
            ? "18px 18px 4px 18px"
            : "18px 18px 18px 4px",

          backgroundColor: isMe
            ? "#d9fdd3"
            : "#ffffff",

          color: "#111",

          boxShadow:
            "0 1px 2px rgba(0,0,0,0.12)",

          wordBreak: "break-word",
        }}
      >
        <div
          style={{
            whiteSpace: "pre-wrap",
            fontSize: "15px",
            lineHeight: "1.5",
          }}
        >
          {message.message}
        </div>

        <div
          className={`d-flex align-items-center justify-content-end gap-1 mt-1 ${
            isMe
              ? "text-success"
              : "text-muted"
          }`}
          style={{
            fontSize: "11px",
          }}
        >
          <span>
            {message.createdAt?.toDate
              ? message.createdAt
                  .toDate()
                  .toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
              : ""}
          </span>

          {isMe && (
            <span>
              {message.read
                ? "✓✓"
                : "✓"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
})}

                  </div>

                )}

              </div>

              {/* =========================================
                  CHAT INPUT
              ========================================= */}

              <div
                className="p-2"
                style={{
                  background:
                    "#f0f2f5",
                  borderTop:
                    "1px solid #ddd",
                }}
              >

                <div className="d-flex align-items-end gap-2">

                  <textarea
                    className="form-control"
                    rows={1}
                    placeholder="Type a message..."
                    value={
                      chatText
                    }
                    onChange={(e) =>
                      setChatText(
                        e.target.value
                      )
                    }
                    onKeyDown={
                      handleChatKeyDown
                    }
                    disabled={
                      sendingChat
                    }
                    style={{
                      resize:
                        "none",
                      borderRadius:
                        "22px",
                      padding:
                        "10px 16px",
                      maxHeight:
                        "100px",
                    }}
                  />

                  <button
                    type="button"
                    className="btn d-flex align-items-center justify-content-center"
                    onClick={
                      handleSendChat
                    }
                    disabled={
                      sendingChat ||
                      !chatText.trim()
                    }
                    style={{
                      width:
                        "46px",
                      height:
                        "46px",
                      borderRadius:
                        "50%",
                      background:
                        "#128C7E",
                      color:
                        "#fff",
                      border:
                        "none",
                      flexShrink:
                        0,
                    }}
                  >
                    {sendingChat ? (
                      <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                      />
                    ) : (
                      "➤"
                    )}
                  </button>

                </div>

                <div className="text-muted text-center mt-1">
                  <small>
                    Enter = Send • Shift + Enter = New Line
                  </small>
                </div>

              </div>

            </div>

          </div>
        )}

      {/* =================================================
          EMAIL MODAL
      ================================================= */}

      {showEmailModal &&
        emailMember && (
          <div
            className="modal fade show d-block"
            style={{
              backgroundColor:
                "rgba(0,0,0,0.5)",
              zIndex: 10000,
            }}
          >

            <div className="modal-dialog modal-lg">

              <div className="modal-content">

                <div className="modal-header">

                  <h5 className="modal-title">
                    📧 Send Email
                  </h5>

                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      if (
                        !sendingEmail
                      ) {
                        setShowEmailModal(
                          false
                        );
                      }
                    }}
                  />

                </div>

                <div className="modal-body">

                  <div className="mb-3">

                    <label className="form-label fw-semibold">
                      To
                    </label>

                    <input
                      type="email"
                      className="form-control"
                      value={
                        emailMember.email
                      }
                      readOnly
                    />

                  </div>

                  <div className="mb-3">

                    <label className="form-label fw-semibold">
                      Member
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      value={
                        emailMember.name
                      }
                      readOnly
                    />

                  </div>

                  <div className="mb-3">

                    <label className="form-label fw-semibold">
                      Subject
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter email subject"
                      value={
                        emailSubject
                      }
                      onChange={(e) =>
                        setEmailSubject(
                          e.target.value
                        )
                      }
                    />

                  </div>

                  <div className="mb-3">

                    <label className="form-label fw-semibold">
                      Message
                    </label>

                    <textarea
                      className="form-control"
                      rows={7}
                      placeholder="Write your message..."
                      value={
                        emailMessage
                      }
                      onChange={(e) =>
                        setEmailMessage(
                          e.target.value
                        )
                      }
                    />

                  </div>

                </div>

                <div className="modal-footer">

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() =>
                      setShowEmailModal(
                        false
                      )
                    }
                    disabled={
                      sendingEmail
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={
                      handleSendEmail
                    }
                    disabled={
                      sendingEmail
                    }
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

      {/* =================================================
          EDIT MODAL
      ================================================= */}

      {showModal &&
        selectedMember && (
          <div
            className="modal fade show d-block"
            style={{
              backgroundColor:
                "rgba(0,0,0,0.5)",
              zIndex: 10000,
            }}
          >

            <div className="modal-dialog modal-lg">

              <div className="modal-content">

                <div className="modal-header">

                  <h5 className="modal-title">
                    Edit Member
                  </h5>

                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setShowModal(
                        false
                      );

                      setSelectedMember(
                        null
                      );

                      setNewPhoto(null);
                    }}
                  />

                </div>

                <div className="modal-body">

                  <div className="row">

                    {/* NAME */}

                    <div className="col-md-6 mb-3">

                      <label className="form-label">
                        Name
                      </label>

                      <input
                        className="form-control"
                        value={
                          selectedMember.name
                        }
                        onChange={(e) =>
                          setSelectedMember({
                            ...selectedMember,
                            name:
                              e.target.value,
                          })
                        }
                      />

                    </div>

                    {/* BANGLA NAME */}

                    <div className="col-md-6 mb-3">

                      <label className="form-label">
                        বাংলা নাম
                      </label>

                      <input
                        className="form-control"
                        value={
                          selectedMember.nameBn ||
                          ""
                        }
                        onChange={(e) =>
                          setSelectedMember({
                            ...selectedMember,
                            nameBn:
                              e.target.value,
                          })
                        }
                        placeholder="বাংলায় নাম লিখুন"
                      />

                    </div>

                    {/* DESIGNATION */}

                    <div className="col-md-6 mb-3">

                      <label className="form-label">
                        Designation
                      </label>

                      <input
                        className="form-control"
                        value={
                          selectedMember.designation
                        }
                        onChange={(e) =>
                          setSelectedMember({
                            ...selectedMember,
                            designation:
                              e.target.value,
                          })
                        }
                      />

                    </div>

                    {/* BANGLA DESIGNATION */}

                    <div className="col-md-6 mb-3">

                      <label className="form-label">
                        বাংলা পদবি
                      </label>

                      <input
                        className="form-control"
                        value={
                          selectedMember.designationBn ||
                          ""
                        }
                        onChange={(e) =>
                          setSelectedMember({
                            ...selectedMember,
                            designationBn:
                              e.target.value,
                          })
                        }
                        placeholder="বাংলায় পদবি লিখুন"
                      />

                    </div>

                    {/* MEMBER TYPE */}

                    <div className="col-md-6 mb-3">

                      <label className="form-label">
                        Member Type
                      </label>

                      <input
                        className="form-control"
                        value={
                          selectedMember.memberType
                        }
                        onChange={(e) =>
                          setSelectedMember({
                            ...selectedMember,
                            memberType:
                              e.target.value,
                          })
                        }
                      />

                    </div>

                    {/* PHONE */}

                    <div className="col-md-6 mb-3">

                      <label className="form-label">
                        Phone
                      </label>

                      <input
                        className="form-control"
                        value={
                          selectedMember.phone
                        }
                        onChange={(e) =>
                          setSelectedMember({
                            ...selectedMember,
                            phone:
                              e.target.value,
                          })
                        }
                      />

                    </div>

                    {/* BLOOD */}

                    <div className="col-md-6 mb-3">

                      <label className="form-label">
                        Blood Group
                      </label>

                      <input
                        className="form-control"
                        value={
                          selectedMember.bloodGroup
                        }
                        onChange={(e) =>
                          setSelectedMember({
                            ...selectedMember,
                            bloodGroup:
                              e.target.value,
                          })
                        }
                      />

                    </div>

                    {/* STATUS */}

                    <div className="col-md-6 mb-3">

                      <label className="form-label">
                        Status
                      </label>

                      <select
                        className="form-select"
                        value={
                          selectedMember.status
                        }
                        onChange={(e) =>
                          setSelectedMember({
                            ...selectedMember,
                            status:
                              e.target.value,
                          })
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

                    {/* PHOTO */}

                    <div className="col-md-6 mb-3">

                      <label className="form-label">
                        Photo
                      </label>

                      <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={(e) =>
                          setNewPhoto(
                            e.target.files?.[0] ||
                              null
                          )
                        }
                      />

                      <div className="mt-2">

                        {newPhoto ? (
                          <img
                            src={URL.createObjectURL(
                              newPhoto
                            )}
                            alt="Preview"
                            width={80}
                            height={80}
                            className="rounded-circle"
                            style={{
                              objectFit:
                                "cover",
                            }}
                          />
                        ) : selectedMember.photo ? (
                          <img
                            src={
                              selectedMember.photo
                            }
                            alt="Member"
                            width={80}
                            height={80}
                            className="rounded-circle"
                            style={{
                              objectFit:
                                "cover",
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
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowModal(
                        false
                      );

                      setSelectedMember(
                        null
                      );

                      setNewPhoto(null);
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={
                      handleUpdate
                    }
                  >
                    Update Member
                  </button>

                </div>

              </div>

            </div>

          </div>
        )}

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <div className="container-fluid">

        {/* HEADER */}

        <div className="d-flex justify-content-between align-items-center mb-4">

          <h2 className="mb-0">
            View Members
          </h2>

          <button
            type="button"
            className="btn btn-success"
            onClick={
              handleEmailAllActive
            }
            disabled={
              sendingEmail
            }
          >
            {sendingEmail
              ? "Sending..."
              : "📧 Email All Active Members"}
          </button>

        </div>

        {/* MEMBER TABLE */}

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

                    members.map(
                      (
                        member,
                        index
                      ) => (

                        <tr
                          key={
                            member.id
                          }
                        >

                          {/* NUMBER */}

                          <td>
                            {index + 1}
                          </td>

                          {/* PHOTO */}

                          <td>

                            {member.photo ? (

                              <img
                                src={
                                  member.photo
                                }
                                alt={
                                  member.name
                                }
                                width={50}
                                height={50}
                                className="rounded-circle"
                                style={{
                                  objectFit:
                                    "cover",
                                }}
                              />

                            ) : (

                              <span className="text-muted">
                                No Photo
                              </span>

                            )}

                          </td>

                          {/* NAME */}

                          <td>
                            {member.name}
                          </td>

                          {/* DESIGNATION */}

                          <td>
                            {
                              member.designation
                            }
                          </td>

                          {/* MEMBER TYPE */}

                          <td>
                            {
                              member.memberType
                            }
                          </td>

                          {/* PHONE */}

                          <td>
                            {member.phone}
                          </td>

                          {/* BLOOD */}

                          <td>
                            {
                              member.bloodGroup
                            }
                          </td>

                          {/* EMAIL */}

                          <td>

                            {member.email ? (

                              <span>
                                {
                                  member.email
                                }
                              </span>

                            ) : (

                              <span className="text-muted">
                                No Email
                              </span>

                            )}

                          </td>

                          {/* STATUS */}

                          <td>

                            <span
                              className={`badge ${
                                member.status ===
                                "Active"
                                  ? "bg-success"
                                  : "bg-danger"
                              }`}
                            >
                              {
                                member.status
                              }
                            </span>

                          </td>

                          {/* ACTION */}

                          <td>

                            <button
                              type="button"
                              className="btn btn-sm btn-primary me-1 mb-1"
                              onClick={() =>
                                handleEdit(
                                  member
                                )
                              }
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className="btn btn-sm btn-danger me-1 mb-1"
                              onClick={() =>
                                handleDelete(
                                  member.id
                                )
                              }
                            >
                              Delete
                            </button>

                            <button
                              type="button"
                              className="btn btn-sm btn-success me-1 mb-1"
                              onClick={() =>
                                handleOpenEmail(
                                  member
                                )
                              }
                              disabled={
                                !member.email ||
                                sendingEmail
                              }
                            >
                              📧 Mail
                            </button>

                            {/* =================================
                                WHATSAPP STYLE MESSAGE
                            ================================= */}

                            <button
                              type="button"
                              className="btn btn-sm btn-info text-white mb-1"
                              onClick={() =>
                                handleOpenChat(
                                  member
                                )
                              }
                              disabled={
                                !member.uid ||
                                sendingChat
                              }
                            >
                              💬 Message
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

        </div>

      </div>

    </AdminLayout>
  );
};

export default ViewMembers;