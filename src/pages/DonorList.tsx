import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

interface Donation {
  id: string;
  donorName: string;
  phone?: string;
  address?: string;
  amount?: string;
  donationType?: string;
  photo?: string;
  createdAt?: any;
}

const DonorList = () => {
  const [donors, setDonors] = useState<Donation[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchDonors = async () => {
    try {
      const snapshot = await getDocs(
        collection(db, "donations")
      );

      const data: Donation[] = snapshot.docs.map((item) => ({
        id: item.id,
        ...(item.data() as Omit<Donation, "id">),
      }));

      // Latest donation first
      data.sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;

        return bTime - aTime;
      });

      setDonors(data);
    } catch (error) {
      console.error("Error loading donors:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, []);

  // Search by donor name
  const filteredDonors = donors.filter((donor) =>
    donor.donorName
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );

  return (

    <>   <Navbar /> 
    <div className="container py-2">

      {/* ================= HEADER ================= */}

      <div className="text-center mb-4">

        <h2 className="fw-bold">
          ⭐ Our Donors
        </h2>

        <p className="text-muted mb-0">
          We are grateful to everyone who supports
          Badokhali Youth Foundation.
        </p>

      </div>

      {/* ================= SEARCH ================= */}

      <div className="row justify-content-center mb-4">

        <div className="col-md-6">

          <div className="input-group">

            <span className="input-group-text bg-white">
              🔍
            </span>

            <input
              type="text"
              className="form-control"
              placeholder="Search donor by name..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

            {search && (
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={() => setSearch("")}
              >
                ✕
              </button>
            )}

          </div>

        </div>

      </div>

      {/* ================= LOADING ================= */}

      {loading && (
        <div className="text-center py-5">

          <div
            className="spinner-border text-primary"
            role="status"
          />

          <p className="mt-2 text-muted">
            Loading donors...
          </p>

        </div>
      )}

      {/* ================= NO DONOR ================= */}

      {!loading &&
        filteredDonors.length === 0 && (

          <div className="text-center py-5">

            <div
              style={{
                fontSize: "50px",
              }}
            >
              🤝
            </div>

            <h5 className="mt-3">
              No Donor Found
            </h5>

            <p className="text-muted">
              Try searching with another name.
            </p>

          </div>
        )}

      {/* ================= DONOR LIST ================= */}

      {!loading &&
        filteredDonors.length > 0 && (

          <div
            className="card border-0 shadow-sm"
            style={{
              borderRadius: "14px",
              overflow: "hidden",
            }}
          >

            {/* Table Header */}

            <div className="card-header bg-dark text-white py-3">

              <div className="d-flex justify-content-between align-items-center">

                <h5 className="mb-0">
                  List
                </h5>

                <span className="badge bg-light text-dark">
                  {filteredDonors.length} Donor
                  {filteredDonors.length !== 1
                    ? "s"
                    : ""}
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
                        width: "70px",
                      }}
                    >
                      #
                    </th>

                    <th
                      style={{
                        width: "100px",
                      }}
                    >
                      Photo
                    </th>

                    <th>
                      Donor Name
                    </th>

                    <th>
                      Address
                    </th>

                    <th>
                      Mobile
                    </th>

                    <th className="text-end">
                      Donation
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredDonors.map(
                    (donor, index) => (

                      <tr key={donor.id}>

                        {/* Serial */}

                        <td className="text-center text-muted">
                          {index + 1}
                        </td>

                        {/* Photo */}

                        <td>

                          {donor.photo ? (

                            <img
                              src={donor.photo}
                              alt={donor.donorName}
                              width="55"
                              height="55"
                              style={{
                                objectFit: "cover",
                                borderRadius: "50%",
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
                                borderRadius: "50%",
                                background:
                                  "#f1f3f5",
                                fontSize: "25px",
                              }}
                            >
                              👤
                            </div>

                          )}

                        </td>

                        {/* Name */}

                        <td>

                          <div className="fw-semibold">
                            {donor.donorName}
                          </div>

                        </td>

                        {/* Address */}

                        <td>

                          <span className="text-muted">

                            {donor.address ||
                              "Address not available"}

                          </span>

                        </td>

                        {/* Mobile */}

                        <td>

                          {donor.phone ? (

                            <span>
                               {donor.phone}
                            </span>

                          ) : (

                            <span className="text-muted">
                              -
                            </span>

                          )}

                        </td>

                        {/* Amount */}

                        <td className="text-end">

                          {donor.donationType ===
                          "Cash" ? (

                            <span
                              className="fw-bold text-success"
                              style={{
                                fontSize: "17px",
                              }}
                            >
                              ৳{" "}
                              {donor.amount ||
                                "0"}
                            </span>

                          ) : donor.donationType ===
                            "Others" ? (

                            <span className="badge bg-info">
                              Non-Cash
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

      {/* ================= RESULT ================= */}

      {!loading &&
        filteredDonors.length > 0 && (

          <div className="text-center mt-3">

            <small className="text-muted">

              Showing{" "}
              <strong>
                {filteredDonors.length}
              </strong>{" "}
              donor
              {filteredDonors.length !== 1
                ? "s"
                : ""}

              {search && (
                <>
                  {" "}
                  matching "
                  <strong>{search}</strong>"
                </>
              )}

            </small>

          </div>
        )}

    </div>

      <Footer />
      </>
  );
};

export default DonorList;

