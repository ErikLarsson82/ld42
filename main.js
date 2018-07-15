let app = new PIXI.Application({width: 800, height: 600})

document.body.appendChild(app.view)

let background = new PIXI.Graphics()
background.beginFill(0x696a6a)
background.drawRect(0, 0, 800, 600)
background.endFill()
app.stage.addChild(background)

PIXI.loader
  .add("player.png")
  .add("speed.png")
  .add("fire.png")
  .add("freeze.png")
  .add("freezed.png")
  .add("enemy.png")
  .add("chaser.png")
  .add("pylon.png")
  .add("check.png")
  .add("cross.png")
  .load(setup)

let player,
  gameover,
  speed,
  pylons,
  fires,
  freezes,
  enemies,
  chasers,
  checks,
  currentCombo,
  speedTimer,
  playerArrows = [false, false, false, false], //left, up, right, down
  combos = [
    "fire",
    "freeze",
    "speed"
  ],
  alphabet = "abcdefghijklmnopqrstuvxyz"


function setup() {
  player = new PIXI.Sprite(
    PIXI.loader.resources["player.png"].texture
  )

  app.stage.addChild(player)
  app.ticker.add(delta => gameLoop(delta))

  speed = new PIXI.Sprite(
    PIXI.loader.resources["speed.png"].texture
  )
  speed.visible = false
  speed.x = -8
  speed.y = 0
  player.addChild(speed)

  currentCombo = ""

  gameover = false

  pylons = []
  freezes = []
  fires = []
  enemies = []
  chasers = []
  checks = []

  speedTimer = null

  loadMap()
}

function gameLoop(delta){
  if (gameover)
    return
  
  let multiplier = speedTimer !== null ? 3 : 1

  if (playerArrows[0]) {
    player.x -= 1 * multiplier
  }
  if (playerArrows[1]) {
    player.y -= 1 * multiplier
  }
  if (playerArrows[2]) {
    player.x += 1 * multiplier
  }
  if (playerArrows[3]) {
    player.y += 1 * multiplier
  }
  fires.forEach(fire => {
    enemies.forEach(enemy => {
      if (hitTestRectangle(enemy, fire)) {
        enemy.kill()
        fire.kill()
      }
    })
  })

  chasers.forEach(chaser => {
    freezes.forEach(freeze => {
      if (hitTestRectangle(chaser, freeze)) {
        chaser.freeze()
        freeze.kill()
      }
    })

    if (hitTestRectangle(chaser, player)) {
      gameover = true
      console.log('Game over')
    }
  })

  pylons.forEach(pylon => {
    if (hitTestRectangle(player, pylon)) {
      pylon.kill()
    }
  })

  if (pylons.length === 0) {
    gameover = true
    console.log('Game over')
  }
  
  if (speedTimer !== null) {
    if (speedTimer < 0) {
      speedTimer = null
      speed.visible = false      
    } else {
      speedTimer -= delta
    }
  }
}

function loadMap() {
  createEnemy(50, 50)
  createEnemy(80, 50)
  createEnemy(80, 100)
  createPylon(100, 200)
  createPylon(150, 200)
  createPylon(200, 200)
  createChaser(300, 300)
}

function hitTestRectangle(r1, r2) {
  let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;
  hit = false;
  r1.centerX = r1.x + r1.width / 2;
  r1.centerY = r1.y + r1.height / 2;
  r2.centerX = r2.x + r2.width / 2;
  r2.centerY = r2.y + r2.height / 2;
  r1.halfWidth = r1.width / 2;
  r1.halfHeight = r1.height / 2;
  r2.halfWidth = r2.width / 2;
  r2.halfHeight = r2.height / 2;
  vx = r1.centerX - r2.centerX;
  vy = r1.centerY - r2.centerY;
  combinedHalfWidths = r1.halfWidth + r2.halfWidth;
  combinedHalfHeights = r1.halfHeight + r2.halfHeight;
  if (Math.abs(vx) < combinedHalfWidths) {
    if (Math.abs(vy) < combinedHalfHeights) {
      hit = true;
    } else {
      hit = false;
    }
  } else {
    hit = false;
  }
  return hit;
};

window.addEventListener("keydown", e => {
  
  if (e.keyCode === 37) {
    playerArrows[0] = true
    e.preventDefault()
  } else if (e.keyCode === 38) {
    playerArrows[1] = true
    e.preventDefault()
  } else if (e.keyCode === 39) {
    playerArrows[2] = true
    e.preventDefault()
  } else if (e.keyCode === 40) {
    playerArrows[3] = true
    e.preventDefault()
  } else if (alphabet.indexOf(e.key) !== -1) {
    e.preventDefault()
  }
})

window.addEventListener("keyup", e => {
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
  } else if (alphabet.indexOf(e.key) !== -1) {
    e.preventDefault()
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
    if (targetCombo === "freeze") {
      createFreezes()
    }
    if (targetCombo === "speed") {
      speedTimer = 100
      speed.visible = true
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
  fire.x = player.x + Math.round(player.width/2)
  fire.y = player.y + Math.round(player.height/2)
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

function createFreeze() {
  let freeze = new PIXI.Sprite(
    PIXI.loader.resources["freeze.png"].texture
  )
  freezes.push(freeze)
  freeze.x = player.x + Math.round(player.width/2) + Math.round((Math.random() - 0.5) * 70)
  freeze.y = player.y + Math.round(player.height/2) + Math.round((Math.random() - 0.5) * 70)
  let freezeTime = 600
  let speed = 0.02
  let freezeDirection = { 
    x: (Math.random() - 0.5) * 2,
    y: (Math.random() - 0.5) * 2
  }

  app.stage.addChild(freeze)

  let tickz = delta => {
    freezeTime -= delta
    freeze.x += freezeDirection.x * speed
    freeze.y += freezeDirection.y * speed
    if (freezeTime < 0) {
      freeze.kill()
    }
  }

  freeze.kill = function() {
    app.stage.removeChild(freeze)
    app.ticker.remove(tickz)
    freezes = freezes.filter(x => x !== freeze)
  }

  app.ticker.add(tickz)
}

function createFreezes() {
  for (let i = 0; i < 4; i++) {
    createFreeze()
  }
}

function createPylon(x, y) {
  let pylon = new PIXI.Sprite(
    PIXI.loader.resources["pylon.png"].texture
  )
  pylons.push(pylon)
  pylon.x = x
  pylon.y = y

  pylon.kill = function() {
    app.stage.removeChild(pylon)
    app.ticker.remove(tickz)
    pylons = pylons.filter(x => x !== pylon)
  }
  
  app.stage.addChild(pylon)

  let tickz = delta => {
    
  }

  app.ticker.add(tickz)
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

function createChaser(x, y) {
  let chaser = new PIXI.Sprite(
    PIXI.loader.resources["chaser.png"].texture
  )
  chasers.push(chaser)
  chaser.x = x
  chaser.y = y

  let timeout

  let freezed = new PIXI.Sprite(
    PIXI.loader.resources["freezed.png"].texture
  )
  freezed.x = -8
  freezed.y = -8
  freezed.visible = false
  chaser.addChild(freezed)

  chaser.kill = function() {
    app.stage.removeChild(chaser)
    app.ticker.remove(tickz)
    chasers = chasers.filter(x => x !== chaser)
  }

  chaser.freeze = function() {
    timeout = 400
    freezed.visible = true
  }
  
  app.stage.addChild(chaser)

  const chaseSpeed = 0.1

  let tickz = delta => {
    if (freezed.visible === false) {
      chaser.x += chaseSpeed * (chaser.x > player.x ? -1 : 1)
      chaser.y += chaseSpeed * (chaser.y > player.y ? -1 : 1)
    } else {
      timeout -= delta
    }
    if (timeout < 0) {
      timeout = null
      freezed.visible = false
    }
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