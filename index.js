$(document).ready(function(){


    // Canvas Variables
    var canvas = $('#canvas1');
    var context = canvas.get(0).getContext('2d');
    var canvasWidth = canvas.width();
    var canvasHeight = canvas.height();

    var canvas2 = $('#canvas2');
    var context2 = canvas2.get(0).getContext('2d');
    var canvas2Width = canvas2.width();
    var canvas2Height = canvas2.height();


    // Keyboard Variables
    var leftKey = 37;
    var upKey = 38;
    var rightKey = 39;
    var downKey = 40;


    // Keyboard event listeners
    $(window).keydown(function(e){
        var keyCode = e.keyCode;
        if(keyCode == leftKey){
            car.left = true;
        } else if(keyCode == upKey){
            car.forward = true;
        } else if(keyCode == rightKey){
            car.right = true;
        } else if (keyCode == downKey){
            car.backward = true;
        }
    });
    $(window).keyup(function(e){
        var keyCode = e.keyCode;
        if(keyCode == leftKey){
            car.left = false;
        } else if(keyCode == upKey){
            car.forward = false;
        } else if(keyCode == rightKey){
            car.right = false;
        } else if (keyCode == downKey){
            car.backward = false;
        }
    });


    // Start & Stop button controlls
    var playAnimation = true;
    
    var startButton = $('#startAnimation');
    var stopButton = $('#stopAnimation');
    
    // startButton.hide();
    startButton.click(function(){
        $(this).hide();
        stopButton.show();
        playAnimation = true;
        updateStage();
    });
    stopButton.click(function(){
        $(this).hide();
        startButton.show();
        playAnimation = false;
    });

    
    // Resize canvas to full screen
    function resizeCanvas(){
        canvas.attr('width', $(window).get(0).innerWidth);
        canvas.attr('height', $(window).get(0).innerHeight);
        canvasWidth = canvas.width();
        canvasHeight = canvas.height();

        canvas2.attr('width', $(window).get(0).innerWidth);
        canvas2.attr('height', $(window).get(0).innerHeight);
        canvas2Width = canvas2.width();
        canvas2Height = canvas2.height();
    }
    resizeCanvas();
    $(window).resize(resizeCanvas);


    function initialise(){
        initStageObjects();
        drawStageObjects();
        updateStage();
    }
    

    // Grass object and properties
    function Grass(src, x, y){        
        this.image = new Image();
        this.image.src = src;
        
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
    }

    // Car object and properties
    function Car(src, x, y){        
        this.image = new Image();
        this.image.src = src;
        
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.angle = 90;
    
        this.topSpeed = 15;

        this.topDrift = 34;
        // Seems to be a nice proportion, since the topDrift are like 34, 45, 56, 67, 78...
        this.minDrift = Math.floor(this.topDrift / 10); // for control pourpose only
        this.driftGearStick = this.topDrift % 10;       // for control pourpose only

        this.acceleration = 0.1;
        this.reverse = 0.1;
        this.brakes = 0.3;
        this.friction = 0.05;
        this.handeling = 15;
        this.grip = 15;
        this.minGrip = 5;
        this.speed = 0;
        this.drift = 0;
    
        this.left = false;
        this.up = false;
        this.right = false;
        this.down = false;
    }

    
    // Create any objects needed for animation        
    function initStageObjects(){
        car = new Car('http://www.henry.brown.name/experiments/foundation-canvas/images/car.png',canvas.width()/2,canvas.height()/2);
        grass = new Grass('grass.png',canvas2.width()/2,canvas2.height()/2);
    }
    
    
    function drawStageObjects(){
        context2.save();
        context2.translate(grass.x,grass.y);
        context2.drawImage(grass.image, 0, 0);
        context2.restore();

        context.save();
        context.translate(car.x,car.y);
        context.rotate((car.angle + car.drift) * Math.PI/180);    
        context.drawImage(car.image, -25 , (-47 + (Math.abs(car.drift / 3))));
        // context.fillRect(-5, -5, 10, 10);
        context.restore();
    }
    
    
    function clearCanvas(){
        context.clearRect(0, 0, canvasWidth, canvasHeight);  
        context.beginPath();

        context2.clearRect(0, 0, canvasWidth, canvasHeight);  
        context2.beginPath();
    }
    
    
    function updateStageObjects(){
        
        // Faster the car is going, the worse it handels
        if(car.handeling > car.minGrip){
            car.handeling = car.grip - car.speed;
        }
        else{
            car.handeling = car.minGrip + 1;
        }
        
        
        // Car acceleration to top speed
        if(car.forward){
            if(car.speed < car.topSpeed){
                car.speed = car.speed + car.acceleration;
            }            
        }        
        else if(car.backward){
            if(car.speed < 1 && -car.speed < car.topSpeed){
                car.speed = car.speed - car.reverse;    
            }
            else if(car.speed > 1){
                car.speed = car.speed - car.brakes;
            }
        }
        

        // Car drifting logic (still working on it...)
        if (car.forward) {
            // If car reach 90% the very own speed, then start drifting
            if(car.left && car.speed > (car.topSpeed * 0.90) && car.drift > -car.topDrift){
                car.drift = car.drift - car.driftGearStick;
            }
            else if(car.right && car.speed > (car.topSpeed * 0.90) && car.drift < car.topDrift){
                car.drift = car.drift + car.driftGearStick;
            }
        } else {
            if(car.drift < -car.minDrift){
                car.drift = car.drift + car.driftGearStick;
            } else  if(car.drift > car.minDrift){
                car.drift = car.drift - car.driftGearStick;
            } 
        }


        // General car handeling when turning    
        if(car.left){
            car.angle = car.angle - (car.handeling * car.speed/car.topSpeed);
        } else if(car.right){
            car.angle = car.angle + (car.handeling * car.speed/car.topSpeed);    
        }
        
        
        // Use this div to display any info I need to see visually
        $('#stats').html(car.drift);
            
        
        // Constant application of friction / air resistance
        if(car.speed > 0){
            car.speed = car.speed - car.friction;
        } else if(car.speed < 0) {
            car.speed = car.speed + car.friction;   
        }
        

        // Update car velocity (speed + direction)
        car.vy = -Math.cos(car.angle * Math.PI / 180) * car.speed;
        car.vx = Math.sin(car.angle * Math.PI / 180) * car.speed;    
        
        
        // Plot the new velocity into x and y cords
        car.y = car.y + car.vy;
        car.x = car.x + car.vx;

        grass.y = -(2.5 * (car.y + car.vy));
        grass.x = -(2.5 * (car.x + car.vx));
    }


    // Main animation loop
    function updateStage(){
        clearCanvas();
        updateStageObjects();
        drawStageObjects();        
        
        if(playAnimation){
            setTimeout(updateStage, 25);
        }
    }

    
    // Initialise the animation loop
    initialise();
        
});