const jsdom = require('jsdom')
const { JSDOM } = jsdom
const sass = require('sass')
const fs = require('fse')
const FileAPI = require('file-api')
const FileAPIFile = FileAPI.File
const FileAPIReader = FileAPI.FileReader
const css = require('css')
const pluginPWA = require('eleventy-plugin-pwa')
const htmlMinify = require('html-minifier').minify

module.exports = function(eleventyConfig) {
    eleventyConfig.addPassthroughCopy('public')
    eleventyConfig.addPassthroughCopy('src/manifest.json')
    // eleventyConfig.addPlugin(pluginPWA)

    eleventyConfig.addTransform('my-transform', content => {
        const document = new JSDOM(content).window.document
        const stylesheetLinks = document.head.getElementsByTagName('link')
        console.log(stylesheetLinks.length)
        let rules = []

        for (let i = 0; i < stylesheetLinks.length; i++) {
            console.log(stylesheetLinks.item(i)?.outerHTML)
            if (stylesheetLinks.item(i).getAttribute('rel') !== 'stylesheet') {
                continue
            }

            const href = stylesheetLinks.item(i).href
            const cssFromFile = css.parse(
                                    sass.renderSync({file: __dirname + href}).css.toString(),
                                    {})
                                    .stylesheet
            
            cssFromFile.rules.map(rule => {
                let declarations = []
                if (rule.declarations) {
                    
                    rule.declarations.map(declaration => {
        
                        if (declaration.type === 'declaration') {
                            
                            declarations.push({
                                property: declaration.property,
                                value: declaration.value,
                            })

                        }

                    })

                }
                
                
                rules.push({
                    selectors: rule.selectors,
                    declarations: declarations,
                })
            })
        }

        while (stylesheetLinks.length > 0) {
            stylesheetLinks.item(stylesheetLinks.length - 1).parentElement.removeChild(stylesheetLinks.item(stylesheetLinks.length - 1))
        }



        function iterateThroughChildren(parent) {
            for (let i = 0; i < parent.children.length; i++) {
                const child = parent.children[i]

                rules.map(rule => {
                    if (rule.selectors) {
                        rule.selectors.map(selector => {
                            if (child.nodeName.toLowerCase() === selector.toLowerCase()) {
                                rule.declarations.map(declaration => {
                                    child.style[declaration.property] = declaration.value
                                    // console.log(declaration)
                                })
                            }
                            if (child.classList.contains(selector.toLowerCase().replace('.', ''))) {
                                // console.log('We have a match: ' + selector)
                                rule.declarations.map(declaration => {
                                    child.style[declaration.property] = declaration.value
                                    // console.log(declaration)
                                })
                                if (selector.toLowerCase().replace('.', '') !== 'app')
                                    child.classList.remove(selector.toLowerCase().replace('.', ''))
                                
                                if (child.classList.length === 0)
                                    child.removeAttribute('class')
                            }
                        })
                    }
                })

                if (child.children.length > 0) {
                    iterateThroughChildren(child)
                }
            }
        }

        iterateThroughChildren(document)
        const minifiedHTML = htmlMinify('<!DOCTYPE html>\n<html lang="en">\n' + 
        document.head.outerHTML + '\n' + 
        document.body.outerHTML + '\n</html>',
        {
            collapseWhitespace: true,
            minifyCSS: true,
            minifyJS: true,
            removeComments: true,
        })
        
        return minifiedHTML
    })

    return {
        dir: {
            input: 'src',
            output: 'dist',
        }
    }
}