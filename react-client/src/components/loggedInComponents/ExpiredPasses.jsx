import React from 'react';
import RestrictedGyms from './RestrictedGyms.jsx';


var ExpiredPasses = (props) => (
  <div className="profilePending">
    <li>
      Pass Start Date: {new Date(props.pass.period_start.slice(0, 10)).toDateString().slice(4)}
    </li>
    <li>
      Pass End Date: {new Date(props.pass.period_end.slice(0, 10)).toDateString().slice(4)}
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
         Restricted Gyms: No Restricted Gyms
       </li>
     }
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
  </div>
);



export default ExpiredPasses;
