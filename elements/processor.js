"use strict";

function Processor(recipeOrder, level) //the Recipe this Processor will produce 
{

	//-------------------------------------------------------------------------------
	// Memeber functions
	//-------------------------------------------------------------------------------
	
	//-------------------------------------------------------------------------------
	// Sets Position of the Compressor
	this.SetPosition = (x,y) => {
		this.mPositionX = x;
		this.mPositionY = y;
	};
	
	//-------------------------------------------------------------------------------
	// On create / Init
	// Variable assignment
	this.Spawn = () => {	
		
		// Variable Assignments
		//this.requiredIngredients = [];
		this.numIngredients = recipeOrder.GetListCount();

		//  --- Sprite related Init  ---
	
		// First Box
		this.mSpriteProcessor = new PIXI.Sprite(
			PIXI.loader.resources["images/spritesheet.json"].textures["input.png"]
		);
		
		// Processor's Origin
		this.mSpriteProcessor.x = this.mPositionX;
		this.mSpriteProcessor.y = this.mPositionY;
		
		// Addes to Scene
		level.scene.addChild(this.mSpriteProcessor);
		
		
		// Rendering Processing Trays
		for(let i = 0; i < this.numIngredients; ++i)
		{
			// Unsafe (no sprite manager to initilize sprite with set position
			
			// Spawns Processor's Tray sprites
			this.mSpriteTray[i] = ( new PIXI.Sprite(
				PIXI.loader.resources["images/spritesheet.json"].textures["recipe-waiting.png"]
			));
			this.mSpriteTray[i].x = (this.mPositionX + (TILES_PX) + (TILES_PX * (i))); // offsets the pos based off index
			this.mSpriteTray[i].y = (this.mPositionY);
			
			//!!
			// Creates Gears Object
			this.mGears.push(makeGear("s",1));			
			// Sets Position
			this.mGears[i].x = this.mSpriteTray[i].x;	
			this.mGears[i].y = this.mSpriteTray[i].y - 22;
			// Pushes to Renderer
			level.scene.addChild(this.mGears[i]);
			//!!
		
			// Addes to Scene
			level.scene.addChild(this.mSpriteTray[i]);		
			
			// Spawns Ingredient image on top of the tray
			this.requiredIngredients[i] = makeItem(recipeOrder.GetList()[i], level);	// Pushes new Item on the list
			this.requiredIngredients[i].interactive = false;								// Not Pressable
			this.requiredIngredients[i].alpha = this.alpha;									// Sets the transparancy
			
			this.requiredIngredients[i].x = this.mSpriteTray[i].x + (this.spriteSizeHalf);	// Spawns to the center of the tray
			this.requiredIngredients[i].y = this.mSpriteTray[i].y + (this.spriteSizeHalf + 67);
			this.recipeProgress[i] = false; // Forcefully sets to not completed
			
		}
		
		// -- Processor's Width and Height --
		
		this.mWidth = TILES_PX + TILES_PX*2 +(this.numIngredients * (TILES_PX));
		this.mHeight = TILES_PX;
		
		// -- Last Tray is the Processor output --
		
		this.mOutputTexture.push(PIXI.loader.resources["images/spritesheet.json"].textures["output.png"]);
		this.mOutputTexture.push(PIXI.loader.resources["images/spritesheet.json"].textures["output-ready.png"]);
	
		this.mOutputSprite = new PIXI.Sprite(this.mOutputTexture[this.mOutputState.Blue]);
		
		this.mOutputSprite.x = (this.mPositionX + (TILES_PX) + (TILES_PX * (this.numIngredients))); //array starts at 0
		this.mOutputSprite.y = (this.mPositionY);

		
		// Adds to Scene
		level.scene.addChild(this.mOutputSprite);
		
		
		// -- Position Timer, center to where processor is at -- 
		this.mTimer.loadTimer(TILES_PX + this.mOutputSprite.x , TILES_PX + this.mOutputSprite.y);
		this.currentState = this.ProcessorState.Feeding;


	};
	
	//-------------------------------------------------------------------------------
	// Collision pass for ingredients Item's center x and y
	this.collidesWithPoint = (x,y) => {
		
		// Input Box
		let inputLeft = this.mPositionX; // x1
		let inputRight = this.mPositionX + (this.mWidth - TILES_PX*2);//x2
		let inputTop = this.mPositionY; // y1
		let inputBottom = this.mPositionY + TILES_PX*2; //y2
		
		// Recipe Boxes
		if(this.currentState === this.ProcessorState.Feeding) {
			return 	( inputLeft < x 
			&& x < inputRight 
			&& inputTop < y 
			&& y < inputBottom);
		}
		// If state is not Feeding, Item's Dragged on Top will still fall
		else
			return false;
    };
	
	//-------------------------------------------------------------------------------
	// Passes Ingredient Object to Processor
	this.addItem = (droppedIngredient) => {
		for(let i = 0; i < this.numIngredients; ++i)
		{
			// ! Change to ====
			if(droppedIngredient.type == this.requiredIngredients[i].type && !this.recipeProgress[i])
			{
				this.requiredIngredients[i].alpha = 0.8; //TODO: MAGIC NUMBER
				this.recipeProgress[i] = true;
				this.mSpriteTray[i].texture = PIXI.loader.resources["images/spritesheet.json"].textures["recipe-correct.png"];
                
				level.scene.removeChild(droppedIngredient);
				return true;
			}
		}
        return false;
	};
	
	//-------------------------------------------------------------------------------
	// State Checker, Updates state if needed
	this.UpdateState = () => {
		
		// Feeding State
		if(this.bRecipeCompletion() && this.currentState === this.ProcessorState.Feeding) {
			// State Change -> Processing
			this.currentState = this.ProcessorState.Processing;
		}
		
		// Proccessing Timer State
		else if(this.currentState === this.ProcessorState.Processing && this.isTimerFinished) {
			this.currentState = this.ProcessorState.Finished;
			
		}
		
		// Item Spawning State
		else if(this.currentState === this.ProcessorState.Finished && this.bReset){
			this.currentState = this.ProcessorState.Feeding;
		}
        
	};
	
	//-------------------------------------------------------------------------------
	// Checks if the Outputted item has been moved
	this.bOutputEmpty = () => {
		
		// Because the Player is only allowed one interaction at a time, 
		// we can persume he can only do one thing when dragging
		return level.isFinalItem(this.mOutputItem.type) || this.mOutputItem.dragging;
	};

	//-------------------------------------------------------------------------------
	// On Update
	this.update = () => {
		
		// State Updater
		this.UpdateState();
			
		// State Machine, Acts accordingly to what ever state it is in
		switch(this.currentState)
		{
			case (this.ProcessorState.Feeding): {	// Feeding State
				if(this.bReset) {
					this.bReset = false;
				}
			}break;
			
			case (this.ProcessorState.Processing): {	// Processing State
					
					// If Timer hasn't been spawned, spawn it.
					if(!this.isTimerSpawned) {
						this.mTimer.OnSpawn();
						this.isTimerSpawned = true;
					}
					
					this.mTimer.Update();
					
					// Spins Gears
					for(let i = 0; i < this.mGears.length; ++i)
					{
						this.mGears[i].update();
					}
					
					//Check for update change
					this.isTimerFinished = this.mTimer.IsFinished();
					
			}break;
			
			case (this.ProcessorState.Finished): {	// Spawning/Item Check State
				
				this.mTimer.OnKill();
				
				if(!this.isFinishedSpawning) {
					this.SpawnOutput();
					this.mOutputSprite.texture = this.mOutputTexture[this.mOutputState.Green];
					this.isFinishedSpawning = true;
				}
				else if(this.bOutputEmpty()){
					this.mOutputSprite.texture = this.mOutputTexture[this.mOutputState.Blue];
					this.ResetProcessorState();
					this.bReset = true;		// State Flag
				}
			}break;
		}
	};
	
	//-------------------------------------------------------------------------------
	// Spawns Ingredient
	this.SpawnOutput = () => {
		
			this.mOutputItem = makeItem(recipeOrder.GetOutput(), level);
			level.addScore(recipeOrder.GetScore());
			
			this.mOutputItem.x = TILES_PX + this.mOutputSprite.x;
			this.mOutputItem.y = TILES_PX + this.mOutputSprite.y;	
			
			if(level.isFinalItem(this.mOutputItem.type)) {
				// TODO: level.poof
				this.mOutputItem.interactive = false;
				this.mOutputItem.fadeAway();
				level.completionData.itemsComplete.push(recipeOrder.GetOutput());
			}
	};
	
	//-------------------------------------------------------------------------------
	// Gets Score of the recipe
	this.GetScore = () => {
		return (this.mScore);
	};
	
	//-------------------------------------------------------------------------------
	// Sets Score
	this.SetScore = () => {
		//(this.mScore) = recipeOrder.GetScore();
	};
	
	//-------------------------------------------------------------------------------
	// Checks if all the required Recipe Ingredients are added
	this.bRecipeCompletion = () => {
		for (let i = 0; i < this.numIngredients; ++i) {
			if(this.recipeProgress[i] == false)
				return false;
		}
		return true;
	};
	
	//-------------------------------------------------------------------------------
	// Resets the State of Processor
	this.ResetProcessorState = () => {
		
		// Resets the Whole Processor's Alpha
		
		// Resets Tray Ingredient's Alpha, and Progress
		for(let i = 0; i < this.numIngredients; ++i)
		{
			this.recipeProgress[i] = false;
			this.requiredIngredients[i].alpha = this.alpha;
			this.mSpriteTray[i].texture = PIXI.loader.resources["images/spritesheet.json"].textures["recipe-waiting.png"];
		}

		// Resets Flags
		this.isFinishedSpawning = false; 	// Spawner Flag 
		this.isDone = false;				// State Flag
		this.isTimerFinished = false;		// Timer Flag
		this.isTimerSpawned = false;
	};
	
	/**
	//-------------------------------------------------------------------------------
	// Sets the Alpha and Interaction State of the Processor's Sprites
	// this.SetInteract = (bool) => {}; 
	
	//-------------------------------------------------------------------------------
	// On draw
	this.OnRender : function()
	{
			//Stuffs to do on Draw?
			
			//if in processing state 
				stage.addChild(mCurrentSprite)
			//render clock
			
	}
	
	*/

	
	//-------------------------------------------------------------------------------
	// Object Variables
	//-------------------------------------------------------------------------------
	
	// Sprites
	this.mSpriteProcessor; 					// Sprite Variable
	this.mSpriteTray = [];
	this.mOutputTexture = []; 			// This Sprite will not be have a bounding box
	
	this.mOutputSprite;
	this.mGears = [];
	

	//output-ready
	
	// Object Variables
	this.mPositionX;
	this.mPositionY;
	
	this.mWidth;
	this.mHeight;
	
	this.mOutputState = { Blue : 0, Green : 1};
	this.spriteSizeHalf = TILES_PX / 2;
	
	this.mScore = 0;
	this.mOutputItem;					// Local Variable that holds the output object
	
	this.alpha = 0.5;
	
	// 80 is TILES_PX, defualt sprite size
	
	// Ingredients
	this.requiredIngredients = [];		// Array of required items
	this.numIngredients;				// Total Number of Ingredients
	this.recipeProgress = []; 			// An array of booleans to check if each seperate ingredients are placed
	this.mPosition;
	
	// Timer Object
	this.mTimer = new Timer(level);
	this.isTimerSpawned = false;

	
	// State Variables
	this.currentState;
	this.bReset = false;				// for Processor is completed, Reset Flag 
	this.isFinishedSpawning = false;	// Flag for item has finished Spawning
	this.ProcessorState = { Feeding : 0, Processing : 1, Finished : 2 };
	
	
	// Object Variables
	

}	// End of Class



//==========================================================================================
//==========================================================================================
//==========================================================================================

function Timer(level) 
{	
	//-------------------------------------------------------------------------------
	// Stuffs to do on Spawn
	this.OnSpawn = () => {
		level.scene.addChild(this.mCurrentSprite);
		this.mCurrentSprite.scale.set(0.25);
		this.isEntering = true;
	}; 	// Play Animation
	
	//-------------------------------------------------------------------------------
	// Stuffs to do on create
	this.Update = () => {
		
		if(this.isEntering) {
			this.EnteranceAnimation();
		}
		
		// Don't continue ticking when timer is done.
		if (!this.isTimerFinished) {
			
			// Increment time
			this.processTimer += TICKER.deltaTime;
			
			// Check for next tick
			if(this.processTimer >= this.timerTick) {
				
				this.currentFrame++; // Increment the frame
				this.mCurrentSprite.texture = this.mSpriteList[this.currentFrame]; // Change the texture
				this.processTimer -= this.timerTick; // Reset ticker
			}
			
			// Reset on last tick
			if(this.currentFrame == this.maxframe - 1) {
				this.isTimerFinished = true;
				this.currentFrame = 0;
			}
		}
	};
	
	//-------------------------------------------------------------------------------
	// Loads Sprite
	this.loadTimer = (x, y) => {
		this.SetPosition(x,y);
		for (let i = 0; i < this.maxframe; i++) {
			this.mSpriteList.push(
				PIXI.loader.resources["images/spritesheet.json"].textures["stop-watch-icon-hi" + i + ".png"]
			);
		}
		
		this.mCurrentSprite = new PIXI.Sprite(this.mSpriteList[0]);
		this.mCurrentSprite.position.set(x, y);
		this.mCurrentSprite.anchor.set(0.5);

	};
	
	//-------------------------------------------------------------------------------
	this.SetPosition = (x,y) => {
		this.mPosition.x = x;
		this.mPosition.y = y;
	};
	
	//-------------------------------------------------------------------------------
	// Resets all the variables
	this.Reset = () => {
		
		this.processTimer = 0; 
		this.currentFrame =  0;
		
		// Resets Sprite
		this.mCurrentSprite.texture = this.mSpriteList[this.currentFrame];
		
		this.isTimerFinished = false;
		this.isSpawned = false;
		
		this.animationFrame = 0;
		this.jump = 0;
		this.scale = 0;
	};
	
	//-------------------------------------------------------------------------------
	// Stuffs on kill
	this.OnKill = () => {
		level.scene.removeChild(this.mCurrentSprite);
		this.Reset();
		this.jump = 0;
	} ;	// Play Animation
	
	//-------------------------------------------------------------------------------
	// Returns a boolean 
	this.IsFinished = () => {
		return this.isTimerFinished;
	};
	
	this.mPosition = {x : 0, y : 0};
	
	// Processing Variables
	this.mCurrentSprite;					// Current Sprite
	this.mSpriteList = [];					// List of Sprite
	
	// Timer Variables
	this.maxframe = 8;			
	this.totalProcessTime = 180; 			// total time it takes for an item to process (3 seconds)
	this.timerTick = this.totalProcessTime / this.maxframe;
	this.processTimer = 0; 
	this.currentFrame =  0;
	this.isTimerFinished = false;
	this.isSpawned = false;
	
	this.animationFrame = 0;
	this.totalAnimationFrame = 10;
	this.isEntering = false;
	
	this.jump = 0;
	this.scale = 0;
	
	this.EnteranceAnimation = () => {
		
		// Tick Rate
		this.animationFrame += TICKER.deltaTime * 0.1;
		
		// First 3 Seconds is Bounce
		//if(this.animationFrame <= 3) {
			// if(this.jump <= 4)
				// this.mCurrentSprite.y--;
			// else if( this.mCurrentSprite.y <= this.mPosition.y)
				// this.mCurrentSprite.y++;
			
			// this.jump += TICKER.deltaTime * 0.2;
			
		if(this.animationFrame <= this.totalAnimationFrame) {
			
			// Slowly Scales back to one to 1
			if(this.animationFrame <= 1) 
				this.mCurrentSprite.scale.set(this.animationFrame);
		}
		else
			this.isEntering = false;
		
	};
	this.ExitAnimation = () => {
		
	};
};
