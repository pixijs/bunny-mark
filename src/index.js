$(onReady);

$(window).on('resize', resize);
$(window).on('orientationchange', resize);

var bunnys = [];
var gravity = 0.75;
var maxX = 0;
var minX = 0;
var maxY = 0;
var minY = 0;
var startBunnyCount = 0;
var isAdding = false;
var count = 0;
var amount = 100;
var renderer = null;
var stage = new PIXI.Container();
var stats = null;
var textures = null;
var counter = null;

function onReady()
{
    var $stage = $('#stage');
    maxX = $stage.width();
    maxY = $stage.height();

    renderer = PIXI.autoDetectRenderer(maxX, maxY, {
        backgroundColor:0xFFFFFF,
        view: $stage.get(0)
    });

    amount = (renderer instanceof PIXI.WebGLRenderer) ? 100 : 5;

    if (amount == 5)
    {
        renderer.context.mozImageSmoothingEnabled = false;
        renderer.context.webkitImageSmoothingEnabled = false;
    }

    stats = new Stats();
    stats.domElement.id = "stats";
    $("#frame").append(stats.domElement);

    requestAnimationFrame(update);

    var texturesURLs  = [
        'images/rabbitv3_ash.png',
        'images/rabbitv3_batman.png',
        'images/rabbitv3_bb8.png',
        'images/rabbitv3_neo.png',
        'images/rabbitv3_sonic.png',
        'images/rabbitv3_spidey.png',
        'images/rabbitv3_stormtrooper.png',
        'images/rabbitv3_superman.png',
        'images/rabbitv3_tron.png',
        'images/rabbitv3_wolverine.png',
        'images/rabbitv3.png',
        'images/rabbitv3_frankenstein.png'
    ];

    textures = texturesURLs.map(function(a){
        return PIXI.Texture.fromImage(a, null, 1);
    });

    var gl = renderer.gl;
    textures.length = Math.min(gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS), textures.length);

    counter = $("#counter");
    count = startBunnyCount;
    counter.html(count + " BUNNIES");

    for (var i = 0; i < startBunnyCount; i++)
    {
        var bunny = new PIXI.Sprite(textures[i % textures.length]);
        bunny.speedX = Math.random() * 10;
        bunny.speedY = (Math.random() * 10) - 5;
        bunny.anchor.x = 0.5;
        bunny.anchor.y = 1;
        bunnys.push(bunny);
        bunny.position.x = Math.random() * 800;
        bunny.position.y = Math.random() * 600;
        stage.addChild(bunny);
    }

    $(renderer.view).mousedown(function(){
        isAdding = true;
    });

    $(renderer.view).mouseup(function(){
        isAdding = false;
    });

    $(document).on("touchstart", onTouchStart);
    $(document).on("touchend", onTouchEnd);

    renderer.view.touchstart = function(){
        isAdding = true;
    };

    renderer.view.touchend = function(){
        isAdding = false;
    };
    resize();
}

function onTouchStart()
{
    isAdding = true;
}

function onTouchEnd()
{
    isAdding = false;
}

function resize()
{
    var $frame = $("#frame");
    var width = $frame.width();
    var height = $frame.height();
    maxX = width;
    maxY = height;
    renderer.resize(width, height);
}

function update()
{
    var i;
    var bunny;

    stats.begin();
    if (isAdding)
    {
        if (count < 200000)
        {
            for (i = 0; i < amount; i++)
            {
                bunny = new PIXI.Sprite(textures[count % textures.length]);
                bunny.speedX = Math.random() * 10;
                bunny.speedY = (Math.random() * 10) - 5;
                bunny.anchor.y = 1;
                bunnys.push(bunny);
                bunny.scale.y = 1;
                bunny.position.x = (count%2) * 800;
                stage.addChild(bunny);
                count++;
            }
        }
        counter.html(count + " BUNNIES");
    }

    for (i = 0; i < bunnys.length; i++)
    {
        //break
        bunny = bunnys[i];
        //bunny.rotation += 0.1
        var transform = bunny;
        transform.position.x += bunny.speedX;
        transform.position.y += bunny.speedY;
        bunny.speedY += gravity;

        if (transform.position.x > maxX)
        {
            bunny.speedX *= -1;
            transform.position.x = maxX;
        }
        else if (transform.position.x < minX)
        {
            bunny.speedX *= -1;
            transform.position.x = minX;
        }

        if (transform.position.y > maxY)
        {
            bunny.speedY *= -0.85;
            transform.position.y = maxY;
            bunny.spin = (Math.random()-0.5) * 0.2
            if (Math.random() > 0.5)
            {
                bunny.speedY -= Math.random() * 6;
            }
        }
        else if (transform.position.y < minY)
        {
            bunny.speedY = 0;
            transform.position.y = minY;
        }
    }
    renderer.render(stage);
    requestAnimationFrame(update);
    stats.end();
}