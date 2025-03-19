import React, { useState, useEffect, useRef } from 'react';
import './utility.css';
import { jsPDF } from 'jspdf';
// Make sure this import is correct and the package is installed
import 'jspdf-autotable';

function UtilityMgt() {
  const [utilities, setUtilities] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [newUtility, setNewUtility] = useState({
    name: '',
    dueDate: '',
    dueTime: '',
    amount: '',
    photo: null,
    photoPreview: null,
    status: 'UnPaid'
  });
  const [notifications, setNotifications] = useState([]);
  const [activeAlarms, setActiveAlarms] = useState([]);
  const [countdowns, setCountdowns] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const audioRefs = useRef({}); // Reference to store multiple audio elements
  const countdownIntervalRef = useRef(null);

  // Load utilities and notifications from localStorage on component mount
  useEffect(() => {
    const savedUtilities = localStorage.getItem('utilities');
    if (savedUtilities) {
      setUtilities(JSON.parse(savedUtilities));
    }
    
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }

    const savedActiveAlarms = localStorage.getItem('activeAlarms');
    if (savedActiveAlarms) {
      setActiveAlarms(JSON.parse(savedActiveAlarms));
    }
  }, []);

  // Save utilities to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('utilities', JSON.stringify(utilities));
  }, [utilities]);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Save active alarms to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('activeAlarms', JSON.stringify(activeAlarms));
  }, [activeAlarms]);

  // Auto-hide success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Calculate and update countdowns every second
  useEffect(() => {
    // Clear any existing countdown interval
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    countdownIntervalRef.current = setInterval(() => {
      const now = new Date();
      const newCountdowns = {};
      
      utilities.forEach(utility => {
        if (utility.dueDate && utility.dueTime) {
          const dueDateTime = new Date(`${utility.dueDate}T${utility.dueTime}`);
          const timeDiff = dueDateTime - now;
          
          if (timeDiff > 0) {
            // Calculate days, hours, minutes, seconds
            const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
            
            newCountdowns[utility.id] = { days, hours, minutes, seconds };
          } else {
            // Due date has passed
            newCountdowns[utility.id] = { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
            
            // Check if this utility is not paid and not already in active alarms
            if (utility.status === 'UnPaid' && !activeAlarms.includes(utility.id)) {
              playAlarmSound(utility.id);
            }
          }
        }
      });
      
      setCountdowns(newCountdowns);
    }, 1000);
    
    // Cleanup function
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [utilities, activeAlarms]);

  // Play alarm sound function
  const playAlarmSound = (utilityId) => {
    // Check if alarm is already active for this utility
    if (activeAlarms.includes(utilityId)) {
      return;
    }
    
    // Create an audio element if it doesn't exist
    if (!audioRefs.current[utilityId]) {
      const audio = new Audio('/alarm.mp3');
      audio.loop = true;
      audioRefs.current[utilityId] = audio;
    }
    
    // Play the sound
    audioRefs.current[utilityId].play().catch(e => {
      console.error('Error playing alarm sound:', e);
      // Fallback to alert if sound fails
      alert(`Utility Bill Due: A bill payment is due now!`);
    });
    
    // Add to active alarms
    setActiveAlarms(prevAlarms => [...prevAlarms, utilityId]);
    
    // Show browser notification if supported
    if ("Notification" in window && Notification.permission === "granted") {
      const utility = utilities.find(u => u.id === utilityId);
      if (utility) {
        new Notification(`Utility Bill Due: ${utility.name}`, {
          body: `Your ${utility.name} bill of ${utility.amount} is due now!`,
        });
      }
    }
  };

  // Function to stop the alarm - Fixed function
  const stopAlarm = (utilityId) => {
    // Stop the audio if it's playing
    if (audioRefs.current[utilityId]) {
      audioRefs.current[utilityId].pause();
      audioRefs.current[utilityId].currentTime = 0;
      // Remove the audio element reference
      delete audioRefs.current[utilityId];
    }
    
    // Remove from active alarms
    setActiveAlarms(prevAlarms => prevAlarms.filter(id => id !== utilityId));
  };

  // Request notification permission on component mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUtility({ ...newUtility, [name]: value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewUtility({
          ...newUtility,
          photo: file,
          photoPreview: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create a new utility object
    const utilityToAdd = {
      id: Date.now(), // Using timestamp as a simple ID
      name: newUtility.name,
      dueDate: newUtility.dueDate,
      dueTime: newUtility.dueTime, // Save the time
      amount: newUtility.amount,
      photoUrl: newUtility.photoPreview,
      status: 'UnPaid',
      createdAt: new Date().toISOString()
    };

    // Add the new utility to the list
    setUtilities([...utilities, utilityToAdd]);
    
    // Create a notification for this utility if due date and time are set
    if (newUtility.dueDate && newUtility.dueTime) {
      const dueDateTime = `${newUtility.dueDate}T${newUtility.dueTime}`;
      const notificationToAdd = {
        id: Date.now() + 1, // Different ID from utility
        utilityId: utilityToAdd.id,
        utilityName: newUtility.name,
        amount: newUtility.amount,
        dueDateTime: dueDateTime,
        triggered: false
      };
      
      setNotifications([...notifications, notificationToAdd]);
    }
    
    // Reset form and close popup
    setNewUtility({
      name: '',
      dueDate: '',
      dueTime: '',
      amount: '',
      photo: null,
      photoPreview: null,
      status: 'UnPaid'
    });
    
    // Show success message
    setSuccessMessage(`${utilityToAdd.name} utility has been successfully added!`);
    
    // Close popup
    setShowPopup(false);
  };

  const handlePhotoLibrary = () => {
    // Simulate clicking the file input
    document.getElementById('photoInput').click();
  };

  const handleTakePhoto = () => {
    // In a real app, this would use the device camera
    // For this example, we'll just open the file picker
    document.getElementById('photoInput').click();
  };

  const handleDelete = (id) => {
    // Stop any active alarms for this utility
    if (activeAlarms.includes(id)) {
      stopAlarm(id);
    }
    
    setUtilities(utilities.filter(utility => utility.id !== id));
    
    // Also delete any associated notifications
    setNotifications(notifications.filter(notification => notification.utilityId !== id));
  };

  const togglePaymentStatus = (id) => {
    setUtilities(utilities.map(utility => {
      if (utility.id === id) {
        const newStatus = utility.status === 'Paid' ? 'UnPaid' : 'Paid';
        
        // If new status is 'Paid', stop the alarm
        if (newStatus === 'Paid' && activeAlarms.includes(id)) {
          stopAlarm(id);
        }
        
        return { ...utility, status: newStatus };
      }
      return utility;
    }));
  };

  const handleUpdate = (id) => {
    // Find the utility to update
    const utilityToUpdate = utilities.find(utility => utility.id === id);
    if (utilityToUpdate) {
      // Set it in the form
      setNewUtility({
        name: utilityToUpdate.name,
        dueDate: utilityToUpdate.dueDate,
        dueTime: utilityToUpdate.dueTime || '',
        amount: utilityToUpdate.amount,
        photoPreview: utilityToUpdate.photoUrl,
        status: utilityToUpdate.status
      });
      
      // Remove the old utility (will be replaced on submit)
      handleDelete(id);
      
      // Show the popup
      setShowPopup(true);
    }
  };

  // New PDF generation function with fixes
  const generatePDF = () => {
    try {
      // Create a new jsPDF instance
      const pdf = new jsPDF();
      
      // Add title
      pdf.setFontSize(18);
      pdf.text('Utility Management Report', 14, 20);
      
      // Add generation date
      pdf.setFontSize(10);
      pdf.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
      
      // Add user summary - total bills, paid, unpaid, total amount
      const totalBills = utilities.length;
      const paidBills = utilities.filter(u => u.status === 'Paid').length;
      const unpaidBills = totalBills - paidBills;
      const totalAmount = utilities.reduce((sum, utility) => {
        const amount = parseFloat(utility.amount.replace(/[^0-9.-]+/g, '')) || 0;
        return sum + amount;
      }, 0);
      
      pdf.setFontSize(12);
      pdf.text(`Summary:`, 14, 38);
      pdf.text(`Total Bills: ${totalBills}`, 20, 46);
      pdf.text(`Paid: ${paidBills}`, 20, 54);
      pdf.text(`Unpaid: ${unpaidBills}`, 20, 62);
      pdf.text(`Total Amount: $${totalAmount.toFixed(2)}`, 20, 70);
      
      // Create the table rows and columns
      const tableColumn = ['Utility', 'Due Date', 'Amount', 'Status'];
      const tableRows = [];
      
      // Add utilities to table rows
      utilities.forEach(utility => {
        const formattedDate = formatDate(utility.dueDate);
        const utilityRow = [
          utility.name,
          formattedDate + (utility.dueTime ? ` | ${utility.dueTime}` : ''),
          utility.amount,
          utility.status
        ];
        tableRows.push(utilityRow);
      });
      
      let finalY = 80; // Default Y position if no table is generated
      
      // Check if autoTable is available
      if (typeof pdf.autoTable === 'function') {
        // Generate the PDF table using autoTable
        pdf.autoTable({
          head: [tableColumn],
          body: tableRows,
          startY: 80,
          styles: {
            fontSize: 10,
            cellPadding: 3,
            overflow: 'linebreak'
          },
          columnStyles: {
            0: { cellWidth: 40 },
            1: { cellWidth: 50 },
            2: { cellWidth: 40 },
            3: { cellWidth: 30 }
          },
          headStyles: {
            fillColor: [66, 135, 245],
            textColor: 255,
            fontStyle: 'bold'
          },
          alternateRowStyles: {
            fillColor: [240, 240, 240]
          }
        });
        
        // Get the final Y position after the table
        finalY = pdf.previousAutoTable ? pdf.previousAutoTable.finalY : 80;
      } else {
        // Fallback for when autoTable is not available
        pdf.setFontSize(10);
        pdf.text('Utility List:', 14, 80);
        
        let yPos = 90;
        // Add table header
        pdf.setFont(undefined, 'bold'); // This replaces setFontStyle which may not be available in newer versions
        pdf.text(tableColumn[0], 14, yPos);
        pdf.text(tableColumn[1], 54, yPos);
        pdf.text(tableColumn[2], 104, yPos);
        pdf.text(tableColumn[3], 144, yPos);
        pdf.setFont(undefined, 'normal'); // Reset font style
        
        // Add rows
        tableRows.forEach((row, index) => {
          yPos += 10;
          if (yPos > 280) {
            pdf.addPage();
            yPos = 20;
          }
          pdf.text(row[0].toString().substring(0, 20), 14, yPos);
          pdf.text(row[1].toString().substring(0, 20), 54, yPos);
          pdf.text(row[2].toString().substring(0, 20), 104, yPos);
          pdf.text(row[3].toString().substring(0, 20), 144, yPos);
        });
        
        finalY = yPos + 10;
      }
      
      // Add bill photos if available
      let yPosition = finalY + 15;
      pdf.setFontSize(14);
      pdf.text('Bill Photos', 14, yPosition);
      yPosition += 10;
      
      const photosPerPage = 2;  // Number of photos per page
      let photoCount = 0;
      
      // Iterate through utilities with photos
      utilities.forEach(utility => {
        if (utility.photoUrl) {
          photoCount++;
          
          // Check if we need a new page
          if (photoCount > 1 && (photoCount - 1) % photosPerPage === 0) {
            pdf.addPage();
            yPosition = 20;
          }
          
          // Add photo title
          pdf.setFontSize(12);
          pdf.text(`${utility.name} (${formatDate(utility.dueDate)})`, 14, yPosition);
          yPosition += 5;
          
          try {
            // Add the image to the PDF
            if (utility.photoUrl.startsWith('data:image')) {
              pdf.addImage(utility.photoUrl, 'JPEG', 14, yPosition, 80, 60);
              yPosition += 70;
            }
          } catch (err) {
            console.error(`Error adding image for ${utility.name}:`, err);
            pdf.text(`[Image not available]`, 14, yPosition);
            yPosition += 10;
          }
        }
      });
      
      // Save the PDF
      pdf.save('Utility-Management-Report.pdf');
      
      // Show success message
      setSuccessMessage('PDF successfully downloaded!');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(`Error generating PDF: ${error.message}. Please try again.`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  // Format countdown time display
  const formatCountdown = (countdown) => {
    if (!countdown) return '';
    if (countdown.expired) return 'Due Date';
    
    return `${countdown.days}d ${countdown.hours}h ${countdown.minutes}m ${countdown.seconds}s`;
  };

  // Function to check if utility is due soon (< 24 hours)
  const isDueSoon = (countdown) => {
    if (!countdown) return false;
    if (countdown.expired) return true;
    return countdown.days === 0 && countdown.hours < 24;
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter utilities based on search term
  const filteredUtilities = utilities.filter(utility => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      utility.name.toLowerCase().includes(searchTermLower) ||
      utility.amount.toLowerCase().includes(searchTermLower) ||
      utility.status.toLowerCase().includes(searchTermLower) ||
      (utility.dueDate && formatDate(utility.dueDate).toLowerCase().includes(searchTermLower))
    );
  });

  // Clear search function
  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div className="utility-container">
      <h2>Utility Management</h2>
      
      {successMessage && (
        <div className="success-message">
          <div className="success-content">
            <span className="success-icon">✓</span>
            <span>{successMessage}</span>
          </div>
        </div>
      )}
      
      <div className="utility-header">
        <div className="search-bar">
          <input 
            type="text" 
            placeholder="Search utilities..." 
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {searchTerm && (
            <button className="clear-search" onClick={clearSearch}>
              ✕
            </button>
          )}
        </div>
        <button className="add-button" onClick={() => setShowPopup(true)}>
          Add Utility
        </button>
      </div>

      <div className="utility-list">
        <div className="utility-list-header">
          <div className="utility-col">Utility</div>
          <div className="utility-col">Due Date</div>
          <div className="utility-col">Countdown</div>
          <div className="utility-col">Amount</div>
          <div className="utility-col">Bill Photo</div>
          <div className="utility-col">Status</div>
          <div className="utility-col">Actions</div>
        </div>
        
        {filteredUtilities.length > 0 ? (
          filteredUtilities.map(utility => (
            <div className="utility-item" key={utility.id}>
              <div className="utility-col">
                {utility.name}
                {activeAlarms.includes(utility.id) && (
                  <span className="alarm-active">🔊</span>
                )}
              </div>
              <div className="utility-col">
                {formatDate(utility.dueDate)} | 
                 {utility.dueTime && <div className="time-display">{utility.dueTime}</div>}
              </div>
              <div className={`utility-col countdown ${isDueSoon(countdowns[utility.id]) ? 'countdown-urgent' : ''}`}>
                {formatCountdown(countdowns[utility.id])}
              </div>
              <div className="utility-col">{utility.amount}</div>
              <div className="utility-col">
                {utility.photoUrl && (
                  <div className="photo-thumbnail">
                    <img src={utility.photoUrl} alt="Bill" />
                  </div>
                )}
              </div>
              <div className="utility-col">
                <label className="status-toggle">
                  <input 
                    type="checkbox" 
                    checked={utility.status === 'Paid'}
                    onChange={() => togglePaymentStatus(utility.id)}
                  />
                  <span className={`status-label ${utility.status === 'Paid' ? 'paid' : (countdowns[utility.id]?.expired ? 'due-now' : '')}`}>
                    {utility.status}
                  </span>
                </label>
              </div>
              <div className="utility-col actions">
                <button onClick={() => handleUpdate(utility.id)}>Update</button>
                <button onClick={() => handleDelete(utility.id)}>Delete</button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-utilities">
            {utilities.length > 0 ? 'No matching utilities found.' : 'No utilities added yet.'}
          </div>
        )}
      </div>

      <div className="footer">
        <button className="pdf-button" onClick={generatePDF}>PDF Download</button>
      </div>

      {/* Popup for adding a new utility */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>Add Utility</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Utility</label>
                <input 
                  type="text" 
                  name="name" 
                  value={newUtility.name}
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input 
                  type="date" 
                  name="dueDate" 
                  value={newUtility.dueDate}
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Reminder Time</label>
                <input 
                  type="time" 
                  name="dueTime" 
                  value={newUtility.dueTime}
                  onChange={handleInputChange} 
                />
              </div>
              <div className="form-group">
                <label>Amount</label>
                <input 
                  type="text" 
                  name="amount" 
                  value={newUtility.amount}
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
              {newUtility.photoPreview && (
                <div className="photo-preview">
                  <img src={newUtility.photoPreview} alt="Bill preview" />
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

export default UtilityMgt;