const AWS = require("aws-sdk");

AWS.config.update({ region: process.env.AWS_REGION || "eu-north-1" });

const docClient = new AWS.DynamoDB.DocumentClient();

module.exports = docClient;
