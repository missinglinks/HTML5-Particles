var PathPoint = function (posX, posY) {
  this.x = posX
  this.y = posY
  this.timeToLive = 100
}

var Particle = function (set_x, set_y) {
  this.x = set_x
  this.originX = this.x
  this.y = set_y
  this.originY = this.y

  this.moveX = 0.01
  this.moveY = 0.01
  this.moveDistance = 0
  this.path = new Array()
  this.glow = 0

  this.r = 55 + Math.round(Math.random() * 200)
  this.g = 55 + Math.round(Math.random() * 200)
  this.b = 55 + Math.round(Math.random() * 200)

  this.rgbString = this.r + ',' + this.g + ',' + this.b

  this.setColorMode = function (colorScheme) {
    if (colorScheme == 'dark') {
      this.r = Math.round(this.r / 2)
      this.g = Math.round(this.g / 2)
      this.b = Math.round(this.b / 2)

      this.rgbString = this.r + ',' + this.g + ',' + this.b
    }
  }

  this.updatePath = function (modifier) {
    for (var i = 0; i < this.path.length; i++) {
      this.path[i].timeToLive -= modifier * 1000
      if (this.path[i].timeToLive < 0) this.path.shift()
    }
    this.path.push(new PathPoint(this.x, this.y))
  }
}

function ParticleField(field_width, field_height, pSize, a) {
  this.size = pSize
  this.numParticles = 0
  this.particles = new Array()
  this.fieldWidth = field_width
  this.fieldHeight = field_height
  this.text = ''
  this.initText = ''
  this.pTextSize = '50'
  this.pTextWidth = 0
  this.alpha = a
  this.pathOn = true
  this.collision = true

  this.vX = 0
  this.vY = 0

  this.setXMovement = function (speed) {
    this.vX = speed
  }
  this.setYMovement = function (speed) {
    this.vY = speed
  }

  this.checkDistance = function (particle1, particle2) {
    var dX = particle1.x - particle2.x
    var dY = particle1.y - particle2.y
    var abstand = Math.sqrt(dX * dX + dY * dY)
    //alert (abstand+"  "+this.size*2)
    return abstand
    //return false;
  }

  this.populate = function (particleNumber) {
    this.particles = new Array()
    this.numParticles = particleNumber
    for (var i = 0; i < particleNumber; i++) {
      var next = true
      do {
        next = true
        var newX = Math.round(
          this.size + Math.random() * (this.fieldWidth - this.size * 2)
        )
        var newY = Math.round(
          this.size + Math.random() * (this.fieldHeight - this.size * 2)
        )

        for (var j = 0; j < i; j++) {
          var abstand = this.checkDistance(
            this.particles[j],
            new Particle(newX, newY)
          )
          if (abstand < this.size) next = false
        }
      } while (!next)
      this.particles.push(new Particle(newX, newY))
    }
  }

  this.populateRect = function (startX, startY, width, height) {
    this.particles = new Array()
    var partCount = 0
    for (var line = 0; line < height - this.size; line += this.size + 1) {
      for (var row = 0; row < width - this.size; row += this.size + 1) {
        this.particles.push(new Particle(startX + row, startY + line))
        partCount++
        //alert(this.particles[i].x);
      }
    }
    this.numParticles = partCount
  }

  this.populateText = function (
    pText,
    pTextSize,
    textX,
    textY,
    colorScheme,
    resizeOff
  ) {
    this.particles = new Array()
    //this.text = 'A'
    this.text = pText
    this.initText = pText
    this.textSize = pTextSize
    var canvasBuffer = document.createElement('canvas')
    canvasBuffer.width = this.fieldWidth
    canvasBuffer.height = this.fieldHeight
    var buffer = canvasBuffer.getContext('2d')
    buffer.fillStyle = 'rgb(0,0,0)'
    console.log(this.fieldWidth)
    buffer.fillRect(0, 0, this.fieldWidth, this.fieldHeight)

    if (!colorScheme) colorScheme = 'bright'

    buffer.font = this.textSize + 'px Verdana'
    buffer.fillStyle = 'rgb(255,255,255)'
    buffer.textAlign = 'left'
    buffer.textBaseline = 'top'
    var textWidth = buffer.measureText(this.text).width

    if (!resizeOff) {
      if (textWidth > this.fieldWidth) {
        this.textSize = Math.round(
          this.textSize * ((this.fieldWidth - 20) / textWidth)
        )
        buffer.font = this.textSize + 'px Verdana'
        textWidth = buffer.measureText(this.text).width
      }
    }
    buffer.fillText(this.text, 0, 0)
    this.pTextWidth = textWidth

    var bufferTextData = buffer.getImageData(
      0,
      0,
      this.fieldWidth,
      this.textSize * 1.5
    ).data

    var line = -1
    var row = 0
    var particleCount = 0
    var skipRows = this.size * 3
    var skipLines = this.size
    var particleInLine = false
    if (!textX) var xOffset = Math.round(this.fieldWidth / 2 - textWidth / 2)
    else var xOffset = textX
    if (!textY)
      var yOffset = Math.round(this.fieldHeight / 2 - this.textSize / 2)
    else var yOffset = textY
    for (var i = 0; i < bufferTextData.length; i++) {
      row = (i + 1) % (this.fieldWidth * 4)
      if (row == 0) line++

      if (
        (i + 1) % 4 != 0 &&
        Math.floor(row % ((this.size + 1) * 4)) == 1 &&
        line % (this.size + 1) == 1
      ) {
        if (bufferTextData[i] != 0) {
          this.particles.push(
            new Particle(Math.floor(row / 4) + xOffset, line + yOffset)
          )
          if (colorScheme == 'dark')
            this.particles[particleCount].setColorMode('dark')

          skipRows = 0
          particleInLine = true
          particleCount++
        }
      }
    }
    this.numParticles = particleCount
  }

  this.checkIntegrity = function (deleteNotVisible, deleteNaN) {
    try {
      var del = false
      for (var i = 0; i < this.particles.length; i++) {
        del = false
        if (deleteNotVisible) {
          /*for (var j = i+1; j < this.particles.length; j++)
				{

					if (this.checkDistance(this.particles[i], this.particles[j]< this.size))
					{
						this.particles.splice(i, 1);
						del = true;
					}
				}*/
          if (
            this.particles[i].x < 0 ||
            this.particles[i].x > this.fieldWidth ||
            this.particles[i].y < 0 ||
            this.particles[i].y > this.fieldHeight
          )
            this.particles.splice(i, 1)
        }
        if (deleteNaN && !del) {
          if (
            isNaN(this.particles[i].x) ||
            isNaN(this.particles[i].y) ||
            isNaN(this.particles[i].moveX) ||
            isNaN(this.particles[i].moveY)
          ) {
            this.particles.splice(i, 1)
            //alert("del");
          }
        }
      }
    } catch (e) {
      alert(e)
    }
  }

  this.push = function (mouseX, mouseY, rad) {
    for (var i = 0; i < this.particles.length; i++) {
      var dx = this.particles[i].x - mouseX
      var dy = this.particles[i].y - mouseY
      var r = Math.sqrt(dx * dx + dy * dy)
      var cosPhi = dx / r
      var sinPhi = dy / r
      //alert(Math.asin(sinPhi)*180/Math.PI+" "+Math.acos(cosPhi)*180/Math.PI);
      //alert(r);
      if (r < rad) {
        this.particles[i].moveX = cosPhi
        this.particles[i].moveY = sinPhi
        this.particles[i].moveDistance += rad - r
      }
    }
  }

  this.setGlow = function (posX, posY, rad) {
    for (var i = 0; i < this.particles.length; i++) {
      var dx = this.particles[i].x - posX
      var dy = this.particles[i].y - posY
      var r = Math.sqrt(dx * dx + dy * dy)
      //alert(r);
      if (r < rad) {
        this.particles[i].glow += 1 - r / rad
        if (this.particles[i].glow > 1) this.particles[i].glow = 1
      }
    }
  }

  this.collide = function (particle1, particle2, abstand) {
    var x1 = particle1.x
    var y1 = particle1.y
    var x2 = particle2.x
    var y2 = particle2.y

    // ABSTANDSVEKTOR 1
    var xa1 = (x2 - x1) / abstand
    var ya1 = (y2 - y1) / abstand

    // ABSTANDSVEKTOR 2
    var xa2 = (x1 - x2) / abstand
    var ya2 = (y1 - y2) / abstand

    var xb2 = particle2.moveX
    var yb2 = particle2.moveY

    //BEWEGUNGSVEKTOR B1
    var xb1 = particle1.moveX
    var yb1 = particle1.moveY

    var skalar1 = xa1 * xb1 + ya1 * yb1 //   ENTSORICHT cos(alpha) alpha

    var deltaX = skalar1 * xa1
    var deltaY = skalar1 * ya1
    if (isNaN(deltaX) || isNaN(deltaY) || isNaN(skalar1))
      alert('NaN delta  ' + skalar1 + ' ' + deltaX + ' ' + deltaY + ' ')

    var finalX = xb1 - deltaX
    var finalY = yb1 - deltaY

    var finalR = Math.sqrt(finalX * finalX + finalY * finalY)
    if (finalR == 0) finalR = 1
    //alert(finalR+" -- "+this.particles[i].moveX+" : "+finalX+" & "+this.particles[i].moveY+" : "+finalX);

    //if(particle1.moveDistance > particle2.moveDistance)
    var newMoveDistance = particle1.moveDistance * 0.8
    //else
    //var newMoveDistance = particle2.moveDistance*0.8;

    particle1.moveX = finalX / finalR
    particle1.moveY = finalY / finalR
    particle1.moveDistance = newMoveDistance

    finalX = xb2 + deltaX
    finalY = yb2 + deltaY

    var finalR = Math.sqrt(finalX * finalX + finalY * finalY)
    if (finalR == 0) finalR = 1
    particle2.moveX = finalX / finalR
    particle2.moveY = finalY / finalR
    particle2.moveDistance = newMoveDistance
  }
  this.quadrants = new Array()
  this.quadrantSize = this.size * 3

  this.updateQuadrants = function () {
    try {
      var qI = 0
      var qJ = 0
      for (var i = 0; i < this.fieldWidth / this.quadrantSize; i++) {
        this.quadrants[i] = new Array()
        for (var j = 0; j < this.fieldHeight / this.quadrantSize; j++)
          this.quadrants[i][j] = new Array()
      }

      for (i = 0; i < this.particles.length; i++) {
        var qI = Math.floor(this.particles[i].x / this.quadrantSize)
        var qJ = Math.floor(this.particles[i].y / this.quadrantSize)

        if (
          qI >= 0 &&
          qI < this.quadrants.length &&
          qJ >= 0 &&
          qJ < this.quadrants[0].length
        )
          this.quadrants[qI][qJ].push(i)
      }
    } catch (e) {
      alert(e)
    }
  }

  this.update = function (modifier) {
    this.checkIntegrity(false, true)
    if (this.collision) this.updateQuadrants()

    for (var i = 0; i < this.particles.length; i++) {
      //fuckNaN(this.particles[i], 'x');

      if (this.particles[i].moveDistance < 0.5) {
        this.particles[i].moveDistance = 0
        this.particles[i].moveX = 0
        this.particles[i].moveY = 0
      }
      if (this.pathOn) this.particles[i].updatePath(modifier)
      if (this.particles[i].glow > 0) this.particles[i].glow -= modifier * 1.5

      var mX =
        this.particles[i].moveX * this.particles[i].moveDistance * modifier * 5
      var mY =
        this.particles[i].moveY * this.particles[i].moveDistance * modifier * 5
      var collided = false

      if (this.collision && this.particles[i].moveDistance > 0) {
        var qI = Math.floor(this.particles[i].x / this.quadrantSize)
        var qJ = Math.floor(this.particles[i].y / this.quadrantSize)

        //alert(qI+" "+qJ);
        var collArray = new Array()

        if (qI >= 0 && qJ >= 0) {
          collArray = this.quadrants[qI][qJ]
          if (qI > 0) collArray = collArray.concat(this.quadrants[qI - 1][qJ])
          if (qI < this.quadrants.length - 1)
            collArray = collArray.concat(this.quadrants[qI + 1][qJ])
          if (qJ > 0) collArray = collArray.concat(this.quadrants[qI][qJ - 1])
          if (qJ < this.quadrants[0].length - 1)
            collArray = collArray.concat(this.quadrants[qI][qJ + 1])
          if (qI > 0 && qJ > 0)
            collArray = collArray.concat(this.quadrants[qI - 1][qJ - 1])
          if (qI > 0 && qJ < this.quadrants[0].length - 1)
            collArray = collArray.concat(this.quadrants[qI - 1][qJ + 1])
          if (qI < this.quadrants.length - 1 && qJ > 0)
            collArray = collArray.concat(this.quadrants[qI + 1][qJ - 1])
          if (
            qI < this.quadrants.length - 1 &&
            qJ < this.quadrants[0].length - 1
          )
            collArray = collArray.concat(this.quadrants[qI + 1][qJ + 1])

          for (var j = 0; j < collArray.length; j++) {
            if (collArray[j] != i) {
              //var abstand = this.checkDistance(this.particles[i], this.particles[j]);
              var dis = this.checkDistance(
                new Particle(
                  this.particles[i].x + mX,
                  this.particles[i].y + mY
                ),
                this.particles[collArray[j]]
              )
              if (dis < this.size + 1) {
                this.collide(
                  this.particles[i],
                  this.particles[collArray[j]],
                  this.size
                )
                collided = true
              }
            }
          }
        }
      }

      if (this.vX != 0) {
        this.particles[i].x += modifier * this.vX
      }
      if (this.vY != 0) {
        this.particles[i].y += modifier * this.vY
      }

      if (this.particles[i].moveDistance > 0 && !collided) {
        this.particles[i].x +=
          this.particles[i].moveX *
          this.particles[i].moveDistance *
          modifier *
          5
        if (
          this.particles[i].x < this.size / 2 ||
          this.particles[i].x > this.fieldWidth - this.size / 2
        ) {
          if (this.particles[i].x < this.size / 2)
            this.particles[i].x = this.size / 2
          else this.particles[i].x = this.fieldWidth - this.size / 2
          this.particles[i].moveX = -this.particles[i].moveX
        }
        this.particles[i].y += mY
        if (
          this.particles[i].y < this.size / 2 ||
          this.particles[i].y > this.fieldHeight - this.size / 2
        ) {
          if (this.particles[i].y < this.size / 2)
            this.particles[i].y = this.size / 2
          else this.particles[i].y = this.fieldHeight - this.size / 2
          this.particles[i].moveY = -this.particles[i].moveY
        }
        this.particles[i].moveDistance -=
          this.particles[i].moveDistance * modifier
      }
      //if(isNaN(this.particles[i].x)) alert('end of update '+this.particles[i].x);
    }
  }

  this.draw = function (cvx) {
    /*for (var p = 0; p<this.quadrants.length; p++)
		{
			cvx.fillRect(p*this.size*5,0, 1, this.fieldHeight);
			//cvx.fillRect(20,20,80,40);
		
		}
		for (var q = 0; q<this.quadrants[0].length; q++)
		{
			//alert (q);			
			cvx.fillRect(0, q*this.size*5, this.fieldWidth,1);
		}*/

    for (i = 0; i < this.particles.length; i++) {
      if (this.particles[i].x < this.fieldWidth && this.particles[i].x > 0) {
        if (this.particles[i].path.length > 0) {
          if (
            Math.round(this.particles[i].x) !=
              Math.round(this.particles[i].path[0].x) ||
            Math.round(this.particles[i].y) !=
              Math.round(this.particles[i].path[0].y)
          ) {
            cvx.strokeStyle = 'rgba(' + this.particles[i].rgbString + ',0.2)'
            cvx.beginPath()
            cvx.lineWidth = 1
            cvx.moveTo(
              this.particles[i].path[0].x,
              this.particles[i].path[0].y + this.size / 2
            )
            cvx.lineTo(this.particles[i].x, this.particles[i].y)
            cvx.stroke()
            cvx.closePath()
          }
        }
        cvx.fillStyle =
          'rgba(' + this.particles[i].rgbString + ',' + this.alpha + ')'
        cvx.beginPath()
        cvx.arc(
          this.particles[i].x,
          this.particles[i].y,
          this.size / 2,
          0,
          Math.PI * 2,
          true
        )

        cvx.closePath()
        cvx.fill()
      }
    }
  }
}
