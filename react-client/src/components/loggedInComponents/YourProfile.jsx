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
      haveAvailablePasses: false,
      availablePasses: [],
      haveExpiredPasses: false,
      expiredPasses: []
    }
  }

  componentWillMount () {
    this.getPendingPasses();
    this.getAvailablePasses();
    this.getExpiredPasses();
  }

  updateMessageState(event) {
  	var newState = this.state;
  	newState[event.target.id] = event.target.value;
    this.setState(newState);
  }

  getPendingPasses() {
    var context = this;
    $.ajax({
      method: 'POST',
      url: '/passes/pending',
      contentType: 'application/json',
      data: JSON.stringify({userId: this.state.userId}),
      success: function(pendingPasses) {
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
          console.log(pendingSellerData, 'CONSOLELOG')
            let i = 0;
            pendingSellerData.map((seller) => {
              this.state.pendingPasses[i].first_name = seller.first_name;
              this.state.pendingPasses[i].email = seller.email;
              i++
            })
            this.setState({
              pendingPasses: this.state.pendingPasses
            })
            console.log(this.state.pendingPasses, 'DID IT WORK??')
          }
        }.bind(this),
          error: function(error) {
          console.log('error:', error);
        }
    });
  }

  getAvailablePasses() {
    $.ajax({
      method: 'POST',
      url: '/passes/available',
      contentType: 'application/json',
      data: JSON.stringify({userId: this.state.userId}),
      success: function(availablePasses) {
        if (availablePasses.length === 0) {
          console.log(availablePasses, '@@@@@@@ NO AVAILABLE');
        } else {
          this.setState({haveAvailablePasses: true})
        }
      }.bind(this),
      error: function(err) {
        console.log(err, '###### ERROR')
      }
    });
  }

  getExpiredPasses() {
    $.ajax({
      method: 'POST',
      url: '/passes/expired',
      contentType: 'application/json',
      data: JSON.stringify({userId: this.state.userId}),
      success: function(expiredPasses) {
        if (expiredPasses.length === 0) {
          console.log(expiredPasses, '@@@@@@@ NO EXPIRED');
        } else {
          console.log(expiredPasses, '@@@@@@@ YES EXPIRED');
          this.setState({haveExpiredPasses: true})
        }
      }.bind(this),
      error: function(err) {
        console.log(err, '####### ERROR');
      }
    });
  }
  

  postChatMessage (event, email) {
    event.preventDefault();
    let message = {
      msgBody: this.state.inputMessage,
      msgTo: email 
    }
    $.ajax({
      method: 'POST',
      url: '/chat',
      contentType: 'application/json',
      data: JSON.stringify(message),
      success: function(resolve) {
        //resolve sends back: 'yay! your message has been sent to the seller!'
        //console.log('resolve from server ', resolve);
        //call back to client for success
          //little checkmark or animation to relay success
      },
      error: function(reject) {
        console.log('error:', reject);
        //graceful error handling needed
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
                  <PendingPasses
                    pass={pass}
                    key={index}
                    post={this.postChatMessage.bind(this)}
                    update={this.updateMessageState.bind(this)}
                  />
                )}
              </ul>
          }
        </ul>
        <div className="profileQuote">
          Workout Quote
        </div>
      </div>
    )
  }
}

export default YourProfile;
