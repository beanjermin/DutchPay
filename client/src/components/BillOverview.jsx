import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io.connect('http://localhost:3001');

function BillOverview({ sessionInfo, receiptInfo, itemList, renderSplitPage }) {
  const [sessionMembers, setSessionMembers] = useState([]);
  const [change, setChange] = useState(false);
  const [itemPairs, setItemPairs] = useState([]);
  const [tip, setTip] = useState('');
  const [chaching, setChaching] = useState(false);
  const [newPairs, setNewPairs] = useState(false);
  const [selectVal, setSelectVal] = useState([Array(sessionInfo.itemList.length).fill('')]);

  socket.on('user_list', (users) => {
    if (sessionMembers.filter((user) => user === users || users.includes(user)).length < 1) {
      setSessionMembers([...sessionMembers, ...users]);
    }
  });

  socket.on('user_joined', (username) => {
    setSessionMembers([...sessionMembers, username]);
    setChange(true);
  });
  if (change) {
    socket.emit('update_user_list', sessionMembers, sessionInfo.sessionId);
    setChange(false);
  }

  const handleSelect = (e, item, i) => {
    const itemPair = {
      name: item.name,
      price: item.price,
      user: e,
    };
    setItemPairs([...itemPairs, itemPair]);

    const newArr = selectVal;
    newArr[i] = e;
    setSelectVal(newArr);
    setNewPairs(true);
  };

  if (newPairs) {
    socket.emit('update_select_user', itemPairs[itemPairs.length - 1], selectVal);
    setNewPairs(false);
  }

  socket.on('update_select', (pairs, e) => {
    setItemPairs([...itemPairs, pairs]);
    setSelectVal(e);
  });

  const handleTip = (fee) => {
    setChaching(true);
    socket.emit('setting_tip', fee);
  };
  socket.on('set_tip', (gratuity) => {
    setChaching(true);
    setTip(gratuity);
  });

  return (
    <div className="bill_overview">
      <header>
        <h1>Dutch Pay</h1>
      </header>
      <h3>Session Members</h3>
      <div className="bo_session_members">
        {sessionMembers.map((user) => (
          <div>{user}</div>
        ))}
      </div>
      <div className="bo_container">
        <h3>Bill Overview</h3>
        <div className="bo_header">
          <div className="user">
            Username: &nbsp;
            { sessionInfo.sessionUsers }
          </div>
          <div className="session_id">
            SessionID: &nbsp;
            { sessionInfo.sessionId }
          </div>
        </div>
        <div className="receipt_content">
          {itemList && (itemList.map((item, i) => (
            <div className="items_container" key={i}>
              <div className="items">
                <p className="item_name">{item.name}</p>
                <p className="item_price">
                  $
                  {item.price}
                </p>
              </div>
              <select type="select" value={selectVal[i]} onChange={(e) => handleSelect(e.target.value, item, i)}>
                <option>-- Who ate this? --</option>
                {sessionMembers.map((user) => (
                  <option>{user}</option>
                ))}
              </select>
            </div>
          )))}
          {sessionInfo.itemList.length > 1 && (sessionInfo.itemList.map((item, i) => (
            <div className="items_container" key={i}>
              <div className="items">
                <p className="item_name">{item.name}</p>
                <p className="item_price">
                  $
                  {item.price}
                </p>
              </div>
              <select type="select" value={selectVal[i]} onChange={(e) => handleSelect(e.target.value, item, i)}>
                <option>-- Who ate this? --</option>
                {sessionMembers.map((user) => (
                  <option>{user}</option>
                ))}
              </select>
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
          <div className="tip">
            Tip: $
            <input className="tip_input" type="text" value={tip} placeholder="0.00" onChange={(e) => setTip(e.target.value)} />
            <button className="tip_btn" type="button" onClick={() => handleTip(tip)}>Set Tip</button>
            {chaching && (
            <p>Cha-Ching!</p>)}
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
      <button className="bill_overview_btn" type="button" onClick={() => renderSplitPage('split', itemPairs, sessionInfo.receiptInfo, tip)}>Split</button>
    </div>
  );
}

export default BillOverview;
