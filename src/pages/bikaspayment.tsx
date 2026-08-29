import { useState } from "react";
import { Container, Card, Button, Modal, Spinner } from "react-bootstrap";
import {
  FaHeart,
  FaCopy,
  FaMobileAlt,
  FaCheckCircle,
} from "react-icons/fa";
import { useTranslation } from "react-i18next";

const BKASH_NUMBER = "01303764484";

const DonorsList = () => {
  const { t } = useTranslation();

  const [showDonate, setShowDonate] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [openingBkash, setOpeningBkash] = useState(false);

  const copyNumber = async () => {
    try {
      await navigator.clipboard.writeText(BKASH_NUMBER);
      alert(t("bkashNumberCopied"));
    } catch {
      alert(t("copyFailed"));
    }
  };

  const handleDonate = (amount: number) => {
    setSelectedAmount(amount);
    setOpeningBkash(true);

    const isAndroid = /Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isAndroid) {
      const intentUrl =
        "intent://#Intent;scheme=bkash;package=com.bKash.customerapp;end";

      window.location.href = intentUrl;

      setTimeout(() => {
        setOpeningBkash(false);
        setShowDonate(true);
      }, 2000);
    } else if (isIOS) {
      window.location.href = "bkash://";

      setTimeout(() => {
        setOpeningBkash(false);
        setShowDonate(true);
      }, 2000);
    } else {
      setOpeningBkash(false);
      setShowDonate(true);
    }
  };

  return (
    <>
      <Container className="py-4">

        {/* Donation Card */}
        <Card className="shadow-sm border-0 text-center">
          <Card.Body className="p-4">

            <h3 className="fw-bold mb-2">
              <FaHeart className="text-danger me-2" />
              {t("supportUs")}
            </h3>

            <p className="text-muted mb-4">
              {t("chooseDonationAmount")}
            </p>

            <div className="d-flex justify-content-center gap-2 flex-wrap">

              <Button
                variant="outline-danger"
                disabled={openingBkash}
                onClick={() => handleDonate(100)}
              >
                ❤️ ৳100
              </Button>

              <Button
                variant="outline-danger"
                disabled={openingBkash}
                onClick={() => handleDonate(200)}
              >
                ❤️ ৳200
              </Button>

              <Button
                variant="outline-danger"
                disabled={openingBkash}
                onClick={() => handleDonate(500)}
              >
                ❤️ ৳500
              </Button>

            </div>

          </Card.Body>
        </Card>

      </Container>

      {/* Opening bKash Modal */}
      <Modal
        show={openingBkash}
        centered
        backdrop="static"
        keyboard={false}
      >
        <Modal.Body className="text-center p-4">

          <FaMobileAlt
            size={45}
            className="text-danger mb-3"
          />

          <h5 className="fw-bold">
            {t("openingBkash")}
          </h5>

          <p className="text-muted mb-3">
            {t("openingBkashMessage")}
          </p>

          <Spinner
            animation="border"
            variant="danger"
          />

          <div className="mt-3 small text-muted">
            {t("donationAmount")}:{" "}
            <strong>৳{selectedAmount}</strong>
          </div>

        </Modal.Body>
      </Modal>

      {/* Fallback Modal */}
      <Modal
        show={showDonate}
        onHide={() => setShowDonate(false)}
        centered
      >
        <Modal.Header closeButton>
         <Modal.Title className="d-flex align-items-center">
  <span
    className="d-inline-flex align-items-center justify-content-center rounded-circle me-2"
    style={{
      width: "32px",
      height: "32px",
      background: "#e2136e",
      color: "#fff",
      fontSize: "15px",
    }}
  >
    ৳
  </span>

  {t("donateWithBkash")}
</Modal.Title>
        </Modal.Header>

        <Modal.Body className="text-center">

          <FaCheckCircle
            size={45}
            className="text-success mb-3"
          />

          <h5 className="fw-bold">
            {t("readyToDonate")}
          </h5>

          <p className="text-muted small">
            {t("bkashAppNotOpened")}
          </p>

          {/* Amount + Number */}
          <div className="bg-light rounded p-3 mb-3">

            <div className="mb-3">

              <strong>
                {t("donationAmount")}
              </strong>

              <div className="fs-3 fw-bold text-success">
                ৳{selectedAmount}
              </div>

            </div>

            <div>

              <strong>
                {t("bkashNumber")}
              </strong>

              <div className="d-flex justify-content-center align-items-center gap-2 mt-2">

                <span className="fs-5 fw-bold">
                  {BKASH_NUMBER}
                </span>

                <Button
                  size="sm"
                  variant="outline-primary"
                  onClick={copyNumber}
                  title={t("copyNumber")}
                >
                  <FaCopy />
                </Button>

              </div>

            </div>

          </div>

          {/* Instructions */}
          <div className="alert alert-warning text-start small">

            <strong>
              {t("howToDonate")}
            </strong>

            <ol className="mb-0 mt-2 ps-3">

              <li>
                {t("openBkashApp")}
              </li>

              <li>
                {t("selectSendMoney")}
              </li>

              <li>
                {t("enterBkashNumber")}{" "}
                <strong>{BKASH_NUMBER}</strong>
              </li>

              <li>
                {t("enterAmount")}{" "}
                <strong>৳{selectedAmount}</strong>
              </li>

              <li>
                {t("confirmPayment")}
              </li>

            </ol>

          </div>

          {/* Copy Button */}
          <Button
            variant="danger"
            className="w-100"
            onClick={copyNumber}
          >
            <FaCopy className="me-2" />
            {t("copyBkashNumber")}
          </Button>

        </Modal.Body>
      </Modal>
    </>
  );
};

export default DonorsList;

