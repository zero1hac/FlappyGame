var mainState = {
	preload: function() {
		// This function will be executed at the beginning
		// That's where we load the resources for the game
		game.load.image('bird', 'assets/flappy_50x50.png');
		
		//Load audio
		game.load.audio('jump', 'assets/jump.wav');

		//Load pipes image in the game
		game.load.image('pipeImage', 'assets/pipeFlappy.png');
		game.load.image('pipeImageInverted', 'assets/pipeFlappyInverted.png');

	},

	create: function(){

		//For compatibility of screen size
		if (game.device.desktop == false) {
    // Set the scaling mode to SHOW_ALL to show all the game
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

    // Set a minimum and maximum size for the game
    // Here the minimum is half the game size
    // And the maximum is the original game size
    game.scale.setMinMax(game.width/2, game.height/2,
        game.width, game.height);

    // Center the game horizontally and vertically
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
	}
		// This function is called after the preload function
		// Here we set up the game, display sprites, etc.
		// Change the background color of the game to blue
		game.stage.backgroundColor = '#71c5cf';

		// Set the physics system
		game.physics.startSystem(Phaser.Physics.ARCADE);

		//creating shadow for the bird
		this.shadow = game.add.sprite(100,245, 'bird');
		this.shadow.tint = 0x000000;
		this.shadow.alpha = 0.6;

		// Display the bird at the position x=100 and y=245
		this.bird = game.add.sprite(100, 245, 'bird');



		// Add physics to the bird
		// Needed for: movements, gravity, collisions, etc.
		game.physics.arcade.enable(this.bird);
		game.physics.arcade.enable(this.shadow);

		// Add gravity to the bird to make it fall
		this.bird.body.gravity.y = 1000;
		this.shadow.body.gravity.y = 1000;

		// Call the 'jump' function when the spacekey is hit
		var spaceKey = game.input.keyboard.addKey(
			Phaser.Keyboard.SPACEBAR);
			spaceKey.onDown.add(this.jump, this);

			//PIPE Section
			// Create an empty group
			this.pipes = game.add.group();
			//creating pipes at a rate of 1800
			this.timer = game.time.events.loop(1800, this.addRowOfPipes, this);


			//Scoring and collisions
			this.score = 0;
			this.labelScore = game.add.text(20, 20, "0", { font: "30px Arial", fill: "#ffffff" });

			//Anchor for tweening motion
			this.bird.anchor.setTo(-0.2, 0.5);
			this.shadow.anchor.setTo(-0.2,0.5);

			//For jump sound
			this.jumpSound = game.add.audio('jump');

			//for Jump keybindng
			game.input.onDown.add(this.jump, this);


		},

		update: function() {
			//This function is called 60 times per second
			//It contains the game's logic
			// If the bird is out of the screen (too high or too low)
			// Call the 'restartGame' function
			if (this.bird.y < 0 || this.bird.y > 490)
			this.restartGame();

			//for collisions restartGame
			game.physics.arcade.overlap(this.bird, this.pipes, this.hitPipe, null, this);

			if (this.bird.angle < 20)
    	this.bird.angle += 1;
			if (this.shadow.angle < 20)
    	this.shadow.angle += 1;
		},

		// Make the bird jump
		jump: function() {
			// Add a vertical velocity to the bird
			this.bird.body.velocity.y = -350;
			this.shadow.body.velocity.y = -350;

			//for tweening motion
			game.add.tween(this.bird).to({angle: -20}, 100).start();
			game.add.tween(this.shadow).to({angle: -20}, 100).start();
			//for restartGame after stop
			if (this.bird.alive == false)
    		return;

			//Play jump sound when jump
			this.jumpSound.play();
		},

		// Restart the game
		restartGame: function() {
			// Start the 'main' state, which restarts the game
			game.state.start('main');
		},

		//For adding multiple pipes
		addOnePipe: function(x, y, hole) {
			// Create a pipe at the position x and y
			//var pipe = game.add.sprite(x, y, 'pipe');
			var pipeFlappy = game.add.sprite(x, y, 'pipeImage');
			var yInverted = -1 * hole;
			var pipeFlappyInverted = game.add.sprite(x , yInverted, 'pipeImageInverted');

			//pipeFlappyInverted.scale.setTo(1, -1);
			//pipeFlappy.scale.setTo(-1, 0.5);

			// Add the pipe to our previously created group
			//this.pipes.add(pipe);
			this.pipes.add(pipeFlappy);
			this.pipes.add(pipeFlappyInverted);
			// Enable physics on the pipe
			//game.physics.arcade.enable(pipe);
			game.physics.arcade.enable(pipeFlappy);
			game.physics.arcade.enable(pipeFlappyInverted);
			// Add velocity to the pipe to make it move left

			//pipe.body.velocity.x = -200;
			pipeFlappy.body.velocity.x = -200;
			pipeFlappyInverted.body.velocity.x = -200;

			// Automatically kill the pipe when it's no longer visible
			pipeFlappy.checkWorldBounds = true;
			pipeFlappy.outOfBoundsKill = true;

			pipeFlappyInverted.checkWorldBounds = true;
			pipeFlappyInverted.outOfBoundsKill = true;
		},

		addRowOfPipes: function() {
			// Randomly pick a number between 1 and 5
			// This will be the hole position
			var hole = Math.floor(Math.random() * 30) + 1;

			//for scoring
			this.score += 1;
			this.labelScore.text = this.score;

			//add pipeFlappy image
			this.addOnePipe(800, 490 - 10*hole, 113 + 10*hole +120);

		},

		hitPipe: function() {
    // If the bird has already hit a pipe, do nothing
    // It means the bird is already falling off the screen
    if (this.bird.alive == false)
        return;

    // Set the alive property of the bird to false
    this.bird.alive = false;
		this.bird.body.velocity.y = 1000;
		this.shadow.body.velocity.y = 1000;
    // Prevent new pipes from appearing
    game.time.events.remove(this.timer);

    // Go through all the pipes, and stop their movement
    this.pipes.forEach(function(p){
        p.body.velocity.x = 0;
    }, this);
},
	};


	// Initialize Phaser, and create a 400px by 490px game
	var game = new Phaser.Game(800, 490);
	//
	// Add and start the 'main' state to start the game
	game.state.add('main', mainState, true);
