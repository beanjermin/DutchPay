import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
const socket = io.connect('http://localhost:3001');

function BillOverview({ sessionInfo, receiptInfo, itemList }) {
  const [sessionMembers, setSessionMembers] = useState([]);


  // socket.on('update_userlist', (usersArr) => {
  //   console.log('herehrehehreh')
  //   setSessionMembers([...sessionMembers, ...usersArr]);
  // })

  socket.on('user_joined', (username) => {
    console.log('this is happening')
    setSessionMembers([...sessionMembers, ...[username]])
  });

  // useEffect(() => {
  //   console.log('SESSION MEMBERS', sessionMembers);
  // }, [socket]);

  // useEffect(() => {
  //   socket.emit('user_list', sessionMembers);
  // }, []);


  return (
    <div className="bill_overview">
      <header>
        <h1>DUTCH PAY</h1>
      </header>
      <div className="bo_session_members">
        <h3>Session Members</h3>
        {sessionMembers.map((user) => (
          <div>{user}</div>
        ))}
      </div>
      <div className="bo_container">
        <h3>Bill Overview</h3>
        <div className="bo_header">
          <div>
            Username: &nbsp;
            { sessionInfo.sessionUsers }
          </div>
          <div>
            SessionID: &nbsp;
            { sessionInfo.sessionId }
          </div>
        </div>
        <div className="receipt_content">
          {itemList && (itemList.map((item) => (
            <div className="items">
              <p>{item.name}</p>
              <p>
                $
                {item.price}
              </p>
            </div>
          )))}
          {sessionInfo.itemList.length > 1 && (sessionInfo.itemList.map((item) => (
            <div className="items">
              <p>{item.name}</p>
              <p>
                $
                {item.price}
              </p>
            </div>
          )))}
        </div>
        <div className="total_cost">
          <div>
            Sales Tax: &nbsp;
            $
            { receiptInfo && (receiptInfo.tax) }
            { sessionInfo.receiptInfo.tax && (
              sessionInfo.receiptInfo.tax) }
          </div>
          <div>
            Tip: &nbsp;
            $
            { receiptInfo && (
              receiptInfo.tipAmount || 0)}
            { sessionInfo.receiptInfo.tipAmount && (
              sessionInfo.receiptInfo.tipAmount
            )}
          </div>
          <div>
            Total: &nbsp;
            $
            { receiptInfo && (receiptInfo.total) }
            { sessionInfo.receiptInfo.total && (
              sessionInfo.receiptInfo.total
            )}
          </div>
        </div>
      </div>
      <button type="button">Split</button>
    </div>
  );
}

export default BillOverview;
