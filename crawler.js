var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');

for (var j = 0; j < 1; j++) {
    var pageToVisit = "https://www.kultunaut.dk/perl/arrlist/type-nynaut?Startnr=" + (j * 20 + 1) + "Area=&ArrStartday=24&ArrStartmonth=Marts&ArrStartyear=2020&ArrSlutday=31&ArrSlutmonth=Marts&ArrSlutyear=2020&ArrMaalgruppe=&ArrKunstner="; //Sæt 'Stratnr=xx' ind lige efter 'type-nynaut?', for at se "næste" side.
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
    var eventDescriptions = $('h3[class="event-title"]'); //Finder alle <h3> elementer i html'en og lister dem i element typer. Obs.: Hvert element får både sig selv, næste, forrige og udeomliggende element returneret med det (prev, next og parent)
    var otherDescriptions = $('span[class="notranslate"]'); //Finder alle <span> elementer med class "notranslate". Der er normalt 3 for hver <h3> element.
    var evLen = eventDescriptions.length;
    for (var i = 0; i < evLen; i++) {
        var checkTitle = eventDescriptions[i].children[1].children[0];
        var title = checkTitle.data ? checkTitle.data : checkTitle.children[0].data;    //Titel
        var desc = eventDescriptions[i].next.data.replace(/\n/g, "");                   //Beskrivelse
        var dateOf = otherDescriptions[i * 3].children[0].data;                         //Dato
        var timeOf = otherDescriptions[i * 3 + 1].children[0].data;                     //Tidspunkt
        var linkOf = otherDescriptions[i * 3 + 2].children[0].attribs.href;             //Link
        var place = otherDescriptions[i * 3 + 2].children[0].children[0].data;          //Sted
        var adress = otherDescriptions[i * 3 + 2].children[1].data;                     //Adresse

        //Setting up date format
        var dateYear = dateOf.slice(dateOf.length - 4, dateOf.length);
        var dateMonth = getMonth(dateOf.slice(dateOf.indexOf(".") + 2, dateOf.indexOf(".") + 5));
        var dateDay = dateOf.slice(dateOf.indexOf(".") - 2, dateOf.indexOf("."));
        var properDate = new Date();
        properDate.setFullYear(dateYear, dateMonth, dateDay);

        //Setting up time format
        var timeOf = timeOf.slice(2, timeOf.length);
        var timeTo = 0;
        var timeFrom = 0;
        if (timeOf.indexOf("-") !== -1) {
            timeFrom = timeOf.slice(timeOf.indexOf(".") + 2, timeOf.indexOf("-"));
            timeTo = timeOf.slice(timeOf.indexOf("-") + 1, timeOf.length - 1);
            console.log(timeFrom)
            console.log(timeTo)
        }

        //Setting up adress format
        var adress = adress.slice(2, adress.length);

        console.log("-------- New event ---------");
    }
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