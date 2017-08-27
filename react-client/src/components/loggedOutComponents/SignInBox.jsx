import React from 'react';
import $ from 'jquery';
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Link
} from 'react-router-dom';
// import Redirect from 'react-router';
import SignUpBox from './SignUpBox.jsx';


class SignInBox extends React.Component {
	constructor(props) {
    super(props);
    this.state = {
    	inputEmail: '',
    	inputPassword: '',
      rememberMe: false
    };
  }

  handleChange(event) {
  	var newState = {};
  	newState[event.target.id] = event.target.value;
  	this.setState(newState);
  }

  handleCheckbox(event) {
    this.setState({rememberMe: !this.state.rememberMe});
  }

  handleSignIn (event) {
    var context = this;
    event.preventDefault();
  	$.ajax({
		  method: 'POST',
		  url: '/auth/email',
		  contentType: 'application/JSON',
		  data: JSON.stringify({
		  	email: this.state.inputEmail,
		  	password: this.state.inputPassword,
        rememberMe: this.state.rememberMe
		  }),
		  success: function (data) {
        if (data.message) {
          console.log(data.message, 'data message');
          //push this error message to a popup with more appropriate wording/display
          window.alert(data.message);
        } else {
          console.log('successful login ', data[0]);
          let userData = data[0];
          context.props.getProfileData(userData);
          context.props.login();
        }
		  },
      error: function(err) {
        console.log('********** sign in error ', err);
      }
		});
  }

  // ADD BACK IN FOR AUTHENTICATION
  // fbSignIn (event) {
  //   var context = this;
  //   event.preventDefault();
  // 	$.ajax({
	// 	  method: 'GET',
	// 	  url: '/auth/facebook',
	// 	  contentType: 'application/JSON',
	// 	  success: function (data) {
  //       if (data.message) {
  //         console.log(data.message);
  //         //push this error message to a popup with more appropriate wording/display
  //       } else {
  //         console.log('successful fb login ', data[0]);
  //         context.props.login();
  //       }
	// 	  },
  //     error: function(err) {
  //       console.log('********** fb sign in error ', err);
  //     }
	// 	});
  // }

  render () {
    return (
      <Router>
        <div className="signInContainerRow">
          <div className="signInContainer">
            <small>The Marketplace for ClassPass Classes</small>
            <br></br>
            <form className="form-signin" onSubmit={this.handleSignIn.bind(this)}>
              <br></br>
            	<label htmlFor="inputEmail" className="sr-only">Email address</label>
            	<input onChange={this.handleChange.bind(this)} type="email" id="inputEmail" className="form-control" placeholder="Email address" required autoFocus/>
            	<label htmlFor="inputPassword" className="sr-only">Password</label>
            	<input onChange={this.handleChange.bind(this)} type="password" id="inputPassword" className="form-control" placeholder="Password" required/>
            <br></br>
            <div className="checkbox">
            		<label>
            			<input type="checkbox" id="remember-me" checked={this.state.rememberMe} onChange={this.handleCheckbox.bind(this)} /> Remember me
            		</label>
            	</div>
            	<button className="searchButton btn btn-md btn-primary btn-block" type="submit">Sign in</button>
              <br></br>
              <div>
                New User? <a href="#" onClick={this.props.signUpChange}>Sign Up</a>
              </div>
            </form>
          </div>
        </div>
      </Router>
    )
  }
}

export default SignInBox;

// ADD BACK IN FOR AUTHENTICATION
// <br></br>
// <button onClick={this.fbSignIn.bind(this)} className="fbButton btn btn-md btn-primary btn-block" type="submit">Login with Facebook</button>
// <br></br>Or Login with Email:
