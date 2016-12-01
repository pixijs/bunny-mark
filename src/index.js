var BunnyMark = require('./BunnyMark');
var app = new BunnyMark('#frame');

// On window ready
$(app.ready.bind(app));