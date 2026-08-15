import { useRef } from "react";
import { Container, Form, Button } from "react-bootstrap";
import emailjs from "@emailjs/browser";
import { useTranslation } from "react-i18next";

const Feedback = () => {
  const { t } = useTranslation();
  const form = useRef<HTMLFormElement>(null);

  const sendEmail = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.current) return;

    emailjs
      .sendForm(
        "service_ziqrpvq",
        "template_qk3tt6y",
        form.current,
        "dkzpDLiexSiWkw_cv"
      )
      .then(() => {
        alert(t("success"));
        form.current?.reset();
      })
      .catch((err) => {
        console.log(err);
        alert(t("error"));
      });
  };

  return (
    <>
      {/* ================= FEEDBACK SECTION ================= */}
      <section
        style={{
          minHeight: "calc(100vh - 70px)",
          background:
            "linear-gradient(135deg, #f0fff7 0%, #f8fffb 50%, #eefaf4 100%)",
          padding: "15px 15px",
        }}
      >
        <Container style={{ maxWidth: "850px" }}>
          {/* Heading */}
          <div className="text-center mb-2">
            <h1 className="fw-bold text-dark mb-2">
              💬 {t("email_title")}
            </h1>

            <p className="text-muted mb-0">
              {t("subtitle")}
            </p>
          </div>

          {/* Form Card */}
          <div
            className="bg-white"
            style={{
              borderRadius: "22px",
              padding: "35px",
              boxShadow: "0 12px 40px rgba(0,0,0,.08)",
              border: "1px solid #e8f3ed",
            }}
          >
            <Form ref={form} onSubmit={sendEmail}>
              {/* Name + Email */}
              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">
                      {t("sender_name")}
                    </Form.Label>

                    <Form.Control
                      type="text"
                      name="name"
                      placeholder={t("namePlaceholder")}
                      required
                      className="py-2 px-3"
                      style={{
                        borderRadius: "10px",
                        minHeight: "48px",
                      }}
                    />
                  </Form.Group>
                </div>

                <div className="col-md-6">
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">
                      {t("to_email")}
                    </Form.Label>

                    <Form.Control
                      type="email"
                      name="email"
                      placeholder={t("emailPlaceholder")}
                      required
                      className="py-2 px-3"
                      style={{
                        borderRadius: "10px",
                        minHeight: "48px",
                      }}
                    />
                  </Form.Group>
                </div>
              </div>

              {/* Subject */}
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">
                  {t("subject")}
                </Form.Label>

                <Form.Control
                  type="text"
                  name="subject"
                  placeholder={t("subjectPlaceholder")}
                  required
                  className="py-2 px-3"
                  style={{
                    borderRadius: "10px",
                    minHeight: "48px",
                  }}
                />
              </Form.Group>

              {/* Message */}
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">
                  {t("message")}
                </Form.Label>

                <Form.Control
                  as="textarea"
                  rows={6}
                  name="message"
                  placeholder={t("messagePlaceholder")}
                  required
                  className="py-3 px-3"
                  style={{
                    borderRadius: "10px",
                    resize: "vertical",
                  }}
                />
              </Form.Group>

              {/* Submit */}
              <Button
                type="submit"
                variant="success"
                className="w-100 fw-semibold"
                style={{
                  minHeight: "52px",
                  borderRadius: "10px",
                  fontSize: "16px",
                }}
              >
                ✉️ {t("send")}
              </Button>
            </Form>
          </div>

          {/* Bottom text */}
          <p className="text-center text-muted mt-4 mb-0">
            {t("bottomText")} ❤️
          </p>
        </Container>
      </section>
    </>
  );
};

export default Feedback;