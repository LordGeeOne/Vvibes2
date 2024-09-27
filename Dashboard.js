import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import './Dashboard.css'; // Ensure the correct path to your CSS file

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0); // State to track current user
  const [message, setMessage] = useState('');
  const auth = getAuth(); // Initialize Firebase Auth

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, 'users');
        const userSnapshot = await getDocs(usersCollection);
        const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(userList);
      } catch (error) {
        console.error("Error fetching users: ", error);
      }
    };

    fetchUsers();
  }, []);

  const handleAction = async (action) => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      setMessage('User not authenticated');
      return;
    }

    const user = users[currentIndex];

    try {
      // Write the decision to Firestore
      const decisionRef = doc(db, 'users', user.id, 'decisions', currentUser.uid);
      await setDoc(decisionRef, {
        action: action,
        decisionBy: currentUser.uid,
        decisionFor: user.id,
        timestamp: new Date()
      });

      setMessage(`${action} decision for ${user.name} was recorded!`);
      
      // Move to the next candidate
      setCurrentIndex((prevIndex) => (prevIndex + 1) % users.length);

    } catch (error) {
      console.error("Error recording decision: ", error);
      setMessage('Error sending decision');
    }
  };

  const currentUser = users[currentIndex];

  return (
    <div>
      <header className="dashboard-header">
        Dashboard
        <Link to="/profile">
          <button className="header-button">My Profile</button>
        </Link>
        <Link to="/requests">
          <button className="header-button">Requests</button>
        </Link>
        <Link to="/matches">
          <button className="header-button">Matches</button>
        </Link>
      </header>

      <div className="slideshow-container">
        {message && <p>{message}</p>}
        {currentUser && (
          <div className="candidate-card">
            <div className="candidate-details">
              <h2 className="candidate-name">{currentUser.name}</h2>
              <p className="candidate-age">{currentUser.age}</p>
            </div>
            {currentUser.profilePictureUrl && (
              <div className="candidate-picture">
                <img src={currentUser.profilePictureUrl} alt={currentUser.name} className="profile-picture" />
              </div>
            )}
            <div className="action-buttons">
              <button className="action-button smash-button" onClick={() => handleAction('Smash')}>Smash</button>
              <button className="action-button date-button" onClick={() => handleAction('Date')}>Date</button>
              <button className="action-button pass-button" onClick={() => handleAction('Pass')}>Pass</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
