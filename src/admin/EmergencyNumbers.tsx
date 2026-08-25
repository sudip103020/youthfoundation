import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";

import { db } from "../firebase/firebase";

import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

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
    label: "Ambulance",
    icon: FaAmbulance,
  },
  {
    value: "police",
    label: "Police",
    icon: FaShieldAlt,
  },
  {
    value: "fire",
    label: "Fire Service",
    icon: FaFireExtinguisher,
  },
  {
    value: "van",
    label: "Van / Rickshaw",
    icon: FaMotorcycle,
  },
  {
    value: "car",
    label: "Car / Transport",
    icon: FaCar,
  },
  {
    value: "hospital",
    label: "Hospital",
    icon: FaHospital,
  },
  {
    value: "doctor",
    label: "Doctor",
    icon: FaUserMd,
  },
  {
    value: "firstaid",
    label: "First Aid",
    icon: FaFirstAid,
  },
  {
    value: "emergency",
    label: "Emergency",
    icon: FaExclamationTriangle,
  },
  {
    value: "lifering",
    label: "Life Support",
    icon: FaLifeRing,
  },
  {
    value: "helicopter",
    label: "Helicopter",
    icon: FaHelicopter,
  },
  {
    value: "taxi",
    label: "Taxi",
    icon: FaTaxi,
  },
];

// =====================================================
// ICON COMPONENT
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
  // ===================================================
  // FORM STATE
  // ===================================================

  const [title, setTitle] = useState("");
  const [titleBn, setTitleBn] = useState("");
  const [number, setNumber] = useState("");
  const [icon, setIcon] = useState("emergency");
  const [description, setDescription] = useState("");

  // ===================================================
  // LIST
  // ===================================================

  const [emergencyNumbers, setEmergencyNumbers] =
    useState<EmergencyNumber[]>([]);

  // ===================================================
  // EDIT
  // ===================================================

  const [editingId, setEditingId] = useState("");

  // ===================================================
  // LOADING
  // ===================================================

  const [loading, setLoading] = useState(false);

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

      const data: EmergencyNumber[] = [];

      snapshot.forEach((item) => {
        data.push({
          id: item.id,
          ...(item.data() as Omit<
            EmergencyNumber,
            "id"
          >),
        });
      });

      setEmergencyNumbers(data);
    } catch (error) {
      console.error(
        "Error fetching emergency numbers:",
        error
      );
    }
  };

  // ===================================================
  // LOAD
  // ===================================================

  useEffect(() => {
    fetchEmergencyNumbers();
  }, []);

  // ===================================================
  // CLEAR FORM
  // ===================================================

  const clearForm = () => {
    setTitle("");
    setTitleBn("");
    setNumber("");
    setIcon("emergency");
    setDescription("");
    setEditingId("");
  };

  // ===================================================
  // ADD
  // ===================================================

  const addEmergencyNumber = async () => {
    if (!title.trim()) {
      alert("English title is required");
      return;
    }

    if (!number.trim()) {
      alert("Phone number is required");
      return;
    }

    try {
      setLoading(true);

      await addDoc(
        collection(db, "emergencyNumbers"),
        {
          title: title.trim(),
          titleBn: titleBn.trim(),
          number: number.trim(),
          icon,
          description: description.trim(),
          createdAt: serverTimestamp(),
        }
      );

      alert(
        "Emergency Number Added Successfully"
      );

      clearForm();

      await fetchEmergencyNumbers();
    } catch (error) {
      console.error(error);

      alert(
        "Failed to add emergency number"
      );
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // EDIT
  // ===================================================

  const handleEdit = (
    item: EmergencyNumber
  ) => {
    setEditingId(item.id);

    setTitle(item.title || "");
    setTitleBn(item.titleBn || "");
    setNumber(item.number || "");
    setIcon(item.icon || "emergency");
    setDescription(item.description || "");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ===================================================
  // UPDATE
  // ===================================================

  const updateEmergencyNumber = async () => {
    if (!editingId) return;

    if (!title.trim()) {
      alert("English title is required");
      return;
    }

    if (!number.trim()) {
      alert("Phone number is required");
      return;
    }

    try {
      setLoading(true);

      await updateDoc(
        doc(
          db,
          "emergencyNumbers",
          editingId
        ),
        {
          title: title.trim(),
          titleBn: titleBn.trim(),
          number: number.trim(),
          icon,
          description: description.trim(),
        }
      );

      alert(
        "Emergency Number Updated Successfully"
      );

      clearForm();

      await fetchEmergencyNumbers();
    } catch (error) {
      console.error(error);

      alert(
        "Failed to update emergency number"
      );
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // DELETE
  // ===================================================

  const handleDelete = async (
    item: EmergencyNumber
  ) => {
    const confirmDelete =
      window.confirm(
        `Are you sure you want to delete "${item.title}"?`
      );

    if (!confirmDelete) return;

    try {
      await deleteDoc(
        doc(
          db,
          "emergencyNumbers",
          item.id
        )
      );

      alert(
        "Emergency Number Deleted Successfully"
      );

      await fetchEmergencyNumbers();
    } catch (error) {
      console.error(error);

      alert(
        "Failed to delete emergency number"
      );
    }
  };

  // ===================================================
  // RETURN
  // ===================================================

  return (
    <AdminLayout>

      <div className="container-fluid p-4">

        {/* =================================================
            FORM
        ================================================= */}

        <div className="card shadow-sm p-3 mb-4">

          <h4 className="mb-4">

            {editingId
              ? "✏️ Edit Emergency Number"
              : "🚨 Add Emergency Number"}

          </h4>

          <div className="row">

            {/* =================================================
                ENGLISH TITLE
            ================================================= */}

            <div className="col-md-4 mb-3">

              <label className="form-label">

                Title (English)

                <span className="text-danger">
                  {" "}*
                </span>

              </label>

              <input
                type="text"
                className="form-control"
                placeholder="Ambulance"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
              />

            </div>


            {/* =================================================
                BANGLA TITLE
            ================================================= */}

            <div className="col-md-4 mb-3">

              <label className="form-label">

                Title (বাংলা)

              </label>

              <input
                type="text"
                className="form-control"
                placeholder="অ্যাম্বুলেন্স"
                value={titleBn}
                onChange={(e) =>
                  setTitleBn(e.target.value)
                }
              />

            </div>


            {/* =================================================
                PHONE NUMBER
            ================================================= */}

            <div className="col-md-4 mb-3">

              <label className="form-label">

                Phone Number

                <span className="text-danger">
                  {" "}*
                </span>

              </label>

              <input
                type="text"
                className="form-control"
                placeholder="999"
                value={number}
                onChange={(e) =>
                  setNumber(e.target.value)
                }
              />

            </div>


            {/* =================================================
                ICON
            ================================================= */}

            <div className="col-md-4 mb-3">

              <label className="form-label">
                Icon
              </label>

              <select
                className="form-select"
                value={icon}
                onChange={(e) =>
                  setIcon(e.target.value)
                }
              >

                {iconOptions.map(
                  (item) => {

                    return (
                      <option
                        key={item.value}
                        value={item.value}
                      >
                        {item.label}
                      </option>
                    );

                  }
                )}

              </select>

            </div>


            {/* =================================================
                ICON PREVIEW
            ================================================= */}

            <div className="col-12 mb-3">

              <div
                className="d-flex align-items-center gap-3 p-3 border rounded bg-light"
              >

                <div
                  className="d-flex align-items-center justify-content-center rounded-circle bg-danger text-white"
                  style={{
                    width: "55px",
                    height: "55px",
                    fontSize: "25px",
                  }}
                >

                  {(() => {

                    const Icon =
                      getIconComponent(icon);

                    return <Icon />;

                  })()}

                </div>


                <div>

                  <strong>
                    {title ||
                      "Emergency Service"}
                  </strong>

                  {titleBn && (
                    <div className="text-muted">
                      {titleBn}
                    </div>
                  )}

                  <div className="text-danger fw-bold">

                    <FaPhoneAlt
                      className="me-1"
                    />

                    {number ||
                      "Phone Number"}

                  </div>

                </div>

              </div>

            </div>


            {/* =================================================
                DESCRIPTION
            ================================================= */}

            <div className="col-12 mb-3">

              <label className="form-label">

                Description

                <span className="text-muted">
                  {" "}
                  (Optional)
                </span>

              </label>

              <textarea
                className="form-control"
                rows={3}
                placeholder="Optional information..."
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
              />

            </div>

          </div>


          {/* =================================================
              BUTTONS
          ================================================= */}

          <div className="d-flex gap-2">

            {editingId ? (

              <button
                className="btn btn-warning"
                onClick={
                  updateEmergencyNumber
                }
                disabled={loading}
              >

                💾{" "}

                {loading
                  ? "Updating..."
                  : "Update Emergency Number"}

              </button>

            ) : (

              <button
                className="btn btn-danger"
                onClick={
                  addEmergencyNumber
                }
                disabled={loading}
              >

                ➕{" "}

                {loading
                  ? "Saving..."
                  : "Save Emergency Number"}

              </button>

            )}


            {editingId && (

              <button
                className="btn btn-secondary"
                onClick={clearForm}
                disabled={loading}
              >
                Cancel
              </button>

            )}

          </div>

        </div>


        {/* =================================================
            EMERGENCY NUMBER LIST
        ================================================= */}

        <div className="card shadow-sm">

          <div className="card-header bg-dark text-white">

            <h5 className="mb-0">
              🚨 Emergency Numbers
            </h5>

          </div>


          <div className="card-body">

            <div className="table-responsive">

              <table className="table table-bordered table-hover align-middle">

                <thead className="table-light">

                  <tr>

                    <th>
                      #
                    </th>

                    <th>
                      Icon
                    </th>

                    <th>
                      Title
                    </th>

                    <th>
                      Title বাংলা
                    </th>

                    <th>
                      Number
                    </th>

                    <th>
                      Description
                    </th>

                    <th>
                      Action
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {emergencyNumbers.length === 0 ? (

                    <tr>

                      <td
                        colSpan={7}
                        className="text-center text-muted"
                      >

                        No Emergency Numbers Found

                      </td>

                    </tr>

                  ) : (

                    emergencyNumbers.map(
                      (item, index) => {

                        const Icon =
                          getIconComponent(
                            item.icon
                          );

                        return (

                          <tr
                            key={item.id}
                          >

                            {/* NUMBER */}

                            <td>
                              {index + 1}
                            </td>


                            {/* ICON */}

                            <td>

                              <div
                                className="d-flex align-items-center justify-content-center rounded-circle bg-danger text-white"
                                style={{
                                  width: "45px",
                                  height: "45px",
                                  fontSize: "20px",
                                }}
                              >

                                <Icon />

                              </div>

                            </td>


                            {/* ENGLISH TITLE */}

                            <td>

                              <strong>
                                {item.title}
                              </strong>

                            </td>


                            {/* BANGLA TITLE */}

                            <td>

                              <strong>
                                {item.titleBn ||
                                  "-"}
                              </strong>

                            </td>


                            {/* PHONE */}

                            <td>

                              <a
                                href={`tel:${item.number}`}
                                className="text-decoration-none fw-bold text-danger"
                              >

                                <FaPhoneAlt className="me-1" />

                                {item.number}

                              </a>

                            </td>


                            {/* DESCRIPTION */}

                            <td>

                              {item.description ||
                                "-"}

                            </td>


                            {/* ACTION */}

                            <td>

                              <button
                                className="btn btn-primary btn-sm me-2"
                                onClick={() =>
                                  handleEdit(
                                    item
                                  )
                                }
                              >

                                ✏️ Edit

                              </button>


                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() =>
                                  handleDelete(
                                    item
                                  )
                                }
                              >

                                🗑 Delete

                              </button>

                            </td>

                          </tr>

                        );

                      }
                    )

                  )}

                </tbody>

              </table>

            </div>

          </div>

        </div>

      </div>

    </AdminLayout>
  );
};

export default EmergencyNumbers;