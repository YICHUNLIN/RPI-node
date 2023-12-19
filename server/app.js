require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const passport = require('passport');
const Auth = require('./src/utils/auth')
const {Logger,CSInterface} = require('./src/logger');
const client = require('./src/utils/ws_client')({
	url: process.env.WS_URL,
	id: process.env.WS_ID,
	name: process.env.WS_NAME
});
const log = new Logger(new CSInterface());

/**Server Define */
var http = require('http');
const app = express();
app.set('port', process.env.PORT);

var server = http.createServer(app);

/** express setting */
app.use(logger('dev'));
app.use(cookieParser());
require('./src/utils/passport')(passport);

const auth = new Auth();
app.use(function(req, res, next) {
    req.auth = auth;
    next();
}, (req, res, next) => {
    next();
});
// v1
require('./src/api')(app, 
  [   cors(),
      express.json(), 
      express.urlencoded({ extended: false }), 
      cookieParser(),
      //passport.authenticate('ticket_auth', { session:false }),
      //(req, res, next) => req.auth.checkPermission('PLC_USE')(req, res, next),
      (req, res, next) => {
          next();
      }
  ]
);

/** Server Listening*/

server.listen(process.env.PORT);
server.on('error', onError);
server.on('listening', onListening);


/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof process.env.PORT === 'string'
    ? 'Pipe ' + process.env.PORT
    : 'Port ' + process.env.PORT;
  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      log.add('ERROR', 'Server Listen', bind + ' requires elevated privileges')
      process.exit(1);
      break;
    case 'EADDRINUSE':
      log.add('ERROR', 'Server Listen', bind + ' is already in use')
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  log.add('INFO', 'Server Listen',' Listening on ' + bind)
}
