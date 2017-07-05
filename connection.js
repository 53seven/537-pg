// connection.js
require('pg').defaults.parseInt8 = true;
const pg = require('pg');
const url = require('url');
//this initializes a connection pool
//it will keep idle connections open for a 30 seconds
//and set a limit of maximum 10 idle clients

const params = url.parse(process.env.DATABASE_URL);
const auth = params.auth.split(':');

const config = {
  user: auth[0],
  password: auth[1],
  host: params.hostname,
  port: params.port,
  database: params.pathname.split('/')[1]
};

const pool = new pg.Pool(config);

function many(query, callback) {
  let q = typeof query.toQuery === 'string' ? query.toQuery() : query;
  // to run a query we can acquire a client from the pool,
  // run a query on the client, and then return the client to the pool
  pool.connect((err, client, done) => {
    if (err) {
      return callback(err);
    }
    client.query(q.text, q.values, (err, result) => {
      done();
      return callback(err, (result ? result.rows : null));
    });
  });

}
module.exports.many = many;

function one(query, callback) {
  many(query, (err, rs) => {
    return callback(err, (rs ? rs[0] : null));
  });
}
module.exports.one = one;
module.exports.end = () => {
  pool.end();
};
// pool is exported for testing reasons only
module.exports.pool = pool;