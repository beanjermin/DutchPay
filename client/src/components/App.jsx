import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UploadPage from './UploadPage';
import BillOverview from './BillOverview';

export default function App() {
  const [sessionInfo, setSessionInfo] = useState({});
  const [newUsername, setNewUsername] = useState('');
  const [username, setUsername] = useState('');
  const [sessionCode, setSessionCode] = useState('');
  const [page, setPage] = useState('');

  const submitSessionCode = (code, user) => {
    const query1 = {
      sessionId: code,
    };
    axios.get('/dutchpay', { params: query1 })
      .then(({ data }) => {
        if (data) {
          const query2 = {
            sessionId: data.sessionId,
            sessionUsers: user,
          };
          axios.post('/dutchpay', query2)
            .then(() => {
              console.log('Successfully posted new user');
              setSessionCode('');
              setUsername('');
              setSessionInfo(query2);
              setPage('bill');
            })
            .catch((err) => console.error('Error posting new user', err));
        }
      })
      .catch((err) => console.error('There was a problem finding the session', err));
  };

  const makeSessionId = (length) => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  };

  const submitNewUsername = (name) => {
    const newSessionId = makeSessionId(4);
    const query = {
      sessionId: newSessionId,
      sessionUsers: name,
    };
    if (name.length >= 3) {
      axios.post('/dutchpay', query)
        .then(() => {
          console.log('Session was posted successfully!');
          setNewUsername('');
          setSessionInfo(query);
          setPage('upload');
        })
        .catch((err) => console.error('There was a problem creating a new session!', err));
    } else if (name.length < 3) {
      function warning() {
        alert('Username must be longer than 4 characters!');
      }
      warning();
    }
  };

  const renderBillOverview = (form) => {
    setPage(form);
  };

  if (page === 'upload' && sessionInfo) {
    return (
      <UploadPage sessionInfo={sessionInfo} renderBillOverview={renderBillOverview} />
    );
  }
  if (page === 'bill') {
    return (
      <BillOverview sessionInfo={sessionInfo} />
    );
  }
  if (page === 'split') {
    return (
      <SplitPage />
    );
  }

  return (
    <div className="login">
      <form
        className="login_form"
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <h1>Dutch Pay</h1>
        <div className="form_container">
          <div>
            <label htmlFor="new-username">
              Start New Session
              <input type="text" id="new-username" placeholder="Enter Username" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} />
            </label>
            <button type="submit" onClick={() => submitNewUsername(newUsername)}>Go</button>
          </div>
          <p>OR</p>
          <div>
            <label htmlFor="session_code">
              Enter Session Code
              <input type="text" id="session_code" placeholder="HQTS" value={sessionCode} onChange={(e) => setSessionCode(e.target.value)} />
            </label>
            <label htmlFor="username">
              Enter Username
              <input type="text" id="username" placeholder="Enter Username" value={username} onChange={(e) => setUsername(e.target.value)} />
            </label>
            <button type="submit" onClick={() => submitSessionCode(sessionCode, username)}>Go</button>
          </div>
        </div>
      </form>
    </div>
  );
}
