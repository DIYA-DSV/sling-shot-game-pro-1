
World.frameRate = 60;

var Slingshot = createSprite(200,315);

var RestartBtn = createSprite(375,25);
RestartBtn.scale = 0.25;

var Obstacles = [];
var Clouds = [];
var Chests = [];

function SpawnObstacle() {
  var New = createSprite(randomNumber(450,2500),Ground - 40);
  New.scale = 0.5;
  Obstacles[Obstacles.length] = New;
}

function SpawnClouds() {
  var MaxClouds = randomNumber(10,20);
  for (var A = 1;A < MaxClouds;A++) {
    var Cloud = createSprite(randomNumber(A/MaxClouds * 5000 - 100,A/MaxClouds * 5000 + 100),randomNumber(0,200));
    Cloud.scale = 0.3;
    Clouds[Clouds.length] = Cloud;
  }
}

function SpawnChests() {
  var MaxChests = randomNumber(3,6);
  for (var A = 1;A < MaxChests;A++) {
    var Chest = createSprite(randomNumber(A/MaxChests * 10000 - 100,A/MaxChests * 10000 + 100),Ground - 30);
    Chest.scale = 0.3;
    Chests[Chests.length] = Chest;
  }
}

function Distance(x1,y1,x2,y2) {
  var A = Math.abs(x1 - x2);
  var B = Math.abs(y2 - y1);
  var CC = A*A + B*B;
  var C = sqrt(CC);
  return C;
}

function Angle(cx, cy, ex, ey) {
  var dy = ey - cy;
  var dx = ex - cx;
  var theta = Math.abs(Math.atan2(dy, dx));
  theta *= 180 / Math.PI; 
  return theta;
}


var LaunchProperties = {Angle:0,Power:0};
var StartPosition = {X:Slingshot.x,Y:Slingshot.y - 35};
var HoldPosition = {X:StartPosition.X,Y:StartPosition.Y};
var BallPosition = {X:HoldPosition.X,Y:HoldPosition.Y};
var BallVelocity = {X:0,Y:0};
var Firing = false;
var Holding = false;
var Hit = false;
var Points = 0;

var BallSize = 20;
var Gravity = 0.25;
var Ground = 375;
var GroundFriction = 0.75; 
var Elasticity = 0.8;

var Ball = createSprite(BallPosition.X,BallPosition.Y);
Ball.scale = BallSize/100;

SpawnClouds();
SpawnChests();
function draw() {
  background(180,240,255);
  // BG
  noStroke();
  fill(255,255,120);
  rect(0,350,400,50);
  
  fill(255,255,60);
  ellipse(50,50,50,50);
  if (!Holding && !Firing && mouseWentDown("leftButton")) {
    Holding = true;
  }
  if (Holding) {
    if (mouseDown("leftButton") && !Firing) {
      if (World.mouseX <= StartPosition.X) {
        HoldPosition.X = World.mouseX;
      } else {
        HoldPosition.X = StartPosition.X;
      }
      if (World.mouseY >= StartPosition.Y) {
        HoldPosition.Y = World.mouseY;
        if (World.mouseY <= Ground - BallSize/2) {
          HoldPosition.Y = World.mouseY;
        } else {
          HoldPosition.Y = Ground - BallSize/2;
        }
      } else {
        HoldPosition.Y = StartPosition.Y;
      }
      BallPosition = {X:HoldPosition.X,Y:HoldPosition.Y};
      LaunchProperties.Angle = Angle(StartPosition.X,StartPosition.Y,HoldPosition.X,HoldPosition.Y);

      LaunchProperties.Power = Distance(HoldPosition.X,HoldPosition.Y,StartPosition.X,StartPosition.Y);

      fill(150,150,30);
      textSize(15);
      textAlign(LEFT,BOTTOM);
      text("Angle: " + Math.round(LaunchProperties.Angle) + "°",10,390);
    } else if (mouseWentUp("leftButton")) {
      SpawnObstacle();
      Holding = false;
      Firing = true;
      var AngleY = -2 * (1 - LaunchProperties.Angle/180);
      var AngleX = 1 + AngleY;
      BallVelocity.X = AngleX * LaunchProperties.Power/3;
      BallVelocity.Y =  AngleY * LaunchProperties.Power/3;
    }
  } else if (!Firing) {
    HoldPosition.X = StartPosition.X;
    HoldPosition.Y = StartPosition.Y;
  }
  
  drawSprites();
  
  fill(150,150,30);
  textSize(15);
  textAlign(RIGHT,BOTTOM);
  if (Points == 1) {
    text(Points + " Point",390,390);
  } else {
    text(Points + " Points",390,390);
  }
  

  if (Firing) {
    fill(255,255,255);
    textSize(20);
    textAlign(CENTER,TOP);
    if (BallPosition.X > Slingshot.x) {
      text("Distance: " + Math.round((BallPosition.X - Slingshot.x)/10)/10 + " meters",200,20);
      if (Hit) {
        fill(255,127,127);
        textSize(15);
        text("You've been hit by a cactus!",200,50);
      }
    }
    Slingshot.x -= BallVelocity.X;
    for (var N in Obstacles) {
      Obstacles[N].x -= BallVelocity.X;
      if (Ball.isTouching(Obstacles[N])) {
        BallVelocity.X *= 0.6; // 0.6
        BallVelocity.Y *= 0.6;
        Hit = true;
      }
      if (N == Obstacles.length - 1) {
        if (Obstacles[N].x < BallPosition.X) {
          SpawnObstacle();
        }
      }
      if (N == 1) {
        if (Obstacles[N].x < 0 - 60) {
          Obstacles[N].destroy();
          delete Obstacles[N];
        }
      }
    }
    for (var C in Clouds) {
      Clouds[C].x -= BallVelocity.X/10;
    }
    for (var T in Chests) {
      Chests[T].x -= BallVelocity.X;
      if (Ball.isTouching(Chests[T]) && Chests[T].visible) {
        Points++;
        Chests[T].visible = false;
      }
    }
    BallPosition.Y += BallVelocity.Y;
    BallVelocity.Y += Gravity;
    if (BallPosition.Y + BallSize/2 > Ground) {
      BallPosition.Y = Ground - BallSize/2;
      BallVelocity.Y = -BallVelocity.Y * Elasticity;
      BallVelocity.X *= GroundFriction;
    }
    
    if (mousePressedOver(RestartBtn)) {
      Firing = false;
      for (var N in Obstacles) {
        Obstacles[N].destroy();
        delete Obstacles[N];
      }
      for (var C in Clouds) {
        Clouds[C].destroy();
        delete Clouds[C];
      }
      for (var T in Chests) {
        Chests[T].destroy();
        delete Chests[T];
      }
      SpawnClouds();
      SpawnChests();
      Slingshot.x = StartPosition.X;
      BallVelocity.X = 0;
      BallVelocity.Y = 0;
      HoldPosition.X = StartPosition.X;
      HoldPosition.Y = StartPosition.Y;
      BallPosition.X = HoldPosition.X;
      BallPosition.Y = HoldPosition.Y;
      Hit = false;
    }
  }
  
  //for rope in sling shot
  if (BallPosition.X <= Slingshot.x && BallPosition.Y >= StartPosition.Y) {
    strokeWeight(5);
    stroke(200,200,200);
    line(BallPosition.X,BallPosition.Y,Slingshot.x + 35,StartPosition.Y);
    line(BallPosition.X,BallPosition.Y,Slingshot.x - 35,StartPosition.Y);
  }
  
  

  Ball.x = BallPosition.X;
  Ball.y = BallPosition.Y;
}