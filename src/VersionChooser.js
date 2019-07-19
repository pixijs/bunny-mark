var GITHUB_TOKEN = 'a3cd5bd2660280b5e8bac7606a0f11764428da1d';

/**
 * Select the version of pixi.js to test
 * @class VersionChooser
 * @param {String} domElementSelector Selector for containing element
 */
var VersionChooser = function(domElementSelector)
{
    /**
     * Containing frame element
     * @type {JQuery}
     */
    this.domElement = $(domElementSelector);

    /**
     * Collection of tag options
     * @type {Array<String>}
     */
    this.tags = [];

    /**
     * Collection of branch options
     * @type {Array<String>}
     */
    this.branches = [];

    /**
     * Callback funtion when complete
     * @type {Function}
     */
    this.select = function(){};

    /**
     * The setInterval timer
     * @type {int}
     */
    this.ticker = null;

    /**
     * The timeout
     * @type {int}
     */
    this.timeout = null;

    /**
     * Path for loading PIXI from the CDN, v5+
     * @type {String}
     */
    this.cdnTemplate = '//pixijs.download/${tag}/pixi-legacy.min.js';

    /**
     * Path for loading PIXI from the CDN, v4 and below
     * @type {String}
     */
    this.cdnTemplate4 = '//pixijs.download/${tag}/pixi.min.js';

    /**
     * The input for bunny count
     * @type {JQuery}
     */
    this.initCount = $("#startBunnyCount");
};

/**
 * Get the list of releases (versions) from the Github API
 * @method getReleases
 * @param {Function} callback when completed
 */
VersionChooser.prototype.getReleases = function(callback)
{
    var _this = this;
    var api = 'https://api.github.com/repos/pixijs/pixi.js/releases';
    $.getJSON(api, { access_token: GITHUB_TOKEN }, function(releases)
    {
        for (var i = 0; i < releases.length; i++)
        {
            _this.tags.push(releases[i].tag_name);
        }
        _this.tags.sort();
        callback();
    });
};

/**
 * Get the list of branches of pixijs/pixi.js from the Github API
 * @method getBranches
 * @param {Function} callback when completed
 */
VersionChooser.prototype.getBranches = function(callback)
{
    var _this = this;
    var api = 'https://api.github.com/repos/pixijs/pixi.js/branches';
    $.getJSON(api, { access_token: GITHUB_TOKEN }, function(branches)
    {
        for (var i = 0; i < branches.length; i++)
        {
            _this.branches.push(branches[i].name);
        }
        _this.branches.sort();
        callback();
    });
};

/**
 * Start setup
 * @method init
 */
VersionChooser.prototype.init = function()
{
    this.domElement.removeClass('hidden');

    var _this = this;

    // Listen for local file upload
    $('#browseFile :file').change(function() {
        
        if (!window.FileReader)
        {
            alert('Your browser is not supported');
            return false;
        }

        var reader = new FileReader();
        if (this.files.length)
        {
            var textFile = this.files[0];
            reader.readAsText(textFile);
            $(reader).on('load', function(e)
            {
                var file = e.target.result;
                if (file && file.length)
                {
                    var script = $("<script></script>");
                    script.html(file);
                    _this.addScript(script);
                }
            });
        }
        else
        {
            alert('Please upload a file before continuing');
        }        
    });

    _this.getReleases(function()
    {
        _this.getBranches(function()
        {
            _this.displayTags();
        })
    });
};

/**
 * Display the tag options
 * @method displayTags
 */
VersionChooser.prototype.displayTags = function()
{
    var domTags = this.domElement.find('#tags');
    var domBranches = this.domElement.find('#branches');
    var i, option;

    for (i = this.tags.length - 1; i >= 0; i--)
    {
        option = $(document.createElement('option'));
        option.html(this.tags[i]);
        domTags.append(option);
    }

    for (i = this.branches.length - 1; i >= 0; i--)
    {
        option = $(document.createElement('option'));
        option.html(this.branches[i]);
        domBranches.append(option);
    }

    var tagsButton = this.domElement.find('#tagsButton');
    var branchesButton = this.domElement.find('#branchesButton');
    var start = this.start.bind(this);

    tagsButton.on('click', function(event) {
        event.preventDefault();
        var value = domTags.val();
        if (value) {
            start(value);
        }
    });

    branchesButton.on('click', function(event) {
        event.preventDefault();
        var value = domBranches.val();
        if (value) {
            start(value);
        }
    });
};

/**
 * Start loadin PIXI
 * @method start
 */
VersionChooser.prototype.start = function(tag)
{
    var script = $('<script></script>');
    var template = tag.indexOf('v4') === 0 ? this.cdnTemplate4 : this.cdnTemplate;
    var src = template.replace('${tag}', tag);
    script.prop('src', src);

    this.addScript(script);
};

/**
 * Start loadin PIXI
 * @method addScript
 * @param {JQuery} script The script element
 */
VersionChooser.prototype.addScript = function(script)
{
    script.get(0).onerror = function() {
        console.error("Script loading error");
    };

    this.domElement.append(script);
    this.domElement.addClass('loading');

    // Check for pixi being available
    this.ticker = setInterval(this.update.bind(this), 15);

    // Also add a timeout
    this.timeout = setTimeout(this.stop.bind(this), 10000);
};

/**
 * Check for when pixi is available
 * @method update
 */
VersionChooser.prototype.update = function()
{
    if (typeof PIXI !== 'undefined')
    {
        this.stop();
    }
};

/**
 * Finish the loading
 * @method stop
 */
VersionChooser.prototype.stop = function()
{
    this.domElement.addClass('hidden');
    clearInterval(this.ticker);
    clearTimeout(this.timeout);
    this.timeout = null;
    this.ticker = null;
    this.select(parseInt(this.initCount.val()));
};

module.exports = VersionChooser;
