var myGamePiece;
var grid;
var myScore;
var prevPos, newPos, offPos;

var shifted = false;

var i, j, k;

// ----------------------------- Initialize --------------------------------

function startGame() {
    initiateGrid();
    myGameArea.start();
    gameStart();
}

function initiateGrid() {
	var tileSize = 50;
	var gridSize = 10;
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

function tile(size, x, y, type, direction) { // ctx = myGameArea.context; paint shit
  this.x = x * size + 1;
  this.y = y * size + 1;
  this.size = size - 2;
  this.type = type;
  this.direction = direction;
  
  this.update = function() {
    ctx = myGameArea.context;
    ctx.fillStyle = "#D3D3D3";
    ctx.fillRect(this.x, this.y, this.size, this.size);
    
    if(this.type==0){ return; }
    ctx.fillStyle = "red";
    switch(this.direction) {
      case 0: //up
        ctx.fillRect(this.x+2, this.y, this.size-4, 3);
        break;
      case 1: //down
        ctx.fillRect(this.x+2, this.y + this.size - 3, this.size-4, 3);
      	break;
      case 2: //left
        ctx.fillRect(this.x, this.y+2, 3, this.size-4);
        break;
      case 3: //right
        ctx.fillRect(this.x + this.size - 3, this.y+2, 3, this.size-4);
      	break;
    }
  }
}

function updateGameArea() {
    myGameArea.clear();
    myGameArea.frameNo += 1;
    
    (shifted) ? shiftGrid() : updateGrid();
    
}

function updateGrid() {
	for (i = 0; i < grid.length; i++) {
		for (j = 0; j < grid[0].length; j++) {
			grid[i][j].update();
		}
	}
}

function shiftGrid() {
	for (i = 0; i < grid.length; i++) {
		for (j = 0; j < grid[0].length; j++) {
        	grid[i][j].x += newPos[0] - prevPos[0];
        	grid[i][j].y += newPos[1] - prevPos[1];
        	grid[i][j].update();
        }
    }
    offPos = [offPos[0] - (newPos[0] - prevPos[0]), offPos[1] - (newPos[1] - prevPos[1])];
    prevPos = newPos;
    //console.log("offpos: "+offPos+" newPos: "+newPos);
}

function everyinterval(n) {
    if ((myGameArea.frameNo / n) % 1 == 0) {return true;}
    return false;
}

function resetCamera() {
	prevPos = [0,0];
	newPos = offPos;
	shiftGrid();
	offPos = [0,0];
}

function addUnit() {
	console.log(grid[0][0]);
	grid[0][0].type = 1;
	grid[0][0].direction = 2;
	console.log(grid[0][0]);
	updateGrid();
}

function checkUnit() {

}

// ----------------------------- Listener --------------------------------
function gameStart() {
  var $gameArea = $("#factory_canvas");
  $gameArea.on('mousedown', function (evt) {
  prevPos = [evt.clientX, evt.clientY];
  newPos = [evt.clientX, evt.clientY];
  $gameArea.on('mouseup mousemove', function handler(evt) {
    if (evt.type === 'mouseup') {
      if(!shifted) { checkUnit(); }
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