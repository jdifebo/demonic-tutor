# mtg-search

### Goal:
To be the fastest way to search for Magic: The Gathering cards.  We load the entire 
dataset of all cards once when the page loads so that each subsequent search takes a
fraction of a second.

### How it's built:
Currently it's using plain JavaScript with no frameworks or libraries.  I've played
around with rebuilding this app using various frameworks, but it's never been quite
as fast.  Using plain JavaScript gives me the most power and freedom, while also
minimizing page load time.  Page load time is especially important since I have to 
load a 5MB JSON file, and I don't want our users to get bored waiting.  The CSS is 
Bootstrap 4 Alpha, with absoultely no custom CSS.  I'm sure I'll have to write some
CSS at some point, but I'm going to hold off for as long as I can.

### Disclaimer:
The information presented on this site about Magic: The Gathering, both literal and graphical, is copyrighted by Wizards of the Coast.
This website is not produced, endorsed, supported, or affiliated with Wizards of the Coast. 

Still very much under construction.
