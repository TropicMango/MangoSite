var myGamePiece;
var grid;
var myScore;
var prevPos;
var newPos;

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
    		grid[i][j] = new tile(tileSize, i, j, "#D3D3D3");
    	}
	}
	prevPos = [0,0];
	newPos = [0,0];

}

// ----------------------------- Canvas --------------------------------

var myGameArea = {
    canvas : document.createElement("canvas"),
    start : function() {
        this.canvas.width = 1000;
        this.canvas.height = 550;
        this.canvas.style.border = "1px solid white";
        this.context = this.canvas.getContext("2d");
        //resize(this.canvas);
        $("#game_canvas").append(this.canvas);
        this.frameNo = 0;
        this.interval = setInterval(updateGameArea, 20);
        },
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

function resize(canvas) {
	var scale = {x: 1, y: 1};
	scale.x = (85*window.innerWidth/100 - 10) / canvas.width;
	scale.y = (90*window.innerHeight/100 - 10) / canvas.height;
	
	if (scale.x < 1 || scale.y < 1) {
		scale = '1, 1';
	} else if (scale.x < scale.y) {
		scale = scale.x + ', ' + scale.x;
	} else {
		scale = scale.y + ', ' + scale.y;
	}
	
	canvas.setAttribute('style', 'border: 1px solid white; -ms-transform-origin: center top; -webkit-transform-origin: center top; -moz-transform-origin: center top; -o-transform-origin: center top; transform-origin: center top; -ms-transform: scale(' + scale + '); -webkit-transform: scale3d(' + scale + ', 1); -moz-transform: scale(' + scale + '); -o-transform: scale(' + scale + '); transform: scale(' + scale + ');');
}

function tile(size, x, y, color) { // ctx = myGameArea.context; paint shit
  this.x = x * size + 1;
  this.y = y * size + 1;
  this.size = size - 2;
  this.color = color;
  
  this.update = function() {
        ctx = myGameArea.context;
        ctx.fillStyle = color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }
}

function updateGameArea() {
    myGameArea.clear();
    myGameArea.frameNo += 1;
    
    for (i = 0; i < grid.length; i++) {
		for (j = 0; j < grid[0].length; j++) {
        	grid[i][j].x += newPos[0] - prevPos[0];
        	grid[i][j].y += newPos[1] - prevPos[1];
        	grid[i][j].update();
        }
    }
    prevPos = newPos;
}

function everyinterval(n) {
    if ((myGameArea.frameNo / n) % 1 == 0) {return true;}
    return false;
}


// ----------------------------- Listener --------------------------------
function gameStart() {
  var $gameArea = $("#game_canvas");
  $gameArea.on('mousedown', function (evt) {
  prevPos = [evt.clientX, evt.clientY];
  newPos = [evt.clientX, evt.clientY];
  $gameArea.on('mouseup mousemove', function handler(evt) {
    if (evt.type === 'mouseup') {
      console.log("mouse up");
      $gameArea.off('mouseup mousemove', handler);
    } else {
      newPos = [evt.clientX, evt.clientY];
      console.log("x:" + newPos[0] + ", y:" + newPos[1]);
    }
  });
  });
}
/**/