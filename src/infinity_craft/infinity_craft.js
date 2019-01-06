var myGamePiece, money=50;
var grid, materials=[];
var prevPos=[0,0], newPos=[0,0], offPos=[0,0];

var selectTile, selectedUnit, selectedCord = [-1,-1];

var removedList = [];

var tileSize = 50;
var gridSize = 10;

var mineSpeed = 200;//200
var beltSpeed = 0.5;
var smeltSpeed = 150;//150
var craftSpeed = 1;

var unitInfo = new Map([ //2d array [unit ID][price / price increase]
	['mine', [10, 1.5, 'w']], // mine
	['conveyor', [5, 1.2, 'q']], // belt
	['market', [10, 2, 'e']], // store
	['furnace', [100, 1.5, 'r']], // smelter
	['fabricator', [500, 1.5, 't']] // combinator
]);

var materialInfo = new Map([ //[color, price, smelt]
	//minerals
	['copper ore', ['./img/copper\ ore.png', 5]],
	['iron ore', ['./img/iron\ ore.png', 10]],
	['gold ore', ['./img/gold\ ore.png', 25]],
	['wood', ['#ffc538', 50]],
	
	//smeltTarget items
	['copper', ['./img/copper.png', 50]],
	['iron', ['./img/iron.png', 100]],
	['gold', ['./img/gold.png', 250]],
	['coal', ['#ffc538', 500]],
	
	//crafted items
	['wire', ['#00c538', 100]],
	['switch', ['#86c538', 200]],
	['switchboard', ['#06050f', 2000]]
]);

var minerals = new Map([
	['copper ore', ['copper', 0]],
	['iron ore', ['iron', 10]],
	['gold ore', ['gold', 40]],
	['wood', ['coal', 70]]
]);

var craftingRecipe = new Map([ // [time needed, unlock price]
	['wire', [200, [['copper', 1]]] ],
	['switch', [500 , [['wire', 2], ['iron', 1]]] ],
	['switchboard', [600 , [['switch', 5], ['wood', 5]]] ],
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
    initializeButtons();
    gameStart();
    resetCamera();
}

function initiateGrid() {
	
    grid = new Array(gridSize);
    for (i=0; i<grid.length; i++) {
    	grid[i] = new Array(gridSize);
    	for (var j=0; j<grid[0].length; j++) {
    		grid[i][j] = new tile(tileSize, i, j);
    	}
	}
	selectTile = new tile(tileSize, 11, 11);
	selectTile.color = "#00000000";
}

function initializeButtons() {
	// unit purchase buttons
	var buyUnit = document.getElementById('buyUnitTag');
	buyUnit.append(document.createElement("br"));
	unitInfo.forEach((value, key, map) => {
		console.log('buy ' + key);
  		
  		var b = document.createElement('button');
     	b.onclick = function() { setUnit(key); };
     	b.innerHTML = key + '(' + value[2] + '): $' + value[0];
     	b.className = "ctrl_btn";
     	b.id = "buy " + key;
     	buyUnit.append(b);
     	buyUnit.append(document.createElement("br"));
	});
	
	// crafting buttons
	var productTag = document.getElementById('ProductionTag');
	productTag.append(document.createElement("br"));
	craftingRecipe.forEach((value, key, map) => {
		console.log('craft ' + key);
  		
  		var b = document.createElement('button');
     	b.onclick = function() { setCraft(key); };
     	b.innerHTML = "craft " + key;
     	b.className = "ctrl_btn";
     	b.id = "craft " + key;
     	productTag.append(b);
     	productTag.append(document.createElement("br"));
	});
	
	// mine ore buttons
	var oreMines = document.getElementById('ore mines');
	oreMines.append(document.createElement("br"));
	minerals.forEach((value, key, map) => {
		console.log('mine ' + key);
  		if(value[1] != -1){ // -1 is un-mineable but smeltable
			var b = document.createElement('button');
			b.onclick = function() { setMine(key); };
			b.innerHTML = 'mine ' + key;
			b.className = "ctrl_btn";
			b.id = key + ' ore';
			oreMines.append(b);
			oreMines.append(document.createElement("br"));
     	}
	});
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

function tile(size, x, y) { // ctx = myGameArea.context; paint shit
  this.x = x * size + 1;
  this.y = y * size + 1;
  this.size = size - 2;
  this.unitType = 'none';
  this.direction = 0;
  this.color = "#D3D3D3";
  
  this.cell = [x, y];
  
  this.img = new Image(320, 320);
  
  this.update = function() { // individual updates for each unit type
    switch(this.unitType) {
  	  case 'none':
  	  	updateBlank(this);
    	break;  	
  	  case 'mine': 
  	    updateMine(this);
  	    break;
  	  case 'conveyor':
  	    updateBelt(this);
  	    break;
  	  case 'market': 
  	    updateStore(this);
  	    break;
  	  case 'fabricator': 
  	    updateCraft(this);
  	    break;
  	  case 'furnace': 
  	    updateSmelt(this);
  	    break;
  	}
  	ctx = myGameArea.context;
	
	ctx.save(); // save current state
	switch(this.direction % 4) {
	  case 0: //up
		ctx.translate(this.x, this.y);
    	ctx.rotate(0/180*Math.PI);
		break;
	  case 2: //down
		ctx.translate(this.x + this.size, this.y + this.size);
    	ctx.rotate(180/180*Math.PI);
		break;
	  case 3: //left
		ctx.translate(this.x, this.y + this.size);
    	ctx.rotate(270/180*Math.PI);
		break;
	  case 1: //right
		ctx.translate(this.x + this.size, this.y);
    	ctx.rotate(90/180*Math.PI);
		break;
	}
	ctx.drawImage(this.img, 0, 0, this.size, this.size);
	ctx.restore(); 
  }
  
  this.hover = function(item) {
    switch(this.unitType) {
  	  case 'none':
    	break;  	
  	  case 'mine': 
  	    //hoverMine(this, item);
  	    break;
  	  case 'conveyor':
  	    hoverBelt(this, item);
  	    break;
  	  case 'market': 
  	    hoverStore(this, item);
  	    break;
  	  case 'fabricator': 
  	    hoverCraft(this, item);
  	    break;
  	  case 'furnace': 
  	    hoverSmelt(this, item);
  	    break;
  	}  
  }
}

function updateBlank(unit) { // ------------------ Blank ------------------
	ctx = myGameArea.context;
    ctx.fillStyle = unit.color;
	ctx.fillRect(unit.x, unit.y, unit.size, unit.size);
}

function updateMine(unit) { // ------------------ Mine ------------------

	if(everyinterval(mineSpeed)){
		var rx = Math.random()*tileSize/5 - tileSize/10;
		var ry = Math.random()*tileSize/5 - tileSize/10;
	    materials.push(new item(unit.x + rx, unit.y + ry, unit.cell, unit.storage));
	}

	ctx = myGameArea.context;
	
	ctx.save(); // save current state
	switch(unit.direction % 4) {
	  case 0: //up
		ctx.translate(unit.x, unit.y);
    	ctx.rotate(0/180*Math.PI);
		break;
	  case 2: //down
		ctx.translate(unit.x + unit.size, unit.y + unit.size);
    	ctx.rotate(180/180*Math.PI);
		break;
	  case 3: //left
		ctx.translate(unit.x, unit.y + unit.size);
    	ctx.rotate(270/180*Math.PI);
		break;
	  case 1: //right
		ctx.translate(unit.x + unit.size, unit.y);
    	ctx.rotate(90/180*Math.PI);
		break;
	}
	ctx.drawImage(unit.img, 0, 0, unit.size, unit.size);
	ctx.restore(); 
}

//function hoverMine(unit, item) { }

function updateBelt(unit) { // ------------------ Belt ------------------

}

function hoverBelt(unit, item) {
	item.currentDir = unit.direction;
}

function updateStore(unit) { // ------------------ store ------------------ 
}

function hoverStore(unit, item) {
	//unit.offset += 3;
	sellMaterial(item); 
}

function updateCraft(unit) { // ------------------ fabricator ------------------
	var available = checkCraftTarget(unit, unit.storage);
	if(unit.crafting) {
		//console.log('crafting');
		if(myGameArea.frameNo > unit.craftTimer) { // output item
			var rx = Math.random()*tileSize/5 - tileSize/10;
			var ry = Math.random()*tileSize/5 - tileSize/10;
			materials.push(new item(unit.x + rx, unit.y + ry, unit.cell, unit.craftTarget));
			if(available){
				setCraftTarget(unit, unit.storage);
			}else{
				unit.crafting = false;
				printCraftStorage('none');
			}
		}
	}else{
		//console.log('not crafting: ' + available);
		if(available){
			setCraftTarget(unit, unit.storage); // creates the delay
			console.log('unit set');
		}
	}
}

function hoverCraft(unit, item) {
	//console.log(craftingRecipe.get(unit.craftTarget)[1]);

	var unitMap = unit.storage;

	if(unitMap.has(item.material)){ //add to the map
		unitMap.set(item.material, unitMap.get(item.material) + 1);
	}else{
		unitMap.set(item.material, 1);
	}

	printCraftStorage(item.cell);
	
	addToTrash(item);
}

function checkCraftTarget(unit, unitMap){
	if(unit.craftTarget == undefined){ return false; }
	var materialList = craftingRecipe.get(unit.craftTarget)[1];
	var check = true;
	materialList.forEach((value) => {
		if(!unitMap.has(value[0]) || unitMap.get(value[0]) < value[1] || !check){
			check = false;
		}
	})
	return check;
}
	
function setCraftTarget(unit, unitMap){
	var materialList = craftingRecipe.get(unit.craftTarget)[1];
	materialList.forEach((value) => {
		unitMap.set(value[0], unitMap.get(value[0]) - value[1]);
	})
	
	unit.crafting = true;
	unit.craftTimer =  myGameArea.frameNo + craftingRecipe.get(unit.craftTarget)[0] * craftSpeed;
	printCraftStorage(unit.cell);
}

function updateSmelt(unit) { // ------------------ smelter ------------------
	var unitMap = unit.storage;
	if(unit.smelting) {
		if(myGameArea.frameNo > unit.smeltTimer) { // output item
			var rx = Math.random()*tileSize/5 - tileSize/10;
			var ry = Math.random()*tileSize/5 - tileSize/10;
			materials.push(new item(unit.x + rx, unit.y + ry, unit.cell, minerals.get(unit.smeltTarget)[0]));
			if(unitMap.size > 0){
				setSmeltTarget(unit, unitMap.keys().next().value);
			}else{
				unit.smelting = false;
				printSmeltStorage('none');
				printSmeltTarget('none');
			}
		}
	}else{
		if(unitMap.size > 0) {
			setSmeltTarget(unit, unitMap.keys().next().value); // creates the delay
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

function hoverSmelt(unit, item) {
	if(minerals.has(item.material)){
		var unitMap = unit.storage;
		if(unit.storage.size > 0 || unit.smelting == true){ 
			if(unitMap.has(item.material)){ //add to the map
				unitMap.set(item.material, unitMap.get(item.material) + 1);
			}else{
				unitMap.set(item.material, 1);
			}
			printSmeltStorage(item.cell);
		}else{ // if nothing is smelting add directly onto the queue (ALSO EXTREMELY SKETCHY)
			setSmeltTarget(unit, item.material);
		}
		
		addToTrash(item);
	}
}

function setSmeltTarget(unit, target) {
	unit.smelting = true;
	unit.smeltTarget = target;
	printSmeltTarget(target);
	unit.smeltTimer =  myGameArea.frameNo + smeltSpeed;
	
	if(unit.storage.get(unit.smeltTarget) > 1){ // if the smeltTarget item is the last
		unit.storage.set(unit.smeltTarget, unit.storage.get(unit.smeltTarget) - 1); // removed one from the set
	}else{
		unit.storage.delete(unit.smeltTarget); // removed the entire element set
	}
	
	printSmeltStorage(unit.cell);
}

// -------------------------------------------- ITEM ------------------------------------------------
function item(x, y, cell, material) {
	this.x = x;
	this.y = y;
	this.cell = [cell[0], cell[1]];
	this.material = material;
	this.img = new Image(320, 320);
	this.img.src = materialInfo.get(material)[0];
	
	this.currentDir = grid[this.cell[0]][this.cell[1]].direction;
	this.distance = 0;
	this.timer = 0;
	
	this.update = function() {
		ctx = myGameArea.context;
		ctx.drawImage(this.img, this.x + tileSize*0.1, this.y + tileSize*0.1, tileSize*0.8, tileSize*0.8);
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
		    this.currentDir = null;
			this.distance=0;
			
			if(this.cell[0] > 0 && this.cell[1] > 0 && this.cell[0] < gridSize && this.cell[1] < gridSize){
				var hoverUnit = grid[this.cell[0]][this.cell[1]];
			}
			hoverUnit.hover(this);
		}	
	}
}

function sellMaterial (item) {
	var amount = materialInfo.get(item.material)[1];
	money += amount;
	updateMoney();
	console.log('pushed');
	materials.push(new moneyLabel("+" + amount, item.x, item.y));
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

// ------------------------------- moneyLabel ----------------------

function moneyLabel(amount, x, y) {
	//console.log (Math.floor((Math.random()*11)-5));
	this.cell = [x, y];
	this.amount = amount;
	this.offset = 0;
	
	this.update = function() {
		ctx = myGameArea.context;
		ctx.font = "20px Arial";
   		ctx.fillStyle = 'black';
		ctx.fillText(amount, this.cell[0], this.cell[1] - this.offset);
		this.offset+=1;
		if(this.offset > 50) { 
			addToTrash(this);
		}
	}
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

function setCraft(recipieID) {
	if(selectedUnit.unitType == 'fabricator') {
		selectedUnit.craftTarget = recipieID;
		printCraftTarget(recipieID);
	}
}

function setUnit(unitID) {
	if(selectedUnit.unitType == unitID){ return rotateUnit(); }
	
	if(selectedUnit.unitType != 'none'){ lastDir = selectedUnit.direction; }
	
	switch(unitID){
  	  case 'none':
  	  	selectedUnit.img.src = './img/mine.png';
    	break;  	
  	  case 'mine': 
  	  	selectedUnit.storage = 'copper ore';
  	    selectedUnit.img.src = './img/mine.png';
  	    break;
  	  case 'conveyor':
  	    selectedUnit.img.src = './img/conveyor.png';
  	    break;
  	  case 'market': 
  	    selectedUnit.img.src = './img/market.png';
  	    break;
  	  case 'fabricator': 
  	  	selectedUnit.storage = new Map();
  	    selectedUnit.img.src = './img/mine.png';
  	    break;
  	  case 'furnace': 
  	  	selectedUnit.storage = new Map();
  	    selectedUnit.img.src = './img/furnace.png';
  	    break;
	}
	
	selectedUnit.unitType = unitID; 
	selectedUnit.direction = lastDir;
	
	selectTile.color = '#00000000';
	
	try { money -= unitInfo.get(unitID)[0]; 
	}catch (e){ console.log(e); }// deleting units will call this, temporarily solution
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
	document.getElementById('craftMenu').style.display = "none";
	document.getElementById('smelterMenu').style.display = "none";
	switch(unitType) {
	  case 'mine': //mine
		document.getElementById('mineMenu').style.display = "block";
		break;
	  case 'fabricator': //combinator
		document.getElementById('craftMenu').style.display = "block";
		printCraftStorage(selectedUnit.cell);
		break;
	  case 'furnace':
	  	document.getElementById('smelterMenu').style.display = "block";
		printSmeltStorage(selectedUnit.cell);
		break;
	  default: //else
		document.getElementById('defaultMenu').style.display = "block";
		break;
	}
}

// ---------------------------------- back to HTML -------------------------------------

function printCraftStorage(currentCell) {
	if(selectedUnit.cell[0] != currentCell[0] || selectedUnit.cell[1] != currentCell[1] || selectedUnit.color == "#00000000"){return;}
	
	document.getElementById('craftStorage').innerHTML = mapToString(currentCell);
}

function printCraftTarget(target) {
	document.getElementById('craftTarget').innerHTML = target;
}

function printSmeltStorage(currentCell) {
	if(selectedUnit.cell[0] != currentCell[0] || selectedUnit.cell[1] != currentCell[1] || selectedUnit.color == "#00000000"){return;}
	
	document.getElementById('smeltingStorage').innerHTML = mapToString(currentCell);
}

function printSmeltTarget(target) {
	document.getElementById('smeltingTarget').innerHTML = target;
}

function mapToString(cell) {
	var returnString = '';
	
	selectedUnit.storage.forEach((value, key, map) => {
  		returnString += key + ": " + value + "<br>";
	})
	
	return (returnString.length == 0)? 'none' : returnString;
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
      setUnit('conveyor');
    }else if(code == 87){ // w: mine
      setUnit('mine');
    }else if(code == 69){ // e: store
      setUnit('market');
    }else if(code == 84){ // t: combinator
      setUnit('fabricator');
    }else if(code == 82){ // r: smelter
      setUnit('furnace');
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