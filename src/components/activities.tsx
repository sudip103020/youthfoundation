
import { Container, Row, Col, Card } from "react-bootstrap";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useEffect, useState } from "react";
import { db } from "../firebase/firebase";

import {
  collection,
  getDocs,
  query,
  orderBy
} from "firebase/firestore";

interface Activity {
  id: string;
  title: string;
  date: string;
  description: string;
  images: string[];
}

const Activities = () => {
  const [showModal, setShowModal] = useState(false);
  const [activeImages, setActiveImages] = useState<string[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {

  const fetchActivities = async () => {

    const q = query(
      collection(db, "activities"),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);

    const data: Activity[] = [];

    snapshot.forEach((item)=>{

      data.push({
        id:item.id,
        ...(item.data() as Omit<Activity,"id">)
      });

    });


    setActivities(data);

  };


  fetchActivities();

}, []);

  const openAlbum = (images: string[], index: number) => {
    setActiveImages(images);
    setActiveIndex(index);
    setShowModal(true);
  };

  const nextImage = () => {
    setActiveIndex((prev) =>
      prev === activeImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setActiveIndex((prev) =>
      prev === 0 ? activeImages.length - 1 : prev - 1
    );
  };

  return (
    <>
      <Navbar />

      <Container className="py-5">
        <Row className="g-4">
          {activities.map((activity) => (
            <Col lg={6} md={6} xs={12} key={activity.id}>
              <Card className="shadow-sm rounded-4 border-0 h-100">
                <Card.Body>
                  <h3 className="text-primary fw-bold">
                    {activity.title}
                  </h3>

                  <small className="text-muted">
                    📅 {activity.date}
                  </small>

                  <p className="mt-3">
                    {activity.description}
                  </p>

                  <Row className="g-2">
                    {activity.images.map((img, index) => (
                      <Col xs={4} key={index}>
                        <img
                          src={img}
                          alt=""
                          className="img-fluid rounded shadow-sm"
                          style={{
                            height: "120px",
                            width: "100%",
                            objectFit: "cover",
                            cursor: "pointer",
                          }}
                          onClick={() => openAlbum(activity.images, index)}
                        />
                      </Col>
                    ))}
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* Image Modal */}
      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          style={{ backgroundColor: "rgba(0,0,0,0.9)" }}
        >
          <div
            className={`modal-dialog modal-dialog-centered ${
              window.innerWidth < 576
                ? "modal-fullscreen"
                : "modal-xl"
            }`}
          >
            <div className="modal-content bg-dark border-0">

              {/* Header */}
              <div className="modal-header border-0">
                <h5 className="modal-title text-white">
                  📸 {activities.find((a) => a.images === activeImages)?.title || "Activity"}
                </h5>

                <button
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                />
              </div>

              {/* Body */}
              <div className="modal-body d-flex justify-content-center align-items-center">
                <img
                  src={activeImages[activeIndex]}
                  alt=""
                  className="img-fluid rounded"
                  style={{
                    width: "100%",
                    height: window.innerWidth < 576 ? "80vh" : "78vh",
                    objectFit: "contain",
                  }}
                />
              </div>

              {/* Footer */}
              <div className="modal-footer border-0 justify-content-between">
                <button className="btn btn-warning" onClick={prevImage}>
                  ◀ Previous
                </button>

                <span className="text-white fw-bold">
                  {activeIndex + 1} / {activeImages.length}
                </span>

                <button className="btn btn-warning" onClick={nextImage}>
                  Next ▶
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default Activities;