import { useEffect, useRef, useState } from "react";

import {
  db,
  auth,
} from "../firebase/firebase";

import AdminLayout from "./AdminLayout";

import {
  onAuthStateChanged,
} from "firebase/auth";

import {
  collection,
  getDocs,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

// =====================================================
// MEMBER DATA
// =====================================================

interface MemberData {
  uid: string;
  name: string;
  photo: string;
}

// =====================================================
// MESSAGE
// =====================================================

interface Message {
  id: string;

  senderId: string;
  senderName: string;

  receiverId: string;
  receiverName: string;

  message: string;

  createdAt?: any;

  read: boolean;
}

// =====================================================
// CONVERSATION PREVIEW
// =====================================================

interface ConversationPreview {
  memberUid: string;

  memberName: string;

  memberPhoto?: string;

  lastMessage: string;

  lastMessageTime?: any;

  unreadCount: number;
}

// =====================================================
// DASHBOARD
// =====================================================

const Dashboard = () => {

  // ===================================================
  // DASHBOARD STATES
  // ===================================================

  const [totalMembers, setTotalMembers] =
    useState(0);

  const [totalSubscription, setTotalSubscription] =
    useState(0);

  const [totalDonation, setTotalDonation] =
    useState(0);

  const [totalExpense, setTotalExpense] =
    useState(0);

  const [profile, setProfile] =
    useState<any>(null);

  const [mySubscriptionAmount, setMySubscriptionAmount] =
    useState(0);

  // ===================================================
  // CHAT STATES
  // ===================================================

  const [conversations, setConversations] =
    useState<ConversationPreview[]>([]);

  const [conversationMessages, setConversationMessages] =
    useState<Message[]>([]);

  const [selectedConversationMember, setSelectedConversationMember] =
    useState<string | null>(null);

  const [selectedConversationName, setSelectedConversationName] =
    useState("");

  const [selectedConversationPhoto, setSelectedConversationPhoto] =
    useState("");

  const [conversationAdminId, setConversationAdminId] =
    useState("");

  const [chatReply, setChatReply] =
    useState("");

  const [sendingChatReply, setSendingChatReply] =
    useState(false);

  const [loadingConversations, setLoadingConversations] =
    useState(false);

  const [loadingChat, setLoadingChat] =
    useState(false);

  const [showInbox, setShowInbox] =
    useState(false);

  const [deletingMessageId, setDeletingMessageId] =
    useState<string | null>(null);

  // ===================================================
  // REFS
  // ===================================================

  const conversationListenersRef =
    useRef<Record<string, () => void>>({});

  const selectedChatListenerRef =
    useRef<(() => void) | null>(null);

  const conversationMapRef =
    useRef<Map<string, ConversationPreview>>(
      new Map()
    );

  // ===================================================
  // GET CONVERSATION ID
  // ===================================================

  const getConversationId = (
    memberUid: string,
    adminUid: string
  ) => {
    return [memberUid, adminUid]
      .sort()
      .join("_");
  };

  // ===================================================
  // LOAD DASHBOARD STATISTICS
  // ===================================================

  const loadDashboard = async () => {

    try {

      // -----------------------------------------------
      // MEMBERS
      // -----------------------------------------------

      const memberSnapshot =
        await getDocs(
          collection(
            db,
            "members"
          )
        );

      setTotalMembers(
        memberSnapshot.size
      );

      // -----------------------------------------------
      // SUBSCRIPTIONS
      // -----------------------------------------------

      const subscriptionSnapshot =
        await getDocs(
          collection(
            db,
            "subscriptions"
          )
        );

      let subscriptionTotal = 0;

      subscriptionSnapshot.forEach(
        (item) => {

          subscriptionTotal +=
            Number(
              item.data().amount || 0
            );

        }
      );

      setTotalSubscription(
        subscriptionTotal
      );

      // -----------------------------------------------
      // DONATIONS
      // -----------------------------------------------

      const donationSnapshot =
        await getDocs(
          collection(
            db,
            "donations"
          )
        );

      let donationTotal = 0;

      donationSnapshot.forEach(
        (item) => {

          donationTotal +=
            Number(
              item.data().amount || 0
            );

        }
      );

      setTotalDonation(
        donationTotal
      );

      // -----------------------------------------------
      // EXPENSES
      // -----------------------------------------------

      const expenseSnapshot =
        await getDocs(
          collection(
            db,
            "expenses"
          )
        );

      let expenseTotal = 0;

      expenseSnapshot.forEach(
        (item) => {

          expenseTotal +=
            Number(
              item.data().amount || 0
            );

        }
      );

      setTotalExpense(
        expenseTotal
      );

    } catch (error) {

      console.error(
        "Dashboard loading error:",
        error
      );

    }
  };

  // ===================================================
  // LOAD ADMIN PROFILE
  // ===================================================

  const loadProfile = async (
    user: any
  ) => {

    try {

      const q =
        query(
          collection(
            db,
            "members"
          ),
          where(
            "uid",
            "==",
            user.uid
          )
        );

      const snapshot =
        await getDocs(q);

      if (
        snapshot.empty
      ) {
        return;
      }

      const memberDoc =
        snapshot.docs[0];

      const memberData =
        memberDoc.data();

      setProfile(
        memberData
      );

      // -----------------------------------------------
      // ADMIN SUBSCRIPTION
      // -----------------------------------------------

      const subscriptionQuery =
        query(
          collection(
            db,
            "subscriptions"
          ),
          where(
            "memberId",
            "==",
            memberDoc.id
          )
        );

      const subscriptionSnapshot =
        await getDocs(
          subscriptionQuery
        );

      let totalAmount = 0;

      subscriptionSnapshot.forEach(
        (subscriptionDoc) => {

          totalAmount +=
            Number(
              subscriptionDoc.data()
                .amount || 0
            );

        }
      );

      setMySubscriptionAmount(
        totalAmount
      );

    } catch (error) {

      console.error(
        "Load profile error:",
        error
      );

    }
  };

  // ===================================================
  // UPDATE CONVERSATION STATE
  // ===================================================

  const updateConversation = (
    conversation: ConversationPreview
  ) => {

    conversationMapRef.current.set(
      conversation.memberUid,
      conversation
    );

    const list =
      Array.from(
        conversationMapRef.current.values()
      );

    list.sort(
      (a, b) => {

        const timeA =
          a.lastMessageTime
            ?.toMillis?.() || 0;

        const timeB =
          b.lastMessageTime
            ?.toMillis?.() || 0;

        return timeB - timeA;
      }
    );

    setConversations(
      list
    );
  };

  // ===================================================
  // REMOVE CONVERSATION
  // ===================================================

  const removeConversation = (
    memberUid: string
  ) => {

    conversationMapRef.current.delete(
      memberUid
    );

    const list =
      Array.from(
        conversationMapRef.current.values()
      );

    list.sort(
      (a, b) => {

        const timeA =
          a.lastMessageTime
            ?.toMillis?.() || 0;

        const timeB =
          b.lastMessageTime
            ?.toMillis?.() || 0;

        return timeB - timeA;
      }
    );

    setConversations(
      list
    );
  };

  // ===================================================
  // LOAD CONVERSATIONS
  //
  // IMPORTANT:
  // NO collectionGroup()
  //
  // We load members first and listen to each member's
  // conversation separately.
  //
  // Therefore NO COLLECTION GROUP INDEX is required.
  // ===================================================

  const loadConversations = async (
    adminUid: string
  ) => {

    setLoadingConversations(
      true
    );

    try {

      // -----------------------------------------------
      // REMOVE OLD LISTENERS
      // -----------------------------------------------

      Object.values(
        conversationListenersRef.current
      ).forEach(
        (unsubscribe) => {
          unsubscribe();
        }
      );

      conversationListenersRef.current =
        {};

      conversationMapRef.current.clear();

      setConversations([]);

      // -----------------------------------------------
      // GET ALL MEMBERS
      // -----------------------------------------------

      const membersSnapshot =
        await getDocs(
          collection(
            db,
            "members"
          )
        );

      const members: MemberData[] = [];

      membersSnapshot.docs.forEach(
        (memberDoc) => {

          const data =
            memberDoc.data();

          if (
            data.uid &&
            data.uid !== adminUid
          ) {

            members.push({
              uid: data.uid,

              name:
                data.name ||
                "Member",

              photo:
                data.photo ||
                "",
            });

          }

        }
      );

      // -----------------------------------------------
      // LISTEN TO EACH MEMBER'S CONVERSATION
      // -----------------------------------------------

      members.forEach(
        (member) => {

          const conversationId =
            getConversationId(
              member.uid,
              adminUid
            );

          const messagesRef =
            collection(
              db,
              "conversations",
              conversationId,
              "messages"
            );

          // -------------------------------------------
          // REAL-TIME LISTENER
          // -------------------------------------------

          const unsubscribe =
            onSnapshot(
              messagesRef,

              (snapshot) => {

                // -------------------------------------
                // IF NO MESSAGE
                // -------------------------------------

                if (
                  snapshot.empty
                ) {

                  removeConversation(
                    member.uid
                  );

                  return;
                }

                // -------------------------------------
                // GET MESSAGES
                // -------------------------------------

                const messages =
                  snapshot.docs.map(
                    (messageDoc) => {

                      const data =
                        messageDoc.data();

                      return {
                        id:
                          messageDoc.id,

                        senderId:
                          data.senderId ||
                          "",

                        senderName:
                          data.senderName ||
                          "",

                        receiverId:
                          data.receiverId ||
                          "",

                        receiverName:
                          data.receiverName ||
                          "",

                        message:
                          data.message ||
                          "",

                        createdAt:
                          data.createdAt,

                        read:
                          data.read === true,
                      } as Message;
                    }
                  );

                // -------------------------------------
                // SORT OLD → NEW
                // -------------------------------------

                messages.sort(
                  (a, b) => {

                    const timeA =
                      a.createdAt
                        ?.toMillis?.() || 0;

                    const timeB =
                      b.createdAt
                        ?.toMillis?.() || 0;

                    return timeA - timeB;
                  }
                );

                const lastMessage =
                  messages[
                    messages.length - 1
                  ];

                // -------------------------------------
                // COUNT UNREAD MEMBER MESSAGES
                // -------------------------------------

                const unreadCount =
                  messages.filter(
                    (message) => {

                      return (
                        message.senderId ===
                          member.uid &&
                        message.receiverId ===
                          adminUid &&
                        message.read === false
                      );

                    }
                  ).length;

                // -------------------------------------
                // UPDATE PREVIEW
                // -------------------------------------

                updateConversation({
                  memberUid:
                    member.uid,

                  memberName:
                    member.name,

                  memberPhoto:
                    member.photo,

                  lastMessage:
                    lastMessage?.message ||
                    "",

                  lastMessageTime:
                    lastMessage?.createdAt,

                  unreadCount,
                });

              },

              (error) => {

                console.error(
                  `Conversation listener error for ${member.name}:`,
                  error
                );

              }
            );

          conversationListenersRef.current[
            member.uid
          ] = unsubscribe;

        }
      );

    } catch (error) {

      console.error(
        "Load conversations error:",
        error
      );

    } finally {

      setLoadingConversations(
        false
      );

    }
  };

  // ===================================================
  // OPEN CONVERSATION
  // ===================================================

  const openConversation = (
    memberUid: string,
    memberName: string,
    memberPhoto?: string
  ) => {

    const currentUser =
      auth.currentUser;

    if (!currentUser) {

      alert(
        "You are not logged in."
      );

      return;
    }

    // -----------------------------------------------
    // CLEAN OLD CHAT LISTENER
    // -----------------------------------------------

    if (
      selectedChatListenerRef.current
    ) {

      selectedChatListenerRef.current();

      selectedChatListenerRef.current =
        null;
    }

    // -----------------------------------------------
    // CONVERSATION ID
    // -----------------------------------------------

    const conversationId =
      getConversationId(
        memberUid,
        currentUser.uid
      );

    setSelectedConversationMember(
      memberUid
    );

    setSelectedConversationName(
      memberName
    );

    setSelectedConversationPhoto(
      memberPhoto || ""
    );

    setConversationAdminId(
      currentUser.uid
    );

    setChatReply("");

    setConversationMessages([]);

    setLoadingChat(true);

    // -----------------------------------------------
    // REAL-TIME CHAT LISTENER
    // -----------------------------------------------

    const messagesRef =
      collection(
        db,
        "conversations",
        conversationId,
        "messages"
      );

    const unsubscribe =
      onSnapshot(
        messagesRef,

        async (snapshot) => {

          const messageList: Message[] =
            snapshot.docs.map(
              (messageDoc) => {

                const data =
                  messageDoc.data();

                return {
                  id:
                    messageDoc.id,

                  senderId:
                    data.senderId ||
                    "",

                  senderName:
                    data.senderName ||
                    "",

                  receiverId:
                    data.receiverId ||
                    "",

                  receiverName:
                    data.receiverName ||
                    "",

                  message:
                    data.message ||
                    "",

                  createdAt:
                    data.createdAt,

                  read:
                    data.read === true,
                };
              }
            );

          // -------------------------------------------
          // SORT OLD → NEW
          // -------------------------------------------

          messageList.sort(
            (a, b) => {

              const timeA =
                a.createdAt
                  ?.toMillis?.() || 0;

              const timeB =
                b.createdAt
                  ?.toMillis?.() || 0;

              return timeA - timeB;
            }
          );

          setConversationMessages(
            messageList
          );

          setLoadingChat(false);

          // -------------------------------------------
          // MARK MEMBER MESSAGES AS READ
          // -------------------------------------------

          const unreadMessages =
            snapshot.docs.filter(
              (messageDoc) => {

                const data =
                  messageDoc.data();

                return (
                  data.senderId ===
                    memberUid &&
                  data.receiverId ===
                    currentUser.uid &&
                  data.read === false
                );

              }
            );

          for (
            const messageDoc of
              unreadMessages
          ) {

            try {

              await updateDoc(
                doc(
                  db,
                  "conversations",
                  conversationId,
                  "messages",
                  messageDoc.id
                ),
                {
                  read: true,
                }
              );

            } catch (error) {

              console.error(
                "Mark message read error:",
                error
              );

            }

          }

        },

        (error) => {

          console.error(
            "Chat listener error:",
            error
          );

          setLoadingChat(false);

        }
      );

    selectedChatListenerRef.current =
      unsubscribe;
  };

  // ===================================================
  // SEND CHAT REPLY
  // ===================================================

  const handleChatReply =
    async () => {

      const currentUser =
        auth.currentUser;

      if (!currentUser) {

        alert(
          "You are not logged in."
        );

        return;
      }

      if (
        !selectedConversationMember
      ) {
        return;
      }

      const text =
        chatReply.trim();

      if (!text) {
        return;
      }

      try {

        setSendingChatReply(
          true
        );

        const conversationId =
          getConversationId(
            selectedConversationMember,
            currentUser.uid
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
    profile?.name ||
    currentUser.displayName ||
    currentUser.email ||
    "Admin",

            receiverId:
              selectedConversationMember,

            receiverName:
              selectedConversationName,

            message:
              text,

            createdAt:
              serverTimestamp(),

            read:
              false,
          }
        );

        setChatReply("");

      } catch (error) {

        console.error(
          "Chat reply error:",
          error
        );

        alert(
          "Failed to send reply. Please try again."
        );

      } finally {

        setSendingChatReply(
          false
        );

      }
    };

  // ===================================================
  // DELETE MESSAGE
  // ===================================================

  const handleDeleteChatMessage =
    async (
      message: Message
    ) => {

      const currentUser =
        auth.currentUser;

      if (!currentUser) {
        return;
      }

      if (
        !selectedConversationMember
      ) {
        return;
      }

      const confirmDelete =
        window.confirm(
          "Are you sure you want to delete this message?"
        );

      if (!confirmDelete) {
        return;
      }

      try {

        setDeletingMessageId(
          message.id
        );

        const conversationId =
          getConversationId(
            selectedConversationMember,
            currentUser.uid
          );

        await deleteDoc(
          doc(
            db,
            "conversations",
            conversationId,
            "messages",
            message.id
          )
        );

      } catch (error) {

        console.error(
          "Delete chat message error:",
          error
        );

        alert(
          "Failed to delete message."
        );

      } finally {

        setDeletingMessageId(
          null
        );

      }
    };

  // ===================================================
  // CLOSE CHAT
  // ===================================================

  const closeChat = () => {

    if (
      selectedChatListenerRef.current
    ) {

      selectedChatListenerRef.current();

      selectedChatListenerRef.current =
        null;
    }

    setSelectedConversationMember(
      null
    );

    setSelectedConversationName(
      ""
    );

    setSelectedConversationPhoto(
      ""
    );

    setConversationMessages(
      []
    );

    setChatReply("");

    setLoadingChat(false);
  };

  // ===================================================
  // AUTH + INITIAL LOAD
  // ===================================================

  useEffect(() => {

    let mounted = true;

    const unsubscribeAuth =
      onAuthStateChanged(
        auth,
        async (user) => {

          if (!user) {

            console.log(
              "No logged-in user"
            );

            return;
          }

          console.log(
            "Logged-in User UID:",
            user.uid
          );

          console.log(
            "Logged-in User Email:",
            user.email
          );

          if (!mounted) {
            return;
          }

          await loadDashboard();

          await loadProfile(
            user
          );

          if (!mounted) {
            return;
          }

          await loadConversations(
            user.uid
          );
        }
      );

    return () => {

      mounted = false;

      unsubscribeAuth();

      // ---------------------------------------------
      // CLEAN ALL CONVERSATION LISTENERS
      // ---------------------------------------------

      Object.values(
        conversationListenersRef.current
      ).forEach(
        (unsubscribe) => {
          unsubscribe();
        }
      );

      conversationListenersRef.current =
        {};

      // ---------------------------------------------
      // CLEAN SELECTED CHAT LISTENER
      // ---------------------------------------------

      if (
        selectedChatListenerRef.current
      ) {

        selectedChatListenerRef.current();

        selectedChatListenerRef.current =
          null;
      }

    };

  }, []);

  // ===================================================
  // TOTAL UNREAD
  // ===================================================

  const unreadCount =
    conversations.reduce(
      (
        total,
        conversation
      ) =>
        total +
        conversation.unreadCount,
      0
    );

  // ===================================================
  // TOTAL INCOME
  // ===================================================

  const totalIncome =
    totalSubscription +
    totalDonation;

  // ===================================================
  // CURRENT BALANCE
  // ===================================================

  const currentBalance =
    totalIncome -
    totalExpense;

  // ===================================================
  // CONTRIBUTION
  // ===================================================

  const subscriptionPercentage =
    totalSubscription > 0
      ? (
          mySubscriptionAmount /
          totalSubscription
        ) * 100
      : 0;

  // ===================================================
  // AGE
  // ===================================================

  const calculateAge = (
    dob: string
  ) => {

    if (!dob) {
      return "N/A";
    }

    const birthDate =
      new Date(dob);

    const today =
      new Date();

    let years =
      today.getFullYear() -
      birthDate.getFullYear();

    let months =
      today.getMonth() -
      birthDate.getMonth();

    let days =
      today.getDate() -
      birthDate.getDate();

    if (days < 0) {

      months--;

      const previousMonth =
        new Date(
          today.getFullYear(),
          today.getMonth(),
          0
        );

      days +=
        previousMonth.getDate();
    }

    if (months < 0) {

      years--;

      months += 12;
    }

    return `${years} Year ${months} Month ${days} Day`;
  };

  // ===================================================
  // MESSAGE TIME
  // ===================================================

  const formatMessageTime = (
    timestamp: any
  ) => {

    if (
      !timestamp?.toDate
    ) {

      return "Just now";
    }

    return timestamp
      .toDate()
      .toLocaleTimeString(
        [],
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      );
  };

  // ===================================================
  // CONVERSATION TIME
  // ===================================================

  const formatConversationTime = (
    timestamp: any
  ) => {

    if (
      !timestamp?.toDate
    ) {
      return "";
    }

    return timestamp
      .toDate()
      .toLocaleString(
        [],
        {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        }
      );
  };

  // ===================================================
  // RETURN
  // ===================================================

  return (
    <AdminLayout>

      {/* =================================================
          INBOX MODAL
      ================================================= */}

      {showInbox && (

        <div
          className="modal fade show d-block"
          style={{
            backgroundColor:
              "rgba(0,0,0,0.6)",
          }}
        >

          <div
            className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable"
          >

            <div className="modal-content">

              {/* =========================================
                  MODAL HEADER
              ========================================= */}

              <div className="modal-header">

                <h5 className="modal-title">

                  {selectedConversationMember ? (
                    <>
                      💬{" "}
                      {selectedConversationName}
                    </>
                  ) : (
                    <>
                      📥 My Inbox

                      {unreadCount > 0 && (
                        <span className="badge bg-danger ms-2">
                          {unreadCount}
                        </span>
                      )}
                    </>
                  )}

                </h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {

                    setShowInbox(
                      false
                    );

                    closeChat();

                  }}
                />

              </div>

              {/* =========================================
                  MODAL BODY
              ========================================= */}

              <div
                className="modal-body p-0"
              >

                {selectedConversationMember ? (

                  /* =======================================
                     CHAT WINDOW
                  ======================================= */

                  <div
                    className="d-flex flex-column"
                    style={{
                      height:
                        "600px",
                    }}
                  >

                    {/* ===================================
                        CHAT HEADER
                    =================================== */}

                    <div
                      className="d-flex align-items-center border-bottom p-3 bg-white"
                    >

                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary me-3"
                        onClick={
                          closeChat
                        }
                      >
                        ←
                      </button>

                      {selectedConversationPhoto ? (

                        <img
                          src={
                            selectedConversationPhoto
                          }
                          alt={
                            selectedConversationName
                          }
                          width={48}
                          height={48}
                          className="rounded-circle me-3"
                          style={{
                            objectFit:
                              "cover",
                          }}
                        />

                      ) : (

                        <div
                          className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center me-3"
                          style={{
                            width: 48,
                            height: 48,
                            fontSize: 22,
                          }}
                        >
                          👤
                        </div>

                      )}

                      <div>

                        <h6 className="mb-0 fw-bold">
                          {
                            selectedConversationName
                          }
                        </h6>

                        <small className="text-muted">
                          Member Conversation
                        </small>

                      </div>

                    </div>

                    {/* ===================================
                        CHAT MESSAGES
                    =================================== */}

                    <div
                      className="flex-grow-1"
                      style={{
                        overflowY:
                          "auto",

                        background:
                          "#efeae2",

                        padding:
                          "20px",
                      }}
                    >

                      {loadingChat ? (

                        <div className="text-center text-muted py-5">

                          <div
                            className="spinner-border"
                            role="status"
                          />

                          <div className="mt-2">
                            Loading conversation...
                          </div>

                        </div>

                      ) : conversationMessages.length === 0 ? (

                        <div className="text-center text-muted py-5">

                          <div
                            style={{
                              fontSize:
                                "50px",
                            }}
                          >
                            💬
                          </div>

                          <p>
                            No messages yet.
                          </p>

                        </div>

                      ) : (

                        conversationMessages.map(
                          (
                            message
                          ) => {

                            const isAdmin =
                              message.senderId ===
                              conversationAdminId;

                            return (

                              <div
                                key={
                                  message.id
                                }
                                className={`d-flex mb-3 ${
                                  isAdmin
                                    ? "justify-content-end"
                                    : "justify-content-start"
                                }`}
                              >

                                <div
                                  style={{
                                    maxWidth:
                                      "75%",

                                    minWidth:
                                      "120px",

                                    padding:
                                      "10px 14px",

                                    borderRadius:
                                      isAdmin
                                        ? "12px 4px 12px 12px"
                                        : "4px 12px 12px 12px",

                                    backgroundColor:
                                      isAdmin
                                        ? "#d9fdd3"
                                        : "#ffffff",

                                    boxShadow:
                                      "0 1px 2px rgba(0,0,0,0.15)",

                                    position:
                                      "relative",
                                  }}
                                >

                                  {/* SENDER */}

                                  <div
                                    className="small fw-bold mb-1"
                                    style={{
                                      color:
                                        isAdmin
                                          ? "#075e54"
                                          : "#555",
                                    }}
                                  >
                                    {isAdmin
  ? (
      profile?.name ||
      auth.currentUser?.displayName ||
      auth.currentUser?.email ||
      "Admin"
    )
  : selectedConversationName}
                                  </div>

                                  {/* MESSAGE */}

                                  <div
                                    style={{
                                      whiteSpace:
                                        "pre-wrap",

                                      wordBreak:
                                        "break-word",

                                      lineHeight:
                                        "1.5",

                                      fontSize:
                                        "15px",
                                    }}
                                  >
                                    {
                                      message.message
                                    }
                                  </div>

                                  {/* TIME + DELETE */}

                                  <div
                                    className="d-flex justify-content-end align-items-center gap-2 mt-1"
                                  >

                                    <small
                                      className="text-muted"
                                      style={{
                                        fontSize:
                                          "10px",
                                      }}
                                    >
                                      {
                                        formatMessageTime(
                                          message.createdAt
                                        )
                                      }
                                    </small>

                                    <button
                                      type="button"
                                      className="btn btn-sm p-0 text-danger"
                                      style={{
                                        fontSize:
                                          "11px",

                                        border:
                                          "none",

                                        background:
                                          "transparent",
                                      }}
                                      onClick={() =>
                                        handleDeleteChatMessage(
                                          message
                                        )
                                      }
                                      disabled={
                                        deletingMessageId ===
                                        message.id
                                      }
                                    >
                                      {deletingMessageId ===
                                      message.id
                                        ? "..."
                                        : "🗑️"}
                                    </button>

                                  </div>

                                </div>

                              </div>

                            );
                          }
                        )

                      )}

                    </div>

                    {/* ===================================
                        REPLY BOX
                    =================================== */}

                    <div
                      className="p-3 border-top bg-white"
                    >

                      <div className="d-flex gap-2 align-items-end">

                        <textarea
                          className="form-control"
                          rows={2}
                          placeholder={`Reply to ${selectedConversationName}...`}
                          value={
                            chatReply
                          }
                          onChange={(e) =>
                            setChatReply(
                              e.target.value
                            )
                          }
                          disabled={
                            sendingChatReply
                          }
                          onKeyDown={(e) => {

                            if (
                              e.key ===
                                "Enter" &&
                              !e.shiftKey
                            ) {

                              e.preventDefault();

                              if (
                                chatReply.trim()
                              ) {

                                handleChatReply();

                              }

                            }

                          }}
                        />

                        <button
                          type="button"
                          className="btn btn-primary"
                          style={{
                            minWidth:
                              "80px",

                            height:
                              "58px",
                          }}
                          onClick={
                            handleChatReply
                          }
                          disabled={
                            sendingChatReply ||
                            !chatReply.trim()
                          }
                        >

                          {sendingChatReply ? (

                            <span
                              className="spinner-border spinner-border-sm"
                            />

                          ) : (
                            "➤ Send"
                          )}

                        </button>

                      </div>

                      <small className="text-muted">
                        Press Enter to send · Shift + Enter for new line
                      </small>

                    </div>

                  </div>

                ) : (

                  /* =======================================
                     CONVERSATION LIST
                  ======================================= */

                  <div
                    className="p-3"
                    style={{
                      minHeight:
                        "450px",
                    }}
                  >

                    {loadingConversations ? (

                      <div className="text-center py-5">

                        <div
                          className="spinner-border text-primary"
                          role="status"
                        />

                        <p className="text-muted mt-3">
                          Loading conversations...
                        </p>

                      </div>

                    ) : conversations.length === 0 ? (

                      <div className="text-center py-5 text-muted">

                        <div
                          style={{
                            fontSize:
                              "55px",
                          }}
                        >
                          📭
                        </div>

                        <h6 className="mt-3">
                          No messages yet.
                        </h6>

                        <p className="mb-0">
                          Messages from members will appear here.
                        </p>

                      </div>

                    ) : (

                      <div className="list-group">

                        {conversations.map(
                          (
                            conversation
                          ) => (

                            <button
                              key={
                                conversation.memberUid
                              }
                              type="button"
                              className="list-group-item list-group-item-action p-3"
                              onClick={() =>
                                openConversation(
                                  conversation.memberUid,
                                  conversation.memberName,
                                  conversation.memberPhoto
                                )
                              }
                            >

                              <div className="d-flex align-items-center">

                                {/* MEMBER PHOTO */}

                                {conversation.memberPhoto ? (

                                  <img
                                    src={
                                      conversation.memberPhoto
                                    }
                                    alt={
                                      conversation.memberName
                                    }
                                    width={55}
                                    height={55}
                                    className="rounded-circle me-3"
                                    style={{
                                      objectFit:
                                        "cover",
                                    }}
                                  />

                                ) : (

                                  <div
                                    className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center me-3"
                                    style={{
                                      width: 55,
                                      height: 55,
                                      fontSize: 25,
                                      flexShrink:
                                        0,
                                    }}
                                  >
                                    👤
                                  </div>

                                )}

                                {/* MESSAGE INFO */}

                                <div
                                  className="flex-grow-1 text-start"
                                  style={{
                                    minWidth:
                                      0,
                                  }}
                                >

                                  <div className="d-flex justify-content-between align-items-center">

                                    <strong
                                      className={
                                        conversation.unreadCount >
                                        0
                                          ? "fw-bold"
                                          : ""
                                      }
                                    >
                                      {
                                        conversation.memberName
                                      }
                                    </strong>

                                    <small className="text-muted ms-2">
                                      {
                                        formatConversationTime(
                                          conversation.lastMessageTime
                                        )
                                      }
                                    </small>

                                  </div>

                                  <div className="d-flex justify-content-between align-items-center mt-1">

                                    <span
                                      className={`text-muted ${
                                        conversation.unreadCount >
                                        0
                                          ? "fw-semibold text-dark"
                                          : ""
                                      }`}
                                      style={{
                                        overflow:
                                          "hidden",

                                        textOverflow:
                                          "ellipsis",

                                        whiteSpace:
                                          "nowrap",
                                      }}
                                    >
                                      {
                                        conversation.lastMessage
                                      }
                                    </span>

                                    {conversation.unreadCount >
                                      0 && (

                                      <span className="badge bg-danger rounded-pill ms-2">
                                        {
                                          conversation.unreadCount
                                        }
                                      </span>

                                    )}

                                  </div>

                                </div>

                              </div>

                            </button>

                          )
                        )}

                      </div>

                    )}

                  </div>

                )}

              </div>

              {/* =========================================
                  MODAL FOOTER
              ========================================= */}

              <div className="modal-footer">

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {

                    setShowInbox(
                      false
                    );

                    closeChat();

                  }}
                >
                  Close
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

      {/* =================================================
          MAIN DASHBOARD
      ================================================= */}

      <div className="container-fluid p-4">

        <div className="row g-4">

          {/* =================================================
              PROFILE
          ================================================= */}

          <div className="col-lg-4">

            <div className="profile-card">

              <div className="avatar">

                {profile?.photo ? (

                  <img
                    src={
                      profile.photo
                    }
                    alt="profile"
                  />

                ) : (

                  "👤"

                )}

              </div>

              <h4>
                {
                  profile?.name ||
                  "Admin"
                }
              </h4>

              <div className="profile-info">

                <div className="designation-badge">

                  <i className="bi bi-patch-check-fill me-2"></i>

                  {
                    profile?.designation ||
                    "No Designation"
                  }

                </div>

                <p>
                  📞{" "}
                  {
                    profile?.phone ||
                    "N/A"
                  }
                </p>

                <p>
                  📧{" "}
                  {
                    profile?.email ||
                    "N/A"
                  }
                </p>

                <p>
                  🩸 Blood :{" "}
                  {
                    profile?.bloodGroup ||
                    "N/A"
                  }
                </p>

                <p>
                  🎂 DOB :{" "}
                  {
                    profile?.dateOfBirth ||
                    "N/A"
                  }
                </p>

                <p>
                  🎈 Age :{" "}
                  {
                    calculateAge(
                      profile?.dateOfBirth
                    )
                  }
                </p>

              </div>

            </div>

          </div>

          {/* =================================================
              STATISTICS
          ================================================= */}

          <div className="col-lg-8">

            <div className="stats-card">

              <div className="row g-3">

                {/* TOTAL MEMBERS */}

                <div className="col-md-6">

                  <div className="stat-box members">

                    <span>
                      👥 Total Members
                    </span>

                    <h3>
                      {
                        totalMembers
                      }
                    </h3>

                  </div>

                </div>

                {/* SUBSCRIPTION */}

                <div className="col-md-6">

                  <div className="stat-box subscription">

                    <span>
                      💳 Total Subscription
                    </span>

                    <h3>
                      ৳{" "}
                      {
                        totalSubscription.toLocaleString()
                      }
                    </h3>

                  </div>

                </div>

                {/* DONATION */}

                <div className="col-md-6">

                  <div className="stat-box donation">

                    <span>
                      🤲 Total Donation
                    </span>

                    <h3>
                      ৳{" "}
                      {
                        totalDonation.toLocaleString()
                      }
                    </h3>

                  </div>

                </div>

                {/* INCOME */}

                <div className="col-md-6">

                  <div className="stat-box income">

                    <span>
                      📈 Total Income
                    </span>

                    <h3>
                      ৳{" "}
                      {
                        totalIncome.toLocaleString()
                      }
                    </h3>

                  </div>

                </div>

                {/* EXPENSE */}

                <div className="col-md-6">

                  <div className="stat-box expense">

                    <span>
                      💸 Total Expense
                    </span>

                    <h3>
                      ৳{" "}
                      {
                        totalExpense.toLocaleString()
                      }
                    </h3>

                  </div>

                </div>

                {/* BALANCE */}

                <div className="col-md-6">

                  <div className="stat-box balance">

                    <span>
                      🏦 Current Balance
                    </span>

                    <h3>
                      ৳{" "}
                      {
                        currentBalance.toLocaleString()
                      }
                    </h3>

                  </div>

                </div>

                {/* MY SUBSCRIPTION */}

                <div className="col-md-6">

                  <div
                    className="stat-box contribution"
                    style={{
                      background:
                        "linear-gradient(135deg, #d011d0, #d011d0)",
                      color:
                        "#fff",
                    }}
                  >

                    <span>
                      💳 My Subscription
                    </span>

                    <h3 className="mb-1">
                      ৳{" "}
                      {
                        mySubscriptionAmount.toLocaleString()
                      }
                    </h3>

                  </div>

                </div>

                {/* CONTRIBUTION */}

                <div className="col-md-6">

                  <div
                    className="stat-box contribution"
                    style={{
                      background:
                        "linear-gradient(135deg, #16e4d3, #16e4d3)",
                      color:
                        "#fff",
                    }}
                  >

                    <span>
                      📊 % of Contribution
                    </span>

                    <div className="mt-3">

                      <div className="d-flex justify-content-between mb-1">

                        <small className="fw-bold text-white">

                          {
                            subscriptionPercentage.toFixed(
                              1
                            )
                          }
                          %

                        </small>

                      </div>

                      <div
                        style={{
                          width:
                            "100%",

                          height:
                            "15px",

                          background:
                            "rgba(255,255,255,0.3)",

                          borderRadius:
                            "10px",

                          overflow:
                            "hidden",
                        }}
                      >

                        <div
                          style={{
                            width: `${Math.min(
                              subscriptionPercentage,
                              100
                            )}%`,

                            height:
                              "100%",

                            background:
                              "#fff",

                            borderRadius:
                              "10px",

                            transition:
                              "width 0.6s ease",
                          }}
                        />

                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            INBOX
        ================================================= */}

        <div className="row mt-4">

          <div className="col-12">

            <div className="card shadow-sm border-0">

              {/* INBOX HEADER */}

              <div className="card-header bg-white d-flex justify-content-between align-items-center">

                <h5 className="mb-0">
                  📥 My Inbox
                </h5>

                <div className="d-flex align-items-center gap-2">

                  {unreadCount > 0 && (

                    <span className="badge bg-danger">
                      {
                        unreadCount
                      } New
                    </span>

                  )}

                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    onClick={() => {

                      closeChat();

                      setShowInbox(
                        true
                      );

                    }}
                  >
                    View Inbox
                  </button>

                </div>

              </div>

              {/* INBOX BODY */}

              <div className="card-body">

                {loadingConversations ? (

                  <div className="text-center text-muted py-4">

                    <div
                      className="spinner-border text-primary"
                      role="status"
                    />

                    <p className="mt-2 mb-0">
                      Loading messages...
                    </p>

                  </div>

                ) : conversations.length === 0 ? (

                  <div className="text-center text-muted py-4">

                    <div
                      style={{
                        fontSize:
                          "45px",
                      }}
                    >
                      📭
                    </div>

                    <p className="mb-0">
                      No messages yet.
                    </p>

                  </div>

                ) : (

                  <div className="list-group">

                    {conversations
                      .slice(
                        0,
                        5
                      )
                      .map(
                        (
                          conversation
                        ) => (

                          <button
                            key={
                              conversation.memberUid
                            }
                            type="button"
                            className="list-group-item list-group-item-action"
                            onClick={() => {

                              setShowInbox(
                                true
                              );

                              openConversation(
                                conversation.memberUid,
                                conversation.memberName,
                                conversation.memberPhoto
                              );

                            }}
                          >

                            <div className="d-flex align-items-center">

                              {conversation.memberPhoto ? (

                                <img
                                  src={
                                    conversation.memberPhoto
                                  }
                                  alt={
                                    conversation.memberName
                                  }
                                  width={50}
                                  height={50}
                                  className="rounded-circle me-3"
                                  style={{
                                    objectFit:
                                      "cover",
                                  }}
                                />

                              ) : (

                                <div
                                  className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center me-3"
                                  style={{
                                    width:
                                      50,
                                    height:
                                      50,
                                    flexShrink:
                                      0,
                                  }}
                                >
                                  👤
                                </div>

                              )}

                              <div
                                className="flex-grow-1 text-start"
                                style={{
                                  minWidth:
                                    0,
                                }}
                              >

                                <div className="d-flex justify-content-between">

                                  <strong>
                                    {
                                      conversation.memberName
                                    }
                                  </strong>

                                  <small className="text-muted ms-2">
                                    {
                                      formatConversationTime(
                                        conversation.lastMessageTime
                                      )
                                    }
                                  </small>

                                </div>

                                <div className="d-flex align-items-center">

                                  <span
                                    className="text-muted text-truncate"
                                    style={{
                                      maxWidth:
                                        "90%",
                                    }}
                                  >
                                    {
                                      conversation.lastMessage
                                    }
                                  </span>

                                  {conversation.unreadCount >
                                    0 && (

                                    <span className="badge bg-danger rounded-pill ms-2">
                                      {
                                        conversation.unreadCount
                                      }
                                    </span>

                                  )}

                                </div>

                              </div>

                            </div>

                          </button>

                        )
                      )}

                  </div>

                )}

              </div>

            </div>

          </div>

        </div>

      </div>

    </AdminLayout>
  );
};

export default Dashboard;