import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io.connect('http://localhost:3001');

function SplitPage({ updatePairs, receiptInfo, tipAmount }) {
  const [socketPair, setSocketPair] = useState([]);

  useEffect(() => {
    const result = [];
    updatePairs.forEach((user) => result.push(
      {
        user: user.user,
        name: user.name,
        price: Number(Number(user.price) + Number((tipAmount / updatePairs.length).toFixed(2)) + Number(receiptInfo.tax)).toFixed(2),
      },
    ));
    setSocketPair(result);
  }, []);

  return (
    <div className="split_page">
      <h1>Dutch Pay</h1>
      <div className="split_page_container">
        <div className="split_content">
          {socketPair.length && socketPair.map((pair) => (
            <div className="split_user_container">
              <div className="split_user">
                <p className="user">{pair.user}: &nbsp;</p>
                <p className="item_name">{pair.name}&nbsp;</p>
                <p className="item_price">{pair.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SplitPage;
