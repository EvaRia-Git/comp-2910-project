"use strict";

function ConveyorBelt(items, speed) {
	
	// Some temp constant controls
	let SCENE_HEIGHT_PX = 480;
	let SCENE_WIDTH_PX = 640;
	let SPRITE_SIZE_PX = 32;
	
	
	// Create Object from array
    this.items = items;
    
	// Position items
	for(let i in this.items) {
		
		// To bottom of screen
		this.items[i].y = SCENE_HEIGHT_PX - SPRITE_SIZE_PX;
		
		// To almost right of screen
		this.items[i].x = SCENE_WIDTH_PX - SPRITE_SIZE_PX * 2;
		
		// Flow left
		this.items[i].x -= SPRITE_SIZE_PX * i;
	}
	
    // We will need to draw/animate the belt but it's in the same position all the time.
    
    // Data that is different for each belt
    this.speed = speed;
    
    // Behaviours
    this.update = () => {
        // Move belt forwards
		for (let i in this.items) {
			this.items[i].x += this.speed;
		}
        // Check for items removed from array
        // Check for items placed into array
        
        // Check if end of conveyor is over trash
            // if true, drop the last item and waste
            // then, we move all ites one index forwards and shift the belt object back one position (in terms of hitbox)
    }
}

function makeTestApple() {
	let apple = new PIXI.Sprite(
		PIXI.loader.resources["images/spritesheet.json"].textures["apple.png"]
	);
	stageScene.addChild(apple);
	return apple;
}