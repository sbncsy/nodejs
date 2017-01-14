var restify = require('restify');
var pg = require('pg');
var util = require('util');
var optimist = require('optimist').argv;
// var AWS = require("aws-sdk");
// AWS.config.loadFromPath('./.aws/credentials.json'); 

// AWS.config.update({
//   region: "us-west-2",
//   endpoint: "http://localhost:8080"
// });

var Init = function(username, password, db) {
    var connection = util.format("postgres://%s:%s@localhost/%s", username, password, db);
    var server = restify.createServer({
        name: 'node-pg-restify',
        version: '1.0.0'
    });
    server.use(restify.acceptParser(server.acceptable));
    server.use(restify.queryParser());
    server.use(restify.bodyParser());

    server.listen(8080, function() {
        console.log('%s listening at %s', server.name, server.url);
    });
};

var name = "postgres";
var password = "postgres";
var db = "postgres";

if(optimist.name !== undefined) {
    name = optimist.name;
}

if(optimist.password !== undefined) {
    password = optimist.password;
}

if(optimist.db !== undefined) {
    db = optimist.db;
}

Init(name,password,db);
