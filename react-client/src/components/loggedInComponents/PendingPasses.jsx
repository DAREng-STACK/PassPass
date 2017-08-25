import React from 'react';

var PendingPasses = (props) => (
  <div className="profilePending">
    <ul>
      <li>
        Pass Start Date: {new Date(props.pass.period_start.slice(0, 10)).toDateString().slice(4)}
      </li>
      <li>
        Pass End Date: {new Date(props.pass.period_end.slice(0, 10)).toDateString().slice(4)}
      </li>
      <li>
        Restricted Gyms:
      </li>
      <li>
        Price: {props.pass.current_price}
      </li>
      <li>
        Passes Available: {props.pass.pass_volume - props.pass.passes_sold}
      </li>
      <li>
        Seller: {props.pass.first_name}
      </li>
      <li>
        Email: {props.pass.email}
      </li>
      <li>
        <form className="form-Message" onSubmit={(event) => {props.post(event, props.pass.email)}} >
          <label htmlFor="inputMessage" className="sr-only">message</label>
          <input
            onChange={props.update}
            type="text"
            id="inputMessage"
            className="form-control"
            placeholder="Message" 
            required
          />
          <button className="btn btn-md btn-primary btn-block" type="submit">Send Message</button>
        </form>
      </li>
    </ul>
  </div>
);



// [ RowDataPacket {
//     id: 5,
//     perspective_buyer_id: 4,
//     for_sale_block_id: 5,
//     pass_volume: 9,
//     seller_id: 1,
//     current_price: 8.99,
//     period_start: 2017-04-20T07:00:00.000Z,
//     period_end: 2017-04-30T07:00:00.000Z,
//     passes_sold: 5 } ]

// [ RowDataPacket { first_name: 'Billy', email: 'billy@bob.com' } ]




export default PendingPasses;
