import React from 'react';
import $ from 'jquery';
import BuyPassesList from './BuyPassesList.jsx';
import BuyPassesSearch from './BuyPassesSearch.jsx';

class BuyPasses extends React.Component {
	constructor(props) {
    super(props);
    this.state = {
      forSaleBlocks: [],
      search: false
    };
  }


  updateForSaleBlocks(forSaleBlocks) {
    var newState = Object.assign({}, this.state);
    newState.forSaleBlocks = forSaleBlocks;
    newState.search = true;
    this.setState(newState);
  }

  handleSearch(searchQueries) {
    var context = this;
    $.ajax({
      method: 'POST',
      url: '/pass/buyer/search',
      contentType: 'application/json',
      data: JSON.stringify({searchQueries: searchQueries}),
      success: function(forSaleBlocks) {
        context.updateForSaleBlocks(forSaleBlocks);
				console.log(forSaleBlocks, 'forSaleBlocks')
      },
      error: function(xhr, error) {
        console.log('error:', error);
      }
    });
  }

  componentDidMount() {
    // this.handleSearch({});
  }

  render () {
    return (
      <div className="buyPasses">
        <BuyPassesSearch handleSearch={this.handleSearch.bind(this)}/>
			<BuyPassesList profileData={this.props.profileData} forSaleBlocks={this.state.forSaleBlocks} searchState={this.state.search}/>
      </div>
    )
  }
}

export default BuyPasses;
