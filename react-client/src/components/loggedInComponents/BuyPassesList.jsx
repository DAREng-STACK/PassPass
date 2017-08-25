import React from 'react';
import $ from 'jquery';
import BuyPassesListItem from './BuyPassesListItem.jsx';

class BuyPassesList extends React.Component {
	constructor(props) {
    super(props);
    this.state = {
			// forSaleBlocks = [];
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
		if (pass.pass_volume - decrementPasses > 0) {

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

		} else {
			//delete this pass from available for sale
			console.log(pass, 'NOW THERE ARE NO PASSES!')
		}

	}

  render() {
    var heading = <h2></h2>;
    if (this.props.forSaleBlocks) {
      if (this.props.forSaleBlocks.length > 0 && this.props.searchState) {
        heading = <h2 className="col">Passes Available For Sale</h2>;
      } else if (this.props.searchState) {
        heading = <h2 className="col">No Results from Your Search. Please Try Again.</h2>
      }
    }

    return (<div className="buyPassesList container">
        <div className="row searchRow">
          {heading}
        </div>
    		{this.props.forSaleBlocks.map((forSaleBlock, key) => (
    			<BuyPassesListItem addToPending={this.addToPending.bind(this)} forSaleBlock={forSaleBlock} key={key}/>
    		))}
    	</div>
    );
  }
}



export default BuyPassesList;
