import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";

const Location = () => {
  const { t } = useTranslation();

  return (
    <Container className="py-2">

      {/* ================= HEADER ================= */}
      <div className="text-center mb-5">
        <h2 className="fw-bold mt-3">
          📍 {t("ourLocation")}
        </h2>
      </div>

      <Row className="gy-4">

        {/* ================= ADDRESS ================= */}
        <Col md={5}>
          <Card className="shadow-sm h-100">
            <Card.Body>

              <h4 className="fw-bold">
                🏢 {t("foundationOffice")}
              </h4>

              <hr />

              {/* Name */}
              <p>
                <strong>{t("name")}:</strong>
                <br />
                {t("foundationName")} 
              </p>

              {/* Address */}
              <p>
                <strong>{t("addressLabel")}:</strong>
                <br />
                {t("village")}: {t("badokhali")},
                <br />
                {t("post")}:  {t("Mograhat")},
                <br />
                {t("upazila")}:  {t("bagerhat")},
                <br />
                 {t("khulna")}
              </p>

              {/* Phone */}
              <p>
                <strong>📞 {t("phone")}:</strong>
                <br />

                <a
                  href="tel:+8801738126875"
                  className="text-decoration-none"
                >
                  +8801738126875
                </a>

                {" , "}

                <a
                  href="tel:+8801714597343"
                  className="text-decoration-none"
                >
                  +8801714597343
                </a>
              </p>

              {/* Email */}
              <p>
                <strong>✉ {t("email")}:</strong>
                <br />

                <a
                  href="mailto:badokhaliyouthfoundation@gmail.com"
                  className="text-decoration-none text-break"
                >
                  badokhaliyouthfoundation@gmail.com
                </a>
              </p>

              {/* Direction */}
              <Button
                variant="success"
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                🧭 {t("getDirection")}
              </Button>

            </Card.Body>
          </Card>
        </Col>

        {/* ================= MAP ================= */}
        <Col md={7}>
          <Card className="shadow-sm">
            <Card.Body>

              <h4 className="fw-bold mb-3">
                🗺 {t("googleMap")}
              </h4>

              <div
                style={{
                  width: "100%",
                  height: "400px",
                }}
              >
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3095.3715928045144!2d89.74006808289894!3d22.68963219226894!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39fff5dccd3afc71%3A0x2765f4534e78c4fb!2sBadokhali%20Das%20para%20mondir!5e0!3m2!1sen!2sbd!4v1785828283271!5m2!1sen!2sbd"
                  width="100%"
                  height="100%"
                  style={{
                    border: 0,
                    borderRadius: "10px",
                  }}
                  loading="lazy"
                  title={t("googleMap")}
                />
              </div>

            </Card.Body>
          </Card>
        </Col>

      </Row>
    </Container>
  );
};

export default Location;