import { useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  const [visitorCount, setVisitorCount] = useState(0);

  useEffect(() => {
    const updateUniqueVisitor = async () => {
      try {
        let visitorId = localStorage.getItem(
          "byf_visitor_id"
        );

        const visitorRef = doc(
          db,
          "siteStats",
          "visitors"
        );

        if (!visitorId) {
          visitorId = crypto.randomUUID();

          localStorage.setItem(
            "byf_visitor_id",
            visitorId
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

            {/* ================= QUICK LINKS ================= */}

            <Col lg={4} md={4} sm={12}>

              <h5 className="footer-title">
                {t("quickLinks")}
              </h5>

              <div className="footer-quick-links">

                <a href="/about">
                  {t("about")}
                </a>

                <a href="/donors">
                  {t("donors")}
                </a>

                <a href="/activities">
                 {t("activities")}
                </a>

                <a href="/medical">
                  {t("bloodBank")}
                </a>

                <a href="/emergency">
                  {t("emergency")}
                </a>

                <a  href="/bikaspayment">
                 {t("donateNow")}
                
            
            
           
         
                </a>

              </div>

            </Col>

            {/* ================= CONTACT ================= */}

            <Col lg={5} md={5} sm={12}>

              <h5 className="footer-title">
                {t("contactInfo")}
              </h5>

              <p>
                <FaPhoneAlt />{" "}

                <a
                  href="tel:+8801738126875"
                  className="text-decoration-none"
                >
                  +8801738126875
                </a>

                ,{" "}

                <a
                  href="tel:+8801714597343"
                  className="text-decoration-none"
                >
                  +8801714597343
                </a>
              </p>

              <p>
                <FaEnvelope />{" "}

                <a
                  href="mailto:badokhaliyouthfoundation@gmail.com"
                  className="text-decoration-none"
                >
                  badokhaliyouthfoundation@gmail.com
                </a>
              </p>

              <p>
                <FaMapMarkerAlt />{" "}
                {t("address")}
              </p>

            </Col>

            {/* ================= SOCIAL ================= */}

            <Col lg={3} md={3} sm={12}>

              <h5 className="footer-title">
                {t("followUs")}
              </h5>

              <div className="social-icons">

                {/* Facebook */}

                <a
                  href="https://www.facebook.com/badokhaliyouthfoundation"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                >
                  <FaFacebookF />
                </a>

                {/* YouTube */}

                <a
                  href="https://youtube.com/@badhokhaliyouthfoundation"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                >
                  <FaYoutube />
                </a>

                {/* WhatsApp */}

                <a
                  href="https://wa.me/8801738126875"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                >
                  <FaWhatsapp />
                </a>

                {/* Feedback */}

                <a
                  href="/feedback"
                  aria-label={t("feedback")}
                >
                  <FaComments />
                </a>

                {/* Visitor */}

                <div
                  className="visitor-count"
                  title={t("visitors")}
                >
                  <FaEye />

                  <span
                    style={{
                      marginLeft: "6px",
                    }}
                  >
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

      {/* ================= COPYRIGHT ================= */}

  


<div className="copyright">

  <div>
    © {t("year")}{" "}
    {t("foundationName")}.{" "}
    {t("allRightsReserved")}
  </div>

  {/* SMALL ADMIN LINK */}
  <a
    href="/admin/login"
    className="footer-admin-link"
  >
    Admin Site
  </a>

  {/* DEVELOPER CREDIT */}
  <div className="developer-credit">
    Developed By <strong>Sudip Halder</strong>
  </div>

</div>








    </>
  );
};

export default Footer;