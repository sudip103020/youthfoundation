import { Container, Row, Col } from "react-bootstrap";
import {
  FaFacebookF,
  FaYoutube,
  FaWhatsapp,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
} from "react-icons/fa";

const Footer = () => {
  return (
    <>
      <footer className="footer">
        <Container>
          <Row className="gy-3">
            {/* Quick Links */}
            <Col lg={4} md={4}>
              <h5 className="footer-title">Quick Links</h5>

              <ul className="footer-links">
                <li>
                  <a href="/about">About Us</a>
                </li>
                <li>
                  <a href="/activities">Activities</a>
                </li>
        
                 <li>
                  <a href="/admin/login">Admin Panel</a>
                </li>
              </ul>
            </Col>

            {/* Contact */}
            <Col lg={5} md={5}>
              <h5 className="footer-title">Contact Info</h5>

              <p>
                <FaMapMarkerAlt /> Badokhali, Mograhat, Bagerhat
              </p>

              <p>
                <FaPhoneAlt /> 01738126875, 01714597343
              </p>

              
              <p>
                <FaEnvelope /> badokhaliyouthfoundation@gmail.com
              </p>
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

                <a
                  href="https://wa.me/8801738126875"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaWhatsapp />
                </a>
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
