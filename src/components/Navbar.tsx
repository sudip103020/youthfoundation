import { Container, Nav, Navbar } from "react-bootstrap";
import { Link } from "react-router-dom";

const Navigation = () => {
  return (
    <Navbar bg="white" expand="lg" sticky="top" className="shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <img src="/logo.png" alt="Logo" width="45" className="me-2" />
          <strong>Badokhali Youth Foundation</strong>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="navbar" />

        <Navbar.Collapse id="navbar">
          <Nav className="ms-auto align-items-center">
            <Nav.Link as={Link} to="/">
              Home
            </Nav.Link>

            <Nav.Link as={Link} to="/about">
              About us
            </Nav.Link>

            <Nav.Link as={Link} to="/activities">
              Activities
            </Nav.Link>
            <Nav.Link as={Link} to="/notice">
              Notice
            </Nav.Link>
            <Nav.Link as={Link} to="/contact" >
              Contact
            </Nav.Link>
            <Nav.Link as={Link} to="/Donation">
              Donation
            </Nav.Link>
            <Nav.Link as={Link} to="/Feedback">
              Feedback
            </Nav.Link>
            <Nav.Link as={Link} to="/medical">
              Blood Bank
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
