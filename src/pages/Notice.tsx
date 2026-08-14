import { useRef } from "react";
import html2canvas from "html2canvas";
import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  Modal,
} from "react-bootstrap";

import { db } from "../firebase/firebase";
import ReportPad from "../components/ReportPad";

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
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      width: 794,
      windowWidth: 794,
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

  const toBanglaDate = (date: string) => {
  if (!date) return "—";

  const months = [
    "জানুয়ারি",
    "ফেব্রুয়ারি",
    "মার্চ",
    "এপ্রিল",
    "মে",
    "জুন",
    "জুলাই",
    "আগস্ট",
    "সেপ্টেম্বর",
    "অক্টোবর",
    "নভেম্বর",
    "ডিসেম্বর",
  ];

  const [year, month, day] = date.split("-");

  const banglaNumber = (value: string) =>
    value.replace(
      /\d/g,
      (digit) => "০১২৩৪৫৬৭৮৯"[Number(digit)]
    );

  return `${banglaNumber(day)} ${months[Number(month) - 1]} ${banglaNumber(year)}`;
};
  return (
    <>
      

      <Container className="py-2">
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

        {/* ================= NOTICE LIST ================= */}

        <Row className="justify-content-center">
          <Col lg={10}>

            <div
              className="border rounded shadow-sm bg-white overflow-hidden"
            >

              {/* List Header */}

              <div className="bg-dark text-white px-4 py-3">
                <div className="row align-items-center">

                  <div className="col-md-2 fw-semibold">
                    তারিখ
                  </div>

                  <div className="col-md-5 fw-semibold">
                    শিরোনাম
                  </div>

                  <div className="col-md-2 text-center fw-semibold">
                    স্মারক নং
                  </div>



                </div>
              </div>


              {/* Notice Items */}

              {filteredNotices.map((item) => (

                <div
                  key={item.id}
                  className="px-4 py-3 border-bottom"
                  style={{
                    transition: "background 0.2s",
                  }}
                >

                  <div className="row align-items-center">

                    {/* Date */}

                    <div className="col-md-2 mb-2 mb-md-0">

                      <div className="d-flex align-items-center">



                        <div>


                          <div
                            style={{

                              fontSize: "12px",
                            }}>
                            {item.publishDate}
                          </div>
                        </div>

                      </div>

                    </div>


                    {/* Notice */}

                    <div className="col-md-5 mb-2 mb-md-0">

                      <div className="d-flex">

                        <span
                          className="me-2"
                          style={{
                            fontSize: "18px",
                          }}
                        >
                          📌
                        </span>

                        <div>

                          <div className="fw-bold">
                            {item.title}
                          </div>

                        </div>

                      </div>

                    </div>


                    {/* Priority */}

                    <div className="col-md-2 text-md-center mb-2 mb-md-0">

                      <span
                        className={`badge ${item.priority === "Urgent"
                          ? "bg-danger"
                          : item.priority === "Important"
                            ? "bg-warning text-dark"
                            : "bg-primary"
                          }`}
                        style={{
                          padding: "7px 12px",
                          fontSize: "12px",
                        }}
                      >
                        {item.priority}
                      </span>

                    </div>


                    {/* Action */}

                    <div className="col-md-3 text-md-end">

                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleView(item)}
                      >
                        👁 Read Details
                      </Button>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          </Col>
        </Row>
      </Container>
      {/* Notice Details Modal */}

      {/* ================= NOTICE DETAILS MODAL ================= */}

      ```tsx
<Modal
  show={showModal}
  onHide={() => setShowModal(false)}
  size="lg"
  centered
  dialogClassName="notice-modal"
>
  <Modal.Header closeButton>
    <Modal.Title>
      📢 Notice Details
    </Modal.Title>
  </Modal.Header>

  {selectedNotice && (
    <Modal.Body className="notice-modal-body">
      <div
        ref={reportRef}
        className="report-download-area"
      >
        <ReportPad
          refNo={selectedNotice.priority
                          ? selectedNotice.priority
                            .split("-")
                            .map((part) =>
                              part.replace(/\d/g, (digit) => "০১২৩৪৫৬৭৮৯"[Number(digit)])
                            )
                            .join("-")
                          : "—"}
       date={toBanglaDate(selectedNotice.publishDate)}
          title={selectedNotice.title}
          content={selectedNotice.description}
          presidentName="সুদীপ কুমার হালদার"
          secretaryName="সভাপতি"
        />
      </div>
    </Modal.Body>
  )}

  <Modal.Footer>
    <Button
      variant="success"
      onClick={downloadNotice}
    >
      📥 Download Notice
    </Button>

    <Button
      variant="secondary"
      onClick={() => setShowModal(false)}
    >
      Close
    </Button>
  </Modal.Footer>
</Modal>



     
    </>
  );
};

export default Notice;
