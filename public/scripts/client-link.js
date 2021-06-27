let linkData = {}


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
                        console.log('client side link clicked')
                        const parser = new DOMParser()
                        const linkHTML = parser.parseFromString(linkData[link.getAttribute('href')], 'text/html')
                        // console.log(linkHTML.head)
                        // console.log(linkHTML.body.style.fontFamily)
                        document.head.innerHTML = linkHTML.head.innerHTML
                        // document.body.innerHTML = linkHTML.body.innerHTML
                        document.getElementById('app').innerHTML = linkHTML.getElementById('app').innerHTML
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