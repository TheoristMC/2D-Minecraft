const Terrain = document.getElementById('gameBoundary');
const TILEMAP = [];

// I use alot of objects to remember what i did

const TerrainProp = {
  CHUNK_ROWS: 16,
  CHUNK_COLS: 16,
  BLOCKS_NUM: 2,
  RIVERS_WIDTH: 4
};

const Texts = {
  NO_WATER_MOVEMENT: 'Oops, you can\'t move in waters!'
}

const BlocksProps = {
  WATER: { 
    index: 1, 
    texture: 'url("img/blocks/water.png")' 
  }, 
  GRASS: {
    index: 2, 
    texture: 'url("img/blocks/grass.png")' 
  }
};

const Entities = {
  PLAYER: { 
    position: { row: 0, col: 0 },
    sprite: { down: '-1px, 0', up: '-38px, 0', right: '-108px, 0', left: '-72px, 0' }
  }
};

function generateRandomTilemap() {
  // Generate Lands
  for (let i = 0; i < TerrainProp.CHUNK_ROWS; i++) {
    TILEMAP.push(Array(TerrainProp.CHUNK_COLS).fill(BlocksProps.GRASS.index));
  }

  let x = Math.floor(Math.random() * TerrainProp.CHUNK_COLS);
  let y = 0;

  while (y < TerrainProp.CHUNK_ROWS) {
    // Generate Rivers
    for (let offset = -Math.floor(TerrainProp.RIVERS_WIDTH / 2); offset <= Math.floor(TerrainProp.RIVERS_WIDTH / 2); offset++) {
      const newX = x + offset;
      if (newX >= 0 && newX < TerrainProp.CHUNK_COLS) {
        TILEMAP[y][newX] = BlocksProps.WATER.index;
      }
    }

    const direction = Math.random();
    if (direction < 0.33 && x > 0) x--;
    else if (direction < 0.66 && x < TerrainProp.CHUNK_COLS - 1) x++;

    y++;
  }
};

function findSafeZones() {
  const mapCenterIndex = Math.floor((TILEMAP.length - 1) / 2);
  const mapCenter = TILEMAP[mapCenterIndex];
  
  const safezones = [];
  for (let i = 0; i < mapCenter.length; i++) {
    const cell = mapCenter[i];
    if (cell === BlocksProps.GRASS.index) {
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

  if (
    moveRow >= 0 && moveRow < TerrainProp.CHUNK_ROWS &&
    moveCol >= 0 && moveCol < TerrainProp.CHUNK_COLS &&
    TILEMAP[moveRow][moveCol] === BlocksProps.GRASS.index
  ) {
    // const currentCell = Terrain.rows[Entities.PLAYER.position.row].cells[Entities.PLAYER.position.col]; No use yet, maybe important later on
    const newCell = Terrain.rows[moveRow].cells[moveCol];
    
    Entities.PLAYER.position = { row: moveRow, col: moveCol };

    // Move the player and update sprite
    const playerCharacter = document.getElementById('playerCharacter');
    newCell.appendChild(playerCharacter);

    const spritePosition = Entities.PLAYER.sprite[direction];
    playerCharacter.style.backgroundPosition = spritePosition;
  }
};

function setPlayerMovement() {
  document.addEventListener('keydown', (ev) => {
    let rowD = 0;
    let colD = 0;
    let direction = '';

    switch (ev.key) {
      case 'ArrowUp':
        rowD = -1;
        direction = 'up';
        break;
      case 'ArrowDown':
        rowD = 1;
        direction = 'down';
        break;
      case 'ArrowRight':
        colD = 1;
        direction = 'right';
        break;
      case 'ArrowLeft':
        colD = -1;
        direction = 'left';
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

  // Generate the table cells
  for (let i = 0; i < TerrainProp.CHUNK_ROWS; i++) {
    const row = document.createElement('tr');
    for (let j = 0; j < TerrainProp.CHUNK_COLS; j++) {
      const cell = document.createElement('td');
      const cellValue = TILEMAP[i][j];

      switch (cellValue) {
        case BlocksProps.WATER.index:
          cell.style.backgroundImage = BlocksProps.WATER.texture;
          break;
        case BlocksProps.GRASS.index:
          cell.style.backgroundImage = BlocksProps.GRASS.texture;
          break;
      };

      row.appendChild(cell);
    }
    Terrain.appendChild(row);
  }

  spawnPlayer(); // Map must be generated before player spawned
  setPlayerMovement();
};

startup();