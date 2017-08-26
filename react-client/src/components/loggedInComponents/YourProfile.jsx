import React from 'react';
import $ from 'jquery';
import PendingPasses from './PendingPasses.jsx';

class YourProfile extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      userId: this.props.profileData.id,
      havePendingPasses: false,
      pendingPasses: [],
      haveCurrentlyAvailablePasses: false,
      currentlyAvailablePasses: [],
      haveExpiredPasses: false,
      expiredPasses: []
    };
  }

  componentWillMount () {
    this.getAllPasses();
  }

  deletePendingPass(pass) {
    $.ajax({
      method: 'POST',
      url: '/passes/delete',
      contentType: 'application/json',
      data: JSON.stringify({id: pass.id}),
      success: function(results) {
				console.log(results, 'SUCCESS');
      },
      error: function(xhr, error) {
        console.log('error:', error);
      }
    });
    console.log(pass)
  }



  getAllPasses() {
    $.ajax({
      method: 'POST',
      url: '/passes/all',
      contentType: 'application/json',
      data: JSON.stringify({userId: this.state.userId}),
      success: function(pendingPasses) {
        console.log(pendingPasses, "PENDINGDPASSES")
				if (pendingPasses.length === 0) {
        } else {
          this.setState({havePendingPasses: true, pendingPasses: pendingPasses})
        }
      }.bind(this),
      error: function(xhr, error) {
        console.log('error:', error);
      }
    });
    $.ajax({
      method: 'POST',
      url: '/passes/pending/seller',
      contentType: 'application/json',
      data: JSON.stringify({userId: this.state.userId}),
      success: function(pendingSellerData) {
        if (pendingSellerData.length === 0) {
          console.log(pendingSellerData, 'NULLLL')
        } else {
          let i = 0;
            pendingSellerData.map((seller) => {
              this.state.pendingPasses[i].first_name = seller.first_name;
              this.state.pendingPasses[i].email = seller.email;
              i++
            })
            this.setState({
              pendingPasses: this.state.pendingPasses
            })
          }
        }.bind(this),
          error: function(error) {
          console.log('error:', error);
        }
    });
  }



  render() {
    return (
      <div className="about" >
        <br></br>
        <div className="profilePicture">PROFILE PICTURE MAYBE</div>
        <h2 className="profileHeader">
          Welcome to PassPass, {this.props.profileData.first_name}!
        </h2>
        <br></br>
      <div className="profileList">
          <strong>Expired Passes</strong>
          {
            !this.state.haveExpiredPasses &&
              <li>
                You don't have any expired passes!
              </li>
          }
          {
            this.state.haveExpiredPasses &&
              <li>
                You have expired passes.
              </li>
          }
        </div>
        <ul className="profileList">
          <strong>Currently Available Passes</strong>
          {
            !this.state.haveAvailablePasses &&
              <li>
                You don't have any available passes.
              </li>
          }
          {
            this.state.haveAvailablePasses &&
              <li>
                You have available passes!
              </li>
          }
        </ul>
        <ul className="profileList">
          <strong>Pending Passes</strong>
          {
            !this.state.havePendingPasses &&
              <li>
                You don't have any pending passes.
              </li>
          }
          {
            this.state.havePendingPasses &&
              <ul>
                {this.state.pendingPasses.map((pass, index) =>
                  <PendingPasses deletePendingPass={this.deletePendingPass.bind(this)} pass={pass} key={index} />
                )}
              </ul>
          }
        </ul>
      </div>
    )
  }
}




export default YourProfile;
