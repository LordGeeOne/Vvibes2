import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebaseConfig';
import { getDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../hooks/useAuth'; // Assuming you're using a custom hook for auth

const ProfileDetailsPage = () => {
  const { currentUser } = useAuth(); // Get the current logged-in user
  const [userData, setUserData] = useState(null);
  const [newPicture, setNewPicture] = useState(null);
  const [uploadMessage, setUploadMessage] = useState('');

  useEffect(() => {
    // Fetch user data from Firestore
    const fetchUserData = async () => {
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        } else {
          console.log('No user data found');
        }
      }
    };

    fetchUserData();
  }, [currentUser]);

  const handlePictureChange = (e) => {
    setNewPicture(e.target.files[0]);
  };

  const uploadNewPicture = async () => {
    if (newPicture && currentUser) {
      const storageRef = ref(storage, `profilePictures/${currentUser.uid}/${newPicture.name}`);
      try {
        await uploadBytes(storageRef, newPicture);
        const downloadURL = await getDownloadURL(storageRef);

        // Update Firestore with the new picture URL
        const userDocRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userDocRef, {
          profilePictureUrl: downloadURL,
        });

        setUploadMessage('Picture uploaded successfully!');
        setUserData(prevData => ({ ...prevData, profilePictureUrl: downloadURL }));
      } catch (error) {
        console.error('Error uploading picture:', error);
        setUploadMessage('Error uploading picture.');
      }
    }
  };

  if (!userData) return <div>Loading...</div>;

  return (
    <div>
      <h1>My Profile</h1>
      <div>
        <h2>{userData.name}</h2>
        <p>Age: {userData.age}</p>
        <p>Gender: {userData.gender}</p>
        <p>Languages: {userData.languages}</p>
        <p>WhatsApp: {userData.contactInfo}</p>
        <p>Instagram: {userData.instagram}</p>
        <p>Facebook: {userData.facebook}</p>
        {userData.profilePictureUrl && (
          <img
            src={userData.profilePictureUrl}
            alt="Profile"
            style={{ width: '100px', height: '100px', borderRadius: '50%' }}
          />
        )}
      </div>
      <div>
        <h3>Upload More Pictures</h3>
        <input type="file" onChange={handlePictureChange} />
        <button onClick={uploadNewPicture}>Upload Picture</button>
        {uploadMessage && <p>{uploadMessage}</p>}
      </div>
    </div>
  );
};

export default ProfileDetailsPage;
