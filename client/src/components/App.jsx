import React, { useState } from 'react';
import axios from 'axios';
import UploadPage from './UploadPage';
import BillOverview from './BillOverview';
import SplitPage from './SplitPage';
import io from 'socket.io-client';
const socket = io.connect('http://localhost:3001');

export default function App() {
  const [receiptInfo, setReceiptInfo] = useState('');
  const [itemList, setItemList] = useState('');
  const [sessionInfo, setSessionInfo] = useState({});
  const [newUsername, setNewUsername] = useState('');
  const [username, setUsername] = useState('');
  const [sessionCode, setSessionCode] = useState('');
  const [page, setPage] = useState('');
  const [updateSession, setUpdateSession] = useState(false);
  const [updatePairs, setUpdatePairs] = useState([]);

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
            receiptInfo: JSON.parse(data.receiptInfo),
            itemList: JSON.parse(data.itemList),
          };
          socket.emit('join_room', data.sessionId, user);
          setSessionCode('');
          setUsername('');
          setSessionInfo(query2);
          setPage('bill');
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
      receiptInfo: receiptInfo,
      itemList: itemList,
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

  const renderBillOverview = async (form, receipt, list, info) => {
    await setReceiptInfo(receipt);
    await setItemList(list);
    await setUpdateSession(true);
    await socket.emit('join_room', info.sessionId, info.sessionUsers);
    await setPage(form);
  };

  const renderSplitPage = async (page, pairs) => {
    await setUpdatePairs(pairs);
    await socket.emit('split_page', pairs);
    await setPage(page);
  };

  if (updateSession) {
    axios.post('/dutchpay', {
      sessionId: sessionInfo.sessionId,
      receiptInfo: JSON.stringify(receiptInfo),
      itemList: JSON.stringify(itemList),
    })
      .then(() => {
        setUpdateSession(false);
        console.log('success!');
      })
      .catch((err) => console.error('error', err));
  }

  if (page === 'upload' && sessionInfo) {
    return (
      <UploadPage sessionInfo={sessionInfo} renderBillOverview={renderBillOverview} />
    );
  }
  if (page === 'bill') {
    return (
      <BillOverview sessionInfo={sessionInfo} receiptInfo={receiptInfo} itemList={itemList} renderSplitPage={renderSplitPage} />
    );
  }
  if (page === 'split') {
    return (
      <SplitPage updatePairs={updatePairs} />
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
