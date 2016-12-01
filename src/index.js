var BunnyMark = require('./BunnyMark');
var VersionChooser = require('./VersionChooser');

var app = new BunnyMark('#frame');
var chooser = new VersionChooser('#chooser');
chooser.select = app.ready.bind(app);

// Wait for window
$(chooser.init.bind(chooser));