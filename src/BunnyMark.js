var Resources = require('./Resources');

/**
 * Application call for simulation
 * @class BunnyMark
 * @param {String} domElementSelector Selector for the frame element
 */
var BunnyMark = function(domElementSelector)
{
    /**
     * Collection of currently running bunnies
     * @type {Array<PIXI.Sprite>}
     */
    this.bunnies = [];

    /**
     * Containing frame element
     * @type {JQuery}
     */
    this.domElement = $(domElementSelector);

    /**
     * Stage bounds
     * @type {Object}
     */
    this.bounds = {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0
    };

    /**
     * `true` to increment the number of bunnies
     * @type {boolean}
     */
    this.isAdding = false;

    /**
     * Number of bunnies on the stage
     * @type {int}
     */
    this.count = 0;

    /**
     * The maximum number of bunnies to render.
     * @type {Number}
     * @default 200000
     */
    this.maxCount = 200000;

    /**
     * Number of bunnies to add each frame if isAdding is `true`
     * @type {int}
     */
    this.amount = 100;

    /**
     * Render for the stage
     * @type {PIXI.CanvasRenderer|PIXI.WebGLRenderer}
     */
    this.renderer = null;

    /**
     * Container for the bunnies
     * @type {PIXI.Container}
     */
    this.stage = null;

    /**
     * The stats UI for showing framerate
     * @type {Stats}
     */
    this.stats = null;

    /**
     * Collection of bunny textures
     * @type {Array<PIXI.Texture>}
     */
    this.textures = null;

    /**
     * Container for the counter
     * @type {JQuery}
     */
    this.counter = null;
};

/**
 * To be called when window and PIXI is ready
 * @method ready
 * @param {int} [startBunnyCount=100000] The number of bunnies to start with
 */
BunnyMark.prototype.ready = function(startBunnyCount)
{
    // Default bunnies to 100000
    if (typeof startBunnyCount === 'undefined') {
        startBunnyCount = 100000;
    }

    this.domElement.removeClass('hidden');

    if (typeof PIXI === 'undefined')
    {
        this.domElement.addClass('error');
        throw "PIXI is required to run";
    }

    var $stage = $('#stage');
    var view = $stage.get(0);
    this.bounds.right = $stage.width();
    this.bounds.bottom = $stage.height();

    var options = {
        backgroundColor: 0xFFFFFF,
        view: view
    };

    $('input[type=checkbox]').each(function() {
        options[this.value] = this.checked;
    });
    $('select').each(function() {
       options['powerPreference'] = this.value;
    })

    if (PIXI.autoDetectRenderer) {
        this.renderer = PIXI.autoDetectRenderer(
            this.bounds.right,
            this.bounds.bottom,
            options
        );

        // Add fewer bunnies for the canvas renderer
        if (this.renderer instanceof PIXI.CanvasRenderer)
        {
            this.amount = 5;
            this.renderer.context.mozImageSmoothingEnabled = false;
            this.renderer.context.webkitImageSmoothingEnabled = false;
        }
    }
    // Support for v5
    else if (PIXI.Renderer) {
        this.renderer = new PIXI.Renderer(
            this.bounds.right,
            this.bounds.bottom,
            options
        );
    }

    // The current stage
    this.stage = new PIXI.Container();

    // Create the stats element
    this.stats = new Stats();
    this.stats.domElement.id = "stats";
    this.domElement.append(this.stats.domElement);

    // Get bunny textures
    this.textures = Resources.map(function(a){
        return PIXI.Texture.fromImage(a, null, 1);
    });

    var gl = this.renderer.gl;
    this.textures.length = Math.min(
        gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS), 
        this.textures.length
    );

    // Create the sounder
    this.counter = $("#counter");
    this.counter.html(this.count + " BUNNIES");

    if (startBunnyCount > 0)
    {
        this.addBunnies(startBunnyCount);
    }

    var $view = $(view);
    var $doc = $(document);
    var startAdding = this.startAdding.bind(this);
    var stopAdding = this.stopAdding.bind(this);

    $view.on('mousedown touchstart', startAdding);
    $view.on('mouseup touchend', stopAdding);
    $doc.on('touchstart', startAdding);
    $doc.on('touchend', stopAdding);

    // Handle window resizes
    $(window).on(
        'resize orientationchange', 
        this.resize.bind(this)
    );

    this.resize();
    this.startUpdate();
};

/**
 * Add an arbitrary amount of bunnies
 * @method addBunnies
 */
BunnyMark.prototype.addBunnies = function(num)
{
    // We don't include this until later because pixi is required
    var Bunny = require('./Bunny');

    for (var i = 0; i < num; i++)
    {
        var texture = this.textures[this.count % this.textures.length];
        var bunny = new Bunny(texture, this.bounds);
        bunny.position.x = (this.count % 2) * 800;
        this.bunnies.push(bunny);
        this.stage.addChild(bunny);
        this.count++;
    }
    this.counter.html(this.count + " BUNNIES");
};

/**
 * Turn on flag to start adding more bunnies.
 * @method startAdding
 */
BunnyMark.prototype.startAdding = function()
{
    this.isAdding = true;
};

/**
 * Turn off flag to stop adding bunnies.
 * @method stopAdding
 */
BunnyMark.prototype.stopAdding = function()
{
    this.isAdding = false;
};

/**
 * Start the requestAnimationFrame update
 * @method startUpdate
 */
BunnyMark.prototype.startUpdate = function()
{
    var _this = this;
    requestAnimationFrame(function()
    {
        _this.update();
    });
};

/**
 * Resize the stage
 * @method resize
 */
BunnyMark.prototype.resize = function()
{
    var width = this.domElement.width();
    var height = this.domElement.height();
    this.bounds.right = width;
    this.bounds.bottom = height;
    this.renderer.resize(width, height);
};

/**
 * Remove all bunnies
 * @method reset
 */
BunnyMark.prototype.reset = function()
{
    this.stage.removeChildren();
    this.count = 0;
    for (var i = this.bunnies.length - 1; i >= 0; i--)
    {
        var bunny = this.bunnies[i];
        bunny.destroy();
    }
    this.bunnies.length = 0;
};

/**
 * Frame update function
 * @method update
 */
BunnyMark.prototype.update = function()
{
    this.stats.begin();

    if (this.isAdding)
    {
        if (this.count < this.maxCount)
        {
            this.addBunnies(this.amount);
        }
    }

    for (var i = 0; i < this.bunnies.length; i++)
    {
        this.bunnies[i].update();
    }

    this.renderer.render(this.stage);
    this.startUpdate();
    this.stats.end();
};

module.exports = BunnyMark;
