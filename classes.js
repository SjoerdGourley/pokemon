class Boundary{
    static width = 48
    static height = 48
    constructor({position}){
        this.position = position
        this.width = 48
        this.height= 48
    }

    draw(){
        c.fillStyle = 'rgba(255,0,0,0)'
        c.fillRect(this.position.x, this.position.y, this.width, this.height)
    }
}

class Sprite{
    constructor({position, image, frames={max:1,hold:10}, sprites,animate=false,rotation=0}){
        this.position = position
        this.image = new Image()
        this.frames = {...frames, val:0,elapsed:0}
        this.image.onload = () => {
            this.width = this.image.width/this.frames.max
            this.height = this.image.height
        }
        this.image.src = image.src
        this.animate = animate
        this.sprites = sprites
        this.opacity = 1
        this.rotation = rotation
    }

    draw(){
        c.save()
        c.translate(
            this.position.x+this.width/2,
            this.position.y+this.height/2)
        c.rotate(this.rotation)

        c.translate(
            -this.position.x-this.width/2,
            -this.position.y-this.height/2)
        c.globalAlpha = this.opacity
        c.drawImage(
            this.image,
            this.frames.val*this.width,
            0,
            this.image.width/this.frames.max,
            this.image.height,
            this.position.x,
            this.position.y,
            this.image.width/this.frames.max,
            this.image.height
        )
        c.restore()
        if(!this.animate) return
        if(this.frames.max>1) this.frames.elapsed++
        if(this.frames.elapsed%this.frames.hold===0){
            if(this.frames.val<this.frames.max-1) this.frames.val++
            else this.frames.val = 0
        }
    }
}

class Monster extends Sprite{
    constructor({isEnemy=false,name,attacks,position, image, frames={max:1,hold:10}, sprites,animate=false,rotation=0}){
        super({
            position, image, frames, sprites,animate,rotation
        })
        this.isEnemy = isEnemy
        this.health  = 100
        this.name = name
        this.attacks= attacks
    }
    attack({attack,recipient, renderedSprites}){
        const dialogueElem = document.querySelector('[data-dialogue]')
        dialogueElem.style.display = 'block'
        dialogueElem.innerHTML = `${this.name} used ${attack.name}`
        recipient.health -= attack.damage
        let movementDistance = 20
        let healthBar = '[data-enemyhealth]'
        let rotation = 1
        if(this.isEnemy) {
            rotation = -2
            movementDistance = -20 
            healthBar='[data-attackerhealth]'
        }
        switch(attack.name){
            case 'Fireball':
                audio.initFireball.play()
                const fireballImage = new Image()
                fireballImage.src = './img/fireball.png'
                const fireball = new Sprite({
                    position:{
                        x:this.position.x,
                        y:this.position.y
                    },
                    image:fireballImage,
                    frames:{
                        max:4,
                        hold:10
                    },
                    animate:true,
                    rotation
                })
                renderedSprites.splice(1,0,fireball)

                gsap.to(fireball.position,{
                    x:recipient.position.x,
                    y:recipient.position.y,
                    onComplete:()=>{
                        audio.fireballHit.play()
                        gsap.to(healthBar,{
                            width:recipient.health+'%'
                        })
                        gsap.to(recipient.position,{
                            x:recipient.position.x+10,
                            yoyo:true,
                            repeat:5,
                            duration:.08,
                            onComplete(){
                                gsap.to(recipient.position,{
                                    x:recipient.position.x
                                })
                            }
                        })
                        gsap.to(recipient,{
                            opacity:0,
                            repeat:5,
                            yoyo:true,
                            duration:.08
                        })
                        renderedSprites.splice(1,1)
                    }
                })
            break
            case 'Tackle':
                const tl = gsap.timeline()
                tl.to(this.position, {
                    x:this.position.x-movementDistance
                }).to(this.position,{
                    x:this.position.x+(movementDistance*2),
                    duration:.1,
                    onComplete:()=>{
                        //Enemy gets hit here.
                        audio.tackleHit.play()
                        gsap.to(healthBar,{
                            width:recipient.health+'%'
                        })
                        gsap.to(recipient.position,{
                            x:recipient.position.x+10,
                            yoyo:true,
                            repeat:5,
                            duration:.08,
                            onComplete(){
                                gsap.to(recipient.position,{
                                    x:recipient.position.x
                                })
                            }
                        })
                        gsap.to(recipient,{
                            opacity:0,
                            repeat:5,
                            yoyo:true,
                            duration:.08
                        })
                    }
                }).to(this.position,{
                    x:this.position.x
                })
            break
        }
    }
    faint(){
        const dialogueElem = document.querySelector('[data-dialogue]')
        dialogueElem.innerHTML = `${this.name} fainted!`
        gsap.to(this.position,{
            y:this.position.y +20,
        })
        gsap.to(this,{
            opacity:0
        })
        audio.battle.stop()
        audio.victory.play()
    }
}