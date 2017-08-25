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


	addToPending (pass) {
		$.ajax({
			method: 'POST',
			url: '/passes/pending/add',
			contentType: 'application/json',
			data: JSON.stringify({pass: pass, profileData: this.props.profileData}),
			success: function(result) {
				console.log(result, 'POST SUCCESS');
			},
			error: function(xhr, error) {
				console.log('error:', error);
			}
		});

		let decrementPasses = pass.passes_sold + 1;
		$.ajax({
			method: 'POST',
			url: '/passes/pending/change',
			contentType: 'application/json',
			data: JSON.stringify({pass: decrementPasses, id: pass.id}),
			success: function(result) {
				console.log(result, 'POST SUCCESS');
			},
			error: function(xhr, error) {
				console.log('error:', error);
			}
		});
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
      },
      error: function(xhr, error) {
        console.log('error:', error);
      }
    });
  }



  render () {
    return (
      <div className="buyPasses">
        <BuyPassesSearch handleSearch={this.handleSearch.bind(this)}/>
<<<<<<< aa379c85a1f14dea9d486b2ed78a3ab143204559
			  <BuyPassesList profileData={this.props.profileData} forSaleBlocks={this.state.forSaleBlocks} searchState={this.state.search}/>
=======
			<BuyPassesList addToPending={this.addToPending.bind(this)} profileData={this.props.profileData} forSaleBlocks={this.state.forSaleBlocks} searchState={this.state.search}/>
>>>>>>> passes with no more availability are removed from Passes Available for Sale
      </div>
    )
  }
}

export default BuyPasses;
