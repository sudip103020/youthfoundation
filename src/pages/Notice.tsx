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

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        centered
      >


        <Modal.Header closeButton>
          <Modal.Title>
            📢 Notice Details
          </Modal.Title>
        </Modal.Header>

        <Modal.Body
          className="bg-secondary-subtle p-3"
          style={{
            overflowX: "auto",
          }}
        >

          {selectedNotice && (

            <div
              ref={reportRef}
              style={{

                position: "relative",
                width: "794px",
                minHeight: "1123px",
                margin: "0 auto",
                backgroundColor: "#ffffff",
                padding: "42px 55px 40px",
                boxSizing: "border-box",
                overflow: "hidden",

                fontFamily:
                  "'Noto Serif Bengali', 'Noto Sans Bengali', sans-serif",

                color: "#222",
              }}
            >

              {/* ================================================= */}
              {/* WATERMARK */}
              {/* ================================================= */}

              <img
                src="/logo.png"
                alt="Watermark"
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",

                  transform:
                    "translate(-50%, -50%)",

                  width: "450px",

                  opacity: 0.045,

                  zIndex: 0,

                  pointerEvents: "none",
                }}
              />


              {/* ================================================= */}
              {/* MAIN CONTENT */}
              {/* ================================================= */}

              <div
                style={{
                  fontFamily: "'Noto Serif Bengali', serif",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {/* ================================================= */}
                {/* TOP RIGHT SLOGAN */}
                {/* ================================================= */}

                <div
                  style={{
                    position: "absolute",
                    top: "-6px",
                    right: "0px",
                    fontFamily: "'Noto Serif Bengali', serif",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#01050b",
                    textAlign: "right",
                    zIndex: 2,
                  }}
                >
                  তারুণ্যের স্পন্দন, সেবার বন্ধন
                </div>

                {/* ================================================= */}
                {/* ORGANIZATION HEADER */}
                {/* ================================================= */}

                <div
                  className="text-center"
                  style={{
                    marginBottom: "10px",
                  }}
                >

                  <img
                    src="/logo.png"
                    alt="Badhokhali Youth Foundation"
                    width="82"
                    height="82"
                    style={{
                      objectFit: "contain",
                      marginBottom: "7px",
                    }}
                  />

                  <h1
                    style={{
                      fontFamily: "'Noto Serif Bengali', serif",
                      margin: "0",
                      fontSize: "31px",
                      fontWeight: "700",
                      color: "#1464d2",
                      lineHeight: "1.2",
                    }}
                  >
                    বাদোখালী ইয়ুথ ফাউন্ডেশন
                  </h1>


                  <div
                    style={{
                      fontFamily: "'Noto Serif Bengali', serif",
                      fontSize: "16px",
                      marginTop: "6px",
                    }}
                  >
                    বাদোখালী, মগরাহাট, বাগেরহাট
                  </div>




                </div>


                {/* ================================================= */}
                {/* HEADER LINE */}
                {/* ================================================= */}

                <div
                  style={{
                    borderTop: "2px solid #1464d2",
                    marginTop: "16px",
                    marginBottom: "25px",
                  }}
                />


                {/* ================================================= */}
                {/* NOTICE TITLE */}
                {/* ================================================= */}

                <div
                  className="text-center"
                  style={{
                    marginBottom: "27px",
                  }}
                >

                  <h2
                    style={{
                      fontFamily: "'Noto Serif Bengali', serif",
                      margin: "0",
                      fontSize: "28px",
                      fontWeight: "700",
                      lineHeight: "1.3",
                      color: "#222",
                    }}
                  >
                    {selectedNotice.title}
                  </h2>




                </div>


                {/* ================================================= */}
                {/* DATE + MEMO */}
                {/* ================================================= */}

                <div
                  style={{
                    fontFamily: "'Noto Serif Bengali', serif",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    fontSize: "15px",
                    marginBottom: "28px",
                  }}
                >

                  {/* DATE */}

                  <div
                    style={{
                      width: "48%",
                    }}
                  >

                    <strong>
                      তারিখ :
                    </strong>

                    <span
                      style={{
                        fontFamily: "'Noto Serif Bengali', serif",
                        marginLeft: "8px",
                      }}
                    >
                      {selectedNotice.publishDate}
                    </span>

                  </div>


                  {/* MEMO */}

                  <div
                    style={{
                      fontFamily: "'Noto Serif Bengali', serif",
                      width: "48%",
                      textAlign: "right",
                    }}
                  >

                    <strong>
                      স্মারক নং :
                    </strong>

                    <span
                      style={{
                        fontFamily: "'Noto Serif Bengali', serif",
                        marginLeft: "8px",
                      }}
                    >
                      {selectedNotice.priority}
                    </span>

                  </div>

                </div>


                {/* ================================================= */}
                {/* NOTICE CONTENT */}
                {/* ================================================= */}

                <div
                  className="notice-html-content"
                  style={{
                    fontFamily: "'Noto Serif Bengali', serif",
                    fontSize: "17px",
                    lineHeight: "1.75",
                    color: "#222",
                    padding: "0 8px",
                    minHeight: "350px",
                    textAlign: "justify",
                  }}
                  dangerouslySetInnerHTML={{
                    __html: selectedNotice.description,
                  }}
                />


                {/* ================================================= */}
                {/* FOOTER */}
                {/* ================================================= */}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",

                    marginTop: "60px",
                  }}
                >


                  {/* ================= SEAL ================= */}

                  <div
                    style={{
                      width: "50%",
                    }}
                  >

                    <img
                      src="/roundseal.png"
                      alt="Official Seal"
                      width="115"
                      height="115"
                      style={{
                        objectFit: "contain",
                      }}
                    />

                  </div>


                  {/* ================= SIGNATURE ================= */}

                  <div
                    style={{
                      fontFamily: "'Noto Serif Bengali', serif",
                      width: "50%",
                      textAlign: "center",
                      fontSize: "14px",
                      lineHeight: "1.5",
                    }}
                  >


                    <strong>
                      স্বাক্ষরিত
                    </strong>
                    <br />
                    <strong>
                      সুদীপ কুমার হালদার
                    </strong>

                    <br />

                    সভাপতি

                    <br />

                    বাদোখালী ইয়ুথ ফাউন্ডেশন

                  </div>

                </div>


                {/* ================================================= */}
{/* CONTACT FOOTER */}
{/* ================================================= */}




                {/* ================================================= */}
                {/* PAD FOOTER */}
                {/* ================================================= */}

                <div
                  style={{
                    borderTop:
                      "1px solid #d5d5d5",

                    marginTop: "35px",

                    paddingTop: "8px",

                    textAlign: "center",

                    fontSize: "10px",

                    color: "#888",
                  }}
                >

                  “This is an electronically generated notice. No signature is required.”

                </div>


              </div>

            </div>

          )}

        </Modal.Body>


        {/* ================================================= */}
        {/* MODAL FOOTER */}
        {/* ================================================= */}

        <Modal.Footer>

          <Button
            variant="success"
            onClick={downloadNotice}
          >
            📥 Download Notice
          </Button>

          <Button
            variant="secondary"
            onClick={() =>
              setShowModal(false)
            }
          >
            Close
          </Button>

        </Modal.Footer>

      </Modal>

     
    </>
  );
};

export default Notice;
