var db = require('../../database/index.js')
var stripe = require('stripe')(
  "sk_test_J9JR0cXKMJL61WGB8O0CWgfG"
);

module.exports.createTransferToPassPass = (data, callback) => {
  console.log(data, '234234');
  var amount = data.amount * 100;

  db.getMerchantAcctNum(data.email, (err, res) => {
    console.log(res)
    if(err){
      callback(err, null)
    }else{
      stripe.charges.create({
        amount: amount,
        currency: "usd",
        source: data.source,
        destination: {
          amount: amount,
          account: res,
        },
        transfer_group: '' + data.passId + ''
      }, function (err, res) {
        if(err){
          callback(err, null)
        }else{
          callback(null, res)
        }
      })

    }
    // .then(
    //   function (charge) {
    //     console.log(charge.destination, 'promise activates')
    //     stripe.transfers.create ( {
    //       amount: amount,
    //       currency: "usd",
    //       destination: charge.destination,
    //
    //     }, function (err, transfer) {
    //       if(err) {
    //         callback(err, null);
    //       }
    //       callback(null, transfer);
    //     });
    //   })
    //
    // })

  })


}


// module.exports.getTransactions = (userId) => {
//   stripe.accounts.retreive(userId, (err, account) => {
//
//   })
// }
