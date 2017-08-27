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
      expiredPasses: [],
      restrictedStudios: []
    };
  }

  componentWillMount () {
    this.getAllPasses();
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
        this.setState({allPasses: allPasses})
      }.bind(this),
      error: function(error) {
        console.log('error:', error);
      }
    });
    $.ajax({
      method: 'POST',
      url: '/passes/restricted',
      contentType: 'application/json',
      data: JSON.stringify({userId: this.state.userId}),
      success: function(restrictedStudios) {
        this.setState({
          restrictedStudios: restrictedStudios
        })
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
            this.state.allPasses[i].restrictedStudios = [];
            i++;
          })
          this.setState({
            allPasses: this.state.allPasses
          })
          var passes = this.state.allPasses;
          for (var t = 0; t < passes.length; t++) {
            for (var e = 0; e < this.state.restrictedStudios.length; e++) {
              if (passes[t].id === this.state.restrictedStudios[e].for_sale_block_id) {
                passes[t].restrictedStudios.push(this.state.restrictedStudios[e].studio);
              }
            }
          }
          this.setState({
            allPasses: passes
          })
          var tempPending = [];
          var tempCurrAvail = [];
          var tempExp = [];
          for (var j = 0; j < this.state.allPasses.length; j++) {
            var pass = this.state.allPasses[j];
            if (pass.purchased === 'false') {
              tempPending.push(pass);
              this.setState({
                havePendingPasses: true
              })
            } else {
              var currentDate = new Date();
              var expirationDate = new Date(pass.period_end);
              if (expirationDate > currentDate) {
                tempCurrAvail.push(pass);
                this.setState({
                  haveCurrentlyAvailablePasses: true
                })
              } else {
                tempExp.push(pass);
                this.setState({
                  haveExpiredPasses: true
                })
              }
            }
          }
          this.setState({
            pendingPasses: tempPending,
            currentlyAvailablePasses: tempCurrAvail,
            expiredPasses: tempExp
          })
        }.bind(this),
          error: function(error) {
          console.log('error:', error);
        }
    });
  }

  deletePendingPass(pass) {
    let context = this;
    $.ajax({
      method: 'POST',
      url: '/passes/delete',
      contentType: 'application/json',
      data: JSON.stringify({id: pass.id, userId: this.state.userId}),
      success: function(results) {
        var newPending = context.state.pendingPasses.filter(function(pass1){
          return pass1.id !== pass.id
        });
        context.setState({pendingPasses: newPending})
        if (context.state.pendingPasses.length === 0) {
          context.setState({
            havePendingPasses: false
          })
        }
      },
      error: function(error) {
        throw error;
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
        <h2 className="profileHeader">
          Welcome to PassPass, {this.props.profileData.first_name}!
        </h2>
        <div className="container-fluid" >
          <div className="col-sm-6">
            <div className='pendingcont'>
              <div className='conttitle'>
                <strong>Pending Passes</strong>
              </div>
              <ul className="profileList">
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


          <div className="col-sm-3">
            <div className="pendingcont">
              <div className="conttitle">
                <strong>Currently Available Passes</strong>
              </div>
              <ul className="profileList">
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
            </div>
          </div>

          <div className="col-sm-3">
            <div className="pendingcont">
              <div className="conttitle">
                <strong>Expired Passes</strong>
              </div>
              <ul className="profileList">
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
              </ul>
            </div>
          </div>
        </div>

      </div>
    )
  }
}

export default YourProfile;
