import { Col, Container, Row } from "react-bootstrap";
import { useTranslation } from "react-i18next";

const Hero = () => {
  const { t } = useTranslation();

  return (
    <section className="py-4 py-lg-5 bg-light">
      <Container>
        <Row className="align-items-center gy-4 gx-lg-5">

          {/* ================= LEFT CONTENT ================= */}
          <Col xs={12} lg={6}>

            {/* Introduction */}
            <div className="bg-white p-3 p-md-4 rounded shadow-sm mb-4">
              <p
                className="lead mb-0"
                style={{
                  fontSize: "clamp(0.9rem, 1.5vw, 1rem)",
                  textAlign: "justify",
                  lineHeight: "1.7",
                }}
              >
                <span className="text-success fw-semibold">
                  {t("foundationName")}
                </span>{" "}
                {t("heroDescription")}
              </p>
            </div>

            {/* Mission & Vision */}
            <div className="bg-white p-3 p-md-4 rounded shadow-sm">
              <h4 className="text-success fw-bold mb-3">
                {t("missionVision")}
              </h4>

              <p
                className="lead mb-0"
                style={{
                  fontSize: "clamp(0.9rem, 1.5vw, 1rem)",
                  textAlign: "justify",
                  lineHeight: "1.7",
                }}
              >
                {t("heroMission")}
              </p>
            </div>

          </Col>

          {/* ================= RIGHT IMAGE ================= */}
          <Col xs={12} lg={6}>
            <div className="text-center">
              <img
                src="/banner.png"
                alt={t("foundationName")}
                className="img-fluid rounded-4 shadow"
                style={{
                  width: "100%",
                  height: "auto",
                  maxHeight: "500px",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </div>
          </Col>

        </Row>
      </Container>
    </section>
  );
};

export default Hero;