import React, { useState, useEffect } from 'react';

function UploadPage({ sessionInfo, renderBillOverview }) {
  const [image, setImage] = useState('');

  const handleImage = (e) => {
    console.log(e.target.files);
    setImage(e.target.files[0]);
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
        <button type="button" onClick={() => renderBillOverview('bill')}>Create Split Session!</button>
      </div>
    </div>
  );
}

export default UploadPage;
