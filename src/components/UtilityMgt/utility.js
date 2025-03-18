
import React, { useState, useEffect } from 'react';
import './utility.css';

function UtilityMgt() {
  const [utilities, setUtilities] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [newUtility, setNewUtility] = useState({
    name: '',
    dueDate: '',
    amount: '',
    photo: null,
    photoPreview: null,
    status: 'UnPaid'
  });

  // Load utilities from localStorage on component mount
  useEffect(() => {
    const savedUtilities = localStorage.getItem('utilities');
    if (savedUtilities) {
      setUtilities(JSON.parse(savedUtilities));
    }
  }, []);

  // Save utilities to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('utilities', JSON.stringify(utilities));
  }, [utilities]);

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
      amount: newUtility.amount,
      photoUrl: newUtility.photoPreview,
      status: 'UnPaid',
      createdAt: new Date().toISOString()
    };

    // Add the new utility to the list
    setUtilities([...utilities, utilityToAdd]);
    
    // Reset form and close popup
    setNewUtility({
      name: '',
      dueDate: '',
      amount: '',
      photo: null,
      photoPreview: null,
      status: 'UnPaid'
    });
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
    setUtilities(utilities.filter(utility => utility.id !== id));
  };

  const togglePaymentStatus = (id) => {
    setUtilities(utilities.map(utility => 
      utility.id === id ? { ...utility, status: utility.status === 'Paid' ? 'UnPaid' : 'Paid' } : utility
    ));
  };

  const handleUpdate = (id) => {
    // For this example, we'll just console log
    console.log("Update utility with ID:", id);
    // In a real app, you would open a form to edit the utility
  };

  return (
    <div className="utility-container">
      <h2>Utility Management</h2>
      
      <div className="utility-header">
        <div className="search-bar">
          <input type="text" placeholder="Search..." />
        </div>
        <button className="add-button" onClick={() => setShowPopup(true)}>
          Add Utility
        </button>
      </div>

      <div className="utility-list">
        <div className="utility-list-header">
          <div className="utility-col">Utility</div>
          <div className="utility-col">Due Date</div>
          <div className="utility-col">Amount</div>
          <div className="utility-col">Bill Photo</div>
          <div className="utility-col">Status</div>
          <div className="utility-col">Actions</div>
        </div>
        
        {utilities.length > 0 ? (
          utilities.map(utility => (
            <div className="utility-item" key={utility.id}>
              <div className="utility-col">{utility.name}</div>
              <div className="utility-col">{utility.dueDate}</div>
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
                  <span className="status-label">{utility.status}</span>
                </label>
              </div>
              <div className="utility-col actions">
                <button onClick={() => handleUpdate(utility.id)}>Update</button>
                <button onClick={() => handleDelete(utility.id)}>Delete</button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-utilities">No utilities added yet.</div>
        )}
      </div>

      <div className="footer">
        <button className="pdf-button">PDF Download</button>
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

