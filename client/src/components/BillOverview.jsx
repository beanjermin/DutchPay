import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io.connect('http://localhost:3001');

function BillOverview({ sessionInfo, receiptInfo, itemList, renderSplitPage }) {
  const [sessionMembers, setSessionMembers] = useState([]);
  const [change, setChange] = useState(false);
  const [itemPairs, setItemPairs] = useState([]);
  const [newPairs, setNewPairs] = useState(false);
  const [selectVal, setSelectVal] = useState([Array(sessionInfo.itemList.length).fill('')]);

  socket.on('user_list', (users) => {
    // console.log('final step', users);
    if (sessionMembers.filter((user) => user === users || users.includes(user)).length < 1) {
      setSessionMembers([...sessionMembers, ...users]);
    }
  });

  socket.on('user_joined', (username) => {
    // console.log('this is happening')
    setSessionMembers([...sessionMembers, username]);
    setChange(true);
    // console.log('sessionmembers', sessionMembers);
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
    console.log('E', e, 'item', item.name);
    setItemPairs([...itemPairs, itemPair]);

    const newArr = selectVal;
    newArr[i] = e;
    setSelectVal(newArr);
    setNewPairs(true);
  };
  if (newPairs) {
    console.log('ITEMMM HERERHERHE', itemPairs)
    console.log('selectVal', selectVal);
    socket.emit('update_select_user', itemPairs[itemPairs.length - 1], selectVal);
    setNewPairs(false);
  }

  socket.on('update_select', (pairs, e) => {
    console.log('OBJECTVALUES', Object.values(itemPairs).map((obj) => obj.user))
    console.log('PAIRSUSERS', e)
    setItemPairs([...itemPairs, pairs]);
    setSelectVal(e);
  });

  console.log('itemPairs', itemPairs);
  console.log('selectVal', selectVal);
  // console.log('sessionInfo', sessionInfo.itemList);
  // console.log('SESSSION MEMBERSSS', sessionMembers);

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
      <button type="button" onClick={() => renderSplitPage('split', itemPairs)}>Split</button>
    </div>
  );
}

export default BillOverview;
