//CREATE BATTLEGROUND BACKGROUND AND POKEMON SPRITES
const battleBackgroundImage = new Image()
battleBackgroundImage.src = './img/battleBackground.png'
const battleBackground = new Sprite({
    position:{
        x: 0,
        y:0
    },
    image:battleBackgroundImage
})

//BATTLEGROUND ANIMATION AND FRAME HANDLING
let draggle = new Monster(mobs.Draggle)
let emby = new Monster(mobs.Emby)
let renderedSprites = [draggle, emby]
let battleAnimationId
let queue

function initBattle(){
    document.querySelector('[data-userinterface]').style.display = 'block' 
    document.querySelector('[data-dialogue]').style.display = 'none'
    document.querySelector('[data-enemyhealth]').style.width = '100%'
    document.querySelector('[data-attackerhealth]').style.width = '100%'
    document.querySelector('[data-attacksbox]').replaceChildren()
    draggle = new Monster(mobs.Draggle)
    emby = new Monster(mobs.Emby)
    renderedSprites = [draggle, emby]
    queue = []

    emby.attacks.forEach((attack) => {
        const attacksbox = document.querySelector('[data-attacksbox]')
        const button = document.createElement('button')
        button.innerHTML = attack.name
        attacksbox.append(button)
    })

    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', (e) => {
            let attack = attacks[e.currentTarget.innerHTML]
            emby.attack({
                attack:attack,
                recipient:draggle,
                renderedSprites
            })
            if(draggle.health <= 0){
                queue.push(()=> {
                    draggle.faint()
                })   
                mobFaint()   
            }
            const randomAttack = draggle.attacks[Math.floor(Math.random() * draggle.attacks.length)]
    
            queue.push(()=> {
                draggle.attack({
                    attack:randomAttack,
                    recipient:emby,
                    renderedSprites
                })
                if(emby.health <= 0){
                    queue.push(()=> {
                        emby.faint()
                    })
                    mobFaint()  
                }
            })   
        })
        button.addEventListener('mouseenter', (e) => {
            const typeElem = document.querySelector('[data-attacktype]')
            let attack = attacks[e.currentTarget.innerHTML]
            typeElem.innerHTML = `<h1>${attack.type}</h1>`
            typeElem.style.color = attack.color
        })
        button.addEventListener('mouseleave', (e) => {
            const typeElem = document.querySelector('[data-attacktype]')
            typeElem.innerHTML = '<h1>Attack Type</h1>'
            typeElem.style.color = 'black'
        })
    })
}
function mobFaint(){
    queue.push(()=> {
        gsap.to('[data-overlapping]',{
            opacity:1,
            onComplete:()=>{
                cancelAnimationFrame(battleAnimationId)
                animate()
                document.querySelector('[data-userinterface]').style.display = 'none'
                gsap.to('[data-overlapping]',{
                    opacity:0
                })
            }
        })
    })
    battle.initiated=false
    audio.forEach((aud) =>{
        audio.aud.stop()
    })

    audio.Map.play()
}

function animateBattle(){
    battleAnimationId = requestAnimationFrame(animateBattle)
    battleBackground.draw()

    renderedSprites.forEach((sprite) => {
        sprite.draw()
    })
    document.querySelector('[data-userinterface]').style.display = 'block'
}
animate()
// initBattle()
// animateBattle()

document.querySelector('[data-dialogue]').addEventListener('click', (e) => {
    if(queue.length>0){
        queue[0]()
        queue.shift()
    }else e.currentTarget.style.display = 'none'
})  