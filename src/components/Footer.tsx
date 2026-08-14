import { useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import {
  FaFacebookF,
  FaYoutube,
  FaWhatsapp,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaComments,
  FaEye,
} from "react-icons/fa";

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
} from "firebase/firestore";

import { db } from "../firebase/firebase";


const Footer = () => {
  const [visitorCount, setVisitorCount] = useState(0);

  useEffect(() => {
    const updateUniqueVisitor = async () => {
      try {
        // Check if this browser already visited
        let visitorId = localStorage.getItem("byf_visitor_id");

        // First visit from this browser
        if (!visitorId) {
          visitorId =
            crypto.randomUUID();

          localStorage.setItem(
            "byf_visitor_id",
            visitorId
          );

          const visitorRef = doc(
            db,
            "siteStats",
            "visitors"
          );

          const snapshot = await getDoc(visitorRef);

          if (snapshot.exists()) {
            await updateDoc(visitorRef, {
              count: increment(1),
            });

            setVisitorCount(
              Number(snapshot.data().count || 0) + 1
            );
          } else {
            await setDoc(visitorRef, {
              count: 1,
            });

            setVisitorCount(1);
          }
        } else {
          // Existing visitor
          const visitorRef = doc(
            db,
            "siteStats",
            "visitors"
          );

          const snapshot = await getDoc(visitorRef);

          if (snapshot.exists()) {
            setVisitorCount(
              Number(snapshot.data().count || 0)
            );
          }
        }
      } catch (error) {
        console.error(
          "Unique visitor error:",
          error
        );
      }
    };

    updateUniqueVisitor();
  }, []);

  return (
    <>
      <footer className="footer">
        <Container>

          <Row className="gy-3">

            {/* Quick Links */}
            <Col lg={4} md={4}>
              <h5 className="footer-title">Quick Links</h5>

              <ul className="footer-links">
                <li><a href="/about">About us</a></li>
                <li><a href="/donors">Donors</a></li>
                <li><a href="/admin/login">Admin Site</a></li>

              </ul>
            </Col>

            {/* Contact */}
            <Col lg={5} md={5}>
              <h5 className="footer-title">Contact Info</h5>

             

              <p><FaPhoneAlt /> +8801738126875, +8801714597343</p>
              <p><FaEnvelope /> badokhaliyouthfoundation@gmail.com</p>
               <p><FaMapMarkerAlt /> Badokhali, Mograhat-9300, Bagerhat Sadar, Bagerhat</p>

              



            </Col>

            {/* Social */}
            <Col lg={3} md={3}>
              <h5 className="footer-title">Follow Us</h5>

              <div className="social-icons">

                <a href="https://www.facebook.com/badokhaliyouthfoundation">
                  <FaFacebookF />
                </a>

                <a href="https://youtube.com/@badhokhaliyouthfoundation">
                  <FaYoutube />
                </a>

                <a href="https://wa.me/8801738126875"
                  target="_blank"
                  rel="noopener noreferrer">
                  <FaWhatsapp />
                </a>

                <a href="/feedback"
                  target="_blank"
                  rel="noopener noreferrer">
                  <FaComments />
                </a>

                <div className="visitor-count">
                <FaEye /> 

                <span style={{ marginLeft: "10px" }}>
    
                  <strong>
                         {visitorCount.toLocaleString()}
                  </strong>
                </span>
              </div>

              </div>

            </Col>

          </Row>

        </Container>
      </footer>

      <div className="copyright">
        © 2026 Badokhali Youth Foundation. All Rights Reserved.
      </div>
    </>
  );
};

export default Footer;