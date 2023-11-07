console.log('script running')

const p1 = document.querySelector('#p1')
const p2 = document.querySelector('#p2')

p1.addEventListener('change', updateLink)
p2.addEventListener('change', updateLink)

function updateLink() {
    const link = document.querySelector('#charSelect')
    const game = document.querySelector('header').id

    link.href = `/matchup/${game}/${p1.value}/${p2.value}`
}

updateLink()

const button = document.querySelector('#charSelect')

button.addEventListener('click', displayLoading)

function displayLoading() {
    const spinner = document.createElement('span')
    spinner.classList.add('loader')
    button.querySelector('button').appendChild(spinner)
}
