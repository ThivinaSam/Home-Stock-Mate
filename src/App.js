import './App.css';
import React from 'react';
import { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './components/context/AuthContext';
import Home from './components/Home/testHome';
import Login from './components/Login/login';
import AddItemsMgt from './components/AddItemsMgt/addEditItems';
import GetItemsMgt from './components/GetItemsMgt/getItems';
import FinanceMgt from './components/FinanceMgt/finance';
import UtilityMgt from './components/UtilityMgt/utility';
// import NavBar from './components/AddItemNavBar/navBar';
import AddItemsHome from './components/AddItemsMgt/addItemsHome';
import UpdateItem from './components/AddItemsMgt/addEditItems';
import GetEditItems from './components/GetItemsMgt/getEditItems';
import GetItemsHome from './components/GetItemsMgt/getItemsHome';
import UpdateGetItem from './components/GetItemsMgt/updateGetItem';
import SignUp from './components/Register/signUp';
import ChatHome from './components/AiAssistant/ChatHome';

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
        {/* <NavBar /> */}
          <Routes>
            
            <Route path="/login" element={<Login />} />
            <Route path="/testHome" element={<RequireAuth><Home/></RequireAuth>} />
            <Route path="/addItems" element= {<RequireAuth><AddItemsMgt/></RequireAuth>} />
            <Route path="/getItems" element={<RequireAuth><GetEditItems/></RequireAuth>} />
            <Route path="/finance" element={<RequireAuth><FinanceMgt/></RequireAuth>} />
            <Route path="/utility" element={<RequireAuth><UtilityMgt/></RequireAuth>} />
            <Route path="/addItem" element={<RequireAuth><AddItemsMgt/></RequireAuth>} />
            <Route path="/updateItem/:id" element={<RequireAuth><UpdateItem/></RequireAuth>} />
            <Route path="/addItemHome" element={<RequireAuth><AddItemsHome/></RequireAuth>} />
            <Route path="/getItemHome" element={<RequireAuth><GetItemsHome/></RequireAuth>} />
            <Route path="/updateGetItem/:id" element={<RequireAuth><UpdateGetItem /></RequireAuth>} />
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<SignUp />} />
            <Route path="/chat" element={<RequireAuth><ChatHome/></RequireAuth>} />

          </Routes>
      
      </React.Fragment>
    </div>
  );
}

export default App;
