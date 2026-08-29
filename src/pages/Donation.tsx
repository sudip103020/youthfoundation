import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";

const Donation = () => {
  const { t } = useTranslation();

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(t("copied"));
  };

  return (
    <>
      <Container className="py-2">

        {/* Header */}
        <div className="text-center mb-5">
          <h2 className="fw-bold mt-3">
            🪙 {t("donation_title")}
          </h2>

          <p>
            {t("donation_subtitle")}
          </p>
        </div>

        <Row className="g-4">

          {/* Bank Account */}
          <Col md={6}>
            <Card className="shadow-sm h-100">
              <Card.Body>

                <h4 className="fw-bold text-success">
                  🏦 {t("bankAccount")}
                </h4>

                <hr />

                <p>
                  <strong>
                    {t("bankName")}:
                  </strong>
                  <br />
                  Dutch Bangla Bank Ltd.
                </p>

                <p>
                  <strong>
                    {t("accountName")}:
                  </strong>
                  <br />
                  SUMON ROY
                </p>

                <p>
                  <strong>
                    {t("accountNumber")}:
                  </strong>
                  <br />

                  1491510084961

                  <Button
                    size="sm"
                    variant="outline-primary"
                    className="ms-2"
                    onClick={() =>
                      copyText("1491510084961")
                    }
                  >
                    {t("copy")}
                  </Button>
                </p>

                <p>
                  <strong>
                    {t("branch")}:
                  </strong>
                  <br />
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
                  📱 {t("bkashAccount")}
                </h4>

                <hr />

                <p>
                  <strong>
                    {t("accountType")}:
                  </strong>
                  <br />
                  {t("personal")}
                </p>

                <p>
                  <strong>
                    {t("bkashNumber")}:
                  </strong>
                  <br />

                  01714597343

                  <Button
                    size="sm"
                    variant="outline-primary"
                    className="ms-2"
                    onClick={() =>
                      copyText("01714597343")
                    }
                  >
                    {t("copy")}
                  </Button>
                </p>

                <p>
                  <strong>
                    {t("bkashNumber")}:
                  </strong>
                  <br />

                  01303764484

                  <Button
                    size="sm"
                    variant="outline-primary"
                    className="ms-2"
                    onClick={() =>
                      copyText("01303764484")
                    }
                  >
                    {t("copy")}
                  </Button>
                </p>

                <p>
                  <strong>
                    {t("paymentMethod")}:
                  </strong>
                  <br />
                  {t("sendMoney")}
                </p>

              </Card.Body>
            </Card>
          </Col>

        </Row>

        {/* Message */}
        <Card className="shadow-sm mt-5">
          <Card.Body className="text-center">

            <h4>
              🤝 {t("thankYou")}
            </h4>

            <Button
            
              className="donate-btn px-4 py-2 fw-bold"
              href="/bikaspayment"
            >
              {t("donateNow")}
            </Button>

          </Card.Body>
        </Card>

      </Container>
    </>
  );
};

export default Donation;