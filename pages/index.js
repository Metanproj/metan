import React, { useEffect, useState } from 'react';
import { Wrapper } from "@googlemaps/react-wrapper";
import Appbar from "./CustomAppBar";
import ChatWindow from "./ChatWindow";
import Map3d from "./Map3d";
import { getDoc, setDoc, doc } from 'firebase/firestore';
import randomNumberInRange from '../utils/utils';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../utils/firebase/firebaseConfig';
import ChatIcon from '@mui/icons-material/Chat';
import { IconButton } from '@mui/material';

export default function Intro() {

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState({});
  const [isChatWindowOpen, setIsChatWindowOpen] = useState(false);
  const toggleChatWindow = () => {
    setIsChatWindowOpen(!isChatWindowOpen);
  };


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (result) => {
      if (result) {
        const { uid, displayName, email, photoURL } = result;
        setUserData({ uid, displayName, email, photoURL });
        setIsLoggedIn(true);

        // Check if user data is already saved in Firestore
        checkAndSaveUserData(uid, displayName, email, photoURL);
      } else {
        setUserData({});
        setIsLoggedIn(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const SignUpUsingGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        const { uid, displayName, email, photoURL } = result.user;

        setUserData({ uid, displayName, email, photoURL });
        setIsLoggedIn(true);

        // Save user data to Firestore
        checkAndSaveUserData(uid, displayName, email, photoURL);
      })
      .catch((error) => {
        console.log({ error });
      });
  };

  const Logout = () => {
    signOut(auth)
      .then(() => {
        setUserData({});
        setIsLoggedIn(false);
      })
      .catch((error) => {
        console.log({ error });
      });
  };

  const handleLogout = () => {
    Logout();
  };

  const checkAndSaveUserData = async (uid, displayName, email, photoURL) => {
    const userDocRef = doc(db, 'users', uid);
    try {
      const userDocSnapshot = await getDoc(userDocRef);

      if (!userDocSnapshot.exists()) {
        // User data not found in Firestore, save it
        const lat = randomNumberInRange(23.89573, 23.90622);
        const lng = randomNumberInRange(89.10729, 89.12990);
        const userData = {
          displayName,
          email,
          photoURL,
          lat,
          lng
        };

        console.log('Data to be written:', userData);

        await setDoc(userDocRef, userData);

      }
    } catch (error) {
      console.error('Error checking and saving user data:', error);
    }
  };

  // Check if the user is not logged in
  if (!isLoggedIn) {
    return (
      <div className="App">
        <div className="blur-background">
          <div className="login-card">
            {/* App Name and Logo */}
            <img src="3DMap.png" alt="3D Map Game" className="logo-img" />
            <h3>3D Map Game</h3>

            {/* Sign in with Google Button */}
            <button onClick={SignUpUsingGoogle} type="button" className="login-with-google-btn">
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="map-app">
      <div className="appbar-wrapper">
        <Appbar username={userData.displayName} photoURL={userData.photoURL} onLogout={handleLogout} toggleChatWindow={toggleChatWindow} />
      </div>
      <div className="map-container">
        <Wrapper apiKey={process.env.NEXT_PUBLIC_MAP_API_KEY}>
          <Map3d />
        </Wrapper>
        {isChatWindowOpen && (
          <ChatWindow
            userUid={userData.uid}
            onClose={toggleChatWindow}
          />
        )}
      </div>
    </div>
  );
}


