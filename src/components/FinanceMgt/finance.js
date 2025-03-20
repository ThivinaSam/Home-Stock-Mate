import React, { useState, useEffect } from 'react';
import { Bar } from 'recharts';
import { BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './finance.css';

function Finance() {
  const [bills, setBills] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [newBill, setNewBill] = useState({
    name: '',
    date: '',
    amount: '',
    photo: null,
    photoPreview: null
  });
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const savedBills = localStorage.getItem('bills');
    if (savedBills) {
      setBills(JSON.parse(savedBills));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('bills', JSON.stringify(bills));
    
    // Process data for the chart when bills change
    generateChartData();
  }, [bills]);

  const generateChartData = () => {
    // Create an object to hold monthly totals
    const monthlyTotals = {
      'Jan': 0, 'Feb': 0, 'Mar': 0, 'Apr': 0, 'May': 0, 'Jun': 0,
      'Jul': 0, 'Aug': 0, 'Sep': 0, 'Oct': 0, 'Nov': 0, 'Dec': 0
    };

    // Sum expenses for each month
    bills.forEach(bill => {
      if (bill.date) {
        // Extract month from date string (assuming format YYYY-MM-DD)
        const date = new Date(bill.date);
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthName = monthNames[date.getMonth()];
        
        // Convert amount string to number and add to the monthly total
        const amount = parseFloat(bill.amount.replace(/[^\d.-]/g, ''));
        if (!isNaN(amount)) {
          monthlyTotals[monthName] += amount;
        }
      }
    });

    // Convert to array format for recharts
    const data = Object.keys(monthlyTotals).map(month => ({
      month,
      amount: monthlyTotals[month]
    }));

    setChartData(data);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBill({ ...newBill, [name]: value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewBill({
          ...newBill,
          photo: file,
          photoPreview: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Format the amount with currency if it's a number
    let formattedAmount = newBill.amount;
    if (!isNaN(parseFloat(newBill.amount))) {
      formattedAmount = `LKR:${parseFloat(newBill.amount)}`;
    }
    
    const billToAdd = {
      id: Date.now(),
      name: newBill.name,
      date: newBill.date,
      amount: formattedAmount,
      photoUrl: newBill.photoPreview,
      createdAt: new Date().toISOString()
    };

    setBills([...bills, billToAdd]);
    
    setNewBill({
      name: '',
      date: '',
      amount: '',
      photo: null,
      photoPreview: null
    });
    setShowPopup(false);
  };

  const handlePhotoLibrary = () => {
    document.getElementById('photoInput').click();
  };

  const handleTakePhoto = () => {
    document.getElementById('photoInput').click();
  };

  const handleDelete = (id) => {
    setBills(bills.filter(bill => bill.id !== id));
  };

  const handleUpdate = (id) => {
    console.log("Update bill with ID:", id);
    // Future enhancement: Implement update functionality
  };

  // Format date to DD-MMM-YYYY format
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 
                       'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    
    return `${day}-${month}-${year}`;
  };

  const handlePdfDownload = () => {
    console.log("PDF download functionality to be implemented");
    // Future enhancement: Implement PDF download functionality
  };

  return (
    <div className="finance-container">
      <h2>Finance Management</h2>
      
      <div className="finance-header">
        <div className="search-bar">
          <input type="text" placeholder="Search..." />
        </div>
        <button className="add-button" onClick={() => setShowPopup(true)}>
          Add Bill
        </button>
      </div>

      <div className="finance-list">
        <div className="finance-list-header">
          <div className="finance-col">Bill Name</div>
          <div className="finance-col">Date</div>
          <div className="finance-col">Amount</div>
          <div className="finance-col">Bill Photo</div>
          <div className="finance-col">Actions</div>
        </div>
        
        {bills.length > 0 ? (
          bills.map(bill => (
            <div className="finance-item" key={bill.id}>
              <div className="finance-col">{bill.name}</div>
              <div className="finance-col">{formatDate(bill.date)}</div>
              <div className="finance-col">{bill.amount}</div>
              <div className="finance-col">
                {bill.photoUrl && (
                  <div className="photo-thumbnail">
                    <img src={bill.photoUrl} alt="Bill" />
                  </div>
                )}
              </div>
              <div className="finance-col actions">
                <button className="update-btn" onClick={() => handleUpdate(bill.id)}>Update</button>
                <button className="delete-btn" onClick={() => handleDelete(bill.id)}>Delete</button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-bills">No bills added yet.</div>
        )}
      </div>

      {/* Chart Section */}
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => [`LKR ${value}`, 'Amount']} />
            <Legend />
            <Bar dataKey="amount" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="footer">
        <button className="pdf-button" onClick={handlePdfDownload}>PDF Download</button>
      </div>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>Add Bill</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Bill Name</label>
                <input 
                  type="text" 
                  name="name" 
                  value={newBill.name}
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Date</label>
                <input 
                  type="date" 
                  name="date" 
                  value={newBill.date}
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Amount</label>
                <input 
                  type="text" 
                  name="amount" 
                  value={newBill.amount}
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              <div className="form-group photo-options">
                <button type="button" onClick={handleTakePhoto}>Take a Photo</button>
                <button type="button" onClick={handlePhotoLibrary}>Photo Library</button>
                <input 
                  type="file"
                  id="photoInput"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  style={{ display: 'none' }}
                />
              </div>
              {newBill.photoPreview && (
                <div className="photo-preview">
                  <img src={newBill.photoPreview} alt="Bill preview" />
                </div>
              )}
              <div className="form-actions">
                <button type="submit">Submit</button>
                <button type="button" onClick={() => setShowPopup(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Finance;
