import React, { useState, useEffect, useRef } from 'react';
import { Bar } from 'recharts';
import { BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
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
  // New validation state for form fields
  const [validationErrors, setValidationErrors] = useState({
    name: '',
    amount: '',
    photo: ''
  });
  const [chartData, setChartData] = useState([]);
  const chartRef = useRef(null);

  useEffect(() => {
    const savedBills = localStorage.getItem('bills');
    if (savedBills) {
      try {
        const parsedBills = JSON.parse(savedBills);
        setBills(parsedBills);
        setFilteredBills(parsedBills); // Initialize filtered bills with all bills
      } catch (error) {
        console.error('Error parsing saved bills:', error);
        setBills([]);
        setFilteredBills([]);
      }
    }
  }, []);

  useEffect(() => {
    // Save to localStorage whenever bills change
    localStorage.setItem('bills', JSON.stringify(bills));
    
    // Process data for the chart when bills change
    generateChartData();
    
    // Update filtered bills when all bills change
    filterBills();
  }, [bills]);

  // Filter bills when search term changes
  useEffect(() => {
    filterBills();
  }, [searchTerm, bills]);

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
        try {
          // Extract month from date string (assuming format YYYY-MM-DD)
          const date = new Date(bill.date);
          if (!isNaN(date.getTime())) { // Check if date is valid
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const monthName = monthNames[date.getMonth()];
            
            // Convert amount string to number and add to the monthly total
            let amount = bill.amount;
            if (typeof amount === 'string') {
              // Remove currency prefix and any non-numeric characters except decimal point
              amount = parseFloat(amount.replace(/[^0-9.]/g, ''));
            }
            
            if (!isNaN(amount)) {
              monthlyTotals[monthName] += amount;
            }
          }
        } catch (error) {
          console.error('Error processing date for chart:', error);
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

  // Modified to include validation
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Perform validation based on field name
    let error = '';
    
    if (name === 'name') {
      if (value.length > 25) {
        error = 'Name must not exceed 25 characters';
      } else if (/\d/.test(value)) {
        error = 'Name must not contain numbers';
      }
    } else if (name === 'amount') {
      if (value && !/^[0-9]+(\.[0-9]{1,2})?$/.test(value)) {
        error = 'Amount must be a positive number';
      }
    }
    
    // Update validation errors
    setValidationErrors({
      ...validationErrors,
      [name]: error
    });
    
    // Update form state
    setNewBill({ ...newBill, [name]: value });
  };

  // Modified to include photo validation
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type (PNG only)
      if (file.type !== 'image/png') {
        setValidationErrors({
          ...validationErrors,
          photo: 'Only PNG images are allowed'
        });
        return;
      }
      
      // Clear validation error if file is valid
      setValidationErrors({
        ...validationErrors,
        photo: ''
      });
      
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

  // Modified to validate all fields before submitting
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Perform validation checks for all fields
    const nameError = newBill.name.length > 25 ? 'Name must not exceed 25 characters' : 
                    /\d/.test(newBill.name) ? 'Name must not contain numbers' : '';
    
    const amountError = !newBill.amount ? 'Amount is required' :
                      !/^[0-9]+(\.[0-9]{1,2})?$/.test(newBill.amount) ? 'Amount must be a positive number' : '';
    
    const photoError = newBill.photo && newBill.photo.type !== 'image/png' ? 'Only PNG images are allowed' : '';
    
    // Update validation errors
    setValidationErrors({
      name: nameError,
      amount: amountError,
      photo: photoError
    });
    
    // Check if there are any validation errors
    if (nameError || amountError || photoError) {
      return; // Stop form submission if there are errors
    }
    
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
    
    // Reset form and validation errors
    setNewBill({
      id: null,
      name: '',
      date: '',
      amount: '',
      photo: null,
      photoPreview: null
    });
    setValidationErrors({
      name: '',
      amount: '',
      photo: ''
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
      
      // Clear validation errors when loading an existing bill
      setValidationErrors({
        name: '',
        amount: '',
        photo: ''
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
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return ''; // Return empty string for invalid dates
      
      const day = date.getDate().toString().padStart(2, '0');
      const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 
                         'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      
      return `${day}-${month}-${year}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  // Calculate total expenses
  const calculateTotalExpenses = () => {
    return bills.reduce((total, bill) => {
      let amount = bill.amount;
      if (typeof amount === 'string') {
        // Remove currency prefix and any non-numeric characters except decimal point
        amount = parseFloat(amount.replace(/[^0-9.]/g, ''));
      }
      return isNaN(amount) ? total : total + amount;
    }, 0);
  };

  
  // PDF Download Function without Bill Images
  const handlePdfDownload = async () => {
    try {
      // Show loading message
      setSuccessMessage('Generating PDF, please wait...');
      setShowSuccessMessage(true);
      
      // Create new jsPDF instance
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });
      
      const pageWidth = doc.internal.pageSize.getWidth();
      let currentY = 15;
      
      // Add header and title
      doc.setFontSize(22);
      doc.setTextColor(44, 62, 80);
      doc.text('Finance Management Report', 105, currentY, { align: 'center' });
      currentY += 10;
      
      // Add date
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      const today = new Date();
      doc.text(`Generated on: ${today.toLocaleDateString()}`, 105, currentY, { align: 'center' });
      currentY += 10;
      
      // Add summary section
      doc.setFontSize(16);
      doc.setTextColor(41, 128, 185);
      doc.text('Summary', 14, currentY);
      currentY += 5;
      
      // Add summary box
      doc.setDrawColor(41, 128, 185);
      doc.setFillColor(240, 248, 255);
      doc.roundedRect(14, currentY, 182, 20, 3, 3, 'FD');
      
      doc.setFontSize(12);
      doc.setTextColor(44, 62, 80);
      const billsToUse = searchTerm ? filteredBills : bills;
      doc.text(`Total Bills: ${billsToUse.length}`, 20, currentY + 10);
      
      const totalExpenses = calculateTotalExpenses();
      doc.text(`Total Expenses: LKR ${totalExpenses.toFixed(2)}`, 120, currentY + 10);
      currentY += 25;
      
      // Add chart section
      doc.setFontSize(16);
      doc.setTextColor(41, 128, 185);
      doc.text('Monthly Expenses Chart', 14, currentY);
      currentY += 5;
      
      // Capture the chart as an image
      if (chartRef.current && chartData.some(item => item.amount > 0)) {
        try {
          const canvas = await html2canvas(chartRef.current, {
            scale: 2,
            logging: false,
            useCORS: true
          });
          
          const chartImage = canvas.toDataURL('image/png');
          doc.addImage(chartImage, 'PNG', 14, currentY, 182, 80);
          currentY += 85;
        } catch (chartError) {
          console.error('Error capturing chart:', chartError);
          doc.text('Error generating chart image.', 14, currentY);
          currentY += 10;
        }
      } else {
        currentY += 10;
      }
      
      // Add bill details table
      doc.setFontSize(16);
      doc.setTextColor(41, 128, 185);
      currentY += 5;
      
      // Prepare bill data for table WITHOUT the "Has Image" column
      const billData = billsToUse.map(bill => [
        bill.name || 'N/A',
        formatDate(bill.date) || 'N/A',
        bill.amount || 'N/A'
      ]);
      
      if (billData.length > 0) {
        try {
          doc.autoTable({
            startY: currentY,
            head: [['Bill Name', 'Date', 'Amount']], // Removed "Has Image" column
            body: billData,
            theme: 'grid',
            headStyles: {
              fillColor: [41, 128, 185],
              textColor: 255,
              fontStyle: 'bold'
            },
            styles: {
              fontSize: 10,
              cellPadding: 3,
              lineColor: [220, 220, 220]
            },
            alternateRowStyles: {
              fillColor: [245, 250, 254]
            },
            margin: { top: currentY }
          });
          
          currentY = doc.previousAutoTable.finalY + 10;
        } catch (tableError) {
          console.error('Error creating bill details table:', tableError);
          currentY += 10;
        }
      } else {
        currentY += 10;
      }
      
      // Add monthly expenses detail table
      doc.setFontSize(16);
      doc.setTextColor(41, 128, 185);
      currentY += 5;
      
      // Prepare monthly data for table
      const monthlyData = chartData
        .filter(item => item.amount > 0)  // Only include months with expenses
        .map(item => [item.month, `LKR ${item.amount.toFixed(2)}`]);
      
      if (monthlyData.length > 0) {
        try {
          doc.autoTable({
            startY: currentY,
            head: [['Month', 'Amount']],
            body: monthlyData,
            theme: 'grid',
            headStyles: {
              fillColor: [41, 128, 185],
              textColor: 255,
              fontStyle: 'bold'
            },
            styles: {
              fontSize: 10,
              cellPadding: 3,
              lineColor: [220, 220, 220]
            },
            alternateRowStyles: {
              fillColor: [245, 250, 254]
            },
            margin: { top: currentY }
          });
          
          currentY = doc.previousAutoTable.finalY + 10;
        } catch (tableError) {
          console.error('Error creating monthly expenses table:', tableError);
          currentY += 10;
        }
      } else {
        currentY += 10;
      }
      
      // Add footer with page number
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i} of ${pageCount}`, 105, 287, { align: 'center' });
        doc.text('Generated by Finance Management App', 105, 292, { align: 'center' });
      }
      
      // Save PDF
      doc.save('finance_report.pdf');
      
      // Show success message
      setSuccessMessage('Finance report downloaded successfully!');
      setShowSuccessMessage(true);
    } catch (error) {
      console.error('Error creating PDF:', error);
      setSuccessMessage('Failed to generate report. Please try again. Error: ' + error.message);
      setShowSuccessMessage(true);
    }
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
          // Reset validation errors when opening the form
          setValidationErrors({
            name: '',
            amount: '',
            photo: ''
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
      <div className="chart-container" ref={chartRef}>
        <h3>Monthly Expenses Chart</h3>
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
            <Tooltip formatter={(value) => [`LKR ${value.toFixed(2)}`, 'Amount']} />
            <Legend />
            <Bar dataKey="amount" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Section */}
      <div className="summary-container">
        <div className="summary-item">
          <h3>Total Bills</h3>
          <p>{bills.length}</p>
        </div>
        <div className="summary-item">
          <h3>Total Expenses</h3>
          <p>LKR {calculateTotalExpenses().toFixed(2)}</p>
        </div>
      </div>

      <div className="footer">
        <button className="pdf-button" onClick={handlePdfDownload}>
          <span className="pdf-icon">📄</span> Download PDF Report
        </button>
      </div>

      {/* Bill Edit/Add Popup with Validation */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>{isUpdating ? 'Update Bill' : 'Add Bill'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Bill Name (max 25 characters, no numbers)</label>
                <input 
                  type="text" 
                  name="name" 
                  value={newBill.name}
                  onChange={handleInputChange} 
                  required 
                  className={validationErrors.name ? 'input-error' : ''}
                />
                {validationErrors.name && (
                  <div className="error-message">{validationErrors.name}</div>
                )}
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
                <label>Amount (positive numbers only)</label>
                <input 
                  type="text" 
                  name="amount" 
                  value={newBill.amount}
                  onChange={handleInputChange} 
                  required 
                  className={validationErrors.amount ? 'input-error' : ''}
                />
                {validationErrors.amount && (
                  <div className="error-message">{validationErrors.amount}</div>
                )}
              </div>
              <div className="form-group photo-options">
                <label>Photo (PNG files only)</label>
                <button type="button" onClick={handleTakePhoto}>Take a Photo</button>
                <button type="button" onClick={handlePhotoLibrary}>Photo Library</button>
                <input 
                  type="file"
                  id="photoInput"
                  accept="image/png"
                  onChange={handlePhotoChange}
                  style={{ display: 'none' }}
                />
                {validationErrors.photo && (
                  <div className="error-message">{validationErrors.photo}</div>
                )}
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