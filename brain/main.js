const Terrain = document.getElementById('gameBoundary');
const TILEMAP = [];

// I use a lot of objects to remember what I did

const Texts = {
  NO_WATER_MOVEMENT: 'Oops, you can\'t move in waters!',
  NO_GOING_OUTSIDE_TERRAIN: 'Oops, end of the world!'
}

const Blocks = {
  WATER: { 
    index: 1, 
    texture: 'url("img/blocks/water.png")' 
  }, 
  GRASS: {
    index: 2, 
    texture: 'url("img/blocks/grass.png")' 
  },
  ROCK: {
    index: 3,
    texture: 'url("img/blocks/rock.png")'
  }
};

const Entities = {
  PLAYER: { 
    position: { row: 0, col: 0 },
    sprite: { down: '-1px, 0', up: '-38px, 0', right: '-108px, 0', left: '-72px, 0' },
    chunk: { row: 0, col: 0 }
  }
};

const TerrainProp = {
  TERRAIN_ROWS: 64,
  TERRAIN_COLS: 64,
  CHUNK_SIZE: 16,
  
  BLOCKS_NUM: 2,
  RIVERS_WIDTH: 4,
  ROCK_PROBABILITY: 0.04
};

function generateRandomTilemap() {
  for (let row = 0; row < TerrainProp.TERRAIN_ROWS / TerrainProp.CHUNK_SIZE; row++) {
    for (let col = 0; col < TerrainProp.TERRAIN_COLS / TerrainProp.CHUNK_SIZE; col++) {
      const chunkArr = [];

      // Generate Lands
      for (let i = 0; i < TerrainProp.CHUNK_SIZE; i++) {
        chunkArr.push(Array(TerrainProp.CHUNK_SIZE).fill(Blocks.GRASS.index));
      }

      let x = Math.floor(Math.random() * TerrainProp.CHUNK_SIZE);
      let y = 0;

      while (y < TerrainProp.CHUNK_SIZE) {
        // Generate Rivers
        for (let offset = -Math.floor(TerrainProp.RIVERS_WIDTH / 2); offset <= Math.floor(TerrainProp.RIVERS_WIDTH / 2); offset++) {
          const newX = x + offset;
          if (newX >= 0 && newX < TerrainProp.CHUNK_SIZE) {
            chunkArr[y][newX] = Blocks.WATER.index;
          }
        }

        const direction = Math.random();
        if (direction < 0.33 && x > 0) x--;
        else if (direction < 0.66 && x < TerrainProp.CHUNK_SIZE - 1) x++;

        y++;
      }

      // Generate Rocks on Grass
      for (let i = 0; i < TerrainProp.CHUNK_SIZE; i++) {
        for (let j = 0; j < TerrainProp.CHUNK_SIZE; j++) {
          if (chunkArr[i][j] === Blocks.GRASS.index && Math.random() < TerrainProp.ROCK_PROBABILITY) {
            chunkArr[i][j] = Blocks.ROCK.index;
          }
        }
      }

      TILEMAP.push(chunkArr);
    }
  }
};

function renderTilemap() {
  Terrain.innerHTML = ''; // Clear current map to replace with the new one

  for (let i = 0; i < TerrainProp.CHUNK_SIZE; i++) {
    const row = document.createElement('tr');
    for (let j = 0; j < TerrainProp.CHUNK_SIZE; j++) {
      const cell = document.createElement('td');
      const cellValue = TILEMAP[Entities.PLAYER.chunk.row * (TerrainProp.TERRAIN_COLS / TerrainProp.CHUNK_SIZE) + Entities.PLAYER.chunk.col][i][j];
  
      switch (cellValue) {
        case Blocks.WATER.index:
          cell.style.backgroundImage = Blocks.WATER.texture;
          break;
        case Blocks.GRASS.index:
          cell.style.backgroundImage = Blocks.GRASS.texture;
          break;
        case Blocks.ROCK.index:
          cell.style.backgroundImage = Blocks.ROCK.texture;
          break;
      };
  
      row.appendChild(cell);
    }
    Terrain.appendChild(row);
  }
};

function reRenderTilemap() {
  renderTilemap();
  spawnPlayer();
}

function findSafeZones() {
  const mapCenterIndex = Math.floor(TerrainProp.CHUNK_SIZE / 2);
  const mapCenter = TILEMAP[Entities.PLAYER.chunk.row * (TerrainProp.TERRAIN_COLS / TerrainProp.CHUNK_SIZE) + Entities.PLAYER.chunk.col][mapCenterIndex];
  
  const safezones = [];
  for (let i = 0; i < TerrainProp.CHUNK_SIZE; i++) {
    const cell = mapCenter[i];
    if (cell === Blocks.GRASS.index) {
      safezones.push(i);
    }
  }

  const formattedZone = { 
    rowNum: mapCenterIndex, 
    locNum: safezones[Math.floor(Math.random() * safezones.length)] 
  };
  return formattedZone;
};

function movePlayer(rowD, colD, direction) {
  const moveRow = Entities.PLAYER.position.row + rowD;
  const moveCol = Entities.PLAYER.position.col + colD;

  const playerCharacter = document.getElementById('playerCharacter');

  const spritePosition = Entities.PLAYER.sprite[direction];
  playerCharacter.style.backgroundPosition = spritePosition;

  // Check if movement stays within the current chunk
  if (
    moveRow >= 0 && moveRow < TerrainProp.CHUNK_SIZE &&
    moveCol >= 0 && moveCol < TerrainProp.CHUNK_SIZE &&
    TILEMAP[Entities.PLAYER.chunk.row * (TerrainProp.TERRAIN_COLS / TerrainProp.CHUNK_SIZE) + Entities.PLAYER.chunk.col][moveRow][moveCol] !== Blocks.WATER.index
  ) {
    const newCell = Terrain.rows[moveRow].cells[moveCol];
    Entities.PLAYER.position = { row: moveRow, col: moveCol };

    // Move the player
    newCell.appendChild(playerCharacter);
  } else if (
    moveRow < 0 || moveRow >= TerrainProp.CHUNK_SIZE ||
    moveCol < 0 || moveCol >= TerrainProp.CHUNK_SIZE
  ) {
    const chunkRowOffset = Math.floor(moveRow / TerrainProp.CHUNK_SIZE);
    const chunkColOffset = Math.floor(moveCol / TerrainProp.CHUNK_SIZE);

    const newChunkRow = Entities.PLAYER.chunk.row + chunkRowOffset;
    const newChunkCol = Entities.PLAYER.chunk.col + chunkColOffset;

    // Check if the new chunk is within terrain
    if (
      newChunkRow >= 0 && newChunkRow < TerrainProp.TERRAIN_ROWS / TerrainProp.CHUNK_SIZE &&
      newChunkCol >= 0 && newChunkCol < TerrainProp.TERRAIN_COLS / TerrainProp.CHUNK_SIZE
    ) {
      Entities.PLAYER.chunk.row = newChunkRow;
      Entities.PLAYER.chunk.col = newChunkCol;

      Entities.PLAYER.position.row = (moveRow + TerrainProp.CHUNK_SIZE) % TerrainProp.CHUNK_SIZE;
      Entities.PLAYER.position.col = (moveCol + TerrainProp.CHUNK_SIZE) % TerrainProp.CHUNK_SIZE;

      reRenderTilemap();
      console.log(`Chunk: ${JSON.stringify(Entities.PLAYER.chunk)}`);
    } else {
      console.log(Texts.NO_GOING_OUTSIDE_TERRAIN);
    }
  }
};

function setHotkeyFunctions() {
  document.addEventListener('keydown', (ev) => {
    if (ev.repeat) return; // Fix Issue (holding key repeats the event causing immediate walking)
    
    let rowD = 0;
    let colD = 0;
    let direction = '';

    switch (ev.key.toString().toUpperCase()) {
      case 'ARROWUP':
        rowD = -1;
        direction = 'up';
        break;
      case 'ARROWDOWN':
        rowD = 1;
        direction = 'down';
        break;
      case 'ARROWRIGHT':
        colD = 1;
        direction = 'right';
        break;
      case 'ARROWLEFT':
        colD = -1;
        direction = 'left';
        break;
      case 'R':
        reRenderTilemap();
        break;
    }

    movePlayer(rowD, colD, direction);
  });
}

function spawnPlayer() {
  const playerCharacter = document.createElement('div');
  playerCharacter.id = 'playerCharacter';

  const { rowNum, locNum } = findSafeZones();

  Entities.PLAYER.position = { row: rowNum, col: locNum };

  const targetCell = Terrain.rows[rowNum].cells[locNum];
  targetCell.appendChild(playerCharacter);
};

function startup() {
  // Generate tilemap
  generateRandomTilemap();
  renderTilemap();

  spawnPlayer(); // Map must be generated before player spawned
  setHotkeyFunctions(); 
};

startup();
