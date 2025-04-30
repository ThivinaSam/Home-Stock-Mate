import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from "../context/AuthContext";
import { updateProfile, updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { auth, storage } from "../../firebase";
import { FaUserCircle, FaCamera, FaLock, FaEnvelope, FaUser, FaCheck, FaEye, FaEyeSlash, FaCalendarAlt, FaShieldAlt } from "react-icons/fa";
import MainSideBar from "../MainSideBar/mainSideBer";

function Profile() {
  const { currentUser, dispatch } = useContext(AuthContext);
  
  // State for user data
  const [displayName, setDisplayName] = useState(currentUser?.displayName || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [photoURL, setPhotoURL] = useState(currentUser?.photoURL || "");
  
  // State for password changes
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // UI states
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Form states
  const [loading, setLoading] = useState(false);
  const [fileUploadProgress, setFileUploadProgress] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Handle profile picture upload
  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.includes("image")) {
      setErrorMessage("Please upload an image file");
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("File size must be less than 5MB");
      return;
    }
    
    setLoading(true);
    setErrorMessage("");
    
    const storageRef = ref(storage, `profilePictures/${currentUser.uid}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Track upload progress
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFileUploadProgress(progress);
      },
      (error) => {
        // Handle errors
        console.error("Error uploading file:", error);
        setErrorMessage("Failed to upload profile picture. Please try again.");
        setLoading(false);
      },
      async () => {
        // Upload completed successfully
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        setPhotoURL(downloadURL);
        
        try {
          // Update user profile with new photo URL
          await updateProfile(auth.currentUser, { photoURL: downloadURL });
          
          // Update auth context
          dispatch({ 
            type: "LOGIN", 
            payload: {...currentUser, photoURL: downloadURL} 
          });
          
          setSuccessMessage("Profile picture updated successfully!");
        } catch (error) {
          console.error("Error updating profile:", error);
          setErrorMessage("Failed to update profile picture. Please try again.");
        } finally {
          setLoading(false);
          setFileUploadProgress(0);
        }
      }
    );
  };

  // Handle profile information update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    if (!displayName.trim()) {
      setErrorMessage("Display name cannot be empty");
      return;
    }
    
    setLoading(true);
    setErrorMessage("");
    
    try {
      // Update display name if changed
      if (displayName !== currentUser.displayName) {
        await updateProfile(auth.currentUser, { displayName });
      }
      
      // Update email if changed
      if (email !== currentUser.email) {
        if (!currentPassword) {
          setErrorMessage("Please enter your current password to change email");
          setLoading(false);
          return;
        }
        
        // Re-authenticate user before updating email
        const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
        await reauthenticateWithCredential(auth.currentUser, credential);
        await updateEmail(auth.currentUser, email);
      }
      
      // Update auth context
      dispatch({
        type: "LOGIN",
        payload: {...currentUser, displayName, email}
      });
      
      setSuccessMessage("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      
      if (error.code === "auth/requires-recent-login") {
        setErrorMessage("Please sign in again before updating your email");
      } else if (error.code === "auth/email-already-in-use") {
        setErrorMessage("Email is already in use by another account");
      } else if (error.code === "auth/invalid-email") {
        setErrorMessage("Please enter a valid email address");
      } else if (error.code === "auth/wrong-password") {
        setErrorMessage("Current password is incorrect");
      } else {
        setErrorMessage("Failed to update profile. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle password change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    // Validate passwords
    if (!currentPassword) {
      setErrorMessage("Please enter your current password");
      return;
    }
    
    if (newPassword.length < 6) {
      setErrorMessage("New password must be at least 6 characters");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setErrorMessage("New passwords don't match");
      return;
    }
    
    setLoading(true);
    setErrorMessage("");
    
    try {
      // Re-authenticate user before changing password
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      
      // Update password
      await updatePassword(auth.currentUser, newPassword);
      
      setSuccessMessage("Password changed successfully!");
      setIsChangingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error changing password:", error);
      
      if (error.code === "auth/wrong-password") {
        setErrorMessage("Current password is incorrect");
      } else {
        setErrorMessage("Failed to change password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Clear messages after 5 seconds
  useEffect(() => {
    let timer;
    if (successMessage) {
      timer = setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [successMessage]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100">
      <MainSideBar />
      
      <div className="lg:ml-64 p-6">
        {/* Page Header with Beautiful Gradient */}
        <header className="mb-10 relative overflow-hidden rounded-xl shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-90"></div>
          <div className="absolute inset-0 bg-pattern opacity-10" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"}}></div>
          <div className="relative p-8 text-white">
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              Your Profile
            </h1>
            <p className="text-blue-100 text-lg max-w-lg">
              View and manage your account information and preferences
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column - Profile Picture & Quick Stats */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {/* Profile Picture Section */}
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-6 flex flex-col items-center">
                <div className="relative mb-4">
                  {photoURL ? (
                    <img 
                      src={photoURL} 
                      alt="Profile" 
                      className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center shadow-lg">
                      <FaUserCircle className="w-24 h-24 text-white" />
                    </div>
                  )}
                  
                  <label htmlFor="profile-picture" className="absolute bottom-0 right-0 bg-white p-2 rounded-full cursor-pointer text-blue-600 hover:text-blue-700 shadow-md transition-all duration-300 hover:scale-110">
                    <FaCamera className="w-5 h-5" />
                    <input 
                      type="file" 
                      id="profile-picture" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleProfilePictureChange}
                      disabled={loading}
                    />
                  </label>
                </div>
                
                {/* Upload progress */}
                {fileUploadProgress > 0 && fileUploadProgress < 100 && (
                  <div className="w-full max-w-md bg-white/30 rounded-full h-2 mb-3">
                    <div 
                      className="bg-white h-2 rounded-full" 
                      style={{ width: `${fileUploadProgress}%` }}
                    ></div>
                  </div>
                )}
                
                <h2 className="text-2xl font-bold text-white mt-2">
                  {currentUser?.displayName || "User"}
                </h2>
                <p className="text-blue-100">{currentUser?.email}</p>
              </div>
              
              {/* Quick Stats */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                  <FaShieldAlt className="mr-2 text-blue-500" />
                  Account Information
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="p-2 rounded-full bg-blue-100 text-blue-600 mr-3">
                      <FaCalendarAlt className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Member Since</p>
                      <p className="font-medium">
                        {currentUser?.metadata?.creationTime 
                          ? new Date(currentUser.metadata.creationTime).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                          : "Unknown"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="p-2 rounded-full bg-green-100 text-green-600 mr-3">
                      <FaCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Email Status</p>
                      <p className="font-medium">
                        {currentUser?.emailVerified ? "Verified" : "Not Verified"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Profile Details & Forms */}
          <div className="md:col-span-2">
            {/* Messages */}
            {successMessage && (
              <div className="mb-6 bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-md flex items-center animate-fade-in-down">
                <div className="p-2 bg-green-100 rounded-full mr-3">
                  <FaCheck className="text-green-500" />
                </div>
                <p>{successMessage}</p>
              </div>
            )}
            
            {errorMessage && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md flex items-center animate-fade-in-down">
                <div className="p-2 bg-red-100 rounded-full mr-3">
                  <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p>{errorMessage}</p>
              </div>
            )}

            {/* Profile Details Card */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
              <div className="border-b border-gray-200">
                <div className="px-6 py-4">
                  <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      Profile Details
                    </span>
                  </h3>
                </div>
              </div>
              
              <div className="p-6">
                {isEditing ? (
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700" htmlFor="displayName">
                        Display Name
                      </label>
                      <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaUser className="text-gray-400" />
                        </div>
                        <input
                          id="displayName"
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="p-2 pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700" htmlFor="email">
                        Email Address
                      </label>
                      <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaEnvelope className="text-gray-400" />
                        </div>
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="p-2 pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          required
                        />
                      </div>
                    </div>
                    
                    {email !== currentUser?.email && (
                      <div className="p-4 bg-yellow-50 rounded-md border-l-4 border-yellow-400">
                        <div className="space-y-1">
                          <label className="block text-sm font-medium text-gray-700" htmlFor="currentPassword">
                            Current Password (required to change email)
                          </label>
                          <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FaLock className="text-gray-400" />
                            </div>
                            <input
                              id="currentPassword"
                              type={showPassword ? "text" : "password"}
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                              {showPassword ? 
                                <FaEyeSlash className="text-gray-400 hover:text-gray-600" /> : 
                                <FaEye className="text-gray-400 hover:text-gray-600" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex space-x-4 pt-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2 px-4 rounded-md shadow-sm flex items-center justify-center transition-all duration-200"
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                          </>
                        ) : "Save Changes"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setDisplayName(currentUser?.displayName || "");
                          setEmail(currentUser?.email || "");
                          setCurrentPassword("");
                          setErrorMessage("");
                        }}
                        className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                        disabled={loading}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : isChangingPassword ? (
                  <form onSubmit={handleChangePassword} className="space-y-6">
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700" htmlFor="currentPasswordChange">
                        Current Password
                      </label>
                      <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaLock className="text-gray-400" />
                        </div>
                        <input
                          id="currentPasswordChange"
                          type={showPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="p-2 pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPassword ? 
                            <FaEyeSlash className="text-gray-400 hover:text-gray-600" /> : 
                            <FaEye className="text-gray-400 hover:text-gray-600" />}
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700" htmlFor="newPassword">
                        New Password
                      </label>
                      <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaLock className="text-gray-400" />
                        </div>
                        <input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="p-2 pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showNewPassword ? 
                            <FaEyeSlash className="text-gray-400 hover:text-gray-600" /> : 
                            <FaEye className="text-gray-400 hover:text-gray-600" />}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters long</p>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700" htmlFor="confirmPassword">
                        Confirm New Password
                      </label>
                      <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaLock className="text-gray-400" />
                        </div>
                        <input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="p-2 pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showConfirmPassword ? 
                            <FaEyeSlash className="text-gray-400 hover:text-gray-600" /> : 
                            <FaEye className="text-gray-400 hover:text-gray-600" />}
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex space-x-4 pt-4">
                      <button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2 px-4 rounded-md shadow-sm flex items-center justify-center transition-all duration-200"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Updating...
                          </>
                        ) : "Change Password"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsChangingPassword(false);
                          setCurrentPassword("");
                          setNewPassword("");
                          setConfirmPassword("");
                          setErrorMessage("");
                        }}
                        className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                        disabled={loading}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="border-b border-gray-200 pb-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Display Name</label>
                          <p className="text-lg font-semibold text-gray-900">{currentUser?.displayName || "Not set"}</p>
                        </div>
                        <div className="hidden sm:block">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Public
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-b border-gray-200 pb-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Email Address</label>
                          <p className="text-lg font-semibold text-gray-900">{currentUser?.email}</p>
                        </div>
                        <div className="hidden sm:block">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Private
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setIsChangingPassword(false);
                          setErrorMessage("");
                        }}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-4 rounded-lg shadow-sm font-medium transition-all duration-200 flex justify-center items-center"
                      >
                        <FaUser className="mr-2" /> 
                        Edit Profile
                      </button>
                      
                      <button
                        onClick={() => {
                          setIsChangingPassword(true);
                          setIsEditing(false);
                          setErrorMessage("");
                        }}
                        className="flex-1 bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 hover:text-gray-900 shadow-sm font-medium transition-all duration-200 flex justify-center items-center"
                      >
                        <FaLock className="mr-2" />
                        Change Password
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Profile Settings Tips Card */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
              <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Profile Tips
              </h3>
              <ul className="space-y-2 text-sm text-blue-700">
                <li className="flex items-start">
                  <svg className="w-4 h-4 text-blue-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Adding a profile picture helps personalize your account
                </li>
                <li className="flex items-start">
                  <svg className="w-4 h-4 text-blue-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Use a strong, unique password with a mix of letters, numbers, and symbols
                </li>
                <li className="flex items-start">
                  <svg className="w-4 h-4 text-blue-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Keep your profile information up to date for better service
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Add some custom styles for animations */}
      <style jsx>{`
        @keyframes fade-in-down {
          0% {
            opacity: 0;
            transform: translateY(-10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}

export default Profile;
