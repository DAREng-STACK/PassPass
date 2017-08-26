import React from 'react';
import $ from 'jquery';
import PendingPasses from './PendingPasses.jsx';
import CurrentPasses from './CurrentPasses.jsx';
import ExpiredPasses from './ExpiredPasses.jsx';

class YourProfile extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      userId: this.props.profileData.id,
      allPasses: [],
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
  }

  updateMessageState(event) {
  	var newState = this.state;
  	newState[event.target.id] = event.target.value;
    this.setState(newState);
  }


  getAllPasses() {
    $.ajax({
      method: 'POST',
      url: '/passes/all',
      contentType: 'application/json',
      data: JSON.stringify({userId: this.state.userId}),
      success: function(allPasses) {
        // console.log(allPasses, "PENDINGDPASS")
        this.setState({allPasses: allPasses})
      }.bind(this),
      error: function(error) {
        console.log('error:', error);
      }
    });
    $.ajax({
      method: 'POST',
      url: '/passes/pending/seller',
      contentType: 'application/json',
      data: JSON.stringify({userId: this.state.userId}),
      success: function(pendingSellerData) {
          let i = 0;
          pendingSellerData.map((seller) => {
            this.state.allPasses[i].first_name = seller.first_name;
            this.state.allPasses[i].email = seller.email;
            i++;
          })
          this.setState({
            allPasses: this.state.allPasses
          })
          console.log(this.state.allPasses)
          for (var j = 0; j < this.state.allPasses.length; j++) {
            var pass = this.state.allPasses[j];
            if (pass.purchased === 'false') {
              this.state.pendingPasses.push(pass);
              this.setState({
                havePendingPasses: true
              })
            } else {
              var currentDate = new Date();
              var expirationDate = new Date(pass.period_end);
              console.log(currentDate, "current", expirationDate, "expirationDate")
              if (expirationDate > currentDate) {
                this.state.currentlyAvailablePasses.push(pass);
                this.setState({
                  haveCurrentlyAvailablePasses: true
                })
              } else {
                this.state.expiredPasses.push(pass);
                this.setState({
                  haveExpiredPasses: true
                })
              }
            }
          }
        }.bind(this),
          error: function(error) {
          console.log('error:', error);
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
        {/* <div className="profilePicture">PROFILE PICTURE MAYBE</div> */}
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
            <ul>
              {this.state.expiredPasses.map((pass, index) =>
                <ExpiredPasses
                  pass={pass}
                  key={index}
                />
              )}
            </ul>
          }
        </div>
        <ul className="profileList">
          <strong>Currently Available Passes</strong>
          {
            !this.state.haveCurrentlyAvailablePasses &&
              <li>
                You don't have any available passes.
              </li>
          }
          {
            this.state.haveCurrentlyAvailablePasses &&
            <ul>
              {this.state.currentlyAvailablePasses.map((pass, index) =>
                <CurrentPasses
                  pass={pass}
                  key={index}
                />
              )}
            </ul>

          }
        </ul>
        <div className="col-sm-6">
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
                    deletePendingPass={this.deletePendingPass.bind(this)}
                  />
                )}
              </ul>
          }
        </ul>
      </div>
      </div>
    )
  }
}

export default YourProfile;
