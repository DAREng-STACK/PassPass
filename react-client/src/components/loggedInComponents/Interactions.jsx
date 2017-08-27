import React from 'react';

class Interactions extends React.Component {
	constructor(props) {
    super(props);
    this.state = {};
  }

  render () {
    return (
      <div className="interactionsRow">
        <div className="interactionsContainer">
          <div>
            <small>Welcome To PassPass!</small>
          </div>
          <br></br>
          <button className="searchButton btn btn-md btn-primary btn-block" onClick={() => {this.props.pageChange('buy')}} >BUY PASSES</button>
          <br></br>
          <button className="searchButton btn btn-md btn-primary btn-block" onClick={() => {this.props.pageChange('sell')}} >SELL PASSES</button>
        </div>
      </div>
    )
  }
}

export default Interactions;
