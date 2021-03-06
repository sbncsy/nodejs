var restify = require('restify');
var pg = require('pg');
var util = require('util');
var optimist = require('optimist').argv;
 
 
var Init = function(username, password, db) {
    var connection = util.format("postgres://%s:%s@localhost/%s", username, password, db);
    var server = restify.createServer({
        name: 'node-pg-restify',
        version: '1.0.0'
    });
    server.use(restify.acceptParser(server.acceptable));
    server.use(restify.queryParser());
    server.use(restify.bodyParser());
 
    // Return full result from query
    server.post('/query', function(req, res, next) {
        console.log(req.params.query, connection);
        pg.connect(connection, function(err, client, done) {
            if (err) {
                res.send({result:"null", type: "connection", error: err});
            }
 
            client.query(req.params.query, function(err, result) {
                done();
                if(err) {
                    res.send({result:"null", type: "query", error:err});
                }
 
                res.send({id: result.rows[0].id, lat: result.rows[0].lat, lon: result.rows[0].lon, distance: result.rows[0].distance});
            });
        });
        return next();
    });
 
    server.post('/route', function(req, res, next) {
        // console.log(req.params.query, connection);
        const steps = [];
        // const geometry = "";
        // const lat = [];
        // const lon = [];
        pg.connect(connection, function(err, client, done) {
            if(err) {
              done();
              console.log(err);
              return res.status(400).json({success: false, data: err})
            }
            const sql = "SELECT lat, lon, ST_AsGeoJSON(the_geom) as the_geom FROM pgr_dijkstra( 'SELECT gid as id, source, target, cost, reverse_cost FROM ways', " + req.params.source_id + ", " + req.params.dest_id + ", FALSE ), ways_vertices_pgr WHERE node = id order by path_seq;";
            const sql_2 = "SELECT ST_AsGeoJSON(ST_LineMerge(ST_Collect(the_geom))) as geometry FROM pgr_dijkstra( 'SELECT gid as id, source, target, cost, reverse_cost FROM ways', " + req.params.source_id + ", " + req.params.dest_id + ", FALSE ), ways where edge = gid;";
            // const sql_2 = "SELECT ST_AsGeoJSON(ST_Collect(the_geom)) as geometry FROM pgr_dijkstra( 'SELECT gid as id, source, target, cost, reverse_cost FROM ways', " + req.params.source_id + ", " + req.params.dest_id + ", FALSE ), ways_vertices_pgr WHERE node = id;";
            // const sql_3 = "select ST_AsGeoJSON(ST_Collect(the_geom)) as geometryfrom('SELECT the_geom FROM pgr_dijkstra( 'SELECT gid as id, source, target, cost, reverse_cost FROM ways', " + req.params.source_id + ", " + req.params.dest_id + ", FALSE ), ways_vertices_pgr WHERE node = id order by path_seq;)'";
            const query = client.query(sql, function(err, result) {
                if(err) {
                  done();
                  console.log(err);
                  return res.status(500).json({success: false, data: err})
                }
            });
                
            query.on('row', function(row) {
                steps.push({"geometry":row.the_geom,"maneuver":{"location":[Number(row.lat), Number(row.lon)]}});
 
            });
            const query_2 = client.query(sql_2, function(err, result) {
                if(err) {
                  done();
                  console.log(err);
                  return res.status(500).json({success: false, data: err})
                }
                geometry = result.rows[0].geometry;
            });
 
            // After all data is returned, close connection and return results
            query_2.on('end', function() {
              done();
              return res.json({"routes":[{geometry:geometry,"legs":[{"steps":steps}]}]});
            });
        });
    });
 
 
    server.post('/route2', function(req, res, next) {
        console.log(req.params.query, connection);
        const steps = [];
        // const lat = [];
        // const lon = [];
        pg.connect(connection, function(err, client, done) {
            if(err) {
              done();
              console.log(err);
              return res.status(500).json({success: false, data: err})
            }
                 
            const query = client.query(req.params.nquery, function(err, result) {
                if(err) {
                  done();
                  console.log(err);
                  return res.status(500).json({success: false, data: err})
                }
            });
                
            query.on('row', function(row) {
                steps.push({"geometry":row.the_geom,"maneuver":{"location":[Number(row.lat), Number(row.lon)]}});
 
            });
            // After all data is returned, close connection and return results
            query.on('end', function() {
              done();
              return res.json({"routes":[{"legs":[{"steps":steps}]}]});
            });
        });
    });
        // Return full result from query
    server.post('/nearnode', function(req, res, next) {
        console.log(req.params.query, connection);
        pg.connect(connection, function(err, client, done) {
            if (err) {
                res.send({result:"null", type: "connection", error: err});
            }
 
            client.query(req.params.query, function(err, result) {
                done();
                if(err) {
                    res.send({result:"null", type: "query", error:err});
                }
 
                res.send({id: result.rows[0].id, lat: result.rows[0].lat, lon: result.rows[0].lon, distance: result.rows[0].distance});
            });
        });
        return next();
    });
 
    server.post('/nearnode2', function(req, res, next) {
        console.log(req.params.query, connection);
        pg.connect(connection, function(err, client, done) {
            if (err) {
                res.send({result:"null", type: "connection", error: err});
            }
 
            client.query(req.params.query, function(err, result) {
                done();
                if(err) {
                    res.send({result:"null", type: "query", error:err});
                }
 
                res.send({id: result.rows[0].id, lat: result.rows[0].lat, lon: result.rows[0].lon, distance: result.rows[0].distance});
            });
        });
        return next();
    });
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
