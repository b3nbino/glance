const { Client } = require("pg");
const CONNECTION = {
  user: "postgres",
  password: "postgres",
  database: "glance",
};

function logQuery(statement, parameters) {
  let timeStamp = new Date();
  let formattedTimeStamp = timeStamp.toString().substring(4, 24);
  console.log(formattedTimeStamp, statement, parameters);
}

module.exports = async function dbQuery(statement, ...parameters) {
  let client = new Client(CONNECTION);

  await client.connect();
  logQuery(statement, parameters);
  let result = await client.query(statement, parameters);
  await client.end();

  return result;
};
