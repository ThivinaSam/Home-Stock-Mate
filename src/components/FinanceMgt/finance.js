import React, { useState, useEffect } from 'react';
import { Bar } from 'recharts';
import { BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './finance.css';

function Finance() {
  const [bills, setBills] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBills, setFilteredBills] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showPhotoPopup, setShowPhotoPopup] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [newBill, setNewBill] = useState({
    id: null,
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
    
    // Update filtered bills when all bills change
    filterBills();
  }, [bills]);

  // Filter bills when search term changes
  useEffect(() => {
    filterBills();
  }, [searchTerm]);

  // Auto-hide success message after 5 seconds
  useEffect(() => {
    let timer;
    if (showSuccessMessage) {
      timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [showSuccessMessage]);

  const filterBills = () => {
    if (!searchTerm.trim()) {
      setFilteredBills(bills);
      return;
    }

    const lowerCaseSearch = searchTerm.toLowerCase();
    const filtered = bills.filter(bill => 
      bill.name.toLowerCase().includes(lowerCaseSearch) || 
      bill.amount.toLowerCase().includes(lowerCaseSearch) ||
      (bill.date && formatDate(bill.date).toLowerCase().includes(lowerCaseSearch))
    );
    setFilteredBills(filtered);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

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
    
    // Format the amount with currency if it's a number and doesn't already have currency
    let formattedAmount = newBill.amount;
    if (!isNaN(parseFloat(newBill.amount)) && !formattedAmount.includes('LKR:')) {
      formattedAmount = `LKR:${parseFloat(newBill.amount)}`;
    }
    
    if (isUpdating) {
      // Update existing bill
      const updatedBills = bills.map(bill => {
        if (bill.id === newBill.id) {
          return {
            ...bill,
            name: newBill.name,
            date: newBill.date,
            amount: formattedAmount,
            photoUrl: newBill.photoPreview || bill.photoUrl,
            updatedAt: new Date().toISOString()
          };
        }
        return bill;
      });
      
      setBills(updatedBills);
      setIsUpdating(false);
      setSuccessMessage(`Bill "${newBill.name}" was successfully updated!`);
    } else {
      // Add new bill
      const billToAdd = {
        id: Date.now(),
        name: newBill.name,
        date: newBill.date,
        amount: formattedAmount,
        photoUrl: newBill.photoPreview,
        createdAt: new Date().toISOString()
      };
      
      setBills([...bills, billToAdd]);
      setSuccessMessage(`New bill "${newBill.name}" was successfully added!`);
    }
    
    // Show success message
    setShowSuccessMessage(true);
    
    // Reset form
    setNewBill({
      id: null,
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
    const billToDelete = bills.find(bill => bill.id === id);
    setBills(bills.filter(bill => bill.id !== id));
    
    if (billToDelete) {
      setSuccessMessage(`Bill "${billToDelete.name}" was successfully deleted!`);
      setShowSuccessMessage(true);
    }
  };

  const handleUpdate = (id) => {
    const billToUpdate = bills.find(bill => bill.id === id);
    if (billToUpdate) {
      // Extract the numeric amount from the formatted string
      let amount = billToUpdate.amount;
      if (amount.includes('LKR:')) {
        amount = amount.replace('LKR:', '');
      }
      
      setNewBill({
        id: billToUpdate.id,
        name: billToUpdate.name,
        date: billToUpdate.date,
        amount: amount,
        photoPreview: billToUpdate.photoUrl
      });
      
      setIsUpdating(true);
      setShowPopup(true);
    }
  };

  // Handle photo click to show popup
  const handlePhotoClick = (photoUrl) => {
    setSelectedPhoto(photoUrl);
    setShowPhotoPopup(true);
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
      
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="success-message">
          <span>{successMessage}</span>
          <button onClick={() => setShowSuccessMessage(false)}>✕</button>
        </div>
      )}
      
      <div className="finance-header">
        <div className="search-bar">
          <input 
            type="text" 
            placeholder="Search bills by name, amount, or date..." 
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <button className="add-button" onClick={() => {
          setIsUpdating(false);
          setNewBill({
            id: null,
            name: '',
            date: '',
            amount: '',
            photo: null,
            photoPreview: null
          });
          setShowPopup(true);
        }}>
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
        
        {filteredBills.length > 0 ? (
          filteredBills.map(bill => (
            <div className="finance-item" key={bill.id}>
              <div className="finance-col">{bill.name}</div>
              <div className="finance-col">{formatDate(bill.date)}</div>
              <div className="finance-col">{bill.amount}</div>
              <div className="finance-col">
                {bill.photoUrl && (
                  <div 
                    className="photo-thumbnail" 
                    onClick={() => handlePhotoClick(bill.photoUrl)}
                  >
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
          <div className="no-bills">
            {bills.length === 0 ? "No bills added yet." : "No bills found matching your search."}
          </div>
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

      {/* Bill Edit/Add Popup */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>{isUpdating ? 'Update Bill' : 'Add Bill'}</h3>
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
                <button type="submit">{isUpdating ? 'Update' : 'Submit'}</button>
                <button type="button" onClick={() => setShowPopup(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Photo Popup */}
      {showPhotoPopup && selectedPhoto && (
        <div className="popup-overlay">
          <div className="photo-popup">
            <div className="photo-popup-content">
              <img src={selectedPhoto} alt="Bill" />
              <button 
                className="close-photo-popup" 
                onClick={() => setShowPhotoPopup(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Finance;