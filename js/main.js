let c,
    ctx,
    fps = 60,
    backGround,
    player = {
      ship: {
        color: '#fff',
        x: 0,
        y: 0,
        speed: {
          x: 5,
          y: 5
        },
        width: 10,
        height: 10
      },
      score: 0,
      lives: 10,
    },
    keysDown = {};

// I've made player an object with ship instead it because I would think lots of other things go in there too.

window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / fps);
          };
})();

window.onload = ()  => {
  c = document.getElementById('buffhammer');
  c.width = window.innerWidth;
  c.height = window.innerHeight;

  ctx = c.getContext('2d');

  backGround = {
    color: '#000',
    x: 0,
    y: 0,
    width: c.width,
    height: c.height
  };

  // Handle keyboard controls
  addEventListener("keydown", function (e) {
    keysDown[e.keyCode] = true;
  }, false);
  addEventListener("keyup", function (e) {
    delete keysDown[e.keyCode];
  }, false);

  animationLoop();
}

let animationLoop = () => {
  requestAnimFrame(animationLoop);
  render();
}

let render = () => {
  // all of your render code goes here
  drawRect(backGround);

  movePlayer();
  drawRect(player.ship);

  // write the score
  let score = {
    message: `Score: ${player.score}`,
    x: 100,
    y: 50
  }
  drawText(score);

  // write the health
  let health = {
    message: `Lives Remaining: ${player.lives}`,
    x: 500,
    y: 50
  }
  drawText(health);
}

let movePlayer = () => {
  if (38 in keysDown) { // Player holding up
    if (10 <= player.ship.y) {
      player.ship.y += -(player.ship.speed.y);
    }
  }
  if (40 in keysDown) { // Player holding down
    if (c.height-10 >= player.ship.y) {
      player.ship.y += player.ship.speed.y;
    }
  }
  if (37 in keysDown) { // Player holding left
    if (10 <= player.ship.x) {
      player.ship.x += -(player.ship.speed.x);
    }
  }
  if (39 in keysDown) { // Player holding right
    if (c.width-10 >= player.ship.x) {
      player.ship.x += player.ship.speed.x;
    }
  }
}

// if you want to draw lots of circles you'll use this function
let drawCircle = (circle) => {
  ctx.fillStyle = circle.color;
  ctx.beginPath();
  ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI*2, true);
  ctx.fill();
}

// if you want to draw lots of rectangles you'll use this function
let drawRect = (rectangle) => {
  ctx.fillStyle = rectangle.color;
  ctx.fillRect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
};

// if you want to draw some text on the screen use this function
let drawText = (text) => {
  ctx.fillStyle = text.color | '#fff';
  ctx.font = '20px Helvetica';
  ctx.fillText(text.message, text.x, text.y);
};
