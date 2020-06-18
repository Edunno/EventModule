const request = require('request');
const cheerio = require('cheerio');
const https = require('https');
var URL = require('url-parse');

for (var j = 0; j < 2; j++) {
    var pageToVisit = "https://www.kultunaut.dk/perl/arrlist/type-nynaut?Startnr=" + (j * 20 + 1) + "&showmap=&Area=&ArrStartdato=21%2F5+2020&ArrSlutdato=4%2F6" +/*tal før % er dato, tal efter F er måned*/"+2020&Genre="; //Sæt 'Stratnr=xx' ind lige efter 'type-nynaut?', for at se "næste" side.
    console.log("Visiting page " + pageToVisit);
    setTimeout(request, 2000 * j, pageToVisit, function (error, response, body) {
        if (error) {
            console.log("Error: " + error);
        }
        // Check status code (200 is HTTP OK)
        console.log("Status code: " + response.statusCode + " ####################################");
        if (response.statusCode === 200) {
            // Parse the document body
            var $ = cheerio.load(body);
            console.log("Page title:  " + $('title').text());
            //estimateNewHtml($);
            searchForWord($);
        }
    }); //Requestet er asyncront, ofc. så resultater kommer i tilfældig rækkefølge, hvis de eksekveres uordnet. SetTimeout laver et delay på hvert request, så vi ikke bebyrder siden unødvændigt.

}

function getMonth(chars) {
    switch (chars) {
        case "jan":
            return 1;
        case "feb":
            return 2;
        case "mar":
            return 3;
        case "apr":
            return 4;
        case "maj":
            return 5;
        case "jun":
            return 6;
        case "jul":
            return 7;
        case "aug":
            return 8;
        case "sep":
            return 9;
        case "okt":
            return 10;
        case "nov":
            return 11;
        case "dec":
            return 12;
        default:
            return null;
    }
}


function searchForWord($) {

    var eventTitle = $('div[class="arr-genre"]');
    var titleArray = [];
    var arrLength = eventTitle.length;
    for (var i = 0; i < arrLength; i++) {
        titleArray.push(eventTitle[i].children[3].children[0].children[0].data); //eventDescriptions[0] er array'et vi går ud fra.
    }
    var eventDescription = $('div[class="arr-description"]');
    var descArray = [];
    arrLength = eventDescription.length;
    for (var i = 0; i < arrLength; i++) {
        eventDescription[i].children[0].children[0] ? descArray.push(eventDescription[i].children[0].children[0].data) : descArray.push(null);
    }
    var eventTimePlace = $('div[class="kult-month-day"]');
    var timePlaceArray = [];
    arrLength = eventTimePlace.length;
    for (var i = 0; i < arrLength; i++) {
        timePlaceArray.push(eventTimePlace[i].children[1].children[0].data);
    }

    //De her links skal måske i stedet bruges til at få yderligere info fra sitet, da det bare er et link internt på sitet nu. Eksempelvis mener jeg at koordinatet på stedet kan ligge under dette link.
    var eventLink = $('a[class="product-content"]');
    var linkArray = [];
    arrLength = eventLink.length;
    for (var i = 0; i < arrLength; i++) {
        linkArray.push(eventLink[i].attribs.href);
    }
    linkArray.forEach(x => {
        console.log(x);
    })

    /* //Koden herunder er gammel strøm, fra før siden ændrede sig sent i maj.
        var eventDescriptions = $('h3[class="event-title"]'); //Finder alle <h3> elementer i html'en og lister dem i element typer. Obs.: Hvert element får både sig selv, næste, forrige og udeomliggende element returneret med det (prev, next og parent)
        var otherDescriptions = $('span[class="notranslate"]'); //Finder alle <span> elementer med class "notranslate". Der er normalt 3 for hver <h3> element.
        var evLen = eventDescriptions.length;
        for (var i = 0; i < evLen; i++) {
            var checkTitle = eventDescriptions[i].children[1].children[0];
            var title = checkTitle.data ? checkTitle.data : checkTitle.children[0].data;    //Titel
            var desc = eventDescriptions[i].next.data.replace(/\n/g, "");                   //Beskrivelse
            var dateOf = otherDescriptions[i * 3].children[0].data;                         //Dato
            try {
                var timeOf = otherDescriptions[i * 3 + 1].children[0].data;                     //Tidspunkt
            }
            catch {
                var timeOf = null;
            }
            var linkOf = otherDescriptions[i * 3 + 2].children[0].attribs.href;             //Link
            var place = otherDescriptions[i * 3 + 2].children[0].children[0].data;          //Sted
            var address = otherDescriptions[i * 3 + 2].children[1].data;                    //Adresse
    
            //Setting up date format
            var dateYear = dateOf.slice(dateOf.length - 4, dateOf.length);
            var dateMonth = getMonth(dateOf.slice(dateOf.indexOf(".") + 2, dateOf.indexOf(".") + 5));
            var dateDay = dateOf.slice(dateOf.indexOf(".") - 2, dateOf.indexOf("."));
            var properDate = new Date();
            properDate.setFullYear(dateYear, dateMonth, dateDay);
    
            //Setting up time format
            if (timeOf !== null) {
                var timeOf = timeOf.slice(2, timeOf.length);
                var timeTo = 0;
                var timeFrom = 0;
                if (timeOf.indexOf("-") !== -1) {
                    timeFrom = timeOf.slice(timeOf.indexOf(".") + 2, timeOf.indexOf("-")).replace(".", "");
                    timeTo = timeOf.slice(timeOf.indexOf("-") + 1, timeOf.length - 1).replace(".", "");
                    timeFrom.length < 3 ? timeFrom += "00" : null;
                    timeTo.length < 3 ? timeTo += "00" : null;
                    console.log(timeFrom)
                    console.log(timeTo)
                }
            }
    
    
            //Setting up address format
            var address = address.slice(2, address.length);
    
            //Set up a json element with the values in them, then throw them on to "postToApi"
    
            console.log("-------- New event ---------");
    
            let eventFull = {
                "title": title,
                "address": address,
                "dateof": dateOf,
                "timeFrom": timeFrom,
                "description": desc,
                "place": place,
                "link": linkOf
            }
                * /
            //for(var i = 0; i < 10; i++){
            //setTimeout(postToApi, 800*i);
            //}
        }
    
        function postToApi(event) {
            /*
            const options = {
                url: 'https://manbearpig.dk/api/Event/create',
                json: true,
                body: {
                    title: event.title,
                    address: event.address,
                    startday: 111111,
                    starttime: 1111111,
                    description: event.desc,
                    place: event.place
                }
            };
        
            request.post(options, (err, res, body) => {
                if (err) {
                    return console.log(err);
                }
                console.log(`Status: ${res.statusCode}`);
                console.log(body);
            });
        }
        */

    var data = JSON.stringify({
        title: 'placeplace',
        address: 'someplace',
        startday: 111111,
        starttime: 1111111,
        description: 'somewhere',
        place: 'tothe left'
    })
    const options = {
        hostname: 'manbearpig.dk',
        port: 443,
        path: '/api/Event/create',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    }
    console.log(eventTitle[0]);
    //sendToDB(options, data);
}

function sendToDB(options, data) {
    const req = https.request(options, (res) => {
        console.log(`statuscode: ${res.statusCode}`)
        res.on('data', (d) => {
            process.stdout.write(d)
        })
    })
    req.on('error', (error) => {
        console.error(error)
    })

    req.write(data)
    req.end()
}


/*
Alt skrevet herunder er noget grundlæggende vi ville have brugt til at imødekomme side ændringer i scraperens mål.
*/

function estimateNewHtml($) {
    let possibleTitles = $('*');
    let newLength = possibleTitles.length;
    let addressArray = [];
    //console.log(possibleTitles[0])
    for (var i = 0; i < newLength; i++) {
        recursiveSearch(possibleTitles[i], addressArray);
    }
}

//Recursive function to search through all html tags
function recursiveSearch($, addressArray) {
    if (typeof $.name !== 'undefined') {
        console.log('Nest: ' + $.name + ' class: ' + $.type)
    }
    if (typeof $.data !== 'undefined' && deleteNonText($.data) !== "") {
        console.log($.data.replace(/\n/g, "").replace(/\s\s/g, ""));
        //Here we'd look at the data of the object, and determine if it fits within a catagory(a link, a date, a title, an address, or a description).
        //We'd then store the address array, and if several hits has a similiar address array, that'd be the new address of the particular catagory.
    }
    if (objectHasChildren($)) {
        for (var i = 0; i < $.children.length; i++) {
            recursiveSearch($.children[i]);
        }
        console.log('cd nest')
    }
}


function objectHasChildren(htmlTag) {
    if (htmlTag.children) {
        return true;
    }
}

function deleteNonText(text) {
    return text.replace(/\n/g, "").replace(/\s/g, "");
}

/*
var eventDescriptions = $('h3[class="event-title"]');                                                       Giver et objekt med nogle beskrivelser, lave [n] for at få dem seperat. 0 indekseret.
console.log(eventDescriptions[0].next.data);                                                                Giver dataen efter titlen, altså beskrivelsen af eventet.
console.log(eventDescriptions[0].children[1].name);                                                         Giver navnet b(div typen) på children.
console.log(eventDescriptions[0].children[1].children[0].data);                                             Giver overskriften på eventet.
console.log(eventDescriptions[i].next.next.next.next.next.next.children[0].children[0].children[0].data);   BURDE give tidspunkt for event. Virker kun hvis resten af teksten er korrekt sat op. Bedre løsning fundet.

{ data:  - Ofte en tekststring, af og til et object(to break down)
  type:  - Hvad den indeholder?
  name:  - navn, eks. b, div, text el. lign.
  attribs: - Attributter, tekststørrelse o.l., men ikke undersøgt fuldt ud
  children: - tagget's children. Er accessible via array.
  next: - tagget efter
  prev: - tagget før
  parent: - tagget der indeholder dette.
}

*/