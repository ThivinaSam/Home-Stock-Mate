import './App.css';
import React from 'react';
import { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './components/context/AuthContext';
import Home from './components/Home/testHome';
import Login from './components/Login/login';
import AddItemsMgt from './components/AddItemsMgt/addItems';
import GetItemsMgt from './components/GetItemsMgt/getItems';
import FinanceMgt from './components/FinanceMgt/finance';
import UtilityMgt from './components/UtilityMgt/utility';

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
          <Route path="/addItems" element= {<RequireAuth><AddItemsMgt/></RequireAuth>} />
          <Route path="/getItems" element={<RequireAuth><GetItemsMgt/></RequireAuth>} />
          <Route path="/finance" element={<RequireAuth><FinanceMgt/></RequireAuth>} />
          <Route path="/utility" element={<RequireAuth><UtilityMgt/></RequireAuth>} />
        </Routes>
      
      </React.Fragment>
    </div>
  );
}

export default App;
