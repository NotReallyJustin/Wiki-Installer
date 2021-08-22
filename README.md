# Wiki-Installer
A node.js app that downloads all the evidence files disclosed on the debate wiki easily <br />
Version 2.0 because the last one was weird :sunglasses:

## Dependencies
Download these from npm before you run the app
* Express.js
* Download
* Node-html parser

## Instructions to Start
* Go to the root directory
* Install node dependencies
* `npm start` on node console
* Go to `https://127.0.0.1:8081/` and take it from there!

## Some observations
So I've been fiddling with JSDOM, Node-HTML Parser, and the overall library <br />
Some noteworthy stuff
* JSDOM and Node-HTML can't parse classes AT ALL if there's a space in the class="" attribute
* Both `getElementsByClassName`, `querySelector`, and `querySelectorAll` doesn't work
* Node-HTML doesn't display `HTMLObject.innerText` properly - Any \n would be ommitted by the console
* JSDOM's operations (well objects that get returned) doesn't actually show the nodeList/HTMLList contents, even under `console.dir`. Very sketchy stuff
*  You can't iterate through custom JSDOM nodeList using for loop BUT spread syntax somehow works
*  Debate Wiki has a smart slowmode system (smart slowmode as in like the term used in Tech Bot and Srs Bot 🤔) A request every 4s seems to abide by that
*  ECONNReset seems to trigger when le functions in `respond.end` take too long
