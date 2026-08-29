import { useEffect, useState } from "react";
import { db, auth } from "../firebase/firebase";
import AdminLayout from "./AdminLayout";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  query,
  where
} from "firebase/firestore";



const Dashboard = () => {

  const [totalMembers, setTotalMembers] = useState(0);
  const [totalSubscription, setTotalSubscription] = useState(0);
  const [totalDonation, setTotalDonation] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [profile, setProfile] = useState<any>(null);

  const [mySubscriptionAmount, setMySubscriptionAmount] = useState(0);


  const loadDashboard = async () => {

    const memberSnapshot = await getDocs(
      collection(db, "members")
    );

    setTotalMembers(memberSnapshot.size);



    const subscriptionSnapshot = await getDocs(
      collection(db, "subscriptions")
    );


    let subscriptionTotal = 0;

    subscriptionSnapshot.forEach((item) => {
      subscriptionTotal += Number(
        item.data().amount || 0
      );
    });

    setTotalSubscription(subscriptionTotal);



    const donationSnapshot = await getDocs(
      collection(db, "donations")
    );

    let donationTotal = 0;

    donationSnapshot.forEach((item) => {
      donationTotal += Number(
        item.data().amount || 0
      );
    });

    setTotalDonation(donationTotal);



    const expenseSnapshot = await getDocs(
      collection(db, "expenses")
    );

    let expenseTotal = 0;

    expenseSnapshot.forEach((item) => {
      expenseTotal += Number(
        item.data().amount || 0
      );
    });

    setTotalExpense(expenseTotal);

  };

  const loadProfile = async (user: any) => {
    const q = query(
      collection(db, "members"),
      where("uid", "==", user.uid)
    );

    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const memberDoc = snapshot.docs[0];

      setProfile(memberDoc.data());

      // Logged-in member document ID
      const memberId = memberDoc.id;

      // Get this member's subscriptions
      const subscriptionQuery = query(
        collection(db, "subscriptions"),
        where("memberId", "==", memberId)
      );

      const subscriptionSnapshot = await getDocs(subscriptionQuery);

      let totalAmount = 0;

      subscriptionSnapshot.forEach((doc) => {
        totalAmount += Number(doc.data().amount || 0);
      });

      setMySubscriptionAmount(totalAmount);
    }
  };


  useEffect(() => {

    loadDashboard();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {

      if (user) {
        
        await loadProfile(user);
      }

    });

    return () => unsubscribe();

  }, []);



  const totalIncome =
    totalSubscription + totalDonation;


  const currentBalance =
    totalIncome - totalExpense;


  const subscriptionPercentage =
    totalSubscription > 0
      ? (mySubscriptionAmount / totalSubscription) * 100
      : 0;

  const calculateAge = (dob: string) => {
  if (!dob) return "N/A";

  const birthDate = new Date(dob);
  const today = new Date();

  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();

  if (days < 0) {
    months--;

    const previousMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      0
    );

    days += previousMonth.getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  return `${years} Year ${months} Month ${days} Day`;
};


  return (

    <AdminLayout>

      <div className="container-fluid p-4">


        <div className="row g-4">

          {/* Profile */}

          <div className="col-lg-4">

            <div className="profile-card">


              <div className="avatar">

                {
                  profile?.photo ?

                    <img
                      src={profile.photo}
                      alt="profile"
                    />

                    :

                    "👤"

                }

              </div>

              <h4>
                {profile?.name || "Admin"}
              </h4>



              <div className="profile-info">


                <div className="designation-badge">
                  <i className="bi bi-patch-check-fill me-2"></i>
                  {profile?.designation || "No Designation"}
                </div>


                <p>
                  📞 {profile?.phone || "N/A"}
                </p>

                <p>
                  📧 {profile?.email || "N/A"}
                </p>

                <p>
                  🩸 Blood : {profile?.bloodGroup || "N/A"}
                </p>

                <p>
                  🎂 DOB : {profile?.dateOfBirth || "N/A"}
                </p>

                <p>
                  🎈 Age : {calculateAge(profile?.dateOfBirth)}
                </p>

              </div>

            </div>

          </div>

          {/* Statistics */}

          <div className="col-lg-8">


            <div className="stats-card">

              <div className="row g-3">


                <div className="col-md-6">

                  <div className="stat-box members">

                    <span>
                      👥 Total Members
                    </span>

                    <h3>
                      {totalMembers}
                    </h3>

                  </div>

                </div>



                <div className="col-md-6">

                  <div className="stat-box subscription">

                    <span>
                      💳 Total Subscription
                    </span>

                    <h3>
                      ৳ {totalSubscription.toLocaleString()}
                    </h3>

                  </div>

                </div>





                <div className="col-md-6">

                  <div className="stat-box donation">

                    <span>
                      🤲 Total Donation
                    </span>

                    <h3>
                      ৳ {totalDonation.toLocaleString()}
                    </h3>

                  </div>

                </div>

                <div className="col-md-6">

                  <div className="stat-box income">

                    <span>
                      📈 Total Income
                    </span>

                    <h3>
                      ৳ {totalIncome.toLocaleString()}
                    </h3>

                  </div>

                </div>


                <div className="col-md-6">

                  <div className="stat-box expense">

                    <span>
                      💸 Total Expense
                    </span>

                    <h3>
                      ৳ {totalExpense.toLocaleString()}
                    </h3>

                  </div>

                </div>

                <div className="col-md-6">

                  <div className="stat-box balance">

                    <span>
                      🏦 Current Balance
                    </span>

                    <h3>
                      ৳ {currentBalance.toLocaleString()}
                    </h3>

                  </div>

                </div>

                <div className="col-md-6">
                  <div
                    className="stat-box contribution"
                    style={{
                      background: "linear-gradient(135deg, #d011d0, #d011d0)",
                      color: "#fff",
                    }}
                  >

                    <span>
                      💳 My Subscription
                    </span>

                    <h3 className="mb-1">
                      ৳ {mySubscriptionAmount.toLocaleString()}
                    </h3>

                  </div>
                </div>

                <div className="col-md-6">
                  <div
                    className="stat-box contribution"
                    style={{
                      background: "linear-gradient(135deg, #16e4d3, #16e4d3)",
                      color: "#fff",
                    }}
                  >

                    <span>
                      📊 % of Contribution
                    </span>

                    <div className="mt-3">

                      <div className="d-flex justify-content-between mb-1">

                        <small className="fw-bold text-white">
                          {subscriptionPercentage.toFixed(1)}%
                        </small>

                      </div>

                      <div
                        style={{
                          width: "100%",
                          height: "15px",
                          background: "rgba(255,255,255,0.3)",
                          borderRadius: "10px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${Math.min(subscriptionPercentage, 100)}%`,
                            height: "100%",
                            background: "#fff",
                            borderRadius: "10px",
                            transition: "width 0.6s ease",
                          }}
                        />
                      </div>

                    </div>

                  </div>
                </div>


              </div>

            </div>


          </div>



        </div>



      </div>


    </AdminLayout>

  );

};


export default Dashboard;