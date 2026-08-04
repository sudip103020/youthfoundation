import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/firebase";



import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Login = () => {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");


  const handleLogin = async (e: React.FormEvent) => {

    e.preventDefault();

    try {

      const result = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );


      const user = result.user;


      localStorage.setItem(
        "user",
        JSON.stringify({
          uid: user.uid,
          email: user.email
        })
      );


      navigate("/admin/dashboard");


    } catch (err) {

      alert("ইমেইল অথবা পাসওয়ার্ড ভুল।");
      console.error(err);

    }

  };



  return (

    <>

      <Navbar />


      <div
        className="d-flex align-items-center justify-content-center"
        style={{
          minHeight:"75vh",
          background:"#f8f9fa"
        }}
      >


        <div
          className="card shadow-lg border-0"
          style={{
            width:"400px",
            borderRadius:"20px"
          }}
        >


          <div className="card-body p-4">


            {/* Logo */}

            <div className="text-center mb-4">

              <img
                src="/logo.png"
                alt="Logo"
                width="80"
              />


              <h3 className="fw-bold mt-3">
                Admin Login
              </h3>


              <p className="text-muted">
                Badokhali Youth Foundation
              </p>


            </div>




            <form onSubmit={handleLogin}>


              <div className="mb-3">

                <label className="fw-semibold">
                  Email
                </label>


                <input

                  type="email"

                  className="form-control"

                  placeholder="Enter email"

                  value={email}

                  onChange={(e)=>
                    setEmail(e.target.value)
                  }

                  required

                />

              </div>





              <div className="mb-3">


                <label className="fw-semibold">
                  Password
                </label>


                <input

                  type="password"

                  className="form-control"

                  placeholder="Enter password"

                  value={password}

                  onChange={(e)=>
                    setPassword(e.target.value)
                  }

                  required

                />


              </div>





              <button
                className="btn btn-success w-100 py-2"
                style={{
                  borderRadius:"10px"
                }}
              >

                🔐 Login

              </button>



            </form>



          </div>


        </div>



      </div>



      <Footer />


    </>

  );

};


export default Login;