const jsdom = require('jsdom')
const { JSDOM } = jsdom
const sass = require('sass')
const fs = require('fse')
const FileAPI = require('file-api')
const FileAPIFile = FileAPI.File
const FileAPIReader = FileAPI.FileReader
const css = require('css')

module.exports = function(eleventyConfig) {
    eleventyConfig.addPassthroughCopy('public')

    eleventyConfig.addTransform('my-transform', content => {
        const document = new JSDOM(content).window.document
        const stylesheetLinks = document.head.getElementsByTagName('link')
        let rules = []

        for (let i = 0; i < stylesheetLinks.length; i++) {
            const href = stylesheetLinks.item(i).href
            const cssFromFile = css.parse(
                                    sass.renderSync({file: __dirname + href}).css.toString(),
                                    {})
                                    .stylesheet
            
            cssFromFile.rules.map(rule => {
                let declarations = []

                rule.declarations.map(declaration => {
                    if (declaration.type === 'declaration')
                        // declarations.push(declaration.property + ": " + declaration.value + ";")
                        declarations.push({
                            property: declaration.property,
                            value: declaration.value,
                        })
                })
                
                rules.push({
                    selectors: rule.selectors,
                    declarations: declarations,
                })
                // console.log(JSON.stringify(rules))
            })
        }

        function iterateThroughChildren(parent) {
            for (let i = 0; i < parent.children.length; i++) {
                const child = parent.children[i]

                rules.map(rule => {
                    rule.selectors.map(selector => {
                        // console.log(child.classList)
                        // for (let j = 0; j < child.classList.length; j++) {
                        //     // console.log(child.classList.item(j))
                        //     if (child.classList.contains(selector.toLowerCase().replace('.', ''))) {
                        //         console.log('We have a match: ' + selector)
                        //     }
                        // }
                        if (child.nodeName.toLowerCase() === selector.toLowerCase()) {
                            rule.declarations.map(declaration => {
                                child.style[declaration.property] = declaration.value
                                // console.log(declaration)
                            })
                        }
                        if (child.classList.contains(selector.toLowerCase().replace('.', ''))) {
                            console.log('We have a match: ' + selector)
                            rule.declarations.map(declaration => {
                                child.style[declaration.property] = declaration.value
                                // console.log(declaration)
                            })
                        }
                    })
                })

                if (child.children.length > 0) {
                    iterateThroughChildren(child)
                }
    
                // console.log(child.nodeName.toLowerCase())
            }
        }

        iterateThroughChildren(document.body)
        
        return document.head.innerHTML + document.body.innerHTML
    })

    return {
        dir: {
            input: 'src',
            output: 'dist',
        }
    }
}