var myGamePiece;
var grid, materials;
var prevPos, newPos, offPos;

var selectTile, selectedCord;

var tileSize = 50;
var gridSize = 10;
var mineSpeed = 200;
var beltSpeed = 1;

var shifted = false;

var i, j, k;

// ----------------------------- Initialize --------------------------------

function startGame() {
    initiateGrid();
    myGameArea.start();
    gameStart();
}

function initiateGrid() {
	
    grid = new Array(gridSize);
    for (i=0; i<grid.length; i++) {
    	grid[i] = new Array(gridSize);
    	for (var j=0; j<grid[0].length; j++) {
    		grid[i][j] = new tile(tileSize, i, j, 0);
    	}
	}
	prevPos = [0,0];
	newPos = [0,0];
	offPos = [0,0];
	materials = [];
	selectTile = new tile(tileSize, 11, 11, 0, 0, "#00000000");
}

// ----------------------------- Canvas --------------------------------

var myGameArea = {
    canvas : document.createElement("canvas"),
    start : function() {
    	var FC = $("#factory_canvas");
        this.canvas.width = FC.width();
        this.canvas.height = FC.height();
        this.canvas.style.border = "1px solid white";
        this.context = this.canvas.getContext("2d");
        FC.append(this.canvas);
        this.frameNo = 0;
        this.interval = setInterval(updateGameArea, 20);
        },
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

function resize(canvas) {
	var scale = {x: 1, y: 1};
	scale.x = (window.innerWidth - 3) / canvas.width;
	scale.y = (window.innerHeight - 3) / canvas.height;
	
	if (scale.x < 1 || scale.y < 1) {
		scale = '1, 1';
	} else if (scale.x < scale.y) {
		scale = scale.x + ', ' + scale.x;
	} else {
		scale = scale.y + ', ' + scale.y;
	}
	canvas.setAttribute('style', 'border: 1px solid white;');
	//canvas.setAttribute('style', 'border: 1px solid black; -ms-transform-origin: center top; -webkit-transform-origin: center top; -moz-transform-origin: center top; -o-transform-origin: center top; transform-origin: center top; -ms-transform: scale(' + scale + '); -webkit-transform: scale3d(' + scale + ', 1); -moz-transform: scale(' + scale + '); -o-transform: scale(' + scale + '); transform: scale(' + scale + ');');
}

function tile(size, x, y, type, direction, color = "#D3D3D3") { // ctx = myGameArea.context; paint shit
  this.x = x * size + 1;
  this.y = y * size + 1;
  this.size = size - 2;
  this.type = type;
  this.direction = direction;
  this.color = color;
  
  this.cell = [x, y];
  
  this.update = function() {
  	this.x += newPos[0] - prevPos[0];
  	this.y += newPos[1] - prevPos[1];
    switch(this.type) {
  	  case 0:
  	  	blank(this);
    	break;
    	
  	  case 1: 
  	    miner(this);
  	    break;
  	    
  	  case 2: 
  	    belt(this);
  	    break;
  	    
  	  case 3: 
  	    sell(this);
  	    break;
  	}  
  }
}

function blank(unit) { // ------------------ Blank ------------------
	ctx = myGameArea.context;
    ctx.fillStyle = unit.color;
	ctx.fillRect(unit.x, unit.y, unit.size, unit.size);
}

function miner(unit) { // ------------------ Mine ------------------
	ctx = myGameArea.context;
    ctx.fillStyle = '#ffb7d3';
	ctx.fillRect(unit.x, unit.y, unit.size, unit.size);
	ctx.fillStyle = "red";
	switch(unit.direction % 4) {
	  case 0: //up
		ctx.fillRect(unit.x+4, unit.y, unit.size-8, 7);
		break;
	  case 2: //down
		ctx.fillRect(unit.x+4, unit.y + unit.size - 8, unit.size-4, 7);
		break;
	  case 3: //left
		ctx.fillRect(unit.x, unit.y+4, 7, unit.size-8);
		break;
	  case 1: //right
		ctx.fillRect(unit.x + unit.size - 7, unit.y+4, 7, unit.size-8);
		break;
	}
	
	if(everyinterval(150)){
	    materials.push(new item(unit.x, unit.y, unit.cell, 0));
	}
}

function belt(unit) { // ------------------ Belt ------------------
	ctx = myGameArea.context;
    ctx.fillStyle = '#b7d3ff';
	ctx.fillRect(unit.x, unit.y, unit.size, unit.size);
	ctx.fillStyle = "blue";
	switch(unit.direction % 4) {
	  case 0: //up
		ctx.fillRect(unit.x+4, unit.y, unit.size-8, 7);
		break;
	  case 2: //down
		ctx.fillRect(unit.x+4, unit.y + unit.size - 8, unit.size-8, 7);
		break;
	  case 3: //left
		ctx.fillRect(unit.x, unit.y+4, 7, unit.size-8);
		break;
	  case 1: //right
		ctx.fillRect(unit.x + unit.size - 7, unit.y+4, 7, unit.size-8);
		break;
	}
}

function sell(unit) { // ------------------ sell ------------------
	ctx = myGameArea.context;
    ctx.fillStyle = '#b7ffd3';
	ctx.fillRect(unit.x, unit.y, unit.size, unit.size);
	ctx.fillStyle = "green";
	switch(unit.direction % 4) {
	  case 0: //up
		ctx.fillRect(unit.x+4, unit.y, unit.size-8, 7);
		break;
	  case 2: //down
		ctx.fillRect(unit.x+4, unit.y + unit.size - 8, unit.size-8, 7);
		break;
	  case 3: //left
		ctx.fillRect(unit.x, unit.y+4, 7, unit.size-8);
		break;
	  case 1: //right
		ctx.fillRect(unit.x + unit.size - 7, unit.y+4, 7, unit.size-8);
		break;
	}
}

function item(x, y, cell, type) {
	this.x = x;
	this.y = y;
	this.cell = [cell[0], cell[1]];
	console.log("summon cell: " + this.cell);
	this.type = type;
	
	this.distance = 0;
	
	this.update = function() {
		ctx = myGameArea.context;
   		ctx.fillStyle = 'white';
		ctx.fillRect(this.x+10, this.y+10, 30, 30);
		
		var hoverUnit = grid[this.cell[0]][this.cell[1]];
		
		console.log("this cell: " + grid[this.cell[0]][this.cell[1]]);
		
		switch(hoverUnit.direction % 4){
		  case 0: //up
			this.y--;
			break;
		  case 2: //down
			this.y++;
			break;
		  case 3: //left
			this.x--;
			break;
		  case 1: //right
			this.x++;
			break;
		}
		
		this.distance++;
		
		if(this.distance >= tileSize){
		  if(hoverUnit.type == 3) { return sellItem(this); }
		  switch(hoverUnit.direction % 4){
			  case 0: //up
				this.cell[1]--;
				break;
			  case 2: //down
				this.cell[1]++;
				break;
			  case 3: //left
				this.cell[0]--;
				break;
			  case 1: //right
				this.cell[0]++;
				break;
			}
			this.distance=0;
		}
	}
}

function sellItem(item) {
	materials.find(item);
}

// ---------------------------------- Unit Update --------------------------------

function updateGameArea() {
    myGameArea.clear();
    myGameArea.frameNo += 1;
    
    //(shifted) ? shiftGrid() : updateGrid();
    updateGrid();
    
}

function updateGrid() {
	for (i = 0; i < grid.length; i++) {
		for (j = 0; j < grid[0].length; j++) {
			grid[i][j].update();
		}
	}
	selectTile.update();
	
	for (i = 0; i < materials.length; i++) {
		materials[i].update();
	}
	
	offPos = [offPos[0] + (newPos[0] - prevPos[0]), offPos[1] + (newPos[1] - prevPos[1])];
    prevPos = newPos;
}

/*function shiftUnit(selectedUnit) {
  selectedUnit.x += newPos[0] - prevPos[0];
  selectedUnit.y += newPos[1] - prevPos[1];
}

function shiftGrid() {
	for (i = 0; i < grid.length; i++) {
		for (j = 0; j < grid[0].length; j++) {
        	shiftUnit(grid[i][j]);
        }
    }
    
    shiftUnit(selectTile);
    
    offPos = [offPos[0] + (newPos[0] - prevPos[0]), offPos[1] + (newPos[1] - prevPos[1])];
    prevPos = newPos;
    //console.log("offpos: "+offPos+" newPos: "+newPos);
    
    updateGrid();
}*/

// ------------------------- Unit modification -----------------------

function everyinterval(n) {
    if ((myGameArea.frameNo / n) % 1 == 0) {return true;}
    return false;
}

function resetCamera() {
	prevPos = offPos;
	newPos = [0,0];
	shiftGrid();
	offPos = [0,0];
}

function setUnit(unitID) {
	grid[selectedCord[0]][selectedCord[1]].type = unitID;
	grid[selectedCord[0]][selectedCord[1]].direction = 0;
	
	selectTile.color = '#00000000';
	
	updateGrid();
}

function rotateUnit() {
	grid[selectedCord[0]][selectedCord[1]].direction += 1;
}

function checkUnit(evt) {
	var correctionPos = [evt.clientX - offPos[0], evt.clientY - offPos[1]];
	var i = Math.floor(correctionPos[0]/tileSize);
	var j = Math.floor(correctionPos[1]/tileSize);
	console.log(i + ", " + j);
	selectTile.x = i * tileSize + 1 + offPos[0];
	selectTile.y = j * tileSize + 1 + offPos[1];
	
	selectedCord = [i, j];
	
	selectTile.color = (i<0 || i>=gridSize || j<0 || j>=gridSize)? "#00000000" : "#00000066";
}

// ----------------------------- Listener --------------------------------
function gameStart() {
  var $gameArea = $("#factory_canvas");
  $gameArea.on('mousedown', function (evt) {
  prevPos = [evt.clientX, evt.clientY];
  newPos = [evt.clientX, evt.clientY];
  $gameArea.on('mouseup mousemove', function handler(evt) {
    if (evt.type === 'mouseup') {
      if(!shifted) { checkUnit(evt); }
      shifted = false;
      $gameArea.off('mouseup mousemove', handler); 
    } else {
      newPos = [evt.clientX, evt.clientY];
      shifted = true;
      //shiftGrid();
      //console.log("x:" + newPos[0] + ", y:" + newPos[1]);
    }
  });
  });
}
/**/