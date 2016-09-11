'use strict';

let c,
    ctx,
    fps = 60,
    background,
    player = {
      ship: {
        color: '#fff',
        x: 0,
        y: 0,
        speed: {
          maxSpeed: 10,
          currentSpeed: 5,
          rotate: 2,
          maxRotate: 10,
          currentX: 0,
          currentY: 0,
        },
        width: 19,
        height: 10,
        rotation: 0,
        lasers: {
          rate: 200, //ms
          charged: 1,
          power: 1,
          active : []
        }
      },
      score: 0,
      lives: 10,
    },
    asteroids = [],
    keysDown = {},
    startScreen = false;

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

  background = {
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

let gameOver = () => {
  ctx.fillStyle = 'black';
  ctx.fillRect(0,0,c.width,c.height);

  // write the health
  ctx.fillStyle = 'white';
  ctx.font = '40px Helvetica';
  let message = 'You lost!';
  let messageTextWidth = ctx.measureText(message);
  ctx.fillText(message, (c.width/2 - messageTextWidth.width/2), 200)

  ctx.fillStyle = 'white';
  ctx.font = '20px Helvetica';
  let restartText = 'Press S to start again';
  let restartTextWidth = ctx.measureText(restartText);
  ctx.fillText(restartText, (c.width/2 - restartTextWidth.width/2), 300)
}

let restartGame = () => {
  player.lives = 10;
  player.score = 0;
  player.ship.lasers.active = [];
  asteroids = [];
  startScreen = false;
}


let render = () => {

  movePlayer();

  if (startScreen) {
    gameOver();
    return;
  }
  // all of your render code goes here
  drawRect(background);

  //drawRotatedRectangle(player.ship, player.ship.rotation);
  drawShip(player.ship);

  drawLasers(player.ship.lasers.active);

  getAsteroids();

  calcLaserHits();
  calcShipHits();

  renderStatusBar();
}

let renderStatusBar = () => {
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
    player.ship = calcWallCollision(player.ship);
  }
  if (40 in keysDown) { // Player holding down
    var movement = calcMove(player.ship.rotation, 'backward', player.ship.speed.currentSpeed);
    player.ship.y -= movement.y;
    player.ship.x -= movement.x;
    player.ship = calcWallCollision(player.ship);
  }
  if (37 in keysDown) { // Player holding left
    player.ship.rotation += -player.ship.speed.rotate; // left is a negative degree
  }
  if (39 in keysDown) { // Player holding right
    player.ship.rotation += player.ship.speed.rotate; // right is a positive degree
  }
  if (32 in keysDown) { // space
    fireLaser();
  }
  if (83 in keysDown) { // S
    if (startScreen) {
      restartGame();
    }
  }
}

// if you hit the wall jump to the other side
let calcWallCollision = (unit) => {
  if (unit.y <= 0) {
    unit.y = c.height;
  } else if (unit.y >= c.height) {
    unit.y = 0;
  }

  if (unit.x <= 0) {
    unit.x = c.width;
  } else if (unit.x >= c.width) {
    unit.x = 0;
  }

  return unit;
}

let fireLaser = () => {
  // only fire if charged
  if (player.ship.lasers.charged) {
    player.ship.lasers.charged = 0; // don't let us fire again until recharged
    let laser = {
      x: player.ship.x + (player.ship.width / 2) + 10,
      y: player.ship.y,
      width: 2,
      height: 6,
      color: 'red',
      rotation: player.ship.rotation,
      speed: 10 // this should be a variable and can get faster/slower based on powerups maybe
    }
    player.ship.lasers.active.push(laser);
    setTimeout(() => {
      player.ship.lasers.charged = 1;
    }, player.ship.lasers.rate);
  }
}

// function to draw lasers
let drawLasers = (lasers) => {
  for (let i = 0; i < lasers.length; i++) {
    var movement = calcMove(lasers[i].rotation, 'forward', lasers[i].speed);
    lasers[i].y += movement.y;
    lasers[i].x += movement.x;
    lasers[i] = calcWallCollision(lasers[i]);
    drawRotatedRectangle(lasers[i], lasers[i].rotation);
  }
}

let getAsteroids = () => {
  let randomNumber = Math.floor(Math.random() * 75); // between 0-75
  // random number to decide if we should make a new asteroid
  if (randomNumber == 42) {
    generateAsteroids();
  }

  for (let i = 0; i < asteroids.length; i++) {
    var movement = calcMove(asteroids[i].degree, 'sure', asteroids[i].speed); // calc where we're going
    asteroids[i].y += movement.y;
    asteroids[i].x += movement.x;
    asteroids[i] = calcWallCollision(asteroids[i]);
    drawRotatedOutline(asteroids[i], asteroids[i].degree);
  }
};

// need to randomly create asteroids
let generateAsteroids = () => {
  // most of this is going to be completely randomly generated
  let min = 4;
  let max = 50;
  let size = Math.floor(Math.random() * (max - min) + min);
  let asteroid = {
    x: Math.floor(Math.random() * (c.width + 100) - 50),
    y: Math.floor(Math.random() * (c.height + 100) - 50),
    width: size,
    height: size,
    degree: Math.floor(Math.random() * 360),
    speed: Math.floor(Math.random() * (7 - 2) + 2),
    color: 'yellow',
  }
  asteroids.push(asteroid);
}

// calculate if you hit an asteroid
let calcLaserHits = () => {
  // for each laser current on screen
  for (let i = 0; i < player.ship.lasers.active.length; i++) {
    let laser = player.ship.lasers.active[i];
    for (let a = 0; a < asteroids.length; a++) {
      if (laser.x >= asteroids[a].x &&
          laser.x <= (asteroids[a].x + asteroids[a].width) &&
          laser.y <= asteroids[a].y &&
          laser.y >= (asteroids[a].y - asteroids[a].height)
         ) {
        // you should be between this asteroid
        // when you hit an asteroid we remove the asteroid and the laser
        asteroids.splice(a, 1);
        player.ship.lasers.active.splice(i, 1);
        player.score++;
      }
    }
  }
}

// calculate if you got hit by an asteroid
let calcShipHits = () => {
  // for each laser current on screen
  let ship = player.ship;
  for (let a = 0; a < asteroids.length; a++) {
    if (ship.x >= asteroids[a].x &&
        ship.x <= (asteroids[a].x + asteroids[a].width) &&
        ship.y <= asteroids[a].y &&
        ship.y >= (asteroids[a].y - asteroids[a].height)
       ) {
      // you should be between this asteroid
      asteroids.splice(a, 1);
      player.lives--;
    }
  }
  let lasers = player.ship.lasers.active;
  for (let i = 0; i < lasers.length; i++) {
    if (lasers[i].x >= ship.x &&
        lasers[i].x <= ship.x + ship.width &&
        lasers[i].y >= ship.y &&
        lasers[i].y <= ship.y + ship.height
       ) {
        player.ship.lasers.active.splice(i, 1);
        player.lives--;
    }
  }
  // see if you just died
  if (player.lives <= 0) {
    startScreen = true;
  }
}

// I need to do some math to figure out how much and where to move the object
// planning on using direction to know if you hit up for down since that will do something different
let calcMove = (degree, direction, speed) => {
  // we need to using your speed (Hypotenuse) find your movement on X & Y
  let triangleDegree = degree % 90; // triangles have a max angle of 90

  var movement = {};
  movement.adjacent = Math.sin(triangleDegree * Math.PI / 180.0) * speed; // turns out Math.sin uses radians instead of deg
  movement.opposite = Math.sqrt(Math.pow(speed,2) - Math.pow(movement.adjacent,2));
  let positiveDegree = degree;
  // degree for this needs to always be positive
  // this isn't a good enough check it turns out when you're negative I think x&y need to be flipped too.
  if (Math.sign(positiveDegree) == -1) {
    positiveDegree = -(positiveDegree);
  }
  // I need to figure out what quadrant (that's what I'm calling it) you're currently moving in, based on that the X,Y values could flip or get negated.
  let quadrantDegree = positiveDegree % 360;
  if (Math.sign(degree) == -1) {
    // need to figure out if there is a more efficent way to do this.
    // also need ${direction to do something...}
    // seems to be a slight movement jank around the 90º mark
    if (quadrantDegree <= 90) {
      movement.y = -movement.opposite;
      movement.x = movement.adjacent;
    } else if (quadrantDegree <= 180) {
      movement.x = -movement.opposite;
      movement.y = -movement.adjacent;
    } else if (quadrantDegree <= 270) {
      movement.y = movement.opposite;
      movement.x = -movement.adjacent;
    } else if (quadrantDegree <= 360) {
      movement.x = movement.opposite;
      movement.y = movement.adjacent;
    }
  } else {
    if (quadrantDegree <= 90) {
      movement.y = -movement.opposite;
      movement.x = movement.adjacent;
    } else if (quadrantDegree <= 180) {
      movement.x = movement.opposite;
      movement.y = movement.adjacent;
    } else if (quadrantDegree <= 270) {
      movement.y = movement.opposite;
      movement.x = -movement.adjacent;
    } else if (quadrantDegree <= 360) {
      movement.x = -movement.opposite;
      movement.y = -movement.adjacent;
    }
  }

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

let drawRotatedRectangle = (rectangle, rotation = 0) => {
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

let drawShip = (ship) => {
  ctx.save();
  ctx.translate(ship.x >> 0, ship.y >> 0); // this is supposed to rotate it around the center point
  ctx.rotate(ship.rotation * Math.PI / 180); // this is used to rotate the object
  //ctx.rect(-rectangle.width/2, -rectangle.height/2, rectangle.width, rectangle.height);
  ctx.beginPath();
  ctx.moveTo(10, 0);
  ctx.lineTo(-10, -10);
  ctx.lineTo(-10, 10);
  ctx.lineTo(10, 0);
  ctx.fillStyle = 'white';
  ctx.fill();
  ctx.restore();
}
// I want to be able to draw borders too
let drawRotatedOutline = (rectangle, rotation = 0) => {
  ctx.save();
  ctx.beginPath();
  ctx.translate((rectangle.x + rectangle.width / 2), (rectangle.y + rectangle.height / 2)); // this is supposed to rotate it around the center point
  ctx.rotate(rotation * Math.PI / 180); // this is used to rotate the object
  ctx.rect(-rectangle.width/2, -rectangle.height/2, rectangle.width, rectangle.height);
  ctx.fillStyle = 'black';
  ctx.fill();
  ctx.strokeStyle = rectangle.color;
  ctx.stroke();
  //ctx.fillRect(-rectangle.x/2, -rectangle.y/2, rectangle.width, rectangle.height);
  //ctx.setTransform(1, 0, 0, 1, 0, 0); // honestly no idea that this is: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/rotate
  ctx.restore();
};
// if you want to draw some text on the screen use this function
let drawText = (text) => {
  ctx.fillStyle = '#fff';
  ctx.font = '20px Helvetica';
  ctx.fillText(text.message, text.x, text.y);
};
