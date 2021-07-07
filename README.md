# Wiki-Installer
A node.js app that downloads all the evidence files disclosed on the debate wiki easily <br />
Version 2.0 because the last one was weird :sunglasses:

## Some observations
So I've been fiddling with JSDOM, Node-HTML Parser, and the overall library <br />
Some noteworthy stuff
* JSDOM and Node-HTML can't parse classes AT ALL if there's a space in the class="" attribute
* Both `getElementsByClassName`, `querySelector`, and `querySelectorAll` doesn't work
* Node-HTML doesn't display `HTMLObject.innerText` properly - Any \n would be ommitted by the console
* JSDOM's operations (well objects that get returned) doesn't actually show the nodeList/HTMLList contents, even under `console.dir`. Very sketchy stuff
*  You can't iterate through custom JSDOM nodeList using for loop BUT spread syntax somehow works
*  Debate Wiki has a 1000 request/minute (approximately?) rate limit, which is rly annoying. Maybe we could outsource this thing to another computer
*  ECONNReset seems to trigger when le functions in `respond.end` take too long
