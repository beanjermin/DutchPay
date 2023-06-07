import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Tesseract from 'tesseract.js';

function UploadPage({ sessionInfo, renderBillOverview }) {
  const [image, setImage] = useState('');
  const [receipt, setReceipt] = useState('');
  const [receiptObj, setReceiptObj] = useState({});
  const [itemList, setItemList] = useState([]);

  const handleImage = (e) => {
    console.log(e.target.files);
    setImage(e.target.files[0]);
  };

  const handleConvert = (img) => {
    Tesseract.recognize(
      img,
      'eng+kor',
      { logger: (m) => console.log(m) })
      .then(({ data: { text } }) => {
        console.log(text);
        setReceipt(text);
      })
      .catch((err) => console.error('Error reading receipt', err));
  };

  const itemsArr = (obj) => {
    const result = [];
    for (let i = 0; i < obj.items.length; i += 1) {
      if (obj.items[i].quantity > 1) {
        const itemObj = {
          name: obj.items[i].name,
          price: Number(obj.items[i].price) / obj.items[i].quantity,
        };
        result.push(...Array(obj.items[i].quantity).fill(itemObj));
      } else {
        result.push({
          name: obj.items[i].name,
          price: obj.items[i].price,
        });
      }
    }
    return result;
  };

  const handleInterpret = (stub) => {
    axios.get('/dutchpay/openai', { params: { data: stub } })
      .then(({ data }) => {
        console.log(JSON.parse(data));
        setReceiptObj(JSON.parse(data));
        setItemList(itemsArr(JSON.parse(data)));
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="upload_page">
      <div className="upload_container">
        <header>
          <h1>Dutch Pay</h1>
        </header>
        <div className="session_header">
          <div>
            Username: &nbsp;
            { sessionInfo.sessionUsers }
          </div>
          <div>
            SessionID: &nbsp;
            { sessionInfo.sessionId }
          </div>
        </div>
        <label htmlFor="file">
          Upload a Receipt &nbsp;
          <input type="file" id="file" onChange={handleImage} />
        </label>
        {receipt && (
          <div>{receipt}</div>
        )}
        <button type="button" onClick={() => handleConvert(image)}>Convert</button>
        <button type="button" onClick={() => handleInterpret(receipt)}>Interpret</button>
        <button type="button" onClick={() => renderBillOverview('bill', receiptObj, itemList)}>Create Split Session!</button>
      </div>
    </div>
  );
}

export default UploadPage;
