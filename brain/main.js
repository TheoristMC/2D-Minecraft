const Terrain = document.getElementById('gameBoundary');
const TILEMAP = [];

const TerrainProp = {
  rows: 16,
  cols: 16,
  numberOfBlocks: 2,
  riversWidth: 4
};

const BlocksProps = {
  WATER: { texture: 'url("img/blocks/water.png")' }, 
  GRASS: { texture: 'url("img/blocks/grass.png")' }
};

function generateRandomTilemap() {
  for (let i = 0; i < TerrainProp.rows; i++) {
    TILEMAP.push(Array(TerrainProp.cols).fill(2));
  }

  let x = Math.floor(Math.random() * TerrainProp.cols);
  let y = 0;

  while (y < TerrainProp.rows) {
    for (let offset = -Math.floor(TerrainProp.riversWidth / 2); offset <= Math.floor(TerrainProp.riversWidth / 2); offset++) {
      const newX = x + offset;
      if (newX >= 0 && newX < TerrainProp.cols) {
        TILEMAP[y][newX] = 1;
      }
    }

    const direction = Math.random();
    if (direction < 0.33 && x > 0) x--;
    else if (direction < 0.66 && x < TerrainProp.cols - 1) x++;

    y++;
  }
}

function startup() {
  // Generate tilemap
  generateRandomTilemap();

  // Generate the table cells
  for (let i = 0; i < TerrainProp.rows; i++) {
    const row = document.createElement('tr');
    for (let j = 0; j < TerrainProp.cols; j++) {
      const cell = document.createElement('td');
      const cellValue = TILEMAP[i][j];

      switch (cellValue) {
        case 1:
          cell.style.backgroundImage = BlocksProps.WATER.texture;
          break;
        case 2:
          cell.style.backgroundImage = BlocksProps.GRASS.texture;
          break;
      };

      row.appendChild(cell);
    }
    Terrain.appendChild(row);
  }
};

startup();