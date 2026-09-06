import { useEffect, useState } from "react";

import { Container, Row, Col, Card } from "react-bootstrap";

import { collection, getDocs } from "firebase/firestore";

import { db } from "../firebase/firebase";

import { useTranslation } from "react-i18next";

interface Member {
  id: string;
  name: string;
  nameBn: string;

  designation?: string;
  designationBn?: string;

  bloodGroup?: string;
  photo?: string;
  status?: string;
}

export default function About() {
  const { t, i18n } = useTranslation();

  const isBangla = i18n.language === "bn";

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

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
  ];

  // =====================================================
  // FETCH MEMBERS
  // =====================================================

  const fetchMembers = async () => {
    try {
      const snapshot = await getDocs(collection(db, "members"));

      const data: Member[] = snapshot.docs.map((item) => ({
        id: item.id,
        ...(item.data() as Omit<Member, "id">),
      }));

      // =================================================
      // ONLY ACTIVE MEMBERS
      // =================================================

      const activeMembers = data.filter(
        (member) => !member.status || member.status.toLowerCase() === "active",
      );

      // =================================================
      // SORT BY DESIGNATION
      // =================================================

      activeMembers.sort((a, b) => {
        const indexA = designationOrder.findIndex(
          (designation) =>
            designation.toLowerCase() === (a.designation || "").toLowerCase(),
        );

        const indexB = designationOrder.findIndex(
          (designation) =>
            designation.toLowerCase() === (b.designation || "").toLowerCase(),
        );

        const orderA = indexA === -1 ? 999 : indexA;

        const orderB = indexB === -1 ? 999 : indexB;

        return orderA - orderB;
      });

      setMembers(activeMembers);
    } catch (error) {
      console.error("Error loading members:", error);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD MEMBERS
  // =====================================================

  useEffect(() => {
    fetchMembers();
  }, []);

  // =====================================================
  // MEMBER CARD
  // =====================================================

  const MemberCard = ({
    member,
    featured = false,
  }: {
    member: Member;
    featured?: boolean;
  }) => {
    return (
      <Card
        className={`border-0 text-center h-100 rounded-4 ${
          featured ? "shadow" : "shadow-sm"
        }`}
      >
        <Card.Body className={featured ? "p-4" : "p-4"}>
          {/* ==========================================
              PHOTO
          ========================================== */}

          {member.photo ? (
            <img
              src={member.photo}
              alt={member.name}
              className="rounded-circle border border-3 border-success mb-3"
              style={{
                width: featured ? "170px" : "150px",

                height: featured ? "170px" : "150px",

                objectFit: "cover",
              }}
            />
          ) : (
            <div
              className="rounded-circle border border-3 border-success mb-3 mx-auto d-flex align-items-center justify-content-center"
              style={{
                width: featured ? "170px" : "150px",

                height: featured ? "170px" : "150px",

                backgroundColor: "#f1f3f5",

                fontSize: featured ? "65px" : "60px",
              }}
            >
              👤
            </div>
          )}

          {/* ==========================================
              NAME
          ========================================== */}

          <h4 className={`fw-bold ${featured ? "mb-2" : "mb-1"}`}>
            {isBangla ? member.nameBn || member.name : member.name}
          </h4>

          {/* ==========================================
              DESIGNATION
          ========================================== */}

          <h6 className="text-success mb-0">
            {isBangla
              ? member.designationBn || member.designation
              : member.designation}
          </h6>
        </Card.Body>
      </Card>
    );
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="py-2 bg-light">
      <Container>
        {/* =============================================
            HEADER
        ============================================= */}

        <div className="text-center mb-5">
          <h2 className="fw-bold">{t("executiveCommittee")}</h2>

          <p className="text-muted">{t("committeeDescription")}</p>
        </div>

        {/* =============================================
            LOADING
        ============================================= */}

        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-success" role="status" />

            <p className="text-muted mt-3">Loading committee members...</p>
          </div>
        )}

        {/* =============================================
            NO MEMBERS
        ============================================= */}

        {!loading && members.length === 0 && (
          <div className="text-center py-5">
            <div
              style={{
                fontSize: "50px",
              }}
            >
              👥
            </div>

            <h5 className="mt-3">No Committee Member Found</h5>

            <p className="text-muted">
              Committee member information is currently unavailable.
            </p>
          </div>
        )}

        {/* =============================================
            MEMBERS
        ============================================= */}

        {!loading && members.length > 0 && (
          <>
            {/* =======================================
                  PRESIDENT
                  FIRST MEMBER
              ======================================= */}

            {/* =============================================
    MEMBERS - 4 × 4 GRID
================================================= */}

            {!loading && members.length > 0 && (
              <Row className="g-4">
                {members.map((member) => (
                  <Col xl={3} lg={3} md={6} sm={12} key={member.id}>
                    <MemberCard member={member} />
                  </Col>
                ))}
              </Row>
            )}


          </>
        )}
      </Container>
    </main>
  );
}
