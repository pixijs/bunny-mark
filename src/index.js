var BunnyMark = require('./BunnyMark');
var VersionChooser = require('./VersionChooser');

// Window ready
$(function()
{
    var app = new BunnyMark('#frame');

    // Check for local pixi.js
    if (typeof PIXI === 'undefined')
    {
        var chooser = new VersionChooser('#chooser');
        chooser.select = app.ready.bind(app);
        chooser.init();
    }
    else
    {
        app.ready();
    }
});