# When's My Turn?
This is the successor to my [Guilty Gear Strive Frame Data API](https://github.com/anitanotto/ggst-framedata), now scraping and serving data from all games on the [Dustloop Wiki](https://www.dustloop.com/w).

Included is an app that analyzes frame data for any matchup in any of the supported games as well as an API that serves all the data as JSON.

API documentation is available at https://whens-my-turn.onrender.com/api

**Link to project:** https://whens-my-turn.onrender.com

## How It's Made:

**Tech used:** HTML, EJS, CSS, JavaScript, Node.js, Express

With my Strive API, I wanted to make some kind of app using the game's frame data, but the only API I could find had data that was way out of date, so, I built my own.

Eventually, flaws with my own code led to my data being out of date as well, so, I rewrote the project from the ground up to solve those issues.

Data is scraped from Dustloop's wiki using the fetch API and DOM manipulation, then used to fill the placeholders in this app's templates or served raw via the API.

## Optimizations
Right now, the server rescrapes all the data with every request it receives - the #1 efficiency boost I could give it would be to implement a data cache.

The major flaws with my Strive API were that it didn't have solutions for every edge case when scraping and the scraper had to be run manually. With this project I have accounted for all edge cases, and data is scraped as requests to the server are made, but, along with allowing the data to be cached I would like to automate the scraping of the data.

## Lessons Learned:
Manual data entry for all of this would have taken forever, so, I learned how to scrape instead.

Flaws with the initial version of this project led to me building this version the way it is - I focused on solving those issues over the efficiency of the code since they were too detrimental to the usability of it, and now that it is stable I can improve it from where it is more easily.

## Example:
An app I built utilizing the API is available at https://whens-my-turn.onrender.com

Let me know if you build anything with it so I can link it here!
