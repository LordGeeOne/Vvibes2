import React, { useState } from 'react';
import { storage, db } from '../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';

const UploadImage = () => {
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handleUpload = async () => {
    if (!file || !name) {
      setError('Please provide a name and select a file.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const storageRef = ref(storage, `profilePictures/${file.name}`);
      await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(storageRef);

      await addDoc(collection(db, 'users'), {
        name,
        profilePictureUrl: photoURL
      });

      alert('Upload successful!');
      setName('');
      setFile(null);
    } catch (err) {
      setError('Failed to upload image.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h2>Upload Profile Picture</h2>
      <input type="text" placeholder="Name" value={name} onChange={handleNameChange} />
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default UploadImage;
