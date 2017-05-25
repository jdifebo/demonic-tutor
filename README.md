# mtg-search

### About:
Demonic Tutor is a tool used to search through cards for the game Magic: The Gathering. The goal is to have a simple-to-use interface with nearly instant results displayed on the same page. The site is capable of being so fast because it loads the entire database of cards into memory, meaning that searching through cards does not need to communicate with a server in order to update results.

### How it's built:
Currently it's using plain JavaScript with no frameworks or libraries. I've played around with rebuilding this app using various frameworks, but it's never been quite as fast. Using plain JavaScript gives me the most power and freedom, while also minimizing page load time. Page load time is especially important since I have to load a 5MB JSON file, and I don't want users to get bored waiting. The CSS is Bootstrap 4 Alpha, with a little bit of custom CSS.

THe card data comes from MTG JSON. I modify the JSON a little bit to make it easier for my application to use, as well as removing fields that I don't use at all. You can see that in the source code if you're super curious. 

### Disclaimer:
The information presented on this site about Magic: The Gathering, both literal and graphical, is copyrighted by Wizards of the Coast. This website is not produced, endorsed, supported, or affiliated with Wizards of the Coast.

This site is still under construction and is provided with ABSOLUTELY NO WARRANTY. Things may be broken or out-of-date at any given time. 
