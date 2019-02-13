# Bunny Mark

The purpose of this tool is to crudely sanity-check relative performance changes in PixiJS between
release versions and branches. It is not designed to show off the performance capabilities of PixiJS and does not reflect typical, real-world rendering conditions. Different devices will have different performance thresholds. 

## Preview

https://pixijs.io/bunny-mark/

## Rebuilding From Source

### Setup

Requires to build from source.

```bash
npm install
```

### Build

Build the source code.

```bash
npm run build
```

### Previewing

Open the deploy folder within a browser.

```bash
npm start
```

### Local Previewing

If you want to test a local build, simply drop **pixi.js** into the deploy folder. This should be a dist build of **pixi.js**.

Then start running the Preview, if it's not running already:

```bash
npm start
```

Lastly, navigate to: http://127.0.0.1:8080/index-local.html to test the local build.
