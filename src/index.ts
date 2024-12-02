import './styles/style.css'
import * as PIXI from 'pixi.js'

const SYMBOL_SIZE: number = 156
const VISIBLE_SYMBOLS: number = 5

let ticker: PIXI.Ticker

// App initialization
const app: PIXI.Application = new PIXI.Application();
await app.init({  
  width: window.innerWidth,
  height: window.innerHeight, 
  resizeTo: window 
});
document.body.appendChild(app.canvas)

// Background picture set
const backgroundTexture: PIXI.Texture = await PIXI.Assets.load('./assets/background.jpg')
const backgroundSprite: PIXI.Sprite = new PIXI.Sprite(backgroundTexture)

backgroundSprite.anchor.set(0.5)

backgroundSprite.x = app.screen.width / 2
backgroundSprite.y = app.screen.height / 2

function resizeBackground(): void {
  const scaleX: number = app.screen.width / backgroundSprite.texture.width
  const scaleY: number = app.screen.height / backgroundSprite.texture.height
  const scale: number = Math.max(scaleX, scaleY)

  backgroundSprite.scale.set(scale)
}

resizeBackground()

app.stage.addChild(backgroundSprite)

// Reel container
const reelContainer: PIXI.Container = new PIXI.Container()
app.stage.addChild(reelContainer)

const symbols: Record<string, PIXI.Sprite> = await PIXI.Assets.load([
  './assets/symbol_10.png', 
  './assets/symbol_9.png',
  './assets/symbol_ace.png',
  './assets/symbol_axe.png',
  './assets/symbol_brain.png',
  './assets/symbol_crow.png',
  './assets/symbol_jack.png',
  './assets/symbol_king.png',
  './assets/symbol_queen.png',
  './assets/symbol_rifle.png',
]);

const symbolKeys: string[] = Object.keys(symbols)

// Generating a random symbol order
let randomOrderSymbols: string[] = []

while (randomOrderSymbols.length < symbolKeys.length) {
  const randomIndex: number = Math.floor(Math.random() * symbolKeys.length)
  const randomSymbol: string = symbolKeys[randomIndex]

  if (!randomOrderSymbols.includes(randomSymbol)) {
    randomOrderSymbols.push(randomSymbol)
  }
}

// Displaying slots
const slotTextures: PIXI.Sprite[] = randomOrderSymbols.map((key: string): PIXI.Sprite => new PIXI.Sprite(symbols[key]))

slotTextures.forEach((slotTexture: PIXI.Sprite, index: number) => {
  slotTexture.x = index * SYMBOL_SIZE
  slotTexture.scale.x = slotTexture.scale.y = Math.min(SYMBOL_SIZE / slotTexture.width, SYMBOL_SIZE / slotTexture.height)
  reelContainer.addChild(slotTexture)
})

// Creating mask for container
const maskGraphics: PIXI.Graphics = new PIXI.Graphics()
maskGraphics.fill(0x000000)
maskGraphics.rect(0, 0, SYMBOL_SIZE * VISIBLE_SYMBOLS, SYMBOL_SIZE)
maskGraphics.fill()

reelContainer.mask = maskGraphics

reelContainer.x = (window.innerWidth - SYMBOL_SIZE * VISIBLE_SYMBOLS) / 2
reelContainer.y = (window.innerHeight - SYMBOL_SIZE) / 2

maskGraphics.x = reelContainer.x
maskGraphics.y = reelContainer.y

app.stage.addChild(maskGraphics)

// Creating a spin button
const button: PIXI.Texture = await PIXI.Assets.load('./assets/spin_button.png')
const spinButton: PIXI.Sprite = new PIXI.Sprite(button)

spinButton.interactive = true
spinButton.cursor = 'pointer'

app.stage.addChild(spinButton)

// Winframe set
const winframe: PIXI.Texture = await PIXI.Assets.load('./assets/winframe.png')
const winframeTexture: PIXI.Sprite = new PIXI.Sprite(winframe)

winframeTexture.anchor.set(0.5)
winframeTexture.x = window.innerWidth / 2
winframeTexture.y = reelContainer.y + SYMBOL_SIZE / 2
winframeTexture.scale.set(0)

app.stage.addChild(winframeTexture)

// Winframe display and hide functions
const showWinframe = (): void => {
  ticker = new PIXI.Ticker()
  let scale: number = 0

  ticker.add((): void => {
    if (scale < 1) {
      scale += 0.1
      winframeTexture.scale.set(scale)
    } else {
      winframeTexture.scale.set(1)
      ticker.stop()
    }
  })
  ticker.start()
};

const hideWinFrame = (): void => {
  winframeTexture.scale.set(0)
};

// Ease-out function to slow down spinning
function easeOut(x: number): number {
  return x === 0
    ? 0
    : x === 1
    ? 1
    : x < 0.5 ? Math.pow(2, 20 * x - 10) / 2
    : (2 - Math.pow(2, -20 * x + 10)) / 2
}

// Find the winning symbol
const containerCenter: number = winframeTexture.x / 4 + SYMBOL_SIZE

const findClosestToCenter = (): PIXI.Sprite => {
  return slotTextures.reduce((closest: PIXI.Sprite, current: PIXI.Sprite) => {
    return Math.abs(current.x - containerCenter) < Math.abs(closest.x - containerCenter) ? current : closest
  })
}

let closestSymbol: PIXI.Sprite

const getWinningSymbol = (): PIXI.Sprite => {
  closestSymbol = findClosestToCenter()
  return closestSymbol
};

const calculateWin = (): number => {
  return Math.random() * 100
};

let winningSymbolSprite: PIXI.Sprite
let winningMessage: PIXI.Text

winningSymbolSprite = new PIXI.Sprite(slotTextures[0].texture)
app.stage.addChild(winningSymbolSprite)

winningSymbolSprite.visible = false

const displayWinningMessage = (symbol: PIXI.Sprite, winAmount: number) => {
  winningSymbolSprite.texture = symbol.texture
  winningSymbolSprite.visible = true

  winningSymbolSprite.x = 600
  winningSymbolSprite.y = 100

  winningMessage = new PIXI.Text({text: '', style: { fontFamily: 'Arial', fontSize: 50, fill: 0x176969 }})
  app.stage.addChild(winningMessage)

  winningMessage.text = `wins $${winAmount.toFixed(2)}`
  winningMessage.x = winningSymbolSprite.x + winningSymbolSprite.width + 30
  winningMessage.y = winningSymbolSprite.y + winningSymbolSprite.height / 2.5

  winningMessage.visible = true
};

// The functions of spinning and stopping the reel
let isSpinning: boolean = false

const spinReel = (): void => {
  if (isSpinning) {
    stopReel()
    return
  }

  isSpinning = true;
  hideWinFrame()

  if (winningSymbolSprite) {
    winningSymbolSprite.visible = false
  }

  if (winningMessage) {
    winningMessage.visible = false
    winningMessage.text = ''
  }

  let step: number
  let time: number = 0
  const duration: number = 4

  ticker = new PIXI.Ticker()

  ticker.add(() => {
    if (!ticker) return
    time += ticker.deltaMS / 1000
    const progress: number = time / duration
    step = (1 - easeOut(progress)) * 100

    if (progress > 0.5) {
      step = (step + 16) * (1.2 - progress)
    }

    slotTextures.forEach((slotTexture) => {
      slotTexture.x -= step;

      if (slotTexture.x + SYMBOL_SIZE < 0) {
        slotTexture.x += SYMBOL_SIZE * slotTextures.length
      }
    });

    if (progress >= 1) {
      stopReel()
    }
  });

  ticker.start()
};

const stopReel = (): void => {
  if (ticker) {
    ticker.stop();
  }

  alignSymbols()
  
  setTimeout(() => {
    const winningSymbol: PIXI.Sprite = getWinningSymbol()
    const winAmount: number = calculateWin()
    displayWinningMessage(winningSymbol, winAmount)
  }, 500)

  isSpinning = false
  hideWinFrame()
}

// Alignment of slots when they go out of the container boundaries
const alignSymbols = (): void => {
  const ticker: PIXI.Ticker = new PIXI.Ticker()

  ticker.add(() => {
    let allAligned: boolean = true

    slotTextures.forEach((sprite: PIXI.Sprite) => {
      const targetX: number = Math.round(sprite.x / SYMBOL_SIZE) * SYMBOL_SIZE
      const diff: number = targetX - sprite.x

      if (Math.abs(diff) > 2) {
        allAligned = false
        sprite.x += diff * 0.2
      } else {
        sprite.x = targetX
      }
    });

    if (allAligned) {
      ticker.stop()
      showWinframe()
    }
  });

  ticker.start()
};

spinButton.on('pointerdown', spinReel)