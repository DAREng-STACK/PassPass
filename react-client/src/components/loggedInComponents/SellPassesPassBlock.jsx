import React from 'react';
import $ from 'jquery';

class SellPassesPassBlock extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      active: false,
      pass_volume: this.props.BlockData.pass_volume,
      passes_sold: this.props.BlockData.passes_sold,
      current_price: this.props.BlockData.current_price,
      current_start: this.formatDateForYYYMMDDOutPut(this.props.BlockData.period_start),
      current_end: this.formatDateForYYYMMDDOutPut(this.props.BlockData.period_end),
      excluded: this.props.BlockData.exclusions ? this.props.BlockData.exclusions.replace(/,/i, ', ') : null,
      current_block_id: this.props.BlockData.id,
      last_state: {},
      addSaleAddRestricted: '',
      addSaleRestrictedSelect: this.props.BlockData.exclusions ? this.props.BlockData.exclusions.split(',') : [],
      existingRestricted: []
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleChangeSelect = this.handleChangeSelect.bind(this);
    this.getRestricted = this.getRestricted.bind(this);
    this.addRestricted = this.addRestricted.bind(this);
  }

  componentDidMount() {
    this.getRestricted();
  }

  //FORMAT DATES
  cleanDates (data) {
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var splitData = (data.split('-'));
    var year = splitData[0];
    var month = months[parseInt(splitData[1] - 1)];
    var day = splitData[2].substring(0, 2);
    return [day, ' ', month, ' ', year];
  }

  formatDateForYYYMMDDOutPut(rawDate) {
    var cutDate = rawDate.split('T');
    return cutDate[0];
  };

  //FORMAT NULL EXCLUSIONS
  commentary(data) {
    if (data === null) {
      return 'No Exclusions';
    } else {
      return data;
    }
  }

  uncommentForSQL(data) {
    if(data.length === 0) {
      return null;
    }
  }

  //FORMAT PRICE TO USD FORMAT
  dollars(num) {
    if(this.state.active === false) {
    return (num).toFixed(2);
    } else {
      return num;
    }
  }

  //ON EDIT POST BUTTON CLICK
  editPost() {
    if (this.state.active === false) {
      this.setState({active: true});
    } else {
      this.setState({active: false});
    }
    this.state.last_state = this.state;
  }

  addPass() {
    this.setState({pass_volume: this.state.pass_volume + 1});
  }

  subtractPass() {
    if(this.state.pass_volume > 0) {
      this.setState({pass_volume: this.state.pass_volume - 1});
    }
  }

  addPassSold() {
    this.setState({passes_sold: this.state.passes_sold + 1});
  }

  subtractPassSold() {
    if(this.state.passes_sold > 0) {
      this.setState({passes_sold: this.state.passes_sold - 1});
    }
  }

  cleanUpPriceInput(priceString) {
    return parseFloat(priceString);
  }

  infoChanged () {
    var that = this;
    $.ajax({
      method: 'POST',
      url: '/pass/edit',
      contentType: 'application/json',
      data: JSON.stringify(that.state),
      context: this,
      success: function(res) {
        console.log('SUCCESS!!!! RES = ', res);
      },
      error: function(err) { console.log('INFOCHANGED FUNCTION FOR SELLPASSES FAILED', err); }
    });
  }

  //UPON SAVE DATA CLICK
  saveNewBlockData() {
    this.editPost();
    this.state.last_state = {};
    this.infoChanged();
  }

  notSavingData() {
    this.state = this.state.last_state;
    this.setState({active: false});
  }

  handleChangeExclusions(event) {
    this.setState({excluded: event.target.value});
  }

  handleChangePrice(event) {
    this.setState({current_price: parseFloat(event.target.value)});
  }

  handleChangeStart(event) {
    this.setState({current_start: event.target.value});
  }

  handleChangeEnd(event) {
    this.setState({current_end: event.target.value});
  }

  handleChange(event) {
    var newState = {};
    newState[event.target.id] = event.target.value;
    this.setState(newState);
  }

  handleChangeSelect(event) {
    const selected = [...event.target.options].filter(option => option.selected).map(option => option.value);
    this.setState({
      addSaleRestrictedSelect: selected,
      excluded: selected.length > 0 ? selected.join(', ') : null,
    });
  }

  getRestricted() {
    $.ajax({
      url: '/user/restricted',
      method: 'GET',
      context: this,
      success: (data) => {
        console.log('GET /user/restricted SUCCEEDED');
        this.setState({
          existingRestricted: data
        });
      },
      error: (err) => {
        console.log('GET /user/restricted FAILED');
      }
    });
  }

  addRestricted() {
    if (this.state.existingRestricted.map(({ studio }) => studio.toLowerCase()).includes(this.state.addSaleAddRestricted.toLowerCase())) {
      console.warn('Studio name already exists');
    } else {
      $.ajax({
        url: '/user/restricted',
        method: 'POST',
        data: JSON.stringify({studio: this.state.addSaleAddRestricted}),
        contentType: 'application/json',
        context: this,
        success: (data) => {
          console.log('POST /user/restricted SUCCEEDED');
          this.setState({addSaleAddRestricted: ''});
          this.getRestricted();
        },
        error: (err) => {
          console.log('POST /user/restricted FAILED: ', err);
        }
      });
    }
  }

  render() {
    if (this.state.active === false) {
      return (
        <div className="sellPassesPassBlock">
          <div className="row">
            <div className="col-sm">
              <div className="sellPassesPassBlockInfo">
                <b>Passes Available:</b>
                <div className="sellPassesPassBlockInfoContent">{this.state.pass_volume}</div>
              </div>
              <div className="sellPassesPassBlockInfo">
                <b>Pass Price:</b>
                <div className="sellPassesPassBlockInfoContent">${this.dollars(this.state.current_price)}</div>
              </div>
            </div>
            <div className="col-sm">
              <div className="sellPassesPassBlockInfo">
                <b>Sale Period:</b>
                <div className="sellPassesPassBlockInfoContent">{new Date(this.state.current_start.slice(0, 10)).toDateString().slice(4) + ' through ' + new Date(this.state.current_end.slice(0, 10)).toDateString().slice(4)}</div>
              </div>
              <div className="sellPassesPassBlockInfo">
                <b>Restricted Studios:</b>
                <div className="restrict">{this.commentary(this.state.excluded)}</div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-sm-9" > </div>
            <div className="col-sm-3">
              <button className="editSaleButton btn btn-md btn-primary btn-block" type="button" onClick={this.editPost.bind(this)}>Edit This Post</button>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="sellPassesAddSale">
          <div className="row addSaleRow"><h2 className="col">Edit A group Of Passes You Are Selling</h2></div>
          <div className="row addSaleRow"><h4 className="col">Remember To Edit Passes That You Offer When You Make A Sale</h4></div>
          <div className="row addSaleRow">
            <div className="addSaleSearchInput col-sm">
              <label htmlFor="addSaleDateStart">Sell passes starting on:</label>
              <input
                type="date"
                className="form-control"
                id="addSaleDateStart"
                placeholder="Start Date"
                value={this.formatDateForYYYMMDDOutPut(this.state.current_start)}
                onChange={this.handleChangeStart.bind(this)}
                required />
            </div>
            <div className="addSaleSearchInput col-sm">
              <label htmlFor="addSaleDateEnd">These passes are available until:</label>
              <input
                type="date"
                className="form-control"
                id="addSaleDateEnd"
                placeholder="End Date"
                value={this.formatDateForYYYMMDDOutPut(this.state.current_end)}
                onChange={this.handleChangeEnd.bind(this)}
                required />
            </div>
          </div>
          <div className="row addSaleRow">
            <div className="addSaleSearchInput col-sm">
              <label htmlFor="addSalePrice">Price Per Pass ($):</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                id="addSalePrice"
                placeholder="e.g. 6.50"
                min="0"
                value={this.dollars(this.state.current_price)}
                onChange={this.handleChangePrice.bind(this)}/>
            </div>
            <div className="addSaleSearchInput col-sm">
                    <label htmlFor="addSaleQuantity">Number of Passes:</label>
              <div className="input-group">
               <span className = "input-group-addon">
                <button type="button" onClick={this.addPass.bind(this)}>+</button>
               </span>
                <input
                  type="text"
                  className="form-control"
                  id="addSaleQuantity"
                  className="form-control"
                  value = {this.state.pass_volume}/>
                  <span className = "input-group-addon">
                    <button type="button" onClick={this.subtractPass.bind(this)}>-</button>
                  </span>
              </div>
            </div>
          </div>
          <div className="row addSaleRow">
            <div className="addSaleSearchInput col-sm">
              <label htmlFor="addSaleRestrictedSelect">Restricted Studios:</label>
              <select multiple className="form-control" id="addSaleRestrictedSelect" value={this.state.addSaleRestrictedSelect} onChange={this.handleChangeSelect}>
                {this.state.existingRestricted.map((item) =>
                  <option key={item.studio} value={item.studio}>{item.studio}</option>
                )}
              </select>
            </div>
            <div className="addSaleSearchInput col-sm">
              <label htmlFor="addSaleAddRestricted">Add New Restricted Studio:</label>
              <input type="text" className="form-control" id="addSaleAddRestricted" placeholder="Type name of studio" value={this.state.addSaleAddRestricted} onChange={this.handleChange} />
              <button className="addStudio btn btn-md btn-info btn-block" onClick={this.addRestricted}>Add Studio</button>
            </div>
          </div>
          <div className="row addSaleRow">
            <div className="addSaleSearchInput col-sm">
              <button className="postSaleButton btn btn-md btn-success btn-block" onClick={this.saveNewBlockData.bind(this)}>Save Changes</button>
            </div>
            <div className="addSaleSearchInput col-sm">
              <button className="cancelSaleButton btn btn-md btn-danger btn-block" onClick={this.notSavingData.bind(this)}>Cancel</button>
            </div>
          </div>
        </div>
      );
    }
  }
}

export default SellPassesPassBlock;
