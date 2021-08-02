import Phaser from 'phaser'

export default class Scene extends Phaser.Scene {
    private platforms?: Phaser.Physics.Arcade.StaticGroup;
    private player?: Phaser.Physics.Arcade.Sprite;
    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
    private stars?: Phaser.Physics.Arcade.Group;
    private score: integer = 0;
    private scoreText?: Phaser.GameObjects.Text;
    private bombs?: Phaser.Physics.Arcade.Group;
    private gameOver: boolean = false;

    constructor() {
        super('star-addict');
    }

    preload() {
        this.load.image('sky', 'assets/sky.png');
        this.load.image('ground', 'assets/platform.png');
        this.load.image('star', 'assets/star.png');
        this.load.image('bomb', 'assets/bomb.png');
        this.load.spritesheet('dude',
            'assets/dude.png',
            { frameWidth: 32, frameHeight: 48 }
        );
    }

    create() {

        // display sky
        this.add.image(400, 300, 'sky');

        this.bombs = this.physics.add.group();
        this.cursors = this.input.keyboard.createCursorKeys();

        this.initializeStar();
        this.initializeCollisions();
        this.initializePlayerAnims();

        this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', color: '#000' });

    }

    initializeCollisions() {
        this.physics.add.collider(this.stars!, this.platforms!);
        // setup method to be called on overlap
        this.physics.add.overlap(this.player!, this.stars!, this.collectStar, undefined, this);
        this.physics.add.collider(this.player!, this.platforms!);
        this.physics.add.collider(this.bombs!, this.platforms!);
        this.physics.add.collider(this.player!, this.bombs!, this.hitBomb, undefined, this);
    }

    initializePlayerAnims() {
        // uses frame 0-3 and runs at 10 frames per second
        // -1 tells animation to loop
        // Define animation once and can set it to mulitple objects
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: - 1
        });

        this.anims.create({
            key: 'turn',
            frames: [{ key: 'dude', frame: 4 }],
            frameRate: 20
        })

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        })
    }

    initializePlatforms() {
        // declare platforms and set to staticGroup
        // groups items of static properties together
        // static items cannot have gravity and such acted on them
        this.platforms = this.physics.add.staticGroup();

        // create ground variable
        const ground: Phaser.Physics.Arcade.Sprite = this.platforms.create(400, 568, 'ground');
        // double size of ground as it won't fit to screen otherwise
        ground.setScale(2).refreshBody();

        this.platforms.create(600, 400, 'ground');
        this.platforms.create(50, 250, 'ground');
        this.platforms.create(750, 220, 'ground');
    }

    initializePlayer() {
        this.player = this.physics.add.sprite(100, 450, 'dude');
        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);
        this.player.setGravityY(300);
    }

    // creates all stars setting their bounce rate and location on screen
    initializeStar() {
        this.stars = this.physics.add.group({
            key: 'star',
            // create a star 11 more times
            repeat: 11,
            // starts at x12 and places in steps of c70
            setXY: { x: 12, y: 0, stepX: 70 }
        });

        this.stars.children.iterate(function (child) {
            const c = child as Phaser.Physics.Arcade.Image;
            c.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        });
    }

    update() {
        if (this.cursors?.left.isDown) {
            this.player?.setVelocityX(-160);
            this.player?.anims.play('left', true);
        }
        else if (this.cursors?.right.isDown) {
            this.player?.setVelocityX(160);
            this.player?.anims.play('right', true);
        }
        else {
            this.player?.setVelocityX(0);
            this.player?.anims.play('turn', true);
        }
        // if up arrow and body is colliding on its bottom edge
        if (this.cursors?.up.isDown && this.player?.body.touching.down) {
            this.player.setVelocityY(-500);
        }
    }

    private collectStar(player: Phaser.GameObjects.GameObject, star: Phaser.GameObjects.GameObject) {

        const s = star as Phaser.Physics.Arcade.Image;
        const p = player as Phaser.Physics.Arcade.Sprite;
        s.disableBody(true, true);

        this.score += 10;
        this.scoreText?.setText(`Score: ${this.score}`);

        // countActive checks how many stars are left
        if (this.stars?.countActive(true) === 0) {
            // redraw all stars
            this.stars.children.iterate((child) => {
                const c = child as Phaser.Physics.Arcade.Image;
                c.enableBody(true, c.x, 0, true, true);
            });
            // ramdom x coord opposite side to player
            const x: number = (p.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);


            const bomb: Phaser.Physics.Arcade.Image = this.bombs?.create(x, 16, 'bomb');
            bomb.setBounce(1);
            bomb.setCollideWorldBounds(true);
            bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        }
    }

    private hitBomb(player: Phaser.GameObjects.GameObject, bomb: Phaser.GameObjects.GameObject) {
        this.physics.pause();
        const p = player as Phaser.Physics.Arcade.Sprite;
        p.setTint(0xff0000);
        p.anims.play('turn');
        this.gameOver = true;
    }

}