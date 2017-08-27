import React from 'react';
import Checkout from './Checkout.jsx';
import RestrictedGyms from './RestrictedGyms.jsx';

var PendingPasses = (props) => (

  <div className="profilePending">
    <div className="col-xs-6">
      <ul>
        <li>
          <strong>Pass Start:</strong> Date: {new Date(props.pass.period_start.slice(0, 10)).toDateString().slice(4)}
        </li>
        <li>
          <strong>Pass End:</strong> Date: {new Date(props.pass.period_end.slice(0, 10)).toDateString().slice(4)}
        </li>
        {props.pass.restrictedStudios.length > 0 &&
         <li>
           {props.pass.restrictedStudios.map((gym, index) =>
             <RestrictedGyms gym={gym} key={index}/>
           )}
         </li>
       }
       {props.pass.restrictedStudios.length === 0 &&
        <li>
          <strong>Restricted Gyms:</strong> no restricted gyms
        </li>
      }
        <li>
          <strong>Price:</strong> ${props.pass.current_price.toFixed(2)}
        </li>
        <li>
          <strong>Passes Available:</strong> {props.pass.pass_volume - props.pass.passes_sold}
        </li>
        <li>
          <strong>Seller:</strong> {props.pass.first_name}
        </li>
        <li>
          <strong>Email:</strong> {props.pass.email}
        </li>
      </ul>
    </div>
    <div className="col-xs-6">
      <ul>
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
        <br></br>
        <li className="checkout">
          <Checkout stuff={props} />
          <br></br>
          <input type="submit" value="Delete" className="deleteFromPendingButton btn btn-md btn-primary btn-blocks" onClick={props.deletePendingPass.bind(this, props.pass)}/>
        </li>
      </ul>
    </div>

  </div>
);




export default PendingPasses;
