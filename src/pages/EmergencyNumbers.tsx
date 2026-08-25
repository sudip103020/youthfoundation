import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";

import { db } from "../firebase/firebase";
import { useTranslation } from "react-i18next";

import {
  FaAmbulance,
  FaShieldAlt,
  FaFireExtinguisher,
  FaMotorcycle,
  FaCar,
  FaHospital,
  FaUserMd,
  FaPhoneAlt,
  FaFirstAid,
  FaExclamationTriangle,
  FaLifeRing,
  FaHelicopter,
  FaTaxi,
} from "react-icons/fa";

// =====================================================
// INTERFACE
// =====================================================

interface EmergencyNumber {
  id: string;
  title: string;
  titleBn?: string;
  number: string;
  icon: string;
  description?: string;
  createdAt?: any;
}

// =====================================================
// ICON LIST
// =====================================================

const iconOptions = [
  {
    value: "ambulance",
    icon: FaAmbulance,
  },
  {
    value: "police",
    icon: FaShieldAlt,
  },
  {
    value: "fire",
    icon: FaFireExtinguisher,
  },
  {
    value: "van",
    icon: FaMotorcycle,
  },
  {
    value: "car",
    icon: FaCar,
  },
  {
    value: "hospital",
    icon: FaHospital,
  },
  {
    value: "doctor",
    icon: FaUserMd,
  },
  {
    value: "firstaid",
    icon: FaFirstAid,
  },
  {
    value: "emergency",
    icon: FaExclamationTriangle,
  },
  {
    value: "lifering",
    icon: FaLifeRing,
  },
  {
    value: "helicopter",
    icon: FaHelicopter,
  },
  {
    value: "taxi",
    icon: FaTaxi,
  },
];

// =====================================================
// GET ICON
// =====================================================

const getIconComponent = (iconName: string) => {
  const found = iconOptions.find(
    (item) => item.value === iconName
  );

  return found ? found.icon : FaPhoneAlt;
};

// =====================================================
// MAIN COMPONENT
// =====================================================

const EmergencyNumbers = () => {
  const { t, i18n } = useTranslation();

  const [emergencyNumbers, setEmergencyNumbers] =
    useState<EmergencyNumber[]>([]);

  const [loading, setLoading] = useState(true);

  // ===================================================
  // CURRENT LANGUAGE
  // ===================================================

  const isBangla = i18n.language.startsWith("bn");

  // ===================================================
  // FETCH DATA
  // ===================================================

  const fetchEmergencyNumbers = async () => {
    try {
      const q = query(
        collection(db, "emergencyNumbers"),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);

      const data: EmergencyNumber[] =
        snapshot.docs.map((item) => ({
          id: item.id,
          ...(item.data() as Omit<
            EmergencyNumber,
            "id"
          >),
        }));

      setEmergencyNumbers(data);
    } catch (error) {
      console.error(
        "Error loading emergency numbers:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // LOAD DATA
  // ===================================================

  useEffect(() => {
    fetchEmergencyNumbers();
  }, []);

  // ===================================================
  // RETURN
  // ===================================================

  return (
    <div className="container py-4">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="text-center mb-4">

        <h2 className="fw-bold">
          🚨 {t("emergency")}
        </h2>

      </div>


      {/* =================================================
          LOADING
      ================================================= */}

      {loading && (
        <div className="text-center py-5">

          <div
            className="spinner-border text-danger"
            role="status"
          />

          <p className="mt-2 text-muted">
            Loading emergency numbers...
          </p>

        </div>
      )}


      {/* =================================================
          NO DATA
      ================================================= */}

      {!loading &&
        emergencyNumbers.length === 0 && (

          <div className="text-center py-5">

            <FaExclamationTriangle
              size={55}
              className="text-muted mb-3"
            />

            <p className="text-muted">
              No emergency numbers available.
            </p>

          </div>
        )}


      {/* =================================================
          CARDS
      ================================================= */}

      {!loading &&
        emergencyNumbers.length > 0 && (

          <div className="row g-4">

            {emergencyNumbers.map((item) => {

              const Icon =
                getIconComponent(item.icon);

              // ==========================================
              // LANGUAGE অনুযায়ী TITLE
              // ==========================================

              const displayTitle = isBangla
                ? item.titleBn || item.title
                : item.title;

              return (

                <div
                  key={item.id}
                  className="
                    col-12
                    col-sm-6
                    col-lg-4
                    col-xl-3
                  "
                >

                  {/* ======================================
                      CARD
                  ====================================== */}

                  <div
                    className="card h-100 border-0 shadow-sm emergency-card"
                    style={{
                      borderRadius: "18px",
                      overflow: "hidden",
                      transition:
                        "transform 0.3s ease, box-shadow 0.3s ease",
                    }}
                  >

                    <div
                      className="
                        card-body
                        text-center
                        p-4
                        d-flex
                        flex-column
                      "
                    >

                      {/* ==================================
                          ICON
                      ================================== */}

                      <div
                        className="
                          d-flex
                          align-items-center
                          justify-content-center
                          mx-auto
                          mb-3
                        "
                        style={{
                          width: "90px",
                          height: "90px",
                          borderRadius: "50%",
                          background:
                            "linear-gradient(135deg, #dc3545, #b02a37)",
                          color: "#fff",
                          fontSize: "42px",
                          boxShadow:
                            "0 8px 20px rgba(220,53,69,0.25)",
                        }}
                      >

                        <Icon />

                      </div>


                      {/* ==================================
                          TITLE
                      ================================== */}

                      <h5
                        className="fw-bold mb-3"
                        style={{
                          fontSize: "18px",
                        }}
                      >
                        {displayTitle}
                      </h5>


                      {/* ==================================
                          PHONE NUMBER
                      ================================== */}

                      <a
                        href={`tel:${item.number}`}
                        className="
                          text-decoration-none
                          d-inline-block
                        "
                      >

                        <div
                          className="fw-bold text-danger"
                          style={{
                            fontSize: "22px",
                          }}
                        >

                          <FaPhoneAlt
                            className="me-2"
                            size={17}
                          />

                          {item.number}

                        </div>

                      </a>


                      {/* ==================================
                          DESCRIPTION
                      ================================== */}

                      {item.description && (

                        <p
                          className="
                            text-muted
                            mt-3
                            mb-3
                          "
                          style={{
                            fontSize: "14px",
                            lineHeight: "1.6",
                          }}
                        >
                          {item.description}
                        </p>

                      )}


                      {/* ==================================
                          CALL BUTTON
                      ================================== */}

                      <a
                        href={`tel:${item.number}`}
                        className="
                          btn
                          btn-danger
                          w-100
                          mt-auto
                        "
                        style={{
                          borderRadius: "10px",
                          fontWeight: 600,
                        }}
                      >

                        <FaPhoneAlt className="me-2" />

                        {isBangla
                          ? "কল করুন"
                          : "Call Now"}

                      </a>

                    </div>

                  </div>

                </div>

              );
            })}

          </div>
        )}

    </div>
  );
};

export default EmergencyNumbers;