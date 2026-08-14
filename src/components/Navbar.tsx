import { Container, Nav, Navbar } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher";

const Navigation = () => {
  const { t } = useTranslation();

  return (
    <Navbar
      bg="white"
      expand="lg"
      sticky="top"
      className="shadow-sm"
    >
      <Container>

        {/* ================= BRAND ================= */}
        <Navbar.Brand as={Link} to="/">
          <img
            src="/logo.png"
            alt={t("foundationName")}
            width="45"
            className="me-2"
          />

          <strong>{t("foundationName")}</strong>
        </Navbar.Brand>

        {/* ================= TOGGLE ================= */}
        <Navbar.Toggle aria-controls="navbar" />

        {/* ================= NAVIGATION ================= */}
        <Navbar.Collapse id="navbar">
          <Nav className="ms-auto align-items-center">

            <Nav.Link as={Link} to="/">
              {t("home")}
            </Nav.Link>

            <Nav.Link as={Link} to="/about">
              {t("about")}
            </Nav.Link>

            <Nav.Link as={Link} to="/activities">
              {t("activities")}
            </Nav.Link>

            <Nav.Link as={Link} to="/notice">
              {t("notice")}
            </Nav.Link>

            <Nav.Link as={Link} to="/contact">
              {t("contact")}
            </Nav.Link>

            <Nav.Link as={Link} to="/Donation">
              {t("donation")}
            </Nav.Link>

            <Nav.Link as={Link} to="/Feedback">
              {t("feedback")}
            </Nav.Link>

            <Nav.Link as={Link} to="/medical">
              {t("bloodBank")}
            </Nav.Link>

            {/* Language Switcher */}
            <LanguageSwitcher />

          </Nav>
        </Navbar.Collapse>

      </Container>
    </Navbar>
  );
};

export default Navigation;