import fs from 'fs'
import { JSDOM } from 'jsdom'

const baseURL = "https://www.dustloop.com"

async function parseIndex() {
    let html = await fetch(baseURL)
    let data = await html.text()

    const { document } = new JSDOM(data).window

    const container = document.querySelector('.logo-nav-menu')

    const links = Array.from(container.querySelectorAll('.home-link__button')).map(link => link.querySelector('a').href)

    const names = links.map(link => {
        link = link.split('/')
        return link[link.length -1].replaceAll('_', ' ')
    })

    const imgs = Array.from(container.querySelectorAll('.home-link__button')).map(link => link.querySelector('img').src)

    console.table(names)
    console.table(links)
    console.table(imgs)
}

parseIndex()
