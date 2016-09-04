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
          maxSpeed: 10,
          currentSpeed: 5,
          rotate: 5,
          maxRotate: 10,
          currentX: 0,
          currentY: 0,
        },
        width: 10,
        height: 10,
        rotation: 0,
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

  // we now know the size so lets put the ship in the middle
  player.ship.x = (c.width/2) - (player.ship.width/2);
  player.ship.y = (c.height/2) - (player.ship.height/2);

  // Handle keyboard controls
  addEventListener("keydown", function (e) {
    e.preventDefault(); // this stops screen wiggle
    keysDown[e.keyCode] = true;
  }, false);
  addEventListener("keyup", function (e) {
    e.preventDefault(); // this stops screen wiggle
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
  drawShip(player.ship, player.ship.rotation);
  //drawRect(player.ship, player.ship.rotation);

  // write the score
  let score = {
    message: `Score: ${player.score}`,
    x: 50,
    y: 20
  }
  drawText(score);

  // write the health
  let health = {
    message: `Lives Remaining: ${player.lives}`,
    x: (c.width - 200),
    y: 20
  }
  drawText(health);
}

// I'm changing it so you have to run so only up & down will let you move. This means the if's for wall collision need to be rewritten
let movePlayer = () => {
  if (38 in keysDown) { // Player holding up
    var movement = calcMove(player.ship.rotation, 'forward', player.ship.speed.currentSpeed);
    player.ship.y += movement.y;
    player.ship.x += movement.x;
    // going to check if they've hit the top, if they have, put them on the bottom
    if (player.ship.y <= 0) {
      player.ship.y = c.height;
    }
  }
  if (40 in keysDown) { // Player holding down
    player.ship.y += player.ship.speed.y;
    // going to check if they've hit the top, if they have, put them on the bottom
    if (player.ship.y >= c.height) {
      player.ship.y = 0;
    }
  }
  if (37 in keysDown) { // Player holding left
    //player.ship.x += -(player.ship.speed.x);
    if (player.ship.x <= 0) {
      player.ship.x = c.width;
    }
    player.ship.rotation += -player.ship.speed.rotate; // left is a negative degree
    if (player.ship.rotation == 0) {
      player.ship.rotation = 360; // i think 0 breaks everything
    }
  console.log(player.ship);
  }
  if (39 in keysDown) { // Player holding right
    //player.ship.x += player.ship.speed.x;
    if (player.ship.x >= c.width) {
      player.ship.x = 0;
    }
    player.ship.rotation += player.ship.speed.rotate; // right is a positive degree
    if (player.ship.rotation == 0) {
      player.ship.rotation = 360; // i think 0 breaks everything
    }
  }
}

// I need to do some math to figure out how much and where to move the object
let calcMove = (degree, direction, speed) => {
  // we need to using your speed (Hypotenuse) find your movement on X & Y
  degree = degree % 90; // triangles have a max angle of 90
  console.log(degree);
  var movement = {};
  movement.x = Math.sqrt(Math.sin(degree * Math.PI / 180.0) * speed); // turns out Math.sin uses radians instead of deg
  movement.y = -Math.sqrt(Math.pow(speed,2) - Math.pow(movement.x,2));

  console.log(movement);
  return movement;
}

// if you want to draw lots of circles you'll use this function
let drawCircle = (circle) => {
  ctx.fillStyle = circle.color;
  ctx.beginPath();
  ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI*2, true);
  ctx.fill();
}

// if you want to draw lots of rectangles you'll use this function
let drawRect = (rectangle, rotation = 0) => {
  ctx.fillStyle = rectangle.color;
  ctx.rotate(rotation * Math.PI / 180); // this is used to rotate the object
  ctx.fillRect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
  ctx.setTransform(1, 0, 0, 1, 0, 0); // honestly no idea that this is: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/rotate
};

let drawShip = (rectangle, rotation = 0) => {
  ctx.save();
  ctx.beginPath();
  ctx.translate((rectangle.x + rectangle.width / 2), (rectangle.y + rectangle.height / 2)); // this is supposed to rotate it around the center point
  ctx.rotate(rotation * Math.PI / 180); // this is used to rotate the object
  ctx.rect(-rectangle.width/2, -rectangle.height/2, rectangle.width, rectangle.height);
  ctx.fillStyle = rectangle.color;
  ctx.fill();
  //ctx.fillRect(-rectangle.x/2, -rectangle.y/2, rectangle.width, rectangle.height);
  //ctx.setTransform(1, 0, 0, 1, 0, 0); // honestly no idea that this is: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/rotate
  ctx.restore();
};

// if you want to draw some text on the screen use this function
let drawText = (text) => {
  ctx.fillStyle = text.color | '#fff';
  ctx.font = '20px Helvetica';
  ctx.fillText(text.message, text.x, text.y);
};
