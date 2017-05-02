"use strict";

// Needs heavy refactoring

let STAGES = [setupStage0, setupStage1, setupStage2, setupStage3, setupStage4];
let currentStage = 0;
let stageTimer = 0;
let stageScene;

function stageInit() {
    stageTimer = 0;

    let bgTexture = PIXI.utils.TextureCache["background.png"];
    let background = new PIXI.Sprite(bgTexture);

    let pauseButton = makeSimpleButton(100, 50, "Pause", 0x94b8b8);
    pauseButton.position.set(canvasWidth - 150, 100);
    pauseButton.on("pointertap", () => {
        stateBuffer = STATE;
        STATE = openPauseMenu;
    });

    stageScene = new PIXI.Container()
    stageScene.addChild(background);
    stageScene.addChild(pauseButton);
}

function setupStage0() {
    renderer.backgroundColor = 0x000000;
    currentStage = 0;
    console.log("stage 0");
	
    stageInit();
	
	// -------------------
	// Test code
	// -------------------
	
	let apples = [];
	let BELT_SPEED = 1;
	
	for (let i = 0; i < 20; i++) {
		apples[i] = makeTestApple();
	}
	
	stageScene.conveyorBelt = new ConveyorBelt(apples, BELT_SPEED);
	
	// -------------------
	// End Test code
	// -------------------
	
    SCENE = stageScene;
    STATE = stage0;
}

function stage0() {
	/*
    stageTimer++;
    if (stageTimer === 120) {
        STATE = openStageComplete;
    }
	*/
	stageScene.conveyorBelt.update();
}

function setupStage1() {
    renderer.backgroundColor = 0x330000;
    currentStage = 1;
    console.log("stage 1");

    stageInit();

    SCENE = stageScene;
    STATE = stage1;
}

function stage1() {
    stageTimer++;
    if (stageTimer === 120) {
        STATE = openStageComplete;
    }
}

function setupStage2() {
    renderer.backgroundColor = 0x660000;
    currentStage = 2;
    console.log("stage 2");

    stageInit();

    SCENE = stageScene;
    STATE = stage2;
}

function stage2() {
    stageTimer++;
    if (stageTimer === 120) {
        STATE = openStageComplete;
    }
}

function setupStage3() {
    renderer.backgroundColor = 0x990000;
    currentStage = 3;
    console.log("stage 3");

    stageInit();

    SCENE = stageScene;
    STATE = stage3;
}

function stage3() {
    stageTimer++;
    if (stageTimer === 120) {
        STATE = openStageComplete;
    }
}

function setupStage4() {
    renderer.backgroundColor = 0xcc0000;
    currentStage = 4;
    console.log("stage 4");

    stageInit();

    SCENE = stageScene;
    STATE = stage4;
}

function stage4() {
    stageTimer++;
    if (stageTimer === 120) {
        STATE = openStageComplete;
    }
}

function nextStage() {
    currentStage = currentStage === STAGES.length - 1 ? 0 : currentStage + 1;
}
