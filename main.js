let app = new PIXI.Application({width: 800, height: 600})

document.body.appendChild(app.view)

let background = new PIXI.Graphics()
background.beginFill(0x696a6a)
background.drawRect(0, 0, 800, 600)
background.endFill()
app.stage.addChild(background)

PIXI.loader
  .add("player.png")
  .add("fire.png")
  .add("enemy.png")
  .add("check.png")
  .add("cross.png")
  .load(setup)

let player
let fires
let enemies
let checks
let playerArrows = [false, false, false, false] //left, up, right, down
let combos = [
  "fire",
  "freeze",
  "speed"
]
let currentCombo

function setup() {
  player = new PIXI.Sprite(
    PIXI.loader.resources["player.png"].texture
  )

  app.stage.addChild(player)
  app.ticker.add(delta => gameLoop(delta))

  currentCombo = ""

  fires = []
  enemies = []
  checks = []

  loadMap()
}

function gameLoop(delta){
  if (playerArrows[0]) {
    player.x -= 1
  }
  if (playerArrows[1]) {
    player.y -= 1
  }
  if (playerArrows[2]) {
    player.x += 1
  }
  if (playerArrows[3]) {
    player.y += 1
  }
  fires.forEach(fire => {
    enemies.forEach(enemy => {
      if (hitTestRectangle(enemy, fire)) {
        enemy.kill()
        fire.kill()
      }
    })
  })
}

function loadMap() {
  createEnemy(50, 50)
  createEnemy(80, 50)
  createEnemy(80, 100)
}

function hitTestRectangle(r1, r2) {

  //Define the variables we'll need to calculate
  let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;

  //hit will determine whether there's a collision
  hit = false;

  //Find the center points of each sprite
  r1.centerX = r1.x + r1.width / 2;
  r1.centerY = r1.y + r1.height / 2;
  r2.centerX = r2.x + r2.width / 2;
  r2.centerY = r2.y + r2.height / 2;

  //Find the half-widths and half-heights of each sprite
  r1.halfWidth = r1.width / 2;
  r1.halfHeight = r1.height / 2;
  r2.halfWidth = r2.width / 2;
  r2.halfHeight = r2.height / 2;

  //Calculate the distance vector between the sprites
  vx = r1.centerX - r2.centerX;
  vy = r1.centerY - r2.centerY;

  //Figure out the combined half-widths and half-heights
  combinedHalfWidths = r1.halfWidth + r2.halfWidth;
  combinedHalfHeights = r1.halfHeight + r2.halfHeight;

  //Check for a collision on the x axis
  if (Math.abs(vx) < combinedHalfWidths) {

    //A collision might be occuring. Check for a collision on the y axis
    if (Math.abs(vy) < combinedHalfHeights) {

      //There's definitely a collision happening
      hit = true;
    } else {

      //There's no collision on the y axis
      hit = false;
    }
  } else {

    //There's no collision on the x axis
    hit = false;
  }

  //`hit` will be either `true` or `false`
  return hit;
};

window.addEventListener("keydown", e => {
  e.preventDefault()
  if (e.keyCode === 37) {
    playerArrows[0] = true
  }
  if (e.keyCode === 38) {
    playerArrows[1] = true
  }
  if (e.keyCode === 39) {
    playerArrows[2] = true
  }
  if (e.keyCode === 40) {
    playerArrows[3] = true
  }
})

window.addEventListener("keyup", e => {
  e.preventDefault()
  if (e.keyCode === 37) {
    playerArrows[0] = false
    currentCombo = ""
  } else if (e.keyCode === 38) {
    playerArrows[1] = false
    currentCombo = ""
  } else if (e.keyCode === 39) {
    playerArrows[2] = false
    currentCombo = ""
  } else if (e.keyCode === 40) {
    playerArrows[3] = false
    currentCombo = ""
  } else {
    currentCombo += e.key
    handleCombos()
  }
})

function contain(sprite, container) {

  let collision = undefined;

  //Left
  if (sprite.x < container.x) {
    sprite.x = container.x;
    collision = "left";
  }

  //Top
  if (sprite.y < container.y) {
    sprite.y = container.y;
    collision = "top";
  }

  //Right
  if (sprite.x + sprite.width > container.width) {
    sprite.x = container.width - sprite.width;
    collision = "right";
  }

  //Bottom
  if (sprite.y + sprite.height > container.height) {
    sprite.y = container.height - sprite.height;
    collision = "bottom";
  }

  //Return the `collision` value
  return collision;
}

function handleCombos() {
  const targetCombo = combos.find(x => x === currentCombo)
  const availableCombos = combos.filter(x => x.substring(0, currentCombo.length) === currentCombo)
  
  if (targetCombo) {
    if (targetCombo === "fire") {
      createFires()
    }
    animateSucess()

    currentCombo = ""
    checks.forEach(check => app.stage.removeChild(check))
    checks = []
  } else if (availableCombos.length === 0) {
    animateFail()
    currentCombo = ""
    checks.forEach(check => app.stage.removeChild(check))
    checks = []
    console.log('----------- FAIL -----------')
  } else {
    let check = new PIXI.Sprite(
      PIXI.loader.resources["check.png"].texture
    )
    check.x = currentCombo.length * 50
    check.y = 200
    checks.push(check)
    app.stage.addChild(check)
  }
}

function createFire() {
  let fire = new PIXI.Sprite(
    PIXI.loader.resources["fire.png"].texture
  )
  fires.push(fire)
  fire.x = player.x
  fire.y = player.y
  let fireTime = 80
  let speed = 1
  let fireDirection = { 
    x: (Math.random() - 0.5) * 2,
    y: (Math.random() - 0.5) * 2
  }

  app.stage.addChild(fire)

  let tickz = delta => {
    fireTime -= delta
    speed = speed > 0.1 ? speed - 0.008 : speed;
    fire.x += fireDirection.x * speed
    fire.y += fireDirection.y * speed
    if (fireTime < 0) {
      fire.kill()
    }
  }

  fire.kill = function() {
    app.stage.removeChild(fire)
    app.ticker.remove(tickz)
    fires = fires.filter(x => x !== fire)
  }

  app.ticker.add(tickz)
}

function createFires() {
  for (let i = 0; i < 10; i++) {
    createFire()
  }
}

function createEnemy(x, y) {
  let enemy = new PIXI.Sprite(
    PIXI.loader.resources["enemy.png"].texture
  )
  enemies.push(enemy)
  enemy.x = x
  enemy.y = y

  enemy.kill = function() {
    app.stage.removeChild(enemy)
    app.ticker.remove(tickz)
    enemies = enemies.filter(x => x !== enemy)
  }
  
  app.stage.addChild(enemy)

  let tickz = delta => {
    
  }

  app.ticker.add(tickz)
}

function animateSucess() {
  new Array(currentCombo.length).fill().forEach((_, i) => {
    let check = new PIXI.Sprite(
      PIXI.loader.resources["check.png"].texture
    )
    check.x = (i * 50) + 50
    check.y = 200
    app.stage.addChild(check)
    let lifetime = 60
    const tick = delta => {
      check.y -= 1
      lifetime -= delta
      check.alpha -= 0.01
      check.scale.x += 0.004
      check.scale.y += 0.004
      if (lifetime < 0) {
        app.ticker.remove(tick)
        app.stage.removeChild(check)
      }
    }
    app.ticker.add(tick)
  })
}

function animateFail() {
  new Array(currentCombo.length).fill().forEach((_, i) => {
    const icon = i === currentCombo.length-1 ? "cross.png" : "check.png";
    let check = new PIXI.Sprite(
      PIXI.loader.resources[icon].texture
    )
    check.x = (i * 50) + 50
    const startX = check.x
    check.y = 200
    app.stage.addChild(check)
    let lifetime = 60
    const tick = delta => {
      if (icon === "cross.png") {
        check.x = startX + (Math.sin(delta * 1000) * 3)
      }
      check.y -= 1
      lifetime -= delta
      check.alpha -= 0.01
      check.scale.x += 0.004
      check.scale.y += 0.004
      if (lifetime < 0) {
        app.ticker.remove(tick)
        app.stage.removeChild(check)
      }
    }
    app.ticker.add(tick)
  })
}