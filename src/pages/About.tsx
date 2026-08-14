import { useEffect, useState } from "react";

import { Container, Row, Col, Card } from "react-bootstrap";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";

interface Member {
  id: string;
  name: string;
  designation?: string;
  phone?: string;
  email?: string;
  bloodGroup?: string;
  photo?: string;
  status?: string;
}

export default function About() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  // ===============================
  // FETCH MEMBERS
  // ===============================
  const fetchMembers = async () => {
    try {
      const snapshot = await getDocs(
        collection(db, "members")
      );

      const data: Member[] = snapshot.docs.map((item) => ({
        id: item.id,
        ...(item.data() as Omit<Member, "id">),
      }));

      // শুধু Active member দেখাবে

      // শুধু Active member দেখাবে
      const activeMembers = data.filter(
        (member) =>
          !member.status ||
          member.status.toLowerCase() === "active"
      );

      // ======================================
      // DESIGNATION অনুযায়ী SORT
      // ======================================

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
      ];

      activeMembers.sort((a, b) => {
        const indexA = designationOrder.findIndex(
          (designation) =>
            designation.toLowerCase() ===
            (a.designation || "").toLowerCase()
        );

        const indexB = designationOrder.findIndex(
          (designation) =>
            designation.toLowerCase() ===
            (b.designation || "").toLowerCase()
        );

        // যাদের designation list-এ নেই
        // তাদের শেষে দেখাবে
        const orderA =
          indexA === -1 ? 999 : indexA;

        const orderB =
          indexB === -1 ? 999 : indexB;

        return orderA - orderB;
      });

      setMembers(activeMembers);



      setMembers(activeMembers);
    } catch (error) {
      console.error("Error loading members:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  return (
    <>


      <main className="py-2 bg-light">
        <Container>
          {/* ===============================
              HEADER
          =============================== */}
          <div className="text-center mb-5">
            <h2 className="fw-bold">
              👥 Executive  Committee

            </h2>

            <p className="text-muted">
              Meet the dedicated members of
              Badokhali Youth Foundation.
            </p>
          </div>

          {/* ===============================
              LOADING
          =============================== */}
          {loading && (
            <div className="text-center py-5">
              <div
                className="spinner-border text-success"
                role="status"
              />

              <p className="text-muted mt-3">
                Loading committee members...
              </p>
            </div>
          )}

          {/* ===============================
              NO MEMBERS
          =============================== */}
          {!loading && members.length === 0 && (
            <div className="text-center py-5">
              <div style={{ fontSize: "50px" }}>
                👥
              </div>

              <h5 className="mt-3">
                No Committee Member Found
              </h5>

              <p className="text-muted">
                Committee member information is
                currently unavailable.
              </p>
            </div>
          )}

          {/* ===============================
              MEMBERS
          =============================== */}
          {!loading && members.length > 0 && (
            <Row className="g-4">
              {members.map((member) => (
                <Col
                  lg={4}
                  md={6}
                  sm={12}
                  key={member.id}
                >
                  <Card
                    className="border-0 shadow-sm text-center h-100 rounded-4"
                  >
                    <Card.Body className="p-4">

                      {/* PHOTO */}
                      {member.photo ? (
                        <img
                          src={member.photo}
                          alt={member.name}
                          className="rounded-circle border border-3 border-success mb-3"
                          style={{
                            width: "150px",
                            height: "150px",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <div
                          className="rounded-circle border border-3 border-success mb-3 mx-auto d-flex align-items-center justify-content-center"
                          style={{
                            width: "150px",
                            height: "150px",
                            backgroundColor: "#f1f3f5",
                            fontSize: "60px",
                          }}
                        >
                          👤
                        </div>
                      )}

                      {/* NAME */}
                      <h4 className="fw-bold mb-1">
                        {member.name}
                      </h4>

                      {/* DESIGNATION */}
                      <h6 className="text-success mb-3">
                        {member.designation ||
                          "Committee Member"}
                      </h6>

                      {/* PHONE */}
                      {member.phone && (
                        <p className="mb-2">
                          📞{" "}
                          <strong>
                            {member.phone}
                          </strong>
                        </p>
                      )}

                      {/* EMAIL */}
                      {member.email && (
                        <p className="mb-2 text-break">
                          ✉️ {member.email}
                        </p>
                      )}

              
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Container>
      </main>


    </>
  );
}

