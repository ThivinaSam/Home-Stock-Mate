import './App.css';
import React from 'react';
import { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home/testHome';
import Login from './components/Login/login';
import { AuthContext } from './components/context/AuthContext';

function App() {
  const {currentUser} = useContext(AuthContext)

  // const currentUser = false;

  const RequireAuth = ({children}) => {
    return currentUser ? (children) : <Navigate to="/login" />
  }

  console.log(currentUser);

  return (
    <div className="App">
      <React.Fragment>
     
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/testHome" element={<RequireAuth><Home/></RequireAuth>} />
        </Routes>
      
      </React.Fragment>
    </div>
  );
}

export default App;
