import React, { useState } from 'react';

function BillOverview({ sessionInfo }) {
  return (
    <div className="bill_overview">
      <header>
        <h1>DUTCH PAY</h1>
      </header>
      <div className="bo_session_members">
        Session Members
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
          <div><p>BLAH BLAH BLAH</p><p>Price</p></div>
          <div><p>BLAH BLAH BLAH</p><p>Price</p></div>
          <div><p>BLAH BLAH BLAH</p><p>Price</p></div>
          <div><p>BLAH BLAH BLAH</p><p>Price</p></div>
          <div><p>BLAH BLAH BLAH</p><p>Price</p></div>
        </div>
        <div className="total_cost">
          <div>Sales Tax</div>
          <div>Tip</div>
          <div>Total</div>
        </div>
      </div>
      <button type="button">Split</button>
    </div>
  );
}

export default BillOverview;
