import React, { useState } from 'react';
import io from 'socket.io-client';

const socket = io.connect('http://localhost:3001');

function SplitPage({ updatePairs }) {
  const [pairs, setPairs] = useState([]);
  const [socketPair, setSocketPair] = useState([]);

  console.log('PAIRS', pairs);
  console.log('updatePairs', updatePairs);

  socket.on('userPairs', (info) => {
    setPairs(info);
  });

  return (
    <div className="split_page">
      <h1>Dutch Pay</h1>
      <div className="split_page_container">
        <div className="split_content">
          {updatePairs.map((pair) => (
            <div className="split_user">
              <p className="user">{pair.user}: &nbsp;</p>
              <p className="item_name">{pair.name}&nbsp;</p>
              <p className="item_price">{pair.price}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SplitPage;
