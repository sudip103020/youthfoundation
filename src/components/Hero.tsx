import { Col, Container, Row } from "react-bootstrap";

const Hero = () => {
  return (
    <section className="py-5 bg-light">
      <Container>
        <Row className="align-items-center g-5">
          {/* Left Content */}
          <Col lg={6}>


            <div className="bg-white p-4 rounded shadow-sm mb-4">

              
             
              <p
                className="lead mb-0"
                style={{
                  fontSize: "1.0rem",
                  textAlign: "justify",
                  lineHeight: "1.6",
                }}
              >

                
            <span className="text-success">Badokhali Youth Foundation</span> is a voluntary, non-profit organization
            committed to education, healthcare, humanitarian assistance,
            environmental protection and youth empowerment.
          
                
              </p>
            </div>

            <div className="bg-white p-4 rounded shadow-sm">
              <h4 className="text-success fw-bold mb-3">Mission & Vision</h4>
              <p className="lead mb-0" style={{
                fontSize: "1.0rem",
                textAlign: "justify",
                lineHeight: "1.6",
              }}>
                To empower the people of Badokhali through education, healthcare, youth
                development, social welfare, and humanitarian initiatives, creating
                opportunities for a better and more inclusive society
                where every individual has the opportunity to grow,
                contribute, and lead a life of dignity.
              </p>
            </div>
          </Col>

          {/* Right Image */}
          <Col lg={6} className="text-center">
            <img
              src="/banner.png"
              alt="Badokhali Youth Foundation"
              className="img-fluid rounded-4 shadow"
              style={{
                maxHeight: "500px",
                width: "100%",
                objectFit: "cover",
              }}
            />
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Hero;