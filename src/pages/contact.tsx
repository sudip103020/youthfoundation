import { Container, Row, Col, Card, Button } from "react-bootstrap";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Location = () => {

  return (
    <>
      <Navbar />

      <Container className="py-5">

        <div className="text-center mb-5">

          <h2 className="fw-bold mt-3">
            📍 Our Location
          </h2>

          

        </div>


        <Row>

          {/* Address */}

          <Col md={5}>

            <Card className="shadow-sm h-100">

              <Card.Body>

                <h4 className="fw-bold">
                  🏢 Foundation Office
                </h4>


                <hr />


                <p>
                  <strong>
                    Name:
                  </strong>
                  <br/>
                  Badokhali Youth Foundation
                </p>


                <p>
                  <strong>
                    Address:
                  </strong>
                  <br/>
                  Village: Badokhali,
                  <br/>
                  Post: Mograhat-9300,
                  <br/>
                  Upzila: Bagerhat Sadar,
                  <br/>
                  Bagerhat, khulna.
                </p>


                <p>
                  <strong>
                    📞 Phone:
                  </strong>
                  <br/>
                  +8801738126875 ,
                  +8801714597343
                </p>


                <p>
                  <strong>
                    ✉ Email:
                  </strong>
                  <br/>
                  badokhaliyouthfoundation@gmail.com
                </p>


                <Button
                  variant="success"
                  href="https://maps.google.com"
                  target="_blank"
                >
                  🧭 Get Direction
                </Button>


              </Card.Body>

            </Card>

          </Col>



          {/* Map */}

          <Col md={7}>

            <Card className="shadow-sm">

              <Card.Body>

                <h4 className="fw-bold mb-3">
                  🗺 Google Map
                </h4>


                <div
                  style={{
                    width:"100%",
                    height:"400px"
                  }}
                >

                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3095.3715928045144!2d89.74006808289894!3d22.68963219226894!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39fff5dccd3afc71%3A0x2765f4534e78c4fb!2sBadokhali%20Das%20para%20mondir!5e0!3m2!1sen!2sbd!4v1785828283271!5m2!1sen!2sbd" 
                    width="100%"
                    height="100%"
                    style={{
                      border:0,
                      borderRadius:"10px"
                    }}
                    loading="lazy"
                  >
                  </iframe>


                </div>


              </Card.Body>

            </Card>

          </Col>


        </Row>


      </Container>


      <Footer />

    </>
  );
};


export default Location;