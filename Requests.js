import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { getAuth } from 'firebase/auth';
import { collection, getDocs, doc, deleteDoc, getDoc, setDoc } from 'firebase/firestore';
import Confetti from 'react-confetti'; // Importing the Confetti library
import './Requests.css'; 

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false); // State to show confetti
  const [matchMessage, setMatchMessage] = useState(''); // Message to display on match
  const auth = getAuth(); // Initialize Firebase Auth

  useEffect(() => {
    const fetchRequests = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error('User not authenticated');
        setLoading(false);
        return;
      }

      try {
        // Reference to the decisions sub-collection for the logged-in user
        const decisionsRef = collection(db, 'users', currentUser.uid, 'decisions');
        const decisionsSnapshot = await getDocs(decisionsRef);

        const requestsList = [];
        for (const decisionDoc of decisionsSnapshot.docs) {
          const decisionData = decisionDoc.data();
          const decisionBy = decisionData.decisionBy;

          // Fetch the user's full details
          const userDoc = await getDoc(doc(db, 'users', decisionBy));

          if (userDoc.exists()) {
            const userData = userDoc.data();
            requestsList.push({
              id: decisionDoc.id,
              action: decisionData.action,
              decisionBy: decisionBy,
              user: {
                name: userData.name,
                age: userData.age,
                gender: userData.gender,
                language: userData.language,
                facebook: userData.facebook,
                instagram: userData.instagram,
                profilePictureUrl: userData.profilePictureUrl,
              },
            });
          }
        }

        setRequests(requestsList);
      } catch (error) {
        console.error('Error fetching requests:', error);
      }
      setLoading(false);
    };

    fetchRequests();
  }, [auth]);

  const handleResponse = async (requestId, responseAction, otherUserId) => {
    try {
      // Get the other user's decision from Firestore
      const otherUserDecisionDoc = await getDoc(doc(db, 'users', otherUserId, 'decisions', auth.currentUser.uid));
      const otherUserDecision = otherUserDecisionDoc.exists() ? otherUserDecisionDoc.data().action : null;

      if (responseAction === 'Pass') {
        // Remove the request if 'Pass'
        const decisionDocRef = doc(db, 'users', auth.currentUser.uid, 'decisions', requestId);
        await deleteDoc(decisionDocRef);
        setRequests((prevRequests) => prevRequests.filter((request) => request.id !== requestId));
      } else if (responseAction === otherUserDecision) {
        // If both users chose the same decision, create a match
        await addMatch(auth.currentUser.uid, otherUserId, responseAction);

        // Show confetti and set match message
        setShowConfetti(true);
        setMatchMessage(`It's a match! Head over to the matches page.`);
        
        // Remove the matched request
        setRequests((prevRequests) => prevRequests.filter((request) => request.id !== requestId));

        // Hide confetti after 5 seconds
        setTimeout(() => {
          setShowConfetti(false);
          setMatchMessage('');
        }, 5000);
      } else {
        console.log(`${responseAction} response recorded for request: ${requestId}`);
      }
    } catch (error) {
      console.error('Error responding to request:', error);
    }
  };

  const addMatch = async (currentUserId, otherUserId, matchDecision) => {
    // Add match to both users' matches sub-collections
    const currentUserMatchRef = doc(db, 'users', currentUserId, 'matches', otherUserId);
    const otherUserMatchRef = doc(db, 'users', otherUserId, 'matches', currentUserId);

    await setDoc(currentUserMatchRef, {
      matchedWith: otherUserId,
      matchDecision: matchDecision,
    });

    await setDoc(otherUserMatchRef, {
      matchedWith: currentUserId,
      matchDecision: matchDecision,
    });

    console.log(`Match created between ${currentUserId} and ${otherUserId}`);
  };

  if (loading) {
    return <div>Loading requests...</div>;
  }

  if (requests.length === 0) {
    return <div>No requests yet.</div>;
  }

  return (
    <div>
      <h1>Requests</h1>

      {/* Display the match message */}
      {matchMessage && <div className="match-message">{matchMessage}</div>}

      {/* Display confetti when there is a match */}
      {showConfetti && <Confetti />}

      <div className="requests-container">
        {requests.map((request) => (
          <div key={request.id} className="request-card">
            {/* Displaying the user's details */}
            <div className="request-user-details">
              <img
                src={request.user.profilePictureUrl}
                alt={`${request.user.name}'s profile`}
                className="request-profile-picture"
              />
              <div className="request-info">
                <p><strong>Name:</strong> {request.user.name}</p>
                <p><strong>Age:</strong> {request.user.age}</p>
                <p><strong>Gender:</strong> {request.user.gender}</p>
                <p><strong>Language:</strong> {request.user.language}</p>
                <p><strong>Facebook:</strong> {request.user.facebook}</p>
                <p><strong>Instagram:</strong> {request.user.instagram}</p>
              </div>
            </div>

            {/* Show the action that was made (Smash, Date, Pass) */}
            <p><strong>Action:</strong> {request.action}</p>

            {/* Buttons for the logged-in user to respond */}
            <div className="action-buttons">
              <button onClick={() => handleResponse(request.id, 'Smash', request.decisionBy)}>Smash</button>
              <button onClick={() => handleResponse(request.id, 'Date', request.decisionBy)}>Date</button>
              <button onClick={() => handleResponse(request.id, 'Pass', request.decisionBy)}>Pass</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Requests;
