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

let index = await parseIndex()
const ignore = new Set(['Granblue_Fantasy_Versus:_Rising','BlazBlue:_Cross_Tag_Battle', 'Guilty_Gear:_The_Missing_Link','Guilty_Gear_XX_Accent_Core_Plus_R',  'Battle_Fantasia','Sailor_Moon_S','Persona_4:_Arena_Ultimax_Remaster','BlazBlue:_Central_Fiction','Hokuto_no_Ken'])

for (let i = 0; i < index[0].length; i++) {
    if (ignore.has(index[0][i])){
        index[0].splice(i, 1)
        index[1].splice(i, 1)
        index[2].splice(i, 1)
        i--
    }
}

console.log(index)

app.get('/', async function(req,res) {
    console.log('get / ')
    console.log(index[0])
    res.render('index.ejs', {names: index[0], links: index[1], imgs: index[2]})
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
            if (character[character.length-1] === 'Susano%27o') {
                return "Susano'o"
            }
            return character[character.length-1]
        }).sort()
    }

    if (container == null) {
        return 'error'
    } else {
        let characters = Array.from(container.querySelectorAll(selector)).map(character =>{
            if (selector === 'a') {
                character = character.href.split('/')
                if (character[character.length-1] === 'Susano%27o') {
                    return "Susano'o"
                }
                return character[character.length-1]
            }
            return character.textContent.split(' ').join('_')
        })
        return characters.sort()
    }
}

app.get('/error', (req, res) => {
    res.send('There was an error processing your request - if you selected DBFZ, that game is not currently working on this page.')
})

app.get('/matchup/:game/:p1/:p2', async function(req, res) {
    const data = await parseMatchup(req.params.game, req.params.p1, req.params.p2)
    //console.log(`get ${req.params.game} : ${req.params.p1} vs ${req.params.p2}`)
    //console.log(data)
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

    if (game === "Granblue_Fantasy_Versus:_Rising") {
        game = "GBVSR"
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
    
    if (game === "Sailor_Moon_S") {
        game = "SMS"
    }

    if (game === "Battle_Fantasia") {
        game = "BatFan"
    }

    if (game === "Sengoku_Basara_X") {
        game = "SBX"
    }
    
    const url = baseURL + '/w/' + game + '/' + character
    console.log(url)
    let html = await fetch(url)
    let data = await html.text()

    const { document } = new JSDOM(data).window

    const skips = new Set([ 'Normal Moves', 'Special Moves', 'Air Throw', 'Unique Mechanics', 'Universal Mechanics', 'Guard Cancel', 'Backwards Dodge', 'Dodge', 'Instant Kill', 'Overview', 'Colors', 'Navigation', 'Z Assists', 'Assist A', 'Assist B', 'Assist C', 'Super Moves', 'Gear Follow-ups', 'Overdrives', 'Dead Angle Attack', 'Taunt', 'Basara Attacks' ])
    const names = Array.from(document.querySelectorAll(".mw-headline")).map(n => n.textContent).filter(e => !skips.has(e))
    console.log(names)
    for (const name of names) {
        res[name] = {}
    }

    const keys = Object.keys(res)
    const moves = document.querySelectorAll(".attack-container")
    let i = 0
    for (const move of moves) {
        if (keys[i] == undefined) break

        const table = move.querySelector("table")
        if (table == undefined) {
            i++
            continue
        }
        console.log(keys[i])
        const img = move.querySelector('img')?.src || null

        if (table.innerHTML.includes("Version")) {
            delete res[keys[i]]
            const rows = Array.from(table.querySelectorAll('tr'))
            const headings = []
            rows[0].querySelectorAll('th').forEach(r => {
                if (r.textContent.trim() !== 'Version') {
                    if (r.children.length === 0) {
                        const text = r.textContent.trim()
                        if (text === 'On-Block') {
                            headings.push('onBlock')
                        } else {
                            headings.push(r.textContent.trim().toLowerCase())
                        }
                    } else {
                        const text = r.querySelector('.tooltip')
                        const tooltipText = r.querySelector('.tooltiptext')
                        if (text && tooltipText) {
                            text.removeChild(tooltipText)
                        }
                        const heading = r.textContent.trim()

                        if (heading === "Frame Adv" || heading === "On-Block") {
                            headings.push('onBlock')
                        } else {
                            headings.push(r.textContent.trim().toLowerCase())
                        }
                    }
                }
            })

            for (let j = 1; j < rows.length; j++) {
                let versionKey = `${keys[i]} (${rows[j].children[0].textContent.trim()})`
                if (keys[i] === rows[j].children[0].textContent.trim()) {
                    versionKey = rows[j].children[0].textContent.trim()
                }
                /*
                console.log(keys[i])
                if (keys[i][0].match(/\d/) && !keys[i][1].match(/\d/)) {
                    versionKey = rows[j].children[0].textContent.trim()
                } else if (keys[i] === rows[j].children[0].textContent.trim()) {
                    versionKey = rows[j].children[0].textContent.trim()
                } else {
                    versionKey = `${keys[i]} (${rows[j].children[0].textContent.trim()})`
                }
                */

                res[versionKey] = {}

                const columns = Array.from(rows[j].children).map(c => c.textContent.trim())

                // table is null here?? for chip/faust/zato ggst
                for (let k = 1; k < columns.length; k++) {
                    let text = columns[k]
                    if (text.match(/^[+-]*\d*[+]?\d*$/) && text !== '' && text !== '-') {
                        res[versionKey][headings[k - 1]] = parseInt(text)
                    } else {
                        if (text === '-') text = ''
                        // Edge case for P4U supers
                        if (text.includes('Flash')) {
                            text = text.split('+')
                            text = parseInt(text[0]) + parseInt(text.at(-1))
                        }
                        res[versionKey][headings[k - 1]] = text
                    }
                }
                const followCheck = rows[j].children[0].textContent.trim()
                console.log(followCheck)
                if (followCheck.match(/[A-Z]{2,}$/) || followCheck.includes('>') || followCheck.includes('~')) {
                    res[versionKey].followup = true
                }
                
                res[versionKey].img = baseURL + img
            }
        } else {
            const moveKeys = Array.from(table.querySelectorAll('th')).map(k => {
                if (k.children.length === 0) {
                    const text = k.textContent.trim()
                    if (text === "Frame Adv" || text === "On-Block") {
                        return 'onBlock'
                    }
                    return text.toLowerCase()
                } else {
                    const text = k.querySelector('.tooltip')
                    const tooltipText = k.querySelector('.tooltiptext')
                    if (text && tooltipText) {
                        text.removeChild(tooltipText)
                    }
                    
                    const key = k.textContent.trim()
                    if (key === "Frame Adv" || key === "On-Block") {
                        return 'onBlock'
                    } else {
                        return key.toLowerCase()
                    }
                }
            })
            const moveValues = Array.from(table.querySelectorAll('td')).map(v => {
                let text = v.textContent.trim()
                if (text.match(/^[+-]*\d*[+]?\d*$/) && text !== '' && text !== '-') {
                    return parseInt(text)
                } else {
                    if (text === '-') text = ''

                    // Edge case for P4U supers
                    if (text.includes('Flash')) {
                        text = text.split('+')
                        return parseInt(text[0]) + parseInt(text.at(-1))
                    }
                    return text
                }
            })
            
            for (let j = 0; j < moveKeys.length; j++) {
                res[keys[i]][moveKeys[j]] = moveValues[j]
            }

            if (keys[i] === '5AA (Frenzy)' || keys[i].match(/[A-Z]{2,}$/) || keys[i].includes('>') || keys[i].includes('~')) {
                res[keys[i]].followup = true
            }
            
            res[keys[i]].img = baseURL + img
        }

        i++
    }
    
    return res
    //console.log(res)

    /*
    const imgUrl = baseURL + '/w/' + game + '/' + character
    let imgHtml = await fetch(imgUrl)
    let imgData = await imgHtml.text()
    
    function parseImgs(data) {
        const { document } = new JSDOM(data).window
        const attacks =  document.querySelectorAll('.attack-gallery')
        const imgs = []
        attacks.forEach(a => imgs.push(a.querySelector('img')))
        return imgs
    }
    const imgs = parseImgs(imgData)
    imgs.forEach(i => console.log(i.src))

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
    console.log(res)
    return res
    */
}

app.get('/api', async function(req,res) {
    const data = await parseIndex()
    console.log('get /api ')
    console.log(data[0])
    res.render('api.ejs', {names: data[0], links: data[1], imgs: data[2]})
})

app.get('/api/games', async function(req,res) {
    const data = await parseIndex()
    console.log('api get games')
    console.log(data[0])
    res.send(data[0])
})


app.get('/api/:game', async function(req, res) {
    const data = await parseGame(req.params.game)
    console.log(`api get ${req.params.game}`)
    console.log(data)
    if (data === 'error') res.redirect('/error')
    
    res.send(data)
})

app.get('/api/:game/:character', async function(req, res) {
    const data = await parseCharacter(req.params.game, req.params.character)
    console.log(`api get ${req.params.game} ${req.params.character}`)
    console.log(data)
    if (data === 'error') res.redirect('/error')
    
    res.send(data)
})

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`)
})
