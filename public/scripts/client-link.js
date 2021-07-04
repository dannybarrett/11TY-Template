let linkData = {}

window.onpopstate = () => {
    fetch(window.location.pathname)
        .then(response => { return response.text() })
        .then(data => {
            const parser = new DOMParser()
            const historyHTML = parser.parseFromString(data, 'text/html')
            document.head.innerHTML = historyHTML.head.innerHTML
            document.body.innerHTML = historyHTML.body.innerHTML
        })
        .catch(error => console.log(error))
}


function analyzeLinks() {
    linkData = {}
    const links = document.querySelectorAll('a')

    links.forEach(link => {
        if (link.hasAttribute('client')) {
            const filePath = link.getAttribute('href') === '/' ? '/index.html' : link.getAttribute('href') + '/index.html'
    
            
            fetch(filePath)
                .then(response => {
                    return response.text()
                })
                .then(data => {
                    addToLinkData(link.getAttribute('href'), data)
                    // console.log(data)
                })
                .then(() => {
                    link.addEventListener('click', event => {
                        event.preventDefault()
                        const parser = new DOMParser()
                        const linkHTML = parser.parseFromString(linkData[link.getAttribute('href')], 'text/html')
                        document.head.innerHTML = linkHTML.head.innerHTML
                        // const documentApp = document.querySelector('section')

                        // console.log(documentApp)
                        document.body.querySelector('.app').outerHTML = linkHTML.body.querySelector('.app').outerHTML
                        const newHREF = window.location.origin + link.getAttribute('href')
                        if (link.getAttribute('href') === '/') {
                            window.history.pushState({}, '/', window.location.origin)
                        } else {
                            window.history.pushState({}, link.getAttribute('href').substring(1), newHREF)
                        }

                        analyzeLinks()
                        return
                    })
                })
                .catch(error => {
                    console.log('error: ' + error)
                })


        }
    })
}

function addToLinkData(href, data) {
    linkData[href] = data
}

analyzeLinks()