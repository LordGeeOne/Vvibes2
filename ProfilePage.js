import './ProfilePage.css';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, storage } from '../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // For profile picture
import { useAuth } from '../hooks/useAuth';

const ProfilePage = () => {
  const { currentUser } = useAuth(); // Get the currently authenticated user
  const [profileData, setProfileData] = useState({
    name: '',
    age: '',
    gender: '',
    language: '',
    instagram: '',
    facebook: '',
    whatsapp: '',
    profilePictureUrl: '', // Profile picture URL
  });
  const [profilePicture, setProfilePicture] = useState(null); // For handling profile picture file upload
  const navigate = useNavigate();

  // Fetch user data when the page loads
  useEffect(() => {
    const fetchProfileData = async () => {
      if (currentUser) {
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProfileData(docSnap.data());
        } else {
          console.log('No such document!');
        }
      }
    };

    fetchProfileData();
  }, [currentUser]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle profile picture selection
  const handleProfilePictureChange = (e) => {
    if (e.target.files[0]) {
      setProfilePicture(e.target.files[0]);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentUser) {
      try {
        // If a profile picture is selected, upload it first
        if (profilePicture) {
          const storageRef = ref(storage, `profilePictures/${currentUser.uid}`);
          await uploadBytes(storageRef, profilePicture);
          const downloadURL = await getDownloadURL(storageRef);
          profileData.profilePictureUrl = downloadURL; // Update profile data with the picture URL
        }

        // Update Firestore with the profile data
        const userDocRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userDocRef, profileData);

        alert('Profile updated successfully!');
        navigate('/dashboard'); // Navigate to dashboard after successful submission
      } catch (error) {
        console.error('Error updating profile:', error);
      }
    }
  };

  return (
    <div>
      <h1>Profile Page</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={profileData.name}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label>Age:</label>
          <input
            type="number"
            name="age"
            value={profileData.age}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label>Gender:</label>
          <select
            name="gender"
            value={profileData.gender}
            onChange={handleInputChange}
            required
          >
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label>Language:</label>
          <input
            type="text"
            name="language"
            value={profileData.language}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>Instagram:</label>
          <input
            type="text"
            name="instagram"
            value={profileData.instagram}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>Facebook:</label>
          <input
            type="text"
            name="facebook"
            value={profileData.facebook}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>WhatsApp:</label>
          <input
            type="text"
            name="whatsapp"
            value={profileData.whatsapp}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>Profile Picture:</label>
          <input type="file" accept="image/*" onChange={handleProfilePictureChange} />
        </div>
        <button type="submit">Update Profile</button>
      </form>
    </div>
  );
};

export default ProfilePage;
