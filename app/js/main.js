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
        width: 10,
        height: 10,
        rotation: 0,
        lasers: {
          rate: 500, //ms
          charged: 1,
          power: 1,
          active : []
        }
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

let render = () => {
  // all of your render code goes here
  drawRect(background);

  movePlayer();
  drawShip(player.ship, player.ship.rotation);

  drawLasers(player.ship.lasers.active);

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
    calcWallCollision();
  }
  if (40 in keysDown) { // Player holding down
    var movement = calcMove(player.ship.rotation, 'backward', player.ship.speed.currentSpeed);
    player.ship.y += movement.y;
    player.ship.x += movement.x;
    calcWallCollision();
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
}

// if you hit the wall jump to the other side
let calcWallCollision = (x, y) => {
  if (player.ship.y <= 0) {
    player.ship.y = c.height;
  } else if (player.ship.y >= c.height) {
    player.ship.y = 0;
  }

  if (player.ship.x <= 0) {
    player.ship.x = c.width;
  } else if (player.ship.x >= c.width) {
    player.ship.x = 0;
  }
}

let fireLaser = () => {
  // only fire if charged
  if (player.ship.lasers.charged) {
    player.ship.lasers.charged = 0; // don't let us fire again until recharged
    console.log('pew');
    let laser = {
      x: player.ship.x + (player.ship.width / 2) -1,
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
    drawShip(lasers[i], lasers[i].rotation);
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
