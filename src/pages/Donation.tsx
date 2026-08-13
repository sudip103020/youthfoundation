import { Container, Row, Col, Card, Button } from "react-bootstrap";


const Donation = () => {

  const copyText = (text:string) => {
    navigator.clipboard.writeText(text);
    alert("Copied Successfully");
  };


  return (
    <>
     

      <Container className="py-2">


        {/* Header */}

        <div className="text-center mb-5">


          <h2 className="fw-bold mt-3">
            🪙 Support Our Foundation 
          </h2>

          <p>
            Your donation can help us to continue our social activities.
          </p>

        </div>



        <Row className="g-4">


          {/* Bank Account */}

          <Col md={6}>

            <Card className="shadow-sm h-100">

              <Card.Body>

                <h4 className="fw-bold text-success">
                  🏦 Bank Account
                </h4>

                <hr/>


                <p>
                  <strong>
                    Bank Name:
                  </strong>
                  <br/>
                  Dutch Bangla Bank Ltd.
                </p>


                <p>
                  <strong>
                    Account Name:
                  </strong>
                  <br/>
                  SUMON ROY
                </p>


                <p>
                  <strong>
                    Account Number:
                  </strong>
                  <br/>

                  1491510084961

                  <Button
                    size="sm"
                    variant="outline-primary"
                    className="ms-2"
                    onClick={() =>
                      copyText("1491510084961")
                    }
                  >
                    Copy
                  </Button>

                </p>


                <p>
                  <strong>
                    Branch:
                  </strong>
                  <br/>
                  Bagerhat Branch
                </p>


              </Card.Body>

            </Card>


          </Col>




          {/* bKash */}

          <Col md={6}>

            <Card className="shadow-sm h-100">


              <Card.Body>


                <h4 className="fw-bold text-danger">
                  📱 bKash Account
                </h4>


                <hr/>


                <p>
                  <strong>
                    Account Type:
                  </strong>
                  <br/>
                  Personal 
                </p>


                <p>

                  <strong>
                    bKash Number:
                  </strong>

                  <br/>

                  01714597343


                  <Button
                    size="sm"
                    variant="outline-primary"
                    className="ms-2"
                    onClick={() =>
                    copyText("01714597343")
                    }
                  >
                    Copy
                  </Button>

                </p>

                  <p>

                  <strong>
                    bKash Number:
                  </strong>

                  <br/>

                  01303764484


                  <Button
                    size="sm"
                    variant="outline-primary"
                    className="ms-2"
                    onClick={() =>
                    copyText("01303764484")
                    }
                  >
                    Copy
                  </Button>

                </p>


                <p>
                  <strong>
                    Payment Method:
                  </strong>
                  <br/>
                  Send Money 
                </p>



              </Card.Body>


            </Card>


          </Col>


        </Row>




        {/* Message */}


        <Card className="shadow-sm mt-5">


          <Card.Body className="text-center">


            <h4>
              🤝 Thank You For Your Support
            </h4>




            <Button
              variant="success"
              href="/feedback"
            >
              send feedback
            </Button>


          </Card.Body>


        </Card>



      </Container>


     
    </>
  );
};


export default Donation;