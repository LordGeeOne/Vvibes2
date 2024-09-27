import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { getAuth } from 'firebase/auth';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore'; // Firestore functions
import './Matches.css'; // Create CSS file for styling

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const auth = getAuth(); // Initialize Firebase Auth

  useEffect(() => {
    const fetchMatches = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error('User not authenticated');
        setLoading(false);
        return;
      }

      try {
        // Fetch matches for the logged-in user from the matches collection
        const matchesRef = collection(db, 'users', currentUser.uid, 'matches');
        const matchesSnapshot = await getDocs(matchesRef);

        const matchesList = [];
        for (const matchDoc of matchesSnapshot.docs) {
          const matchData = matchDoc.data();
          const matchedWith = matchData.matchedWith;

          // Fetch full user details for the matched user
          const userDoc = await getDoc(doc(db, 'users', matchedWith));

          if (userDoc.exists()) {
            const userData = userDoc.data();
            matchesList.push({
              id: matchDoc.id,
              matchDecision: matchData.matchDecision, // The matching decision (Smash, Date, etc.)
              user: {
                name: userData.name,
                age: userData.age,
                gender: userData.gender,
                language: userData.language,
                facebook: userData.facebook,
                instagram: userData.instagram,
                whatsapp: userData.whatsapp, // Include WhatsApp number
                profilePictureUrl: userData.profilePictureUrl,
              },
            });
          }
        }

        setMatches(matchesList);
      } catch (error) {
        console.error('Error fetching matches:', error);
      }
      setLoading(false);
    };

    fetchMatches();
  }, [auth]);

  if (loading) {
    return <div>Loading matches...</div>;
  }

  if (matches.length === 0) {
    return <div>No matches yet.</div>;
  }

  return (
    <div>
      <h1>Matches</h1>
      <div className="matches-container">
        {matches.map((match) => (
          <div key={match.id} className="match-card">
            {/* Display matched user's details */}
            <div className="match-user-details">
              <img
                src={match.user.profilePictureUrl}
                alt={`${match.user.name}'s profile`}
                className="match-profile-picture"
              />
              <div className="match-info">
                <p><strong>Name:</strong> {match.user.name}</p>
                <p><strong>Age:</strong> {match.user.age}</p>
                <p><strong>Gender:</strong> {match.user.gender}</p>
                <p><strong>Language:</strong> {match.user.language}</p>
                <p><strong>Facebook:</strong> {match.user.facebook}</p>
                <p><strong>Instagram:</strong> {match.user.instagram}</p>
                <p><strong>WhatsApp:</strong> {match.user.whatsapp}</p>
                <p className="text-message">This user is expecting a text from you!</p>
              </div>
            </div>

            {/* Show the match decision */}
            <p><strong>Matched on:</strong> {match.matchDecision}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Matches;
