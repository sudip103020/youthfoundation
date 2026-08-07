import { useRef } from "react";
import html2canvas from "html2canvas";
import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Modal,
} from "react-bootstrap";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { db } from "../firebase/firebase";






import { collection, getDocs } from "firebase/firestore";

interface Notice {
  id: string;
  title: string;
  description: string;
  publishDate: string;
  priority: string;
  status: string;
}

const Notice = () => {
    const reportRef = useRef<HTMLDivElement>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  // Fetch Published Notices

  const fetchNotices = async () => {
    const snapshot = await getDocs(collection(db, "notices"));

    const data: Notice[] = [];

    snapshot.forEach((doc) => {
      console.log("Firebase Data:", doc.data());

      data.push({
        id: doc.id,
        ...(doc.data() as Omit<Notice, "id">),
      });
    });

    console.log("All Notices:", data);

    setNotices(data.filter((item) => item.status === "Published"));
  };

  const downloadNotice = async () => {
    if (!reportRef.current) return;

    const canvas = await html2canvas(reportRef.current, {
      scale: 3,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const image = canvas.toDataURL("image/png");

    const link = document.createElement("a");
    link.href = image;
    link.download = `Notice-${selectedNotice?.title}.png`;
    link.click();
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const filteredNotices = notices.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase()),
  );

  const handleView = (notice: Notice) => {
    setSelectedNotice(notice);
    setShowModal(true);
  };
  return (
    <>
      <Navbar />

      <Container className="py-5">
        <div className="text-center mb-5">

          <h2 className="fw-bold mt-3">📢 Notice Board</h2>

          
        </div>

        {/* Search */}

        <Row className="mb-4">
          <Col md={6} className="mx-auto">
            <Form.Control
              type="text"
              placeholder="Search Notice..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Col>
        </Row>

        {/* Notice List */}

        <Row>
          {filteredNotices.length === 0 ? (
            <div className="text-center">
              <h5>No Notice Found</h5>
            </div>
          ) : (
            filteredNotices.map((item) => (
              <Col md={6} lg={4} className="mb-4" key={item.id}>
                <Card className="shadow-sm h-100">
                  <Card.Body>
                    <div className="d-flex justify-content-between">
                      <h5 className="fw-bold">📌 {item.title}</h5>
                    </div>

                    <p className="text-muted">📅 {item.publishDate}</p>

                    <span
                      className={`badge ${
                        item.priority === "Urgent"
                          ? "bg-danger"
                          : item.priority === "Important"
                            ? "bg-warning text-dark"
                            : "bg-primary"
                      }`}
                    >
                      {item.priority}
                    </span>

                    <p className="mt-3">
                      {item.description.length > 120
                        ? item.description.substring(0, 50) + "..."
                        : item.description}
                    </p>

                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleView(item)}
                    >
                      👁 Read Details
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))
          )}
        </Row>
      </Container>
      {/* Notice Details Modal */}

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="sm"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>📢 Notice Details</Modal.Title>
        </Modal.Header>

        <Modal.Body className="bg-light">
          {selectedNotice && (
            <div
              ref={reportRef}
              style={{
                position: "relative",
                overflow: "hidden",
                background: "#fff",
                padding: "20px",
              }}
            >
              {/* Watermark */}
              <img
                src="/logo.png"
                alt="Watermark"
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "320px",
                  opacity: 0.06,
                  zIndex: 0,
                }}
              />

              <div className="position-relative" style={{ zIndex: 1 }}>
                {/* Header */}

                <div className="text-center">
                  <img src="/logo.png" alt="Logo" width="90" className="mb-2" />

                  <h2 className="fw-bold text-primary mb-1">
                    বাদোখালী ইয়ুথ ফাউন্ডেশন
                  </h2>

                  <p className="mb-1">বাদোখালী, মগরাহাট, বাগেরহাট</p>

                  <small className="text-muted">
                    "তরুণদের স্পন্দন, সেবার বন্ধন"
                  </small>
                </div>

                <hr className="my-4" />

                {/* Notice Heading */}

                <div className="text-center py-2 mb-4 rounded">
                  <h4 className="mb-0 fw-bold"> {selectedNotice.title}</h4>
                </div>

                {/* Info */}

                <div className="row mb-4">
                  <div className="col-6">
                    <strong>তারিখ : {selectedNotice.publishDate}</strong>
                    <br />
                  </div>

                  <div className="col-6 text-end">
                    <strong>স্মারক নং : {selectedNotice.priority}</strong>
                    <br />
                  </div>
                </div>

                {/* Notice */}

                <div
                  className="border rounded p-4 mt-3"
                  style={{
                    minHeight: "200px",
                    whiteSpace: "pre-wrap",
                    lineHeight: "15px",
                    fontSize: "15px",
                  }}
                >
                  {selectedNotice.description}
                </div>

                {/* Footer */}

                <div className="row mt-5 align-items-end">
                  <div className="col-6">
                    <img src="/roundseal.png" alt="Seal" width="130" />
                  </div>

                  <div className="col-6 text-end">
                    <div
                      style={{
                        display: "inline-block",
                        paddingTop: "6px",
                        minWidth: "180px",
                      }}
                    >
                      <strong> স্বাক্ষরিত</strong>
                      <br />
                      <strong>সুদীপ কুমার হালদার</strong>
                      <br />
                      সভাপতি
                      <br />
                      বাদোখালী ইয়ুথ ফাউন্ডেশন
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>

        <Modal.Footer>
         
            <Button variant="success" onClick={downloadNotice}>
              📥 Download Image
            </Button>

            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Close
            </Button>
          </Modal.Footer>
          
        
      </Modal>

      <Footer />
    </>
  );
};

export default Notice;
