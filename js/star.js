var starImg = new Image();
var starImgReady = false;
starImg.onload = function() { starImgReady = true }
starImg.src="images/star2.gif";

function Star(x1, y1)
{
	this.x = x1;
	this.y = y1;
	this.rot = Math.round(Math.random()*90);
	this.speed = 1;
	this.r=255;
	this.g=255;
	this.b=255;
	this.i = Math.random()*4;
	this.timeToLive = 1000;
	if (this.i < 1)
		this.r = Math.round(Math.random()*255);
	else if (this.i < 2)
		this.g = Math.round(Math.random()*255);
	else
		this.b = Math.round(Math.random()*255);
	
	this.rgbString = this.r+","+this.g+","+this.b;
	this.starImage=starImg;

	
	this.setSpeed = function(s)
	{
		this.speed = s;	
	}
	
	this.moveX = function(modifier)
	{
		if (modifier < 0)
			this.x += Math.round(((modifier/10)*this.speed));
	}

	
	this.animate = function(modifier)
	{
		this.rot += 45*modifier*2;
		if (this.rot > 360)
			this.rot -= 360;
	}
	
	this.fade = function(modifier)
	{
		this.timeToLive -= modifier*500;
		this.animate(modifier);
	}
	
	this.draw = function (context)
	{
		if (starImgReady)
		{
   		var canvasBuffer = document.createElement('canvas');
		canvasBuffer.width = this.starImage.width;
		canvasBuffer.height = this.starImage.height;
		var buffer = canvasBuffer.getContext('2d');
    	var colors = [this.r,this.g,this.b];
    	
 		buffer.translate(this.starImage.width/2,this.starImage.height/2);
		buffer.rotate(this.rot*Math.PI/180);
		buffer.translate(-this.starImage.width/2, -this.starImage.height/2);
   		buffer.drawImage(this.starImage, 0, 0);
    	
    	var image2 = buffer.getImageData(64, 64, this.starImage.width/2, this.starImage.height/2);    	 	
    	var imageData2 = image2.data;
  		var image3 = context.getImageData(this.x, this.y, this.starImage.width/2, this.starImage.height/2);
    	var imageData3 = image3.data;
 
    	var i = -1;
    	var pixels = 4* this.starImage.width/2 * this.starImage.height/2;
    	for (pixel = 0; pixel < pixels; pixel++) {
    		i++;
    		if (i < 3)
    		{
    			//imageData2[pixel] = ((imageData2[pixel] / 255) - (1-(colors[i]/-255))) *255;
        		imageData2[pixel] -= 255-colors[i];
        		imageData2[pixel] = (imageData2[pixel]*this.timeToLive/1000) + imageData3[pixel];
        	}
        	else 
        		i = -1;
    	}

    	image2.data = imageData2;
    	context.putImageData(image2, this.x, this.y);


		}
	}
		
}
