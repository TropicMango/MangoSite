var myGamePiece, money=50;
var grid, materials=[];
var prevPos=[0,0], newPos=[0,0], offPos=[0,0];

var selectTile, selectedUnit, selectedCord = [-1,-1];

var removedList = [];

var tileSize = 50;
var gridSize = 10;

var mineSpeed = 200;//200
var beltSpeed = 1;
var smeltSpeed = 150;//150

var unitInfo = new Map([ //2d array [unit ID][price / price increase]
	['mine', [10, 1.5, 'w']], // mine
	['belt', [5, 1.2, 'q']], // belt
	['store', [10, 2, 'e']], // store
	['combo', [100, 1.5, 'r']], // combinator
	['smelt', [500, 1.5, 't']] // smelter
]);

var materialInfo = new Map([ //[color, price, smelt]
	['copper ore', ['#54fa9c', 5, 'copper']],
	['iron ore', ['#e01adb', 10, 'iron']],
	['tin ore', ['#ca6c61', 15, 'tin']],
	['silver ore', ['#64a871', 20, 'silver']],
	['gold ore', ['#06aaa6', 25, 'gold']],
	['aluminum ore', ['#344c7d', 30, 'aluminum']],
	['zinc ore', ['#9c6690', 35, 'zinc']],
	['nickel ore', ['#86c538', 40, 'nickel']],
	//smelted items
	['copper', ['#86c538', 50, null]],
	['iron', ['#86c538', 100, null]],
	['tin', ['#86c538', 150, null]],
	['silver', ['#86c538', 200, null]],
	['gold', ['#86c538', 250, null]],
	['aluminum', ['#86c538', 300, null]],
	['zinc', ['#86c538', 350, null]],
	['nickel', ['#86c538', 400, null]]
]);

var lastDir = 0;

var shifted = false;

var i, j, k;

// ----------------------------- Initialize --------------------------------

function startGame() {
	document.getElementById('defaultMenu').style.display = "block";
	updateMoney();
    initiateGrid();
    myGameArea.start();
    initalizePrice();
    gameStart();
    resetCamera();
}

function initiateGrid() {
	
    grid = new Array(gridSize);
    for (i=0; i<grid.length; i++) {
    	grid[i] = new Array(gridSize);
    	for (var j=0; j<grid[0].length; j++) {
    		grid[i][j] = new tile(tileSize, i, j, 'none', 0);
    	}
	}
	selectTile = new tile(tileSize, 11, 11, 'none', 0);
	selectTile.color = "#00000000";
}

function initalizePrice() {
	unitInfo.forEach((value, key, map) => {
		console.log('buy ' + key);
  		document.getElementById('buy ' + key).innerHTML = key + '(' + value[2] + '): $' + value[0];
	})
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
	//canvas.setAttribute('style', 'border: 1px solid white;');
	//canvas.setAttribute('style', 'border: 1px solid black; -ms-transform-origin: center top; -webkit-transform-origin: center top; -moz-transform-origin: center top; -o-transform-origin: center top; transform-origin: center top; -ms-transform: scale(' + scale + '); -webkit-transform: scale3d(' + scale + ', 1); -moz-transform: scale(' + scale + '); -o-transform: scale(' + scale + '); transform: scale(' + scale + ');');
}

function tile(size, x, y, unitType, direction, storage) { // ctx = myGameArea.context; paint shit
  this.x = x * size + 1;
  this.y = y * size + 1;
  this.size = size - 2;
  this.unitType = unitType;
  this.direction = direction;
  this.color = "#D3D3D3";
  
  this.cell = [x, y];
  
  this.storage = storage;
  
  this.update = function() {
    switch(this.unitType) {
  	  case 'none':
  	  	blank(this);
    	break;
    	
  	  case 'mine': 
  	    miner(this);
  	    break;
  	    
  	  case 'belt': 
  	    belt(this);
  	    break;
  	    
  	  case 'store': 
  	    store(this);
  	    break;
  	    
  	  case 'combo': 
  	    combine(this);
  	    break;
  	    
  	  case 'smelt': 
  	    smelt(this);
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

	if(everyinterval(mineSpeed)){
	    materials.push(new item(unit.x, unit.y, unit.cell, unit.storage));
	}

	ctx = myGameArea.context;
    ctx.fillStyle = '#ffb7d3';
	ctx.fillRect(unit.x, unit.y, unit.size, unit.size);
	ctx.fillStyle = "red";
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

function store(unit) { // ------------------ store ------------------
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

function combine(unit) { // ------------------ combinator ------------------
	ctx = myGameArea.context;
    ctx.fillStyle = '#EE82EE';
	ctx.fillRect(unit.x, unit.y, unit.size, unit.size);
	ctx.fillStyle = "#9400D3";
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

function smelt(unit) { // ------------------ smelter ------------------
	if(unit.storage.length > 0) {
		if(unit.smeltTimer == undefined) { unit.smeltTimer =  myGameArea.frameNo + smeltSpeed; }
		else if(myGameArea.frameNo > unit.smeltTimer) {
			materials.push(new item(unit.x, unit.y, unit.cell, materialInfo.get(unit.storage[0].material)[2]));
			unit.storage.splice(0, 1);
			setSmeltString(unit.cell);
			if(unit.storage.length == 0) { unit.smeltTimer =  undefined }
			else { unit.smeltTimer =  myGameArea.frameNo + smeltSpeed; }
		}
	}
	
	ctx = myGameArea.context;
    ctx.fillStyle = '#4C4C4C';
	ctx.fillRect(unit.x, unit.y, unit.size, unit.size);
	ctx.fillStyle = "#C9C9C9";
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

// -------------------------------------------- ITEM ------------------------------------------------
function item(x, y, cell, material) {
	this.x = x;
	this.y = y;
	this.cell = [cell[0], cell[1]];
	this.material = material;
	this.color = materialInfo.get(material)[0];
	
	this.currentDir = grid[this.cell[0]][this.cell[1]].direction;
	this.distance = 0;
	this.timer = 0;
	
	this.update = function() {
		ctx = myGameArea.context;
   		ctx.fillStyle = this.color;
		ctx.fillRect(this.x+tileSize*0.2, this.y+tileSize*0.2, tileSize*0.6, tileSize*0.6);
		//console.log("this cell: " + grid[this.cell[0]][this.cell[1]]);
		if(this.currentDir == null){
			if(this.distance > 100) {
				addToTrash(this);
			} else {
				this.distance++;
			}
			return;
		}
		
		switch(this.currentDir % 4){
		  case 0: //up
			this.y-=beltSpeed;
			break;
		  case 2: //down
			this.y+=beltSpeed;
			break;
		  case 3: //left
			this.x-=beltSpeed;
			break;
		  case 1: //right
			this.x+=beltSpeed;
			break;
		}
		
		this.distance+=beltSpeed;
		
		if(this.distance >= tileSize){
		    switch(this.currentDir % 4){
			  case 0: //up
				this.cell[1]--;
				this.y += (this.distance > tileSize)? this.distance - tileSize : 0;
				break;
			  case 2: //down
				this.cell[1]++;
				this.y -= (this.distance > tileSize)? this.distance - tileSize : 0;
				break;
			  case 3: //left
				this.cell[0]--;
				this.x += (this.distance > tileSize)? this.distance - tileSize : 0;
				break;
			  case 1: //right
				this.cell[0]++;
				this.x -= (this.distance > tileSize)? this.distance - tileSize : 0;
				break;
		    }
			this.distance=0;
			try{
				var hoverUnit = grid[this.cell[0]][this.cell[1]];
			}catch (e){
				return addToTrash(this);
			}
			this.currentDir = hoverUnit.direction;
			if(hoverUnit.unitType != 'belt') { this.currentDir = null; }
			if(hoverUnit.unitType == 'store') { 
				return sellMaterial(this); 
			} else if(hoverUnit.unitType == 'combo') { 
				var unitMap = hoverUnit.storage
				
				if(unitMap.has(this.material)){ //add to the map
					unitMap.set(this.material, unitMap.get(this.material) + 1);
				}else{
					unitMap.set(this.material, 1);
				}

				setComboString(this.cell);
				addToTrash(this);
			} else if(hoverUnit.unitType == 'smelt') { 
				if(materialInfo.get(this.material)[2] != null){
					hoverUnit.storage.push(this);
					setSmeltString(this.cell);
					addToTrash(this);
				}
			}
		}
		
	}
}

function sellMaterial (item) {
	money += materialInfo.get(item.material)[1];
	updateMoney();
	addToTrash(item);
}
function updateMoney() {
	document.getElementById('money').innerHTML = "$"+money;
}
function addToTrash(item) {
	removedList.push(item);
}
function removeList() {
	removedList.forEach((target) => { 
		var index = materials.findIndex(function(element){ return element.cell == target.cell});
		delete(materials.splice(index, 1));
	});
	removedList = [];
}

// ---------------------------------- Unit Update --------------------------------

function updateGameArea() {
    myGameArea.clear();
    myGameArea.frameNo += 1;
    
    (shifted) ? shiftGrid() : updateGrid();
    removeList();
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
}

function shiftUnit(selectedUnit) {
  selectedUnit.x += newPos[0] - prevPos[0];
  selectedUnit.y += newPos[1] - prevPos[1];
}

function shiftGrid() {
	for (i = 0; i < grid.length; i++) {
		for (j = 0; j < grid[0].length; j++) {
        	shiftUnit(grid[i][j]);
        	grid[i][j].update();
        }
    }
    
    shiftUnit(selectTile);
    selectTile.update();
    
    for (i = 0; i < materials.length; i++) {
		shiftUnit(materials[i]);
		materials[i].update();
	}
    
    offPos = [offPos[0] + (newPos[0] - prevPos[0]), offPos[1] + (newPos[1] - prevPos[1])];
    prevPos = newPos;
    //console.log("offpos: "+offPos+" newPos: "+newPos);
}

// ------------------------- Unit modification -----------------------

function everyinterval(n) {
    if ((myGameArea.frameNo / n) % 1 == 0) {return true;}
    return false;
}

function resetCamera() {
	prevPos = offPos;
	newPos = [(myGameArea.canvas.width - tileSize * gridSize) / 2, (myGameArea.canvas.height - tileSize * gridSize) / 2];
	shiftGrid();
	offPos = [(myGameArea.canvas.width - tileSize * gridSize) / 2, (myGameArea.canvas.height - tileSize * gridSize) / 2];
}

function setMine(oreID) {
	if(selectedUnit.unitType == 'mine') {
		selectedUnit.storage = oreID;
	}
}

function setUnit(unitID) {
	if(selectedUnit.unitType == unitID){ return rotateUnit(); }
	else{ selectedUnit.unitType = unitID; }
	selectedUnit.direction = lastDir;
	
	switch(unitID){
	  case 'mine':
		selectedUnit.storage = 'copper ore';
		break;
	  case 'combo': 
		selectedUnit.storage = new Map();
		break;
	  case 'smelt': 
		selectedUnit.storage = [];
		break;
	}
	
	selectTile.color = '#00000000';
	
	money -= unitInfo.get(unitID)[0];
	unitInfo.get(unitID)[0] = Math.floor( unitInfo.get(unitID)[0] * unitInfo.get(unitID)[1] );
	document.getElementById('buy ' + unitID).innerHTML = unitID + '(' + unitInfo.get(unitID)[2] + '): $' + unitInfo.get(unitID)[0];
	updateMoney();
}

function rotateUnit() {
	selectedUnit.direction += 1;
	lastDir = selectedUnit.direction;
}

function selectUnit(evt) {
	var correctionPos = [evt.clientX - offPos[0], evt.clientY - offPos[1]];
	var i = Math.floor(correctionPos[0]/tileSize);
	var j = Math.floor(correctionPos[1]/tileSize);
	
	selectTile.x = i * tileSize + 1 + offPos[0];
	selectTile.y = j * tileSize + 1 + offPos[1];
	
	selectedCord = [i, j];
	
	if(i<0 || i>=gridSize || j<0 || j>=gridSize){
		selectTile.color = "#00000000";
		setUI(0);
	}else{
		selectTile.color = "#00000066";
		selectedUnit = grid[i][j];
		setUI(selectedUnit.unitType);
	}
}

function setUI(unitType) {
	document.getElementById('defaultMenu').style.display = "none";
	document.getElementById('mineMenu').style.display = "none";
	document.getElementById('comboMenu').style.display = "none";
	document.getElementById('smelterMenu').style.display = "none";
	switch(unitType) {
	  case 'mine': //mine
		document.getElementById('mineMenu').style.display = "block";
		break;
	  case 'combo': //combinator
		document.getElementById('comboMenu').style.display = "block";
		setComboString(selectedUnit.cell);
		break;
	  case 'smelt':
	  	document.getElementById('smelterMenu').style.display = "block";
		setSmeltString(selectedUnit.cell);
		break;
	  default: //else
		document.getElementById('defaultMenu').style.display = "block";
		break;
	}
}

function setComboString(currentCell) {
	if(selectedUnit.cell[0] != currentCell[0] || selectedUnit.cell[1] != currentCell[1] || selectedUnit.color == "#00000000"){return;}

	var returnString = '';
	//console.log(selectedUnit.storage);
	
	selectedUnit.storage.forEach((value, key, map) => {
  		returnString += key + ": " + value + "<br>";
	})
	
	document.getElementById('storedItems').innerHTML = returnString;
}

function setSmeltString(currentCell) {
	if(selectedUnit.cell[0] != currentCell[0] || selectedUnit.cell[1] != currentCell[1] || selectedUnit.color == "#00000000"){return;}

	var returnString = '';
	//console.log(selectedUnit.storage)
	selectedUnit.storage.forEach((value) => { returnString += value.material + "<br>"; })
	document.getElementById('smeltingItems').innerHTML = returnString;
}

// ----------------------------- Upgrades --------------------------------

function fasterMine() {
	mineSpeed=Math.round(mineSpeed*0.75);
	console.log("mine speed: " + mineSpeed);
}

function fasterBelt() {
	beltSpeed++;
}

function fasterSmelt() {
	smeltSpeed=Math.round(smeltSpeed*0.75);
	console.log("smelt speed: " + smeltSpeed);
}

function unlockOre(ore) {
	console.log(ore + " ore");
	document.getElementById(ore + " ore").classList.remove("disabled");
	document.getElementById("unlock " + ore).classList.add("hidden");
}

// ----------------------------- Listener --------------------------------
function gameStart() {
  console.log('loaded');
  var $gameArea = $("#factory_canvas");
  
  $(document).keydown(function(evt) { 
  	console.log('pressed');
    //selectUnit(evt);
  	var code = evt.keyCode || evt.which;
    if(code == 81){ // q: belt
      setUnit('belt');
    }else if(code == 87){ // w: mine
      setUnit('mine');
    }else if(code == 69){ // e: store
      setUnit('store');
    }else if(code == 82){ // r: combinator
      setUnit('combo');
    }else if(code == 84){ // t: smelter
      setUnit('smelt');
    }
  });
  
  $gameArea.on('mousedown', function (evt) {
  prevPos = [evt.clientX, evt.clientY];
  newPos = [evt.clientX, evt.clientY];
  $gameArea.on('mouseup mousemove', function handler(evt) {
    if (evt.type === 'mouseup') {
      if(!shifted) { selectUnit(evt); }
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