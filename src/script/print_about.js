  var timer = setInterval(load , 1); 
  var about = [
  "My name is Charlie Wan, a student at UCSB studying computer science",
  "I am passionate about computer science with a dream of working at a VR firm",
  "This site contains my favorite programs and projects feel free to download them and try it out",
  "Honestly I have no idea what else goes here XD",
  "If you have suggestions please contact me~ (I'm lonely T^T)"
  ]
  var inc = 1;
  var text = "";
  function load() {
	var i;
	var tempText = "";
	for(i=0; i<1200; i++){ tempText = Math.floor(Math.random()*2) + " " + tempText; }
	document.getElementById("code_text").innerHTML = tempText;
	
	if(inc > 100){ 
	  text = tempText;
	  clearTimeout(timer); 
	  timer = setInterval(remove , 1); 
	}else{
	  inc++;
	}
  }
  function remove() {
	text = text.slice(2);
	document.getElementById("code_text").innerHTML = text;
	if(text.length == 0){
	  clearTimeout(timer); 
	  text = "";
	  window.setTimeout(printCode, 200);
	}
  }
  
  var reps = 0;
  var inc = 0;
  function printCode() {
	var j = 0;
	for(i=0; i<about.length; i++){
	  var seg = about[i];
	   for(j=seg.length-1; j>=0; j--){
		window.setTimeout(addText, inc, Math.floor(Math.random()*2));
		inc+=5;
	  }
	  window.setTimeout(addText, inc, "<br>");
	  inc+=5;
	}
	printAbout();
  }
  
  function addText(addie) {
	text += addie;
	document.getElementById("code_text").innerHTML = text;
  }
  
  var finalText = "";
  function printAbout() {
	for(i=0; i<about.length; i++){
	  var seg = about[i];
	  for(j=0; j<seg.length; j++){
		window.setTimeout(replaceText, inc, about[i].charAt(j));
		inc+=5;
	  }
	  window.setTimeout(replaceText, inc, "<br>");
	  inc+=5;
	}
  }
  
  function replaceText(addie) {
	finalText += addie;
	text = finalText + text.slice(finalText.length);
	document.getElementById("code_text").innerHTML = text;
  }