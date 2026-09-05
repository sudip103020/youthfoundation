import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useTranslation } from "react-i18next";
import { FaFileCircleXmark } from "react-icons/fa6";

interface MedicalInfo {
  id: string;
  name: string;

  bloodGroup?: string;
  photo?: string;

  // New Fields
  dateOfBirth?: string;
  gender?: string;
  currentAddress?: string;

  createdAt?: any;
}

const MedicalList = () => {
  const { t } = useTranslation();

  const [members, setMembers] = useState<MedicalInfo[]>([]);
  const [bloodFilter, setBloodFilter] = useState("");
  const [loading, setLoading] = useState(true);

  // ===============================
  // PAGINATION
  // ===============================

  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // ===============================
  // FETCH MEDICAL INFO
  // ===============================

  const fetchMedicalInfo = async () => {
    try {
      const snapshot = await getDocs(
        collection(db, "medicalInfo")
      );

      const data: MedicalInfo[] = snapshot.docs.map(
        (item) => ({
          id: item.id,
          ...(item.data() as Omit<MedicalInfo, "id">),
        })
      );

      // Latest first
      data.sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;

        return bTime - aTime;
      });

      setMembers(data);
    } catch (error) {
      console.error(
        "Error loading medical info:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicalInfo();
  }, []);

  // ===============================
  // CALCULATE AGE FROM DATE OF BIRTH
  // ===============================

  const calculateAge = (
    dateOfBirth?: string
  ): string => {
    if (!dateOfBirth) return "-";

    const birthDate = new Date(dateOfBirth);

    if (isNaN(birthDate.getTime())) {
      return "-";
    }

    const today = new Date();

    let age =
      today.getFullYear() -
      birthDate.getFullYear();

    const monthDifference =
      today.getMonth() -
      birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 &&
        today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age >= 0 ? `${age} Years` : "-";
  };

  // ===============================
  // BLOOD GROUP FILTER
  // ===============================

  const filteredMembers = members.filter((member) => {
    return (
      bloodFilter === "" ||
      member.bloodGroup === bloodFilter
    );
  });

  // ===============================
  // RESET PAGE WHEN FILTER CHANGES
  // ===============================

  useEffect(() => {
    setCurrentPage(1);
  }, [bloodFilter]);

  // ===============================
  // PAGINATION CALCULATION
  // ===============================

  const totalPages = Math.ceil(
    filteredMembers.length / ITEMS_PER_PAGE
  );

  const startIndex =
    (currentPage - 1) * ITEMS_PER_PAGE;

  const endIndex =
    startIndex + ITEMS_PER_PAGE;

  const currentMembers =
    filteredMembers.slice(
      startIndex,
      endIndex
    );

  // ===============================
  // PAGE CHANGE
  // ===============================

  const goToPage = (page: number) => {
    if (
      page >= 1 &&
      page <= totalPages
    ) {
      setCurrentPage(page);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  return (
    <>
      <div className="container py-2">

        {/* ================= HEADER ================= */}

        <div className="text-center mb-4">

          <h2 className="fw-bold">
            {t("bloodInformation")}
          </h2>

          <p className="text-muted mb-0">
            {t("bloodInformationDescription")}
          </p>

        </div>

        {/* ================= FILTER ================= */}

        <div className="row justify-content-center mb-4">

          <div className="col-md-5">

            <label className="form-label fw-semibold">
              {t("searchBloodGroup")}
            </label>

            <select
              className="form-select"
              value={bloodFilter}
              onChange={(e) =>
                setBloodFilter(e.target.value)
              }
            >

              <option value="">
                {t("allBloodGroups")}
              </option>

              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>

            </select>

          </div>

        </div>

        {/* ================= LOADING ================= */}

        {loading && (
          <div className="text-center py-2">

            <div
              className="spinner-border text-danger"
              role="status"
            />

            <p className="mt-2 text-muted">
              Loading medical information...
            </p>

          </div>
        )}

        {/* ================= NO DATA ================= */}

        {!loading &&
          filteredMembers.length === 0 && (

            <div className="text-center py-5">

              <div
                style={{
                  fontSize: "50px",
                }}
              >
                <FaFileCircleXmark />
              </div>

              <p className="text-muted">
                {t("noMemberWithBloodGroup")}
              </p>

            </div>
          )}

        {/* ================= MEDICAL LIST ================= */}

        {!loading &&
          currentMembers.length > 0 && (

            <div
              className="card border-0 shadow-sm"
              style={{
                borderRadius: "14px",
                overflow: "hidden",
              }}
            >

              {/* Header */}

              <div className="card-header bg-dark text-white py-3">

                <div className="d-flex justify-content-between align-items-center">

                  <h5 className="badge bg-light text-dark mb-0">
                    {t("talika")}
                  </h5>

                  <span className="badge bg-light text-dark">
                    {filteredMembers.length}{" "}
                    {t("donarjon")}
                  </span>

                </div>

              </div>

              {/* Responsive Table */}

              <div className="table-responsive">

                <table className="table table-hover align-middle mb-0">

                  <thead className="table-light">

                    <tr>

                      <th
                        className="text-center"
                        style={{
                          width: "60px",
                        }}
                      >
                        #
                      </th>

                      <th
                        style={{
                          width: "90px",
                        }}
                      >
                        {t("Donarphoto")}
                      </th>

                      <th>
                        {t("bloodmember")}
                      </th>

                     

                      {/* NEW */}

                      <th>
                        {t("gender")}
                      </th>

                      <th>
                       {t("age")}
                      </th>

                      <th>
                         {t("currentaddress")}
                      </th>

                      <th className="text-center">
                        {t("bloodgroup")}
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {currentMembers.map(
                      (member, index) => (

                        <tr key={member.id}>

                          {/* Number */}

                          <td className="text-center text-muted">
                            {startIndex + index + 1}
                          </td>

                          {/* Photo */}

                          <td>

                            {member.photo ? (

                              <img
                                src={member.photo}
                                alt={member.name}
                                width="55"
                                height="55"
                                style={{
                                  objectFit:
                                    "cover",
                                  borderRadius:
                                    "50%",
                                  border:
                                    "2px solid #eee",
                                }}
                              />

                            ) : (

                              <div
                                className="d-flex align-items-center justify-content-center"
                                style={{
                                  width: "55px",
                                  height: "55px",
                                  borderRadius:
                                    "50%",
                                  background:
                                    "#f1f3f5",
                                  fontSize:
                                    "25px",
                                }}
                              >
                                👤
                              </div>

                            )}

                          </td>

                          {/* Name */}

                          <td>

                            <div className="fw-semibold">
                              {member.name}
                            </div>

                          </td>

                        

                          {/* Gender */}

                          <td>

                            {member.gender ? (

                              <span className="badge bg-info text-dark">
                                {member.gender}
                              </span>

                            ) : (

                              <span className="text-muted">
                                -
                              </span>

                            )}

                          </td>

                          {/* AGE */}

                          <td>

                            {member.dateOfBirth ? (

                              <span>
                                {calculateAge(
                                  member.dateOfBirth
                                )}
                              </span>

                            ) : (

                              <span className="text-muted">
                                -
                              </span>

                            )}

                          </td>

                          {/* CURRENT ADDRESS */}

                          <td>

                            {member.currentAddress ? (

                              <span
                                title={
                                  member.currentAddress
                                }
                              >
                                📍{" "}
                                {member.currentAddress}
                              </span>

                            ) : (

                              <span className="text-muted">
                                -
                              </span>

                            )}

                          </td>

                          {/* Blood Group */}

                          <td className="text-center">

                            {member.bloodGroup ? (

                              <span
                                className="badge"
                                style={{
                                  fontSize: "15px",
                                  padding:
                                    "8px 12px",
                                  backgroundColor:
                                    "#e7f1ff",
                                  color:
                                    "#0d6efd",
                                  border:
                                    "1px solid #b6d4fe",
                                }}
                              >
                                🩸{" "}
                                {member.bloodGroup}
                              </span>

                            ) : (

                              <span className="text-muted">
                                -
                              </span>

                            )}

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            </div>
          )}

        {/* ================= PAGINATION ================= */}

        {!loading &&
          filteredMembers.length > 0 &&
          totalPages > 1 && (

            <div className="d-flex justify-content-center mt-4">

              <nav>

                <ul className="pagination">

                  {/* Previous */}

                  <li
                    className={`page-item ${
                      currentPage === 1
                        ? "disabled"
                        : ""
                    }`}
                  >

                    <button
                      className="page-link"
                      onClick={() =>
                        goToPage(
                          currentPage - 1
                        )
                      }
                      disabled={
                        currentPage === 1
                      }
                    >
                      {t("previous")}
                    </button>

                  </li>

                  {/* Page Numbers */}

                  {Array.from(
                    { length: totalPages },
                    (_, index) =>
                      index + 1
                  ).map((page) => (

                    <li
                      key={page}
                      className={`page-item ${
                        currentPage === page
                          ? "active"
                          : ""
                      }`}
                    >

                      <button
                        className="page-link"
                        onClick={() =>
                          goToPage(page)
                        }
                      >
                        {page}
                      </button>

                    </li>

                  ))}

                  {/* Next */}

                  <li
                    className={`page-item ${
                      currentPage === totalPages
                        ? "disabled"
                        : ""
                    }`}
                  >

                    <button
                      className="page-link"
                      onClick={() =>
                        goToPage(
                          currentPage + 1
                        )
                      }
                      disabled={
                        currentPage === totalPages
                      }
                    >
                      {t("next")}
                    </button>

                  </li>

                </ul>

              </nav>

            </div>
          )}

        {/* ================= RESULT ================= */}

        {!loading &&
          filteredMembers.length > 0 && (

            <div className="text-center mt-3">

              <small className="text-muted">

                {t("showing")}{" "}

                <strong>
                  {startIndex + 1}
                </strong>{" "}

                -{" "}

                <strong>
                  {Math.min(
                    endIndex,
                    filteredMembers.length
                  )}
                </strong>{" "}

                {t("of")}{" "}

                <strong>
                  {filteredMembers.length}
                </strong>{" "}

                {t("of1")}

                {bloodFilter && (
                  <>
                    {" "}
                    with blood group{" "}
                    <strong>
                      {bloodFilter}
                    </strong>
                  </>
                )}

              </small>

            </div>
          )}

      </div>
    </>
  );
};

export default MedicalList;