import BunnyMark from './BunnyMark';
import VersionChooser from './VersionChooser';

const app = new BunnyMark('#frame');

if (typeof PIXI === 'undefined')
{
    const chooser = new VersionChooser('#chooser');

    chooser.select = () => app.ready();
    chooser.init();
}
else
{
    app.ready();
}
