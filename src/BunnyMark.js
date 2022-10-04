import Resources from './Resources';

/** Application call for simulation */
class BunnyMark
{
    constructor(domElementSelector)
    {
        /** Collection of currently running bunnies */
        this.bunnies = [];

        /** Containing frame element */
        this.domElement = $(domElementSelector);

        /** Stage bounds */
        this.bounds = {
            left: 0,
            top: 0,
            right: 0,
            bottom: 0
        };

        /** `true` to increment the number of bunnies */
        this.isAdding = false;

        /** Number of bunnies on the stage */
        this.count = 0;

        /** The maximum number of bunnies to render. */
        this.maxCount = 200000;

        /** Number of bunnies to add each frame if isAdding is `true` */
        this.amount = 100;

        /** Render for the stage */
        this.renderer = null;

        /** Container for the bunnies */
        this.stage = null;

        /** The stats UI for showing framerate */
        this.stats = null;

        /** Collection of bunny textures */
        this.textures = null;

        /** Container for the counter */
        this.counter = null;
    }

    /** To be called when window and PIXI is ready */
    ready(startBunnyCount)
    {
        // Default bunnies to 100000
        if (typeof startBunnyCount === 'undefined')
        {
            startBunnyCount = 100000;
        }

        this.domElement.removeClass('hidden');

        if (typeof PIXI === 'undefined')
        {
            this.domElement.addClass('error');
            throw new Error('PIXI is required to run');
        }

        const $stage = $('#stage');
        const view = $stage.get(0);

        this.bounds.right = $stage.width();
        this.bounds.bottom = $stage.height();

        const options = {
            backgroundColor: 0xFFFFFF,
            view
        };

        $('input[type=checkbox]').each(() =>
        {
            options[this.value] = this.checked;
        });
        $('select[name=powerPreference]').each(() =>
        {
            options.powerPreference = this.value;
        });

        Object.assign(options, {
            width: this.bounds.right,
            height: this.bounds.bottom,
        });

        try
        {
            this.renderer = PIXI.autoDetectRenderer(options);
        }
        catch (err)
        {
            // eslint-disable-next-line no-alert
            alert(err.message);

            return;
        }

        // Add fewer bunnies for the canvas renderer
        if (PIXI.CanvasRenderer && this.renderer instanceof PIXI.CanvasRenderer)
        {
            this.amount = 5;
            this.renderer.context.mozImageSmoothingEnabled = false;
            this.renderer.context.webkitImageSmoothingEnabled = false;
        }

        // The current stage
        this.stage = new PIXI.Container();

        // Create the stats element
        this.stats = new Stats();
        this.stats.domElement.id = 'stats';
        this.domElement.append(this.stats.domElement);

        // Get bunny textures
        this.textures = Resources.map((src) => PIXI.Texture.from(src));

        if (this.renderer.gl)
        {
            const { gl } = this.renderer;

            this.textures.length = Math.min(
                gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS),
                this.textures.length
            );
        }

        // Create the sounder
        this.counter = $('#counter');
        this.counter.html(`${this.count} BUNNIES`);

        if (startBunnyCount > 0)
        {
            this.addBunnies(startBunnyCount);
        }

        const $view = $(view);
        const $doc = $(document);
        const startAdding = this.startAdding.bind(this);
        const stopAdding = this.stopAdding.bind(this);

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
    }

    /** Add an arbitrary amount of bunnies */
    addBunnies(num)
    {
        import('./Bunny').then(({ default: Bunny }) =>
        {
            for (let i = 0; i < num; i++)
            {
                const texture = this.textures[this.count % this.textures.length];
                const bunny = new Bunny(texture, this.bounds);

                bunny.position.x = (this.count % 2) * 800;
                this.bunnies.push(bunny);
                this.stage.addChild(bunny);
                this.count++;
            }
            this.counter.html(`${this.count} BUNNIES`);
        });
    }

    /** Turn on flag to start adding more bunnies. */
    startAdding()
    {
        this.isAdding = true;
    }

    /** Turn off flag to stop adding bunnies. */
    stopAdding()
    {
        this.isAdding = false;
    }

    /** Start the requestAnimationFrame update */
    startUpdate()
    {
        requestAnimationFrame(() => this.update());
    }

    /** Resize the stage */
    resize()
    {
        const width = this.domElement.width();
        const height = this.domElement.height();

        this.bounds.right = width;
        this.bounds.bottom = height;
        this.renderer.resize(width, height);
    }

    /** Remove all bunnies */
    reset()
    {
        this.stage.removeChildren();
        this.count = 0;
        for (let i = this.bunnies.length - 1; i >= 0; i--)
        {
            const bunny = this.bunnies[i];

            bunny.destroy();
        }
        this.bunnies.length = 0;
    }

    /** Frame update function */
    update()
    {
        this.stats.begin();

        if (this.isAdding)
        {
            if (this.count < this.maxCount)
            {
                this.addBunnies(this.amount);
            }
        }

        for (let i = 0; i < this.bunnies.length; i++)
        {
            this.bunnies[i].update();
        }

        this.renderer.render(this.stage);
        this.startUpdate();
        this.stats.end();
    }
}

export default BunnyMark;
