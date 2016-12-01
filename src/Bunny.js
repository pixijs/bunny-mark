
/**
 * Bunny
 * @class Bunny
 * @param {PIXI.Texture} texture
 * @param {Object} bounds
 */
var Bunny = function(texture, bounds)
{
	PIXI.Sprite.call(this, texture);

    /**
     * The amount of gravity
     * @type {Number}
     */
    this.gravity = 0.75;

    /**
     * Horizontal speed
     * @type {Number}
     */
	this.speedX = Math.random() * 10;

	/**
     * Vertical speed
     * @type {Number}
     */
    this.speedY = (Math.random() * 10) - 5;

    /**
     * Reference to the bounds object
     * @type {Object}
     */
	this.bounds = bounds;

    // Set the anchor position
    this.anchor.x = 0.5;
    this.anchor.y = 1;
};

// Extend the prototype
Bunny.prototype = Object.create(PIXI.Sprite.prototype);

/**
 * Update the position of the bunny
 * @method update
 */
Bunny.prototype.update = function()
{
    this.position.x += this.speedX;
    this.position.y += this.speedY;
    this.speedY += this.gravity;

    if (this.position.x > this.bounds.right)
    {
        this.speedX *= -1;
        this.position.x = this.bounds.right;
    }
    else if (this.position.x < this.bounds.left)
    {
        this.speedX *= -1;
        this.position.x = this.bounds.left;
    }

    if (this.position.y > this.bounds.bottom)
    {
        this.speedY *= -0.85;
        this.position.y = this.bounds.bottom;
        if (Math.random() > 0.5)
        {
            this.speedY -= Math.random() * 6;
        }
    }
    else if (this.position.y < this.bounds.top)
    {
        this.speedY = 0;
        this.position.y = this.bounds.top;
    }
};

/**
 * Don't use after this.
 * @method destroy
 */
Bunny.prototype.destroy = function()
{
    this.bounds = null;
    PIXI.Sprite.prototype.destroy.call(this);
};

module.exports = Bunny;
