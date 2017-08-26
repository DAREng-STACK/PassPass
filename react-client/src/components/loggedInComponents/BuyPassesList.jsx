import React from 'react';
import $ from 'jquery';
import BuyPassesListItem from './BuyPassesListItem.jsx';

class BuyPassesList extends React.Component {
	constructor(props) {
    super(props);
    this.state = {};
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
    			<BuyPassesListItem addToPending={this.props.addToPending} forSaleBlock={forSaleBlock} key={key}/>
    		))}
    	</div>
    );
  }
}



export default BuyPassesList;
