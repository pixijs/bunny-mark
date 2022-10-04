/** Select the version of pixi.js to test */
class VersionChooser
{
    constructor(domElementSelector)
    {
        /** Containing frame element */
        this.domElement = $(domElementSelector);

        /** Callback funtion when complete */
        this.select = () => null;

        /** The setInterval timer */
        this.ticker = null;

        /** The timeout */
        this.timeout = null;

        /** Path for loading PIXI from the CDN, v5+ */
        this.cdnTemplate = '//pixijs.download/${tag}/pixi-legacy.min.js';

        /** Path for loading PIXI from the CDN, v4 and below */
        this.cdnTemplate4 = '//pixijs.download/${tag}/pixi.min.js';

        /** The input for bunny count */
        this.initCount = $('#startBunnyCount');
    }

    /** Start setup */
    init()
    {
        this.domElement.removeClass('hidden');

        const _this = this;

        // Listen for local file upload
        $('#browseFile :file').change(() =>
        {
            if (!window.FileReader)
            {
                // eslint-disable-next-line no-alert
                alert('Your browser is not supported');

                return;
            }

            const reader = new FileReader();

            if (this.files.length)
            {
                const textFile = this.files[0];

                reader.readAsText(textFile);
                $(reader).on('load', (e) =>
                {
                    const file = e.target.result;

                    if (file && file.length)
                    {
                        const script = $('<script></script>');

                        script.html(file);
                        _this.addScript(script);
                    }
                });
            }
            else
            {
                // eslint-disable-next-line no-alert
                alert('Please upload a file before continuing');
            }
        });

        const goButton = this.domElement.find('#goButton');
        const branch = this.domElement.find('#branch');
        const start = this.start.bind(this);

        goButton.on('click', (event) =>
        {
            event.preventDefault();
            const value = branch.val();

            if (value)
            {
                start(value);
            }
        });
    }

    /** Start loadin PIXI */
    start(tag)
    {
        const script = $('<script></script>');
        const template = tag.indexOf('v4') === 0 ? this.cdnTemplate4 : this.cdnTemplate;
        const src = template.replace('${tag}', tag);

        script.prop('src', src);

        this.addScript(script);
    }

    /**
     * Start loadin PIXI
     * @method addScript
     * @param {JQuery} script The script element
     */
    addScript(script)
    {
        script.get(0).onerror = () => console.error('Script loading error');

        this.domElement.append(script);
        this.domElement.addClass('loading');

        // Check for pixi being available
        this.ticker = setInterval(() => this.update(), 15);

        // Also add a timeout
        this.timeout = setTimeout(() => this.stop(), 10000);
    }

    /**
     * Check for when pixi is available
     * @method update
     */
    update()
    {
        if (typeof PIXI !== 'undefined')
        {
            this.stop();
        }
    }

    /**
     * Finish the loading
     * @method stop
     */
    stop()
    {
        this.domElement.addClass('hidden');
        clearInterval(this.ticker);
        clearTimeout(this.timeout);
        this.timeout = null;
        this.ticker = null;
        this.select(parseInt(this.initCount.val(), 10));
    }
}

export default VersionChooser;
