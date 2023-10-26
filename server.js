import express from 'express'
import cors from 'cors'
import fs from 'fs'
import { JSDOM } from 'jsdom'

const app = express()
const PORT = process.env.port || 8000
const baseURL = "https://www.dustloop.com"

app.set('view engine', 'ejs')

app.use(cors())
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.get('/', async function(req,res) {
    const data = await parseIndex()
    console.log('get / ')
    console.log(data[0])
    res.render('index.ejs', {names: data[0], links: data[1], imgs: data[2]})
})

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`)
})

async function parseIndex() {
    let html = await fetch(baseURL)
    let data = await html.text()

    const { document } = new JSDOM(data).window

    const container = document.querySelector('.logo-nav-menu')

    const links = Array.from(container.querySelectorAll('.home-link__button')).map(link => baseURL + link.querySelector('a').href)

    const names = links.map(link => {
        link = link.split('/')
        return link[link.length -1]
    })

    const imgs = Array.from(container.querySelectorAll('.home-link__button')).map(link => baseURL + link.querySelector('img').src)

    return [names, links, imgs]
}

app.get('/game/:game', async function(req, res) {
    const data = await parseGame(req.params.game)
    console.log(`get ${req.params.game}`)
    console.log(data)
    if (data === 'error') res.redirect('/error')
    
    res.render('game.ejs', {characters: data, game: req.params.game})
})

async function parseGame(game){
    const url = baseURL + '/w/' + game

    let html = await fetch(url)
    let data = await html.text()

    const { document } = new JSDOM(data).window

    let container = document.querySelector('#home-nav')
    let selector = '.home-card__foreground'

    if (game === 'Guilty_Gear_-Strive-' || game === 'Persona_4:_Arena_Ultimax_Remaster'){
        container = document.querySelector('.home-card')
        selector = 'a'
    }

    if (game === 'BlazBlue:_Cross_Tag_Battle') {
        container = document.querySelector('.add-hover-effect')
        selector = 'a'
    }
    
    if (game === 'BlazBlue:_Central_Fiction' || game === 'Guilty_Gear_XX_Accent_Core_Plus_R') {
        return Array.from(document.querySelectorAll('area')).map(character => {
            character = character.href.split('/')
            return character[character.length-1]
        }).sort()
    }

    if (container == null) {
        return 'error'
    } else {
        let characters = Array.from(container.querySelectorAll(selector)).map(character =>{
            if (selector === 'a') {
                character = character.href.split('/')
                return character[character.length-1]
            }
            return character.innerHTML.split(' ').join('_')
        })
        return characters.sort()
    }
}

app.get('/error', (req, res) => {
    res.send('There was an error processing your request - if you selected P4AU, that game is not currently working on this page.')
})

app.get('/matchup/:game/:p1/:p2', async function(req, res) {
    const data = await parseMatchup(req.params.game, req.params.p1, req.params.p2)
    console.log(`get ${req.params.game} : ${req.params.p1} vs ${req.params.p2}`)
    console.log(data)
    if (data === 'error') res.redirect('/error')
    const characters = await parseGame(req.params.game) 
    res.render('matchup.ejs', {game: req.params.game, characters: characters,  p1name: req.params.p1, p1: data[req.params.p1], p2name: req.params.p2, p2: data[req.params.p2]})
})

async function parseMatchup(game, p1, p2) {
    const matchup = { game: game }

    matchup[p1] = await parseCharacter(game, p1)

    if (p1 !== p2) {
        matchup[p2] = await parseCharacter(game, p2)
    }

    return matchup
}

async function parseCharacter(game, character) {
    const res = {}

    if (game === "DNF_Duel") {
        game = "DNFD"
    }

    if (game === "Guilty_Gear_-Strive-") {
        game = "GGST"
    }

    if (game === "Granblue_Fantasy:_Versus") {
        game = "GBVS"
    }

    if (game === "Dragon_Ball_FighterZ") {
        game = "DBFZ"
    }

    if (game === "BlazBlue:_Cross_Tag_Battle") {
        game = "BBTag"
    }

    if (game === "Guilty_Gear_Xrd_REV_2") {
        game = "GGXRD-R2"
    }

    if (game === "BlazBlue:_Central_Fiction") {
        game = "BBCF"
    }

    if (game === "Persona_4:_Arena_Ultimax_Remaster") {
        game = "P4U2R"
    }

    if (game === "Guilty_Gear_XX_Accent_Core_Plus_R") {
        game = "GGACR"
    }

    if (game === "Hokuto_no_Ken") {
        game = "HNK"
    }

    if (game === "Guilty_Gear:_The_Missing_Link") {
        game = "GGML"
    }
    
    const url = baseURL + '/w/' + game + '/' + character + '/Frame_Data'

    let html = await fetch(url)
    let data = await html.text()

    const { document } = new JSDOM(data).window

    // There will be multiple containers -> loop through '#section-collapsable-1' until 'section-collapsible-X' is undefined?

    let i = 0
    let container = document.querySelector(`#section-collapsible-${i}`)
    while (container) {
        const tables = container.querySelectorAll('table')

        if (tables == null) {
            i++
            container = document.querySelector(`#section-collapsible-${i}`)
            continue
        }
        
        tables.forEach(table => {
            const headings = table.querySelectorAll('thead th')
            let j = 0
            let inputColumn = null
            let nameColumn = null
            let onBlockColumn = null
            let startupColumn = null
            
            headings.forEach(e => {
                if (e.innerHTML === 'Input' || e.innerHTML === 'input') {
                    inputColumn = j
                }
                if (e.innerHTML === 'Name' || e.innerHTML === 'name') {
                    nameColumn = j
                }
                if (e.innerHTML === 'On-Block' || e.innerHTML === 'onBlock') {
                    onBlockColumn = j
                }
                if (e.innerHTML === 'Startup' || e.innerHTML === 'startup') {
                    startupColumn = j
                }

                j++
            })

            if (startupColumn != null && onBlockColumn != null) {
                const rows = table.querySelectorAll('tbody tr')
                //rows.forEach(row => console.log(row.innerHTML))

                for (let k = 0; k < rows.length; k++) {
                    const columns = rows[k].querySelectorAll('td')
                    let input = ''
                    let name = ''
                    let onBlock = null
                    let startup = null

                    for (let l = 0; l < columns.length; l++) {
                        if (l === inputColumn) {
                            input = columns[l].innerHTML
                        }

                        if (l === nameColumn) {
                            name = columns[l].innerHTML
                        }

                        if (l === onBlockColumn) {
                            onBlock = parseInt(columns[l].innerHTML)
                        }

                        if (l === startupColumn) {
                            startup = parseInt(columns[l].innerHTML)
                        }
                    }
                    if ((input || name) && (startup != null && onBlock != null)) {
                        if (!Number.isNaN(startup) || !Number.isNaN(onBlock)) {
                            res[name || input] = {}
                        }
                        if (!Number.isNaN(startup)) {
                            res[name || input].startup = startup
                        }
                        if (!Number.isNaN(onBlock)) {
                            res[name || input].onBlock = onBlock
                        }
                    }
                }
            }
        })

        i++
        container = document.querySelector(`#section-collapsible-${i}`)
    }

    // If section has onBlock column, then select for these:
    // should just be the first img?
    let imageSelector = ''
    // If name column doesn't exist then find the input column
    let nameSelector = ''
    // These might be different depending on the game so check for 
    // Add a flag to check if startup or on block is needed?
    let startupSelector = ''
    let onBlockSelector = ''
    
    return res
}
