import React, { useContext } from "react";
import { useState } from "react";
import { signInWithEmailAndPassword  } from "firebase/auth";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Login() {
  const [error, setError] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const {dispatch} = useContext(AuthContext)

  const handleLogin = (e) => {
    e.preventDefault();

    signInWithEmailAndPassword (auth, email, password)
      .then((userCredential) => {
        // Signed up
        const user = userCredential.user;
        dispatch({type: "LOGIN", payload: user});
        navigate("/testHome");
        console.log(user);
      })
      .catch((error) => {
        setError(true);
      });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        className="max-w-md w-full p-6 bg-white shadow-lg rounded-lg"
        onSubmit={handleLogin}
      >
        <h2 className="text-2xl font-semibold text-center mb-6">Login</h2>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-6">
          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="w-full p-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
        >
          Login
        </button>

        {error && (
          <span className="text-red-600 mt-4 block">
            Wrong email or password!
          </span>
        )}
      </form>
    </div>
  );
}

export default Login;
