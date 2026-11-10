import { useEffect, useState } from "react";

import { Container, Row, Col, Card,  Badge } from "react-bootstrap";

import { collection, getDocs } from "firebase/firestore";

import { db } from "../firebase/firebase";

import { useTranslation } from "react-i18next";

// =====================================================
// MEMBER INTERFACE
// =====================================================

interface Member {
  phone: string;
  id: string;

  name: string;
  nameBn: string;

  designation?: string;
  designationBn?: string;

  photo?: string;
  status?: string;

  memberCategory?: string;

  shortBio?: string;
  shortBioBn?: string;

  bio?: string;
  bioBn?: string;

  description?: string;
  descriptionBn?: string;
}

// =====================================================
// CATEGORY TYPE
// =====================================================

type Category = "executive" | "founder" | "associate";

// =====================================================
// ABOUT COMPONENT
// =====================================================

export default function About() {
  const {  i18n } = useTranslation();

  const isBangla = i18n.language.startsWith("bn");

  const [members, setMembers] = useState<Member[]>([]);

  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<Category>("executive");

  // =====================================================
  // DESIGNATION ORDER
  // =====================================================

  const designationOrder = [
    "President",
    "Vice President",
    "General Secretary",
    "Joint Secretary",
    "Treasurer",
    "Legal Secretary",
    "Health Secretary",
    "Organizing Secretary",
    "Social Welfare Secretary",
    "Education and Literature Secretary",
    "Cultural Secretary",
    "Information and Technology Secretary",
    "Office Secretary",
    "Sports Secretary",
    "Publicity and Publication Secretary",
    "Women Affairs Secretary",
    "Executive Member",
  ];

  // =====================================================
  // FETCH MEMBERS FROM FIREBASE
  // =====================================================

  const fetchMembers = async () => {
    try {
      setLoading(true);

      const snapshot = await getDocs(collection(db, "members"));

      const data: Member[] = snapshot.docs.map((item) => ({
        id: item.id,
        ...(item.data() as Omit<Member, "id">),
      }));

      // ONLY ACTIVE MEMBERS
      const activeMembers = data.filter(
        (member) => !member.status || member.status.toLowerCase() === "active",
      );

      // SORT BY DESIGNATION
     activeMembers.sort((a, b) => {
  const categoryA = (a.memberCategory || "executive").toLowerCase();
  const categoryB = (b.memberCategory || "executive").toLowerCase();

  // Founder ও Associate সদস্যদের আলাদা ক্যাটাগরি হিসেবে রাখা
  const categoryOrder: Record<string, number> = {
    founder: 1,
    associate: 2,
    executive: 3,
  };

  const categoryDiff =
    (categoryOrder[categoryA] ?? 99) -
    (categoryOrder[categoryB] ?? 99);

  if (categoryDiff !== 0) return categoryDiff;

  // Founder ও Associate: Mobile Number অনুযায়ী Sort
  if (categoryA === "founder" || categoryA === "associate") {
    const phoneA = (a.phone || "").replace(/\D/g, "");
    const phoneB = (b.phone || "").replace(/\D/g, "");

    if (!phoneA) return 1;
    if (!phoneB) return -1;

    return phoneA.localeCompare(phoneB);
  }

  // শুধু Executive Members: Designation অনুযায়ী Sort
  if (categoryA === "executive") {
    const indexA = designationOrder.findIndex(
      (designation) =>
        designation.toLowerCase() === (a.designation || "").toLowerCase()
    );

    const indexB = designationOrder.findIndex(
      (designation) =>
        designation.toLowerCase() === (b.designation || "").toLowerCase()
    );

    const orderA = indexA === -1 ? 999 : indexA;
    const orderB = indexB === -1 ? 999 : indexB;

    return orderA - orderB;
  }

  return 0;
});
      setMembers(activeMembers);
    } catch (error) {
      console.error("Error loading members:", error);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {
    fetchMembers();
  }, []);

  // =====================================================
  // MEMBER CATEGORY
  // OLD MEMBERS WITHOUT CATEGORY = EXECUTIVE
  // =====================================================

  const getCategory = (member: Member): Category => {
    const category = (member.memberCategory || "executive").toLowerCase();

    if (
      category === "founder" ||
      category === "associate" ||
      category === "executive"
    ) {
      return category;
    }

    return "executive";
  };

  // =====================================================
  // FILTER MEMBERS
  // =====================================================

  const executiveMembers = members.filter(
    (member) => getCategory(member) === "executive",
  );

  const founderMembers = members.filter(
    (member) => getCategory(member) === "founder",
  );

  const associateMembers = members.filter(
    (member) => getCategory(member) === "associate",
  );

  // =====================================================
  // CATEGORY DATA
  // =====================================================

  const categoryData = [
    {
      key: "executive" as Category,

      title: isBangla ? "কার্যকরী সদস্যবৃন্দ" : "Executive Members",

      icon: "bi bi-people-fill",

      count: executiveMembers.length,

      members: executiveMembers,
    },

    {
      key: "founder" as Category,

      title: isBangla ? "প্রতিষ্ঠাতা সদস্যবৃন্দ" : "Founder Members",

      icon: "bi bi-award-fill",

      count: founderMembers.length,

      members: founderMembers,
    },

    {
      key: "associate" as Category,

      title: isBangla ? "সহযোগী সদস্যবৃন্দ" : "Associate Members",

      icon: "bi bi-handshake-fill",

      count: associateMembers.length,

      members: associateMembers,
    },
  ];

  const currentCategory = categoryData.find((item) => item.key === activeTab)!;

  // =====================================================
  // GET MEMBER NAME
  // =====================================================

  const getName = (member: Member) =>
    isBangla ? member.nameBn || member.name : member.name;

  // =====================================================
  // GET DESIGNATION
  // =====================================================

  const getDesignation = (member: Member) =>
    isBangla
      ? member.designationBn || member.designation || ""
      : member.designation || "";

  // =====================================================
  // GET SHORT BIO
  // =====================================================

  const getBio = (member: Member) => {
    if (isBangla) {
      return (
        member.shortBioBn ||
        member.bioBn ||
        member.descriptionBn ||
        member.shortBio ||
        member.bio ||
        member.description ||
        ""
      );
    }

    return (
      member.shortBio ||
      member.bio ||
      member.description ||
      member.shortBioBn ||
      member.bioBn ||
      member.descriptionBn ||
      ""
    );
  };

  // =====================================================
  // MEMBER CARD - ALL SAME LEVEL
  // =====================================================

  const MemberCard = ({ member }: { member: Member }) => {
    return (
      <Card className="member-profile-card border-0 h-100 rounded-4 overflow-hidden">
        {/* TOP ACCENT */}

        <div className="member-card-accent" />

        <Card.Body className="text-center d-flex flex-column align-items-center p-4">
          {/* PHOTO */}

          <div className="member-photo-wrapper mb-3">
            {member.photo ? (
              <img
                src={member.photo}
                alt={member.name}
                className="member-photo"
                loading="lazy"
              />
            ) : (
              <div className="member-photo-placeholder">
                <i className="bi bi-person-fill" />
              </div>
            )}
          </div>

          {/* NAME */}

          <h5 className="fw-bold member-name mb-2">{getName(member)}</h5>

          {/* DESIGNATION */}

          {member.designation && (
            <Badge bg="success" className="member-designation px-3 py-2 mb-3">
              {getDesignation(member)}
            </Badge>
          )}

          {/* SHORT BIO */}

          {getBio(member) && (
            <p className="member-bio mb-0">{getBio(member)}</p>
          )}
        </Card.Body>
      </Card>
    );
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="about-page py-5">
      <Container>
      

        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-success" role="status" />

            <p className="text-muted mt-3">
              {isBangla ? "সদস্যদের তথ্য লোড হচ্ছে..." : "Loading members..."}
            </p>
          </div>
        )}

        {/* =========================================
            NO MEMBERS
        ========================================= */}

        {!loading && members.length === 0 && (
          <div className="text-center py-5">
            <i className="bi bi-people display-1 text-secondary" />

            <h5 className="mt-3">
              {isBangla ? "কোনো সদস্য পাওয়া যায়নি" : "No Members Found"}
            </h5>

            <p className="text-muted">
              {isBangla
                ? "সদস্যদের তথ্য বর্তমানে পাওয়া যাচ্ছে না।"
                : "Member information is currently unavailable."}
            </p>
          </div>
        )}

        {!loading && members.length > 0 && (
          <>
            {/* =========================================
                MEMBER STATISTICS
            ========================================= */}

            <Row className="g-3 mb-5">
              {categoryData.map((category) => (
                <Col xs={4} key={category.key}>
                  <Card
                    className={`member-stat-card border-0 h-100 rounded-4 ${
                      activeTab === category.key ? "stat-active" : ""
                    }`}
                    onClick={() => setActiveTab(category.key)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setActiveTab(category.key);
                      }
                    }}
                  >
                    <Card.Body className="text-center p-3">
                      <div className="stat-icon mb-2">
                        <i className={category.icon} />
                      </div>

                     

                      <p className="stat-label mb-0">{category.title}</p>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* =========================================
                ACTIVE CATEGORY HEADER
            ========================================= */}

            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4">
              <div>
                <h4 className="fw-bold mb-1">{currentCategory.title}</h4>             
              </div>

            </div>

            {/* =========================================
                EMPTY CATEGORY
            ========================================= */}

            {currentCategory.members.length === 0 && (
              <div className="text-center py-5 bg-white rounded-4">
                <i className="bi bi-person-x display-4 text-secondary" />

                <h5 className="mt-3">
                  {isBangla
                    ? "এই বিভাগে কোনো সদস্য নেই"
                    : "No Members in This Category"}
                </h5>
              </div>
            )}

            {/* =========================================
                ALL MEMBERS - SAME LEVEL GRID
            ========================================= */}

            {currentCategory.members.length > 0 && (
              <Row className="g-4">
                {currentCategory.members.map((member) => (
                  <Col xl={3} lg={3} md={6} sm={6} xs={12} key={member.id}>
                    <MemberCard member={member} />
                  </Col>
                ))}
              </Row>
            )}
          </>
        )}
      </Container>

      {/* =========================================
          CUSTOM CSS
      ========================================= */}

      <style>{`

        .about-page {
          background: #f7faf8;
          min-height: 70vh;
        }

        .about-header-icon {
          width: 65px;
          height: 65px;
          border-radius: 50%;
          background: #e2f3e9;
          color: #198754;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          margin: auto;
        }

        .about-title {
          color: #145c37;
        }

        .about-subtitle {
          max-width: 650px;
          line-height: 1.8;
        }

        .about-title-line {
          width: 75px;
          height: 4px;
          border-radius: 5px;
          background: #198754;
        }

        /* MEMBER STATISTICS */

        .member-stat-card {
          background: #ffffff;
          cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: 0 3px 15px rgba(0,0,0,0.04);
        }

        .member-stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.08);
        }

        .member-stat-card.stat-active {
          border-bottom: 3px solid #198754 !important;
          background: #f0faf4;
        }

        .stat-icon {
          font-size: 25px;
          color: #198754;
        }

        .stat-label {
          font-size: 13px;
          font-weight: 600;
          color: #555;
        }

        /* CATEGORY TABS */

        .member-tabs-wrapper {
          background: #ffffff;
          padding: 10px;
          border-radius: 15px;
          box-shadow: 0 3px 15px rgba(0,0,0,0.04);
        }

        .member-tabs {
          gap: 8px;
        }

        .member-tab-link {
          color: #198754 !important;
          font-weight: 600;
          border-radius: 10px !important;
          padding: 12px 18px !important;
          white-space: nowrap;
          transition: all 0.2s ease;
        }

        .member-tab-link.active {
          background: #198754 !important;
          color: #ffffff !important;
        }

        .tab-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 23px;
          height: 23px;
          padding: 0 6px;
          border-radius: 20px;
          background: rgba(25,135,84,0.12);
          font-size: 11px;
        }

        .member-tab-link.active .tab-count {
          background: rgba(255,255,255,0.2);
          color: #ffffff;
        }

        /* MEMBER CARDS */

        .member-profile-card {
          background: #ffffff;
          box-shadow: 0 4px 18px rgba(0,0,0,0.045);
          transition: transform 0.25s ease,
                      box-shadow 0.25s ease;
        }

        .member-profile-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 28px rgba(0,0,0,0.09);
        }

        .member-card-accent {
          height: 4px;
          width: 100%;
          background: linear-gradient(
            90deg,
            #198754,
            #75c99a
          );
        }

        .member-photo-wrapper {
          width: 135px;
          height: 135px;
          border-radius: 50%;
          padding: 4px;
          border: 3px solid #198754;
          background: #ffffff;
          overflow: hidden;
          flex-shrink: 0;
        }

        .member-photo {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
        }

        .member-photo-placeholder {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: #edf5ef;
          color: #198754;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 55px;
        }

        .member-name {
          color: #263b30;
          font-size: 17px;
          line-height: 1.5;
          overflow-wrap: anywhere;
        }

        .member-designation {
          font-size: 12px;
          font-weight: 600;
          white-space: normal;
        }

        .member-bio {
          font-size: 13px;
          color: #6c757d;
          line-height: 1.7;
          max-width: 100%;
          overflow-wrap: anywhere;
        }

        /* MOBILE RESPONSIVE */

        @media (max-width: 576px) {

          .about-page {
            padding-top: 30px !important;
          }

          .about-title {
            font-size: 23px;
          }

          .member-tabs-wrapper {
            padding: 7px;
          }

          .member-tabs {
            display: grid;
            grid-template-columns: 1fr;
            gap: 5px;
          }

          .member-tab-link {
            padding: 10px 8px !important;
            text-align: center;
            font-size: 13px;
          }

          .stat-label {
            font-size: 10px;
            line-height: 1.5;
          }

          .stat-icon {
            font-size: 20px;
          }

          .member-stat-card .card-body {
            padding: 10px 4px !important;
          }

          .member-photo-wrapper {
            width: 105px;
            height: 105px;
          }

          .member-name {
            font-size: 15px;
          }

          .member-bio {
            font-size: 12px;
          }

        }

      `}</style>
    </main>
  );
}
