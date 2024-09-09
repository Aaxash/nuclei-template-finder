import React, { useEffect, useState } from 'react';
import Header from "./components/Header";
import Main from './components/Main';
import TopRepo from './components/TopRepo';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import the CSS
import { setupIndexedDB, storeData, getMetadata, fetchGzFile, fetchHashFile } from './utils/indexedDBUtils';
import './App.css'; // Ensure this CSS file contains the styles for spinner

const GZ_FILE_URL = '/files/data.json.gz'; // Path to .json.gz file in the public folder
const HASH_FILE_URL = '/files/hash.txt'; // Path to hash file in the public folder

const MEMES = [
  'Fetching database... Please wait.',
  'Hold tight! Data is on its way.',
  'Sifting through bytes and bits...',
  'Almost there, fetching data...',
  'Chasing down some data gremlins...',
  'Data loading in progress, enjoy the spinner!',
  'Grabbing the bits and bytes for you...',
  'Fetching data: don’t unplug your brain!',
];

function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [memeIndex, setMemeIndex] = useState(0);

  useEffect(() => {
    const initializeDB = async () => {
      try {
        //console.log('Initializing IndexedDB...');
        const db = await setupIndexedDB();

        //console.log('Fetching hash file...');
        const fetchedHash = await fetchHashFile(HASH_FILE_URL);

        const storedHash = await getMetadata(db);
        //console.log('Retrieved stored hash:', storedHash);

        if (storedHash !== fetchedHash) {
          //console.log('Hash mismatch detected. Fetching new data and storing it.');

          const temporaryData = await fetchGzFile(GZ_FILE_URL);
         // console.log('Fetched and decompressed .json.gz file.');

          await storeData(db, temporaryData, fetchedHash);
          console.log('IndexedDB updated with new data and hash.');
        } else {
          console.log('Data is up to date. No changes required.');
        }
      } catch (error) {
        setError('Error setting up IndexedDB');
        console.error('Error during IndexedDB setup:', error);
      } finally {
        console.log('Initialization process complete.');
        setLoading(false);
      }
    };

    initializeDB();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setMemeIndex((prevIndex) => (prevIndex + 1) % MEMES.length);
    }, 3000); // Change text every 3 seconds

    return () => clearInterval(interval); // Cleanup on component unmount
  }, []);

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
        <div className="spinner-text">{MEMES[memeIndex]}</div>
      </div>
    );
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="App">
      <ToastContainer />
      <Header />
      <Main />
      <TopRepo />
    </div>
  );
}

export default App;
