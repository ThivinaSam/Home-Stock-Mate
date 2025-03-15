import './App.css';
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './components/Home/testHome';

function App() {
  return (
    <div className="App">
      <React.Fragment>
        <Routes>
          <Route path="/testHome" element={<Home />} />
        </Routes>
      </React.Fragment>
    </div>
  );
}

export default App;
