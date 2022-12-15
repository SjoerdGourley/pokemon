const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576

//SLICING THE COLLISIONS JSON TO TILES AND PUSH TO A MAP
const collisionsMap =[]
for(let i =0; i<collisions.length;i+=70){
    collisionsMap.push(collisions.slice(i,70+i))
}

//SLICING THE BATTLEZONES JSON TO TILES AND PUSH TO A MAP
const battleZonesMap =[]
for(let i =0; i<battlezonesData.length;i+=70){
    battleZonesMap.push(battlezonesData.slice(i,70+i))
}

const boundaries = []
const battlezones = []
const offset = {
    x: -735,
    y: -635
}
//GETTING ALL BATTLEZONES FROM MAP AND CREATE  BOUNDARIES
battleZonesMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if (symbol === 1025){
            battlezones.push(new Boundary({
                position:{
                x:j * Boundary.width+offset.x,
                y:i * Boundary.height+offset.y
            }}))
        }
    })
})   

//GETTING ALL COLLISIONS FROM MAP AND CREATE  BOUNDARIES
collisionsMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if (symbol === 1025){
            boundaries.push(new Boundary({
                position:{
                x:j * Boundary.width+offset.x,
                y:i * Boundary.height+offset.y
            }}))
        }
    })
})

//SET ALL DIFFERENT SPRITE PALLETS FOR PLAYER DIRECTIONS
const image = new Image()
image.src = './img/Pellet_Town_400.png'

const playerDownImage = new Image()
playerDownImage.src = './img/playerDown.png'

const playerUpImage = new Image()
playerUpImage.src = './img/playerUp.png'

const playerLeftImage = new Image()
playerLeftImage.src = './img/playerLeft.png'

const playerRightImage = new Image()
playerRightImage.src = './img/playerRight.png'

const foregroundImage = new Image()
foregroundImage.src = './img/foreground.png'

//CREATE PLAYER
const player = new Sprite({
    position:{
        x:canvas.width/2-192/4/2,
        y:canvas.height/2-68/2
    },
    image:playerDownImage,
    frames:{
        max:4,
        hold:10
    },
    sprites:{
        down:playerDownImage,
        up:playerUpImage,
        left:playerLeftImage,
        right:playerRightImage
    }
})

//CREATE BACKGROUND
const background = new Sprite({position:{
    x:offset.x,
    y:offset.y
    },
    image: image
})
//CREATE PARTS OF MAP WHERE YOU CAN WALK BEHIND
const foreground = new Sprite({position:{
    x:offset.x,
    y:offset.y
    },
    image:foregroundImage
})
//SAVE KEY PRESS STATE
const keys = {
    w:{
        pressed:false
    },
    a:{
        pressed:false
    },
    s:{
        pressed:false
    },
    d:{
        pressed:false
    }
}
//MAKE MAP MOVE WITH DIRECTION AND OBJECTS
const movables = [background, ...boundaries, foreground, ...battlezones]
function rectangularCollision({rectangle1, rectangle2}){
    return (
        rectangle1.position.x + rectangle1.width>=rectangle2.position.x &&
        rectangle1.position.x <=rectangle2.position.x+rectangle2.width &&
        rectangle1.position.y + rectangle1.height >=rectangle2.position.y &&
        rectangle1.position.y <=rectangle2.position.y+rectangle2.height
    )
}
const battle = {
    initiated:false
}
//ANIMATION FUNCTION HANDLING EVERY FRAME
function animate(){
    const animationId = requestAnimationFrame(animate)
    background.draw()
    boundaries.forEach(boundary => {
        boundary.draw()

    })
    battlezones.forEach(battlezone => {
        battlezone.draw()

    })
    player.draw()
    foreground.draw()
    //HANDLE KEY MOVEMENT
    player.animate = false
    let moving = true
    if (battle.initiated) return
    if(keys.w.pressed || keys.a.pressed || keys.s.pressed || keys.d.pressed){
        for (let i = 0;i<battlezones.length;i++){
            const battlezone = battlezones[i]
            const overlappingArea =     (Math.min(player.position.x + player.width, 
                                            battlezone.position.x + battlezone.width) - 

                                        Math.max(player.position.x, 
                                            battlezone.position.x)) *
                                        
                                        (Math.min(player.position.y + player.height,
                                            battlezone.position.y + battlezone.height) - 
                                        
                                        Math.max(player.position.y,
                                            battlezone.position.y))
            if  (rectangularCollision({
                rectangle1:player,
                rectangle2:battlezone
            }) &&
                overlappingArea > (player.width * player.height)/ 2
                && Math.random() < 0.01
            ){
                audio.Map.stop()
                audio.initBattle.play()
                audio.battle.play()

                cancelAnimationFrame(animationId)
                battle.initiated = true
                gsap.to('[data-overlapping]',{
                    opacity:1,
                    repeat:3,
                    yoyo:true,
                    duration:0.4,
                    onComplete(){
                        gsap.to('[data-overlapping]',{
                            opacity:1,
                            duration:0.4,
                            onComplete(){
                                initBattle()
                                animateBattle()
                                gsap.to('[data-overlapping]',{
                                opacity:0,
                                duration:0.4
                                })
                            }
                        })
                    }
                })

                break
            }
        }
    }

    if (keys.w.pressed && lastKey === 'w'){
        for (let i = 0;i<boundaries.length;i++){
            const boundary = boundaries[i]
            if  (rectangularCollision({
                rectangle1:player,
                rectangle2:{...boundary, position:{
                    x:boundary.position.x,
                    y:boundary.position.y +3
                }}
            })){
                console.log('collision')
                moving = false
                break
            }
        }
        movables.forEach(movable =>{
            if (moving){
                player.animate = true
                player.image = player.sprites.up
                movable.position.y += 3
            }
        })
    }else
    if (keys.a.pressed && lastKey === 'a'){
        for (let i = 0;i<boundaries.length;i++){
            const boundary = boundaries[i]
            if  (rectangularCollision({
                rectangle1:player,
                rectangle2:{...boundary, position:{
                    x:boundary.position.x + 3,
                    y:boundary.position.y
                }}
            })){
                console.log('collision')
                moving = false
                break
            }
        }
        movables.forEach(movable =>{
            if (moving){
                player.animate = true
                player.image = player.sprites.left
                movable.position.x += 3
            }
        })
    }else
    if (keys.s.pressed && lastKey === 's'){
        for (let i = 0;i<boundaries.length;i++){
            const boundary = boundaries[i]
            if  (rectangularCollision({
                rectangle1:player,
                rectangle2:{...boundary, position:{
                    x:boundary.position.x,
                    y:boundary.position.y - 3
                }}
            })){
                console.log('collision')
                moving = false
                break
            }
        }
        movables.forEach(movable =>{
            if (moving){
                player.animate = true
                player.image = player.sprites.down
                movable.position.y -= 3 
            }
        })
    }else
    if (keys.d.pressed && lastKey === 'd'){
        for (let i = 0;i<boundaries.length;i++){
            const boundary = boundaries[i]
            if  (rectangularCollision({
                rectangle1:player,
                rectangle2:{...boundary, position:{
                    x:boundary.position.x - 3,
                    y:boundary.position.y
                }}
            })){
                console.log('collision')
                moving = false
                break
            }
        }
        movables.forEach(movable =>{
            if (moving){
                player.animate = true
                player.image = player.sprites.right
                movable.position.x -= 3
            }
        })   
    }
}
// animate()

let lastKey = ''
addEventListener('keydown', ({key}) => {
    switch (key){
        case 'w':
            keys.w.pressed = true
            lastKey = 'w'
            break
        case 'a':
            keys.a.pressed = true
            lastKey = 'a'
            break
        case 's':
            keys.s.pressed = true
            lastKey = 's'
            break
        case 'd':
            keys.d.pressed = true
            lastKey = 'd'
            break
    }
})
addEventListener('keyup', ({key}) => {
    switch (key){
        case 'w':
            keys.w.pressed = false
            player.frames.val = 0
            break
        case 'a':
            keys.a.pressed = false
            player.frames.val = 0
            break
        case 's':
            keys.s.pressed = false
            player.frames.val = 0
            break
        case 'd':
            keys.d.pressed = false
            player.frames.val = 0
            break
    }
})
let clicked =false
addEventListener('click',()=>{
    if(clicked) return
    audio.Map.play()
    clicked = false
})