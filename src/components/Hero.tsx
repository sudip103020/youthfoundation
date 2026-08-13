import { Col, Container, Row } from "react-bootstrap";

const Hero = () => {
  return (
    <section className="py-4 py-lg-5 bg-light">
      <Container>
        <Row className="align-items-center gy-4 gx-lg-5">

          {/* Left Content */}
          <Col xs={12} lg={6}>
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
                  Badokhali Youth Foundation
                </span>{" "}
                is a voluntary, non-profit organization committed to building
                a better society through education, healthcare, humanitarian
                aid, environment and youth empowerment.
              </p>
            </div>

            <div className="bg-white p-3 p-md-4 rounded shadow-sm">
              <h4 className="text-success fw-bold mb-3">
                Mission & Vision
              </h4>

              <p
                className="lead mb-0"
                style={{
                  fontSize: "clamp(0.9rem, 1.5vw, 1rem)",
                  textAlign: "justify",
                  lineHeight: "1.7",
                }}
              >
                To empower the people of Badokhali through education,
                healthcare, youth development, social welfare, and humanitarian
                initiatives, creating opportunities for a better and more
                inclusive society where every individual has the opportunity to
                grow, contribute, and lead a life of dignity.
              </p>
            </div>
          </Col>

          {/* Right Image */}
          <Col xs={12} lg={6}>
            <div className="text-center">
              <img
                src="/banner.png"
                alt="Badokhali Youth Foundation"
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