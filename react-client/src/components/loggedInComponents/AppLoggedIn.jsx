import React from 'react';
import $ from 'jquery';
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch,
  Link
} from 'react-router-dom';
import Interactions from './Interactions.jsx';
import BuyPasses from './BuyPasses.jsx';
import SellPasses from './SellPasses.jsx';
import AboutPassPass from './AboutPassPass.jsx';
import YourProfile from './YourProfile.jsx';
import AppLoggedOut from '../loggedOutComponents/AppLoggedOut.jsx';


class AppLoggedIn extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 'home'
    };
  }

  pageChange(newPage) {
    this.setState({
      page: newPage
    });
  }

  render () {
    return (
      <Router>
        <div>
          <nav className="navbar navbar-toggleable-md navbar-light bg-faded fixed-top">
            <button className="navbar-toggler navbar-toggler-right collapsed"
                    type="button"
                    data-toggle="collapse"
                    data-target="#navbarSupportedContent"
                    aria-controls="navbarSupportedContent"
                    aria-expanded="false"
                    aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>
            <h1>
              <a onClick={() => {this.pageChange('home')}}>
                <Link to="/interactions" className="navbar-brand">PassPass</Link>
              </a>
            </h1>
            &emsp;&emsp;&emsp;
            <div className="collapse navbar-collapse" id="navbarSupportedContent">
              <ul className="navbar-nav mr-auto">
                <li className="nav-item">
                  <Link to="/aboutpasspass" className="nav-link">About PassPass</Link>
                </li>
                <li className="nav-item">
                  <Link to="/buypasses" className="nav-link">Buy Passes</Link>
                </li>
                <li className="nav-item">
                  <Link to="/sellpasses" className="nav-link">Sell Passes</Link>
                </li>
                <li className="nav-item">
                  <Link to="/yourprofile" className="nav-link">Your Profile</Link>
                </li>
                <li className="nav-item" onClick={this.props.logout}>
                  <Link to="/" className="nav-link" >Log Out</Link>
                </li>
              </ul>
            </div>
          </nav>
          <div>
            <Switch>
            <Route exact path="/interactions" render={() => {
                if (this.props.authenicated && this.state.page === 'home') {
                  return <Interactions authenicated={this.props.authenicated} pageChange={this.pageChange.bind(this)}/>
                } else if (this.props.authenicated && this.state.page === 'buy') {
                  return <Redirect to="/buypasses" />
                } else if (this.props.authenicated && this.state.page === 'sell') {
                  return <Redirect to="/sellpasses" />
                } else {
                  return <AppLoggedOut />
                }
              }
            }/>
            <Route path="/buypasses" render={() => (
                this.props.authenicated ? (
                  <BuyPasses authenicated={this.props.authenicated} profileData={this.props.profileData}/>
                ) : (
                  <AppLoggedOut />
                )
              )}
            />
            <Route path="/sellpasses" render={() => (
                this.props.authenicated ? (
                  <SellPasses authenicated={this.props.authenicated}/>
                ) : (
                  <AppLoggedOut />
                )
              )}
            />
            <Route path="/aboutpasspass" render={() => (
                this.props.authenicated ? (
                  <AboutPassPass authenicated={this.props.authenticated}/>
                ) : (
                  <AppLoggedOut />
                )
              )}
            />
            <Route path="/yourprofile" render={() => (
                this.props.authenicated ? (
                  <YourProfile authenicated={this.props.authenticated} profileData={this.props.profileData}/>
                ) : (
                  <AppLoggedOut />
                )
              )}
            />
          </Switch>
          </div>
        </div>
      </Router>
    )
  }
}

export default AppLoggedIn;

// <li className="nav-item active">
//   <Link to="/interactions">Interactions</Link>
// </li>

// <Route exact path="/interactions" component={Interactions}/>
