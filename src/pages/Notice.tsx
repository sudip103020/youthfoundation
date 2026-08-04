import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Form, Modal } from "react-bootstrap";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { db } from "../firebase/firebase";

import {
  collection,
  getDocs,
} from "firebase/firestore";

interface Notice {
  id: string;
  title: string;
  description: string;
  publishDate: string;
  priority: string;
  status: string;
}

const Notice = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedNotice, setSelectedNotice] =
    useState<Notice | null>(null);

  // Fetch Published Notices

 const fetchNotices = async () => {
  const snapshot = await getDocs(
    collection(db, "notices")
  );

  const data: Notice[] = [];

  snapshot.forEach((doc) => {

    console.log("Firebase Data:", doc.data());

    data.push({
      id: doc.id,
      ...(doc.data() as Omit<Notice, "id">),
    });

  });

  console.log("All Notices:", data);


  setNotices(
    data.filter(
      (item) => item.status === "Published"
    )
  );
};

  useEffect(() => {
    fetchNotices();
  }, []);

  const filteredNotices = notices.filter((item) =>
    item.title
      .toLowerCase()
      .includes(search.toLowerCase())
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
        <img
          src="/logo.png"
          alt="Logo"
          width="80"
        />

        <h2 className="fw-bold mt-3">
          📢 Notice Board
        </h2>

        <p>
          Badokhali Youth Foundation
        </p>
      </div>


      {/* Search */}

      <Row className="mb-4">

        <Col md={6} className="mx-auto">

          <Form.Control
            type="text"
            placeholder="Search Notice..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </Col>

      </Row>


      {/* Notice List */}

      <Row>

        {filteredNotices.length === 0 ? (

          <div className="text-center">
            <h5>
              No Notice Found
            </h5>
          </div>

        ) : (

          filteredNotices.map((item) => (

            <Col
              md={6}
              lg={4}
              className="mb-4"
              key={item.id}
            >

              <Card
                className="shadow-sm h-100"
              >

                <Card.Body>


                  <div className="d-flex justify-content-between">

                    <h5 className="fw-bold">
                      📌 {item.title}
                    </h5>

                  </div>


                  <p className="text-muted">
                    📅 {item.publishDate}
                  </p>


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
                      ? item.description.substring(0,120) + "..."
                      : item.description
                    }

                  </p>


                  <Button
                    variant="success"
                    size="sm"
                    onClick={() =>
                      handleView(item)
                    }
                  >
                    👁 Read More
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
  size="lg"
  centered
>

  <Modal.Header closeButton>
    <Modal.Title>
      📢 Notice Details
    </Modal.Title>
  </Modal.Header>


  <Modal.Body>

    {selectedNotice && (

      <div
        style={{
          position: "relative",
          overflow: "hidden",
        }}
      >


        {/* Watermark Logo */}

        <img
          src="/logo.png"
          alt="Watermark"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform:
              "translate(-50%, -50%)",
            width: "350px",
            opacity: 0.08,
            zIndex: 0,
          }}
        />


        <div
          style={{
            position: "relative",
            zIndex: 1,
          }}
        >


          {/* Header */}

          <div className="text-center mb-4">

            <img
              src="/logo.png"
              alt="Logo"
              width="80"
            />

            <h3 className="fw-bold mt-2">
              বাদোখালী ইয়ুথ ফাউন্ডেশন
            </h3>

            <p>
              বাদোখালী, মগরাহাট, বাগেরহাট
            </p>

            <hr />

          </div>



          {/* Notice Content */}

          <h4 className="fw-bold text-center">
            {selectedNotice.title}
          </h4>


          <p className="mt-4">

            <strong>
              তারিখ :
            </strong>{" "}
            {selectedNotice.publishDate}

          </p>


          <p>

            <strong>
              সারক নং :
            </strong>{" "}
            {selectedNotice.priority}

          </p>



          <div
            className="border rounded p-3 mt-3"
            style={{
              whiteSpace:"pre-wrap",
              minHeight:"150px"
            }}
          >

            {selectedNotice.description}

          </div>



          {/* Signature */}

          <div className="row mt-5">


            <div className="col-md-6">

              <img
                src="/roundseal.png"
                alt="Seal"
                width="120"
              />

            </div>



            <div className="col-md-6 text-end">

              <br/>
              <br/>
              <br/>

              ___________________

              <br/>

              <strong>
                সুদীপ কুমার হালদার
              </strong>

              <br/>

              সভাপতি

              <br/>

              বাদোখালী ইয়ুথ ফাউন্ডেশন

            </div>


          </div>



        </div>


      </div>

    )}

  </Modal.Body>


  <Modal.Footer>


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

   <Footer />

</>
);

};

export default Notice;