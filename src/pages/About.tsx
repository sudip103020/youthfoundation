import Header from "../components/Navbar";
import Footer from "../components/Footer";
import { Container, Row, Col, Card } from "react-bootstrap";

const members = [
  {
    id: 1,
    name: "Sudip Kumar Halder",
    designation: "President",
    phone: "01738126875",
    email: "sudiphalderruet@gmail.com",
    blood: "A+",
    image: "sudip.jpeg",
  },
  {
    id: 2,
    name: "Haripada Das",
    designation: "Vice President",
    phone: "01910430997",
    email: "haripadodas@gmail.com",
    blood: "A+",
    image: "hori.jpeg",
  },
  {
    id: 3,
    name: "Sohag Das",
    designation: "General Secretary",
    phone: "01714597343",
    email: "sasohag742@gmail.com",
    blood: "O+",
    image: "tutul.jpg",
  },
  {
    id: 4,
    name: "Dipta Kumar Das",
    designation: "Joint Secretary",
    phone: "01521318984",
    email: "dipta75das@gmail.com",
    blood: "A+",
    image: "dipta.jpg",
  },
  {
    id: 5,
    name: "Suman Roy",
    designation: "Treasurer",
    phone: "01739009623",
    email: "sumon.roy9300@gmail.com",
    blood: "O+",
    image: "sumon.jpg",
  },
  {
    id: 6,
    name: "Chayan Das",
    designation: "Legal Secretary",
    phone: "01915040040",
    email: "Chayan676@yahoo.com",
    blood: "O+",
    image: "cayan.jpeg",
  },
  {
    id: 7,
    name: "Piyas Halder",
    designation: "Health Secretary",
    phone: "01737074522",
    email: "piyashalder3@gmail.com",
    blood: "A+",
    image: "paish.jpeg",
  },
  {
    id: 8,
    name: "Sajib Roy",
    designation: "Organizing Secretary",
    phone: "01941716469",
    email: "sajibroy580426@gmail.com",
    blood: "B+",
    image: "sajib.jpeg",
  },
  {
    id: 9,
    name: "Chandon Halder",
    designation: "Social Service Secretary",
    phone: "01728934174",
    email: "chandonhalder1992@gmail.com",
    blood: "B+",
    image: "chandan.png",
  },
  {
    id: 10,
    name: "Sathi Das",
    designation: "Education and Literature Secretary",
    phone: "01919374875",
    email: "sathidas@gmail.com",
    blood: "O-",
    image: "images.png",
  },
  {
    id: 11,
    name: "Mithun Roy",
    designation: "Cultural Secretary",
    phone: "01737135893",
    email: "member11@byf.org",
    blood: "A+",
    image: "mithun.jpeg",
  },
  {
    id: 12,
    name: "Antu kumar Halder",
    designation: "Information and Technology Secretary",
    phone: "01786627284",
    email: "antukumarhalder@gmail.com",
    blood: "B+",
    image: "antu.jpeg",
  },
  {
    id: 13,
    name: "Anupom Roy",
    designation: "Office Secretary",
    phone: "01726661045",
    email: "roy226801@gmail.com",
    blood: "B+",
    image: "anupom.png",
  },
  {
    id: 14,
    name: "Dipayon Das ",
    designation: "Sports Secretary",
    phone: "01767540983",
    email: "dipayondas473@gmail.com",
    blood: "O+",
    image: "dipaon.jpg",
  },
  {
    id: 15,
    name: "Pavel Das",
    designation: "Publicity and Publication Secretary",
    phone: "01947835283",
    email: "paveldn18@gmail.com",
    blood: "A+",
    image: "pavel.jpeg",
  },
];

export default function About() {
  return (
    <>
      <Header />

      <main className="py-5 bg-light">
        <Container>
          <div className="text-center mb-5">
            <h1 className="fw-bold">
              Executive <span className="text-success">Committee</span>
            </h1>
            <p className="text-muted">
              Meet the dedicated members of Badokhali Youth Foundation.
            </p>
          </div>

          <Row className="g-4">
            {members.map((member) => (
              <Col lg={4} md={6} sm={12} key={member.id}>
                <Card className="border-0 shadow-sm text-center h-100 rounded-4">
                  <Card.Body>
                    <img
                      src={member.image}
                      alt={member.name}
                      className="rounded-circle border border-3 border-success mb-3"
                      style={{
                        width: "150px",
                        height: "150px",
                        objectFit: "cover",
                      }}
                    />

                    <h4 className="fw-bold mb-1">{member.name}</h4>

                    <h6 className="text-success mb-3">
                      {member.designation}
                    </h6>

                    <p className="mb-2">
                      📞 <strong>{member.phone}</strong>
                    </p>

                    <p className="mb-2">
                      ✉ {member.email}
                    </p>

                    <p className="mb-0">
                      🩸 Blood Group: <strong>{member.blood}</strong>
                    </p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </main>

      <Footer />
    </>
  );
}