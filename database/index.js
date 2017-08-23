var mysql      = require('mysql');

module.exports.connection = mysql.createConnection(
  process.env.JAWSDB_URL ||
  {
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'pass_database'
  }
);

var del = module.exports.connection._protocol._delegateError;

module.exports.connection.connect(
  function (err) {
    if (err) { console.log(err)
  } else {
    console.log('DATABASE CONNECTED')
  }
});

module.exports.connection._protocol._delegateError = function(err, sequence) {
  if (err.fatal) {
    console.trace('fatal error: ' + err.message);
  }
  return del.call(this, err, sequence);
};

module.exports.findUser = function(user, callback) {
  var values = [user];
  module.exports.connection.query('SELECT * FROM users WHERE email= ?', values, (error, results, fields) => {
      if (error || !results) {
        console.log('*********** database find user by email error ', error);
        callback(error);
      }
      if (results.length > 0) {
        callback(null, results);
      } else {
        console.log('*********** database find user by email success but no match ', results);
        callback(null, results);
      }
    }
  );
};

module.exports.findUserById = function(id, callback) {
  module.exports.connection.query('SELECT * FROM users WHERE id=' + id, (error, results, fields) => {
      if (error || !results) {
        console.log('*********** database find user by ID error ', error);
        callback(error);
      }
      if (results.length > 0) {
        callback(null, results);
      } else {
        console.log('*********** database find user by ID success but no match ', results);
        callback(null, results);
      }
    }
  );
};

module.exports.authUser = function(user, callback) {
  var values = [user.email, user.password + user.salt];
  module.exports.connection.query('SELECT * FROM users WHERE email= ? AND password=SHA2( ? , 0)',
    values, function (error, results, fields) {
      if (error || !results) {
        console.log('*********** database authenicate user email error ', error);
        callback(error);
      }
      if (results.length > 0) {
        callback(null, results);
      } else {
        console.log('*********** database authenicate user email success but no match ', results);
        callback(null, results);
      }
    }
  );
};

module.exports.newUser = function(user, callback) {
  var values = [user.email, user.password + user.salt, user.salt, user.first_name, user.last_name, user.phone];
  module.exports.connection.query('INSERT INTO users (email, password, salt, first_name, last_name, phone) ' +
    'VALUES (?, SHA2(?, 0), ?, ?, ?, ?)', values, function(error, results, fields) {
      if (error) {
        console.log('*********** database add new user error ', error);
        callback(error);
      }
      if (results) {
        callback(null, results);
      }
    }
  );
};

// add back in for facebook authentication
// module.exports.findOrCreateUser = function (user, callback) {
//   //user = {email: profile.emails[0].value, first_name: profile.displayName.split(' ')[0], fb_id: profile.id, fb_accessToken: accessToken, fb_accessToken_New: refreshToken}
//   module.exports.findUser(user.email, (err, results) => {
//     if (err) {
//       console.log('*********** database findOrCreateUser error in findUser ', err);
//       callback(err);
//     }
//     if (results.length > 0) {
//       callback(null, results);
//     } else {
//       console.log('*********** database findOrCreateUser in findUser success but no match so will Create ');
//       //create user
//       //var values = [user.email, user.password + user.salt, user.salt, user.first_name, user.last_name, user.phone];
//       module.exports.newUser(user); //need to update this query for additional fb_id param
//       //confirm info received from FB
//     }
//
//   });
// };

module.exports.addUserToSession = function(user, session, callback) {
  var values = [Number(user), session];
  module.exports.connection.query('UPDATE sessions SET user_id= ? WHERE session_id= ? ',
    values, function (error, results, fields) {
      if (error) {
        console.log('*********** database add user to session error ', error);
        throw error;
        callback(error);
      }
      if (results) {
        callback(null, results);
      }
    }
  );
};

module.exports.addSale = function(forSaleBlock, restrictedStudios, callback) {
  module.exports.connection.query('INSERT INTO for_sale_block SET ?', forSaleBlock, function(err, results) {
    const blockId = results.insertId;
    let error;
    if (restrictedStudios && !err) {
      module.exports.connection.query(`SELECT id FROM restricted_list WHERE user_id=${forSaleBlock.seller_id} AND studio IN ("${restrictedStudios.join('", "')}")`, function(err, results) {
        if (err) {
          callback(err, results);
        } else {
          const studios = results.map(({id}) => `(${blockId}, ${id})`).join(',');
          module.exports.connection.query(`INSERT INTO restricted_studios (block_id, exempt_studio_id) VALUES ${studios}`, function(err, results) {
            callback(err, results);
          });
        }
      });
    } else {
      callback(err, results);
    }
  });
};

module.exports.getRestrictedStudios = function(user, callback) {
  module.exports.connection.query(`SELECT id, studio FROM restricted_list WHERE user_id=${user.id}`, function(err, results) {
    callback(err, results);
  });
};

module.exports.addRestrictedStudio = function(user, studio, callback) {
  module.exports.connection.query(`INSERT INTO restricted_list (studio, user_id) VALUES ("${studio}", ${user.id})`, function(err, results) {
    callback(err, results);
  });
};

module.exports.getForSaleBlocks = function(searchQueries, callback) {
  var queryString = 'SELECT users.email, users.first_name, ' +
                      'users.rating, for_sale_block.pass_volume, for_sale_block.passes_sold, ' +
                      'for_sale_block.current_price, for_sale_block.period_start, ' +
                      'for_sale_block.period_end, A.studios FROM users ' +
                    'INNER JOIN for_sale_block ON users.id = for_sale_block.seller_id ' +
                    'LEFT JOIN ' +
                      '(SELECT restricted_studios.block_id, ' +
                        'GROUP_CONCAT(restricted_list.studio SEPARATOR ",") AS studios FROM restricted_studios ' +
                      'INNER JOIN restricted_list ON restricted_studios.exempt_studio_id=restricted_list.id ' +
                      'GROUP BY restricted_studios.block_id) A ' +
                    'ON for_sale_block.id=A.block_id ' +
                    'WHERE users.id <> ' + searchQueries.ignoreUserId;
  for (var key in searchQueries) {
    if (key === 'priceInput' && searchQueries[key]) {
      queryString += ' AND for_sale_block.current_price < ' + searchQueries[key];
    } else if (key === 'dateRange' && searchQueries[key]) {
      var dates = searchQueries[key];
      var startDate = dates[0];
      var endDate = dates[1];
      queryString += ' AND ((for_sale_block.period_start between "' + startDate + '" and "' + endDate + '") OR (for_sale_block.period_end between "' + startDate + '" and "' + endDate + '") OR (for_sale_block.period_start <= "' + startDate + '" AND for_sale_block.period_end >= "' + endDate + '"))';
    } else if (key === 'passesCountInput' && searchQueries[key]) {
      queryString += ' AND for_sale_block.pass_volume - for_sale_block.passes_sold >= ' + searchQueries[key];
    } else if (key === 'gymInput' && searchQueries[key] && searchQueries[key].toLowerCase() !== 'none') {
      queryString += ' AND studios NOT LIKE "%' + searchQueries[key] + '%"';
    }
  }
  module.exports.connection.query(queryString, function(error, results, fields) {
    callback(error, results);
  });
};

module.exports.findAllFromCurrentUser = function(currentUserId, callback) {
  var queryString = `\
    SELECT users.email, users.first_name, for_sale_block.id, for_sale_block.pass_volume, \
      for_sale_block.passes_sold, for_sale_block.current_price, for_sale_block.period_start, \
      for_sale_block.period_end, A.exclusions \
    FROM users \
    INNER JOIN for_sale_block ON users.id = for_sale_block.seller_id \
    LEFT JOIN (SELECT restricted_studios.block_id, GROUP_CONCAT(restricted_list.studio SEPARATOR ",") \
      AS exclusions \
      FROM restricted_studios \
      INNER JOIN restricted_list ON restricted_studios.exempt_studio_id=restricted_list.id \
      GROUP BY restricted_studios.block_id) A ON for_sale_block.id=A.block_id \
    WHERE users.id=${currentUserId}`;
  module.exports.connection.query(queryString, function(err, rows, fields) {
    if(err) {
      throw err;
    }
    callback(rows);
  })
};

module.exports.makeBlockChanges = function(currentStateObject, restrictedStudios, callback) {
  var queryString = 'UPDATE for_sale_block SET pass_volume=' + currentStateObject.pass_volume +
    ', passes_sold=' + currentStateObject.passes_sold + ', current_price=' + currentStateObject.current_price +
    ', period_start="' + currentStateObject.current_start + '", period_end="' + currentStateObject.current_end +
    '" WHERE id=' + currentStateObject.current_block_id;
  module.exports.connection.query(queryString, function(err, results, fields) {
    if (err) {
      callback(err, null);
    }
    module.exports.connection.query(`DELETE FROM restricted_studios WHERE block_id=${currentStateObject.current_block_id}`, function (error, results, fields) {
      if (err) {
        callback(err, null);
      }
      if (restrictedStudios) {
        module.exports.connection.query(`SELECT id FROM restricted_list WHERE user_id=${currentStateObject.userId} AND studio IN ("${restrictedStudios.join('", "')}")`, function(err, results) {
          if (err) {
            callback(err, null);
          } else {
            const studios = results.map(({id}) => `(${currentStateObject.current_block_id}, ${id})`).join(',');
            module.exports.connection.query(`INSERT INTO restricted_studios (block_id, exempt_studio_id) VALUES ${studios}`, function(err, results) {
              callback(err, results);
            });
          }
        });
      } else {
        callback(err, results);
      }
    });
  });
};
