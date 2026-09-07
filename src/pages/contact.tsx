import { useEffect } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// =====================================================
// FIX LEAFLET DEFAULT MARKER ICON
// =====================================================

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// =====================================================
// FOUNDATION LOCATION
// =====================================================

const FOUNDATION_LOCATION: [number, number] = [
  22.6905625,
  89.7430625,
];

// =====================================================
// CUSTOM FOUNDATION ICON
// =====================================================

const foundationIcon = L.divIcon({
  className: "foundation-marker-wrapper",

  html: `
    <div style="
      position: relative;
      width: 220px;
      height: 55px;
      display: flex;
      align-items: center;
      transform: translate(-15px, -20px);
    ">

      <!-- PIN -->
      <div style="
        position: relative;
        width: 30px;
        height: 30px;
        background: #dc2626;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 3px 10px rgba(0,0,0,0.4);
        flex-shrink: 0;
      ">

        <!-- WHITE DOT -->
        <div style="
          position: absolute;
          width: 9px;
          height: 9px;
          background: white;
          border-radius: 50%;
          top: 7px;
          left: 7px;
        "></div>

      </div>

      <!-- LABEL -->
      <div style="
        margin-left: 10px;
        background: white;
        color: #dc2626;
        padding: 6px 11px;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 700;
        line-height: 1.25;
        white-space: nowrap;
        box-shadow: 0 2px 10px rgba(0,0,0,0.25);
        border: 1px solid #e5e7eb;
      ">
        বাদোখালী ইয়ুথ
        <br />
        ফাউন্ডেশন
      </div>

    </div>
  `,

  iconSize: [220, 55],
  iconAnchor: [15, 27],
  popupAnchor: [0, -30],
});

// =====================================================
// MAP CONTROLLER
// =====================================================

const MapController = () => {
  const map = useMap();

  useEffect(() => {
    // Keep the map centered on the foundation location
    map.setView(FOUNDATION_LOCATION, 17);

    // Make sure map resizes correctly
    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }, [map]);

  return null;
};

// =====================================================
// LOCATION COMPONENT
// =====================================================

const Location = () => {
  const { t } = useTranslation();

  // ===================================================
  // OPEN GOOGLE MAPS DIRECTION
  // ===================================================

  const openGoogleMaps = () => {
    const url =
      "https://www.google.com/maps/dir/?api=1&destination=22.6905625,89.7430625";

    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Container className="py-2">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="text-center mb-5">
        <h2 className="fw-bold mt-3">
          📍 {t("ourLocation")}
        </h2>
      </div>

      <Row className="gy-4">

        {/* =================================================
            ADDRESS
        ================================================= */}

        <Col md={5}>
          <Card className="shadow-sm h-100">
            <Card.Body>

              <h4 className="fw-bold">
                🏢 {t("foundationOffice")}
              </h4>

              <hr />

              {/* FOUNDATION NAME */}

              <p>
                <strong>{t("name")}:</strong>
                <br />
                {t("foundationName")}
              </p>

              {/* ADDRESS */}

              <p>
                <strong>{t("addressLabel")}:</strong>
                <br />

                {t("village")}: {t("badokhali")},
                <br />

                {t("post")}: {t("Mograhat")},
                <br />

                {t("upazila")}: {t("bagerhat")},
                <br />

                {t("khulna")}
              </p>

              {/* PHONE */}

              <p>
                <strong>📞 {t("phone")}:</strong>
                <br />

                <a
                  href="tel:+8801738126875"
                  className="text-decoration-none"
                >
                  +8801738126875
                </a>

                {" , "}

                <a
                  href="tel:+8801714597343"
                  className="text-decoration-none"
                >
                  +8801714597343
                </a>
              </p>

              {/* EMAIL */}

              <p>
                <strong>✉ {t("email")}:</strong>
                <br />

                <a
                  href="mailto:badokhaliyouthfoundation@gmail.com"
                  className="text-decoration-none text-break"
                >
                  badokhaliyouthfoundation@gmail.com
                </a>
              </p>

              {/* =================================================
                  GET DIRECTION
              ================================================= */}

              <Button
                variant="success"
                onClick={openGoogleMaps}
              >
                🧭 {t("getDirection")}
              </Button>

            </Card.Body>
          </Card>
        </Col>

        {/* =================================================
            MAP
        ================================================= */}

        <Col md={7}>
          <Card className="shadow-sm">
            <Card.Body>

              <h4 className="fw-bold mb-3">
                🗺 {t("googleMap")}
              </h4>

              {/* =================================================
                  MAP
              ================================================= */}

              <div
                style={{
                  width: "100%",
                  height: "400px",
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: "10px",
                }}
              >

                <MapContainer
                  center={FOUNDATION_LOCATION}
                  zoom={17}
                  scrollWheelZoom={true}
                  doubleClickZoom={true}
                  dragging={true}
                  touchZoom={true}
                  zoomControl={true}
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "10px",
                  }}
                >

                  {/* =================================================
                      OPENSTREETMAP TILES
                  ================================================= */}

                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {/* =================================================
                      MAP CONTROLLER
                  ================================================= */}

                  <MapController />

                  {/* =================================================
                      FOUNDATION MARKER + LABEL
                  ================================================= */}

                  <Marker
                    position={FOUNDATION_LOCATION}
                    icon={foundationIcon}
                  >

                    {/* =================================================
                        HOVER TOOLTIP
                    ================================================= */}

                    <Tooltip
                      direction="top"
                      offset={[0, -20]}
                      opacity={1}
                      permanent={false}
                    >
                      বাদোখালী ইয়ুথ ফাউন্ডেশন
                    </Tooltip>

                    {/* =================================================
                        CLICK POPUP
                    ================================================= */}

                    <Popup>
                      <div
                        style={{
                          textAlign: "center",
                          minWidth: "180px",
                        }}
                      >
                        <strong>
                          বাদোখালী ইয়ুথ ফাউন্ডেশন
                        </strong>

                        <br />

                        <span
                          style={{
                            fontSize: "13px",
                            color: "#666",
                          }}
                        >
                          Badokhali, Mograhat, Bagerhat
                        </span>

                        <br />

                        <Button
                          variant="success"
                          size="sm"
                          className="mt-2"
                          onClick={openGoogleMaps}
                        >
                          🧭 Get Direction
                        </Button>
                      </div>
                    </Popup>

                  </Marker>

                </MapContainer>

              </div>

            </Card.Body>
          </Card>
        </Col>

      </Row>
    </Container>
  );
};

export default Location;

