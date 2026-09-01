import { useEffect, useRef, useState } from "react";

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

  // Monthly Subscription
  monthlySubscriptionAmount?: number;
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
  // =====================================================
  // MEMBERS
  // =====================================================

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

  const [updatingMember, setUpdatingMember] =
    useState(false);

  // =====================================================
  // EMAIL
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
  // CHAT
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

  // =====================================================
  // CHAT REFS
  // =====================================================

  const chatUnsubscribeRef =
    useRef<(() => void) | null>(null);

  const chatBottomRef =
    useRef<HTMLDivElement | null>(null);

  const messagesContainerRef =
    useRef<HTMLDivElement | null>(null);

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

      const snapshot = await getDocs(
        collection(db, "members")
      );

      const memberList: Member[] =
        snapshot.docs.map((memberDoc) => ({
          id: memberDoc.id,
          ...(memberDoc.data() as Omit<
            Member,
            "id"
          >),
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
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchMembers();

    return () => {
      if (chatUnsubscribeRef.current) {
        chatUnsubscribeRef.current();

        chatUnsubscribeRef.current = null;
      }
    };
  }, []);

  // =====================================================
  // SCROLL CHAT TO BOTTOM
  // =====================================================

  useEffect(() => {
    if (!showChatModal) return;

    requestAnimationFrame(() => {
      chatBottomRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    });
  }, [
    chatMessages,
    showChatModal,
  ]);

  // =====================================================
  // DELETE MEMBER
  // =====================================================

  const handleDelete = async (
    id: string
  ) => {
    const confirmDelete =
      window.confirm(
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

  const handleEdit = (
    member: Member
  ) => {
    setSelectedMember({
      ...member,

      // Old members without amount
      // will show 0
      monthlySubscriptionAmount:
        Number(
          member.monthlySubscriptionAmount
        ) || 0,
    });

    setNewPhoto(null);
    setShowModal(true);
  };

  // =====================================================
  // CLOSE EDIT MODAL
  // =====================================================

  const closeEditModal = () => {
    if (updatingMember) return;

    setShowModal(false);
    setSelectedMember(null);
    setNewPhoto(null);
  };

  // =====================================================
  // CLOUDINARY UPLOAD
  // =====================================================

  const uploadPhoto =
    async (): Promise<string> => {
      if (!newPhoto) {
        return selectedMember?.photo || "";
      }

      // 5MB limit
      if (
        newPhoto.size >
        5 * 1024 * 1024
      ) {
        throw new Error(
          "Photo size must be less than 5MB."
        );
      }

      const formData =
        new FormData();

      formData.append(
        "file",
        newPhoto
      );

      formData.append(
        "upload_preset",
        "badokhali_youth_foundation"
      );

      const response =
        await fetch(
          "https://api.cloudinary.com/v1_1/dvpfixfd/image/upload",
          {
            method: "POST",
            body: formData,
          }
        );

      if (!response.ok) {
        throw new Error(
          "Cloudinary upload failed."
        );
      }

      const data =
        await response.json();

      return data.secure_url || "";
    };

  // =====================================================
  // UPDATE MEMBER
  // =====================================================

  const handleUpdate =
    async () => {
      if (!selectedMember) return;

      if (
        !selectedMember.name.trim()
      ) {
        alert(
          "Please enter member name."
        );

        return;
      }

      if (
        !selectedMember.designation.trim()
      ) {
        alert(
          "Please enter designation."
        );

        return;
      }

      try {
        setUpdatingMember(true);

        const photoUrl =
          await uploadPhoto();

        await updateDoc(
          doc(
            db,
            "members",
            selectedMember.id
          ),
          {
            name:
              selectedMember.name.trim(),

            nameBn:
              selectedMember.nameBn?.trim() ||
              "",

            designation:
              selectedMember.designation.trim(),

            designationBn:
              selectedMember.designationBn?.trim() ||
              "",

            memberType:
              selectedMember.memberType?.trim() ||
              "",

            phone:
              selectedMember.phone?.trim() ||
              "",

            dateOfBirth:
              selectedMember.dateOfBirth || "",

            bloodGroup:
              selectedMember.bloodGroup?.trim() ||
              "",

            address:
              selectedMember.address?.trim() ||
              "",

            email:
              selectedMember.email?.trim() ||
              "",

            status:
              selectedMember.status || "Active",

            photo: photoUrl,

            // ==========================================
            // MONTHLY SUBSCRIPTION AMOUNT
            // ==========================================

            monthlySubscriptionAmount:
              Number(
                selectedMember.monthlySubscriptionAmount
              ) || 0,

            updatedAt:
              serverTimestamp(),
          }
        );

        alert(
          "Member updated successfully."
        );

        closeEditModal();

        await fetchMembers();
      } catch (error: any) {
        console.error(
          "Update error:",
          error
        );

        alert(
          error?.message ||
            "Failed to update member."
        );
      } finally {
        setUpdatingMember(false);
      }
    };

  // =====================================================
  // OPEN EMAIL
  // =====================================================

  const handleOpenEmail = (
    member: Member
  ) => {
    if (!member.email?.trim()) {
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
  // CLOSE EMAIL
  // =====================================================

  const closeEmailModal = () => {
    if (sendingEmail) return;

    setShowEmailModal(false);
    setEmailMember(null);
    setEmailSubject("");
    setEmailMessage("");
  };

  // =====================================================
  // SEND INDIVIDUAL EMAIL
  // =====================================================

  const handleSendEmail =
    async () => {
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
            member.status ===
              "Active" &&
            member.email?.trim()
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

      if (!subject?.trim()) return;

      const message =
        window.prompt(
          "Enter your message:"
        );

      if (!message?.trim()) return;

      const confirmSend =
        window.confirm(
          `Are you sure you want to send this email to ${activeMembers.length} active members?`
        );

      if (!confirmSend) return;

      try {
        setSendingEmail(true);

        let successCount = 0;
        let failedCount = 0;

        for (const member of activeMembers) {
          try {
            const templateParams =
              {
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
  // CONVERSATION ID
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
  // SORT MESSAGES
  // =====================================================

  const sortMessages = (
    messages: ChatMessage[]
  ) => {
    return [...messages].sort(
      (a, b) => {
        const timeA =
          a.createdAt?.toMillis?.() ||
          0;

        const timeB =
          b.createdAt?.toMillis?.() ||
          0;

        return timeA - timeB;
      }
    );
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
  // OPEN CHAT
  // =====================================================

  const handleOpenChat =
    async (
      member: Member
    ) => {
      const currentUser =
        auth.currentUser;

      if (!currentUser) {
        alert(
          "You are not logged in."
        );

        return;
      }

      if (!member.uid) {
        alert(
          "This member does not have a Firebase User ID."
        );

        return;
      }

      if (
        chatUnsubscribeRef.current
      ) {
        chatUnsubscribeRef.current();

        chatUnsubscribeRef.current =
          null;
      }

      setChatMember(member);
      setChatMessages([]);
      setChatText("");
      setLoadingChat(true);
      setShowChatModal(true);

      const conversationId =
        getConversationId(
          currentUser.uid,
          member.uid
        );

      console.log(
        "Opening conversation:",
        conversationId
      );

      const messagesRef =
        collection(
          db,
          "conversations",
          conversationId,
          "messages"
        );

      try {
        const unsubscribe =
          onSnapshot(
            messagesRef,
            async (snapshot) => {
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

              const sortedMessages =
                sortMessages(
                  messageList
                );

              setChatMessages(
                sortedMessages
              );

              setLoadingChat(false);

              await markMessagesAsRead(
                conversationId,
                sortedMessages,
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

        chatUnsubscribeRef.current =
          unsubscribe;
      } catch (error: any) {
        console.error(
          "Open chat error:",
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
  // DELETE CHAT MESSAGE
  // =====================================================

  const handleDeleteChatMessage =
    async (
      messageId: string
    ) => {
      const currentUser =
        auth.currentUser;

      if (!currentUser) {
        alert(
          "You are not logged in."
        );

        return;
      }

      if (!chatMember?.uid) {
        return;
      }

      const confirmDelete =
        window.confirm(
          "Are you sure you want to delete this message?"
        );

      if (!confirmDelete) return;

      try {
        const conversationId =
          getConversationId(
            currentUser.uid,
            chatMember.uid
          );

        await deleteDoc(
          doc(
            db,
            "conversations",
            conversationId,
            "messages",
            messageId
          )
        );
      } catch (error) {
        console.error(
          "Delete chat message error:",
          error
        );

        alert(
          "Failed to delete message. Please try again."
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

      if (!chatMember?.uid) {
        alert(
          "Member User ID not found."
        );

        return;
      }

      const text =
        chatText.trim();

      if (!text) return;

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

            message: text,

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
    if (
      chatUnsubscribeRef.current
    ) {
      chatUnsubscribeRef.current();

      chatUnsubscribeRef.current =
        null;
    }

    setShowChatModal(false);
    setChatMember(null);
    setChatMessages([]);
    setChatText("");
    setLoadingChat(false);
    setSendingChat(false);
  };

  // =====================================================
  // CHAT ENTER KEY
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

  // =====================================================
  // FORMAT MESSAGE TIME
  // =====================================================

  const formatMessageTime = (
    timestamp: any
  ) => {
    if (!timestamp?.toDate) {
      return "";
    }

    return timestamp
      .toDate()
      .toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
  };

  // =====================================================
  // UPDATE SELECTED MEMBER FIELD
  // =====================================================

  const updateSelectedMember = (
    field: keyof Member,
    value: string | number
  ) => {
    setSelectedMember(
      (previous) => {
        if (!previous)
          return previous;

        return {
          ...previous,
          [field]: value,
        };
      }
    );
  };

  // =====================================================
  // RETURN
  // =====================================================

  return (
    <AdminLayout>

      {/* =================================================
          CHAT MODAL
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
                borderRadius: "14px",
                overflow: "hidden",
                display: "flex",
                flexDirection:
                  "column",
              }}
            >

              {/* CHAT HEADER */}

              <div
                className="d-flex align-items-center justify-content-between px-3 py-2"
                style={{
                  background:
                    "#075E54",
                  color: "#fff",
                  minHeight: "72px",
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
                        fontSize: "22px",
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
                        opacity: 0.8,
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

              {/* CHAT BODY */}

              <div
                ref={
                  messagesContainerRef
                }
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
                  <div className="h-100 d-flex align-items-center justify-content-center">

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
                ) : chatMessages.length ===
                  0 ? (
                  <div className="h-100 d-flex align-items-center justify-content-center">

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
                        Start a conversation
                        with{" "}
                        {
                          chatMember.name
                        }.
                      </p>

                    </div>

                  </div>
                ) : (
                  <div>

                    {chatMessages.map(
                      (message) => {
                        const isMe =
                          message.senderId ===
                          auth.currentUser?.uid;

                        return (
                          <div
                            key={
                              message.id
                            }
                            className={`d-flex mb-2 ${
                              isMe
                                ? "justify-content-end"
                                : "justify-content-start"
                            }`}
                          >

                            <div
                              style={{
                                maxWidth:
                                  "75%",
                                minWidth:
                                  "80px",
                                padding:
                                  "8px 12px",
                                borderRadius:
                                  isMe
                                    ? "18px 18px 4px 18px"
                                    : "18px 18px 18px 4px",
                                backgroundColor:
                                  isMe
                                    ? "#d9fdd3"
                                    : "#ffffff",
                                color:
                                  "#111",
                                boxShadow:
                                  "0 1px 2px rgba(0,0,0,0.12)",
                                wordBreak:
                                  "break-word",
                              }}
                            >

                              <div
                                style={{
                                  whiteSpace:
                                    "pre-wrap",
                                  fontSize:
                                    "15px",
                                  lineHeight:
                                    "1.45",
                                }}
                              >
                                {
                                  message.message
                                }
                              </div>

                              <div
                                className={`d-flex align-items-center justify-content-end gap-1 mt-1 ${
                                  isMe
                                    ? "text-success"
                                    : "text-muted"
                                }`}
                                style={{
                                  fontSize:
                                    "11px",
                                }}
                              >

                                <span>
                                  {formatMessageTime(
                                    message.createdAt
                                  )}
                                </span>

                                {isMe && (
                                  <span
                                    style={{
                                      fontWeight:
                                        "bold",
                                    }}
                                  >
                                    {message.read
                                      ? "✓✓"
                                      : "✓"}
                                  </span>
                                )}

                                {isMe && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDeleteChatMessage(
                                        message.id
                                      )
                                    }
                                    disabled={
                                      sendingChat
                                    }
                                    style={{
                                      border:
                                        "none",
                                      background:
                                        "transparent",
                                      color:
                                        "#dc3545",
                                      fontSize:
                                        "10px",
                                      padding:
                                        "0 3px",
                                      cursor:
                                        "pointer",
                                      fontWeight:
                                        600,
                                    }}
                                    title="Delete message"
                                  >
                                    Delete
                                  </button>
                                )}

                              </div>

                            </div>

                          </div>
                        );
                      }
                    )}

                    <div
                      ref={
                        chatBottomRef
                      }
                    />

                  </div>
                )}

              </div>

              {/* CHAT INPUT */}

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
                      width: "46px",
                      height: "46px",
                      borderRadius:
                        "50%",
                      background:
                        "#128C7E",
                      color: "#fff",
                      border: "none",
                      flexShrink: 0,
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
                    Enter = Send • Shift +
                    Enter = New Line
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
                    onClick={
                      closeEmailModal
                    }
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
                    onClick={
                      closeEmailModal
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
          EDIT MEMBER MODAL
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
                    onClick={
                      closeEditModal
                    }
                    disabled={
                      updatingMember
                    }
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
                          updateSelectedMember(
                            "name",
                            e.target.value
                          )
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
                          updateSelectedMember(
                            "nameBn",
                            e.target.value
                          )
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
                          updateSelectedMember(
                            "designation",
                            e.target.value
                          )
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
                          updateSelectedMember(
                            "designationBn",
                            e.target.value
                          )
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
                          updateSelectedMember(
                            "memberType",
                            e.target.value
                          )
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
                          updateSelectedMember(
                            "phone",
                            e.target.value
                          )
                        }
                      />

                    </div>

                    {/* DOB */}

                    <div className="col-md-6 mb-3">

                      <label className="form-label">
                        Date of Birth
                      </label>

                      <input
                        type="date"
                        className="form-control"
                        value={
                          selectedMember.dateOfBirth ||
                          ""
                        }
                        onChange={(e) =>
                          updateSelectedMember(
                            "dateOfBirth",
                            e.target.value
                          )
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
                          updateSelectedMember(
                            "bloodGroup",
                            e.target.value
                          )
                        }
                      />

                    </div>

                    {/* MONTHLY SUBSCRIPTION */}

                    <div className="col-md-6 mb-3">

                      <label className="form-label fw-semibold">
                        Monthly Subscription Amount (৳)
                      </label>

                      <input
                        type="number"
                        className="form-control"
                        value={
                          selectedMember.monthlySubscriptionAmount ??
                          0
                        }
                        onChange={(e) =>
                          updateSelectedMember(
                            "monthlySubscriptionAmount",
                            Number(
                              e.target.value
                            ) || 0
                          )
                        }
                        min="0"
                        step="1"
                        placeholder="Enter monthly amount"
                      />

                      <small className="text-muted">
                        Example: 100
                      </small>

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
                          updateSelectedMember(
                            "status",
                            e.target.value
                          )
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

                    {/* ADDRESS */}

                    <div className="col-md-12 mb-3">

                      <label className="form-label">
                        Address
                      </label>

                      <textarea
                        className="form-control"
                        rows={2}
                        value={
                          selectedMember.address ||
                          ""
                        }
                        onChange={(e) =>
                          updateSelectedMember(
                            "address",
                            e.target.value
                          )
                        }
                      />

                    </div>

                    {/* EMAIL */}

                    <div className="col-md-6 mb-3">

                      <label className="form-label">
                        Email
                      </label>

                      <input
                        type="email"
                        className="form-control"
                        value={
                          selectedMember.email ||
                          ""
                        }
                        onChange={(e) =>
                          updateSelectedMember(
                            "email",
                            e.target.value
                          )
                        }
                      />

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
                            alt={
                              selectedMember.name
                            }
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
                    onClick={
                      closeEditModal
                    }
                    disabled={
                      updatingMember
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={
                      handleUpdate
                    }
                    disabled={
                      updatingMember
                    }
                  >
                    {updatingMember
                      ? "Updating..."
                      : "Update Member"}
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

        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">

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

                    <th>
                      Monthly Subscription
                    </th>

                    <th>Email</th>

                    <th>Status</th>

                    <th>Action</th>

                  </tr>

                </thead>

                <tbody>

                  {loading ? (

                    <tr>

                      <td
                        colSpan={11}
                        className="text-center py-4"
                      >

                        <div
                          className="spinner-border text-success"
                          role="status"
                        />

                        <div className="mt-2 text-muted">
                          Loading members...
                        </div>

                      </td>

                    </tr>

                  ) : members.length ===
                    0 ? (

                    <tr>

                      <td
                        colSpan={11}
                        className="text-center py-4"
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
                              member.bloodGroup ||
                              "-"
                            }
                          </td>

                          {/* MONTHLY SUBSCRIPTION */}

                          <td>

                            <span className="fw-semibold text-success">
                              ৳{" "}
                              {Number(
                                member.monthlySubscriptionAmount
                              ) || 0}
                            </span>

                            <small className="text-muted d-block">
                              per month
                            </small>

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

                          <td
                            style={{
                              minWidth:
                                "250px",
                            }}
                          >

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
                                !member.email?.trim() ||
                                sendingEmail
                              }
                            >
                              📧 Mail
                            </button>

                            <button
                              type="button"
                              className="btn btn-sm btn-info text-white mb-1"
                              onClick={() =>
                                handleOpenChat(
                                  member
                                )
                              }
                              disabled={
                                !member.uid
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

