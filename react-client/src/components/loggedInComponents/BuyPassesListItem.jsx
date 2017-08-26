import React from 'react';
import Checkout from './Checkout.jsx'

const BuyPassesListItem = (props) => {
	var restricted;
	// let boundClick = this.{props.addToPending}.bind(this, {props.forSaleBlock});
	if (props.forSaleBlock.studios && props.forSaleBlock.studios !== 'none') {
		restricted = <div className="buyPassesListItemInfo">
									<b>No Passes Available For:</b><div className="restrict">{props.forSaleBlock.studios.replace(',', ', ')}</div>
									</div>
	} else {
		restricted = '';
	}
	return (
		<div className="buyPassesListItem" key={props.i}>
			<div className="row">
				<div className="col-sm">
					<div className="buyPassesListItemInfo"><b>Seller:</b><div className="buyPassesListItemInfoContent">{props.forSaleBlock.first_name}</div></div>
					<div className="buyPassesListItemInfo"><b>Email:</b><div className="buyPassesListItemInfoContent"><a href={`mailto:${props.forSaleBlock.email}`}>{props.forSaleBlock.email}</a></div></div>
				</div>
				<div className="col-sm">
					<div className="buyPassesListItemInfo"><b>Sale Period:</b><div className="buyPassesListItemInfoContent">{new Date(props.forSaleBlock.period_start.slice(0, 10)).toDateString().slice(4) + ' through ' + new Date(props.forSaleBlock.period_end.slice(0, 10)).toDateString().slice(4)}</div></div>
					{restricted}
				</div>
				<input type="submit" value="Add to Pending" className="addToPendingButton" onClick={props.addToPending.bind(this, props.forSaleBlock)}/>
			</div>
			<div className="row">
				<div className="col-sm">
					<div className="buyPassesListItemInfo"><b>Passes Available:</b><div className="buyPassesListItemInfoContent">{props.forSaleBlock.pass_volume - props.forSaleBlock.passes_sold}</div></div>
					<div className="buyPassesListItemInfo"><b>Pass Price:</b><div className="buyPassesListItemInfoContent">${props.forSaleBlock.current_price.toFixed(2)}</div></div>
			</div>
				<div className="col-sm">
				</div>
			</div>
		</div>
	);
};

export default BuyPassesListItem;
