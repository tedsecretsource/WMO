# WMO
A JavaScript library for popping a new window

## Brief History
I started writing this code in the late 1990s, roughly 1999 or 2000 and first published it in 2002.
As far as I can tell, it runs equally well today as it did back then, and I've made no changes to
this code since it was first published! (note the 'a' in the version number XD)

## How it works
Load this library in plain JS in an HTML document and then load the document in a browser window. 
You can then open a "configurator" that allows you to specify some common options for opening a new
window in a browser, either as a response to loading the page or to clicking a link.

## Apology
It was libraries like this that caused browser manufacturers to have to add a pop-up blocker! That
said, back when this was written, this kind of library solved a problem that had no other solution.
At that time we didn't have ReactJS or Vue or any of the other fancy libraries we have today. Instead
we had something called [DHTML](https://en.wikipedia.org/wiki/Dynamic_HTML) and even that was in its
infancy (and full of cross-browser issues that made using it an exercise in frustration).
