require("dotenv").config();
var Spotify = require('node-spotify-api');
var inquirer = require("inquirer");
var keys = require("./keys.js");
var request = require('request');
var moment = require('moment');
var fs = require("fs");

var spotify = new Spotify(keys.spotify);



//Initial prompt to user of what the would like to know, using inquirer
inquirer
  .prompt([
	{
	//presents user with a list of options for Liri to do
      type: "list",
      message: "Which option would you like?",
      choices: ["Find a concert", "Spotify a song", "Get info on a movie", 'Make Liri "do what it says"'],
      name: "choice"
    }
	])
	.then(function(inquirerResponse) {
	//logging inputs and responses
		log(inquirerResponse.choice);
	//switch to manage user's choice
		switcher(inquirerResponse.choice);
	});
	
	//function to run the switch case for user's choice
	function switcher(choice, rando) {
		switch(choice){
			case "Find a concert":
				concert(rando);
				break;
			case "Spotify a song":
			// call to spotify stuff
				songSearch(rando);
				break;
			case "Get info on a movie":
				movieSearch(rando);
				break;
			case 'Make Liri "do what it says"':
				randomSelection();
				break;
			default:
				break;
		}
	}
	
	//function that prompts user to whether they know the band for the song, helps get correct results
	function artist(song, artist) {
		if (!artist){
			inquirer.prompt([{
			  name: 'songArtist',
			  type: 'confirm',
			  message: 'Do you know the artist or band?'
			}, {
				//if they know the artist, the confirm will return a true, if false, will just 
				//move on the the log and song functions
			  when: function (response) {
				return response.songArtist;
			  },
			  //this runs only if the confirm returned true, user is prompted for a band name
			  name: 'yes',
			  type: 'input',
			  message: 'Artist or band?'
			}], function (response) {
				//this space intentionally left blank, this is the first response that will
				//trigger the when, as I understand it
				//Yay, let's grab code from stackoverflow and see if it works.
			}).then(function(response){
				var band = response.yes;
				//logging artist name or lack thereof
				log(band);
				//calls the song function with the artist name or lack thereof
				if (!band){
					track(song);
					return;
				}
				//if it includes an artist, we need to shape the query
				//artist names with a space need concatenated with a +
				res = band.replace(" ", "+");
				//query request for a song with an artist
				//otherwise one gets what one may not have wanted in results
				var query ="track%3A" + song + "+artist%3A" + res;
				//call to the spotify API call
				track(query);
			});
		} else {
			//if no song requested we default them to Ace of Base: The Sign
			//sucks for them
			var query ="track%3A" + song + "+artist%3A" + artist;
			//call to the spotify API call
			track(query);
		}
	}

		//function to prompt the user for a song name
	function songSearch(rando) {
		//if random choice is selected it is parsed here
		if (rando) {
			var userSong = queryBuilder(rando);
			track(userSong);
			return;
		}
		inquirer.prompt([{
		  name: 'song',
		  type: 'input',
		  message: 'What song do you want?'
		}]).then(function(response){
			//logging song name or lack thereof
			log(response.song);
			//multi word queries need the words concatenated with a +
			var userSong = queryBuilder(response.song);
			//check if an artist was supplied
			if (!userSong) {
				//if no song, we send them to get a default response
				artist("The+Sign","Ace+of+Base");
				return;
			}
			//if they gave a song title, we send it to the see if they know an artist
			artist(userSong);
		});
	}
	
	//call to spotify using node-spotify-api (not spotify-web-api-node)
	function track(userQuery) {
		//query, limited to 1 response
		spotify.search({ type: 'track', query: userQuery , limit: 1 }, function(err, data) {
		  if (err) {
			return presentData(['Error occurred: unable to get song info']);
		  }
		  //parsed response from spotify, which returns a very complicated response
		var dataArr = ["\nArtist(s): " + data.tracks.items[0].artists[0].name, "Track:" + data.tracks.items[0].name, "Preview URL: " + data.tracks.items[0].preview_url, "Album: " + data.tracks.items[0].album.name];
		//some artists do not have a preview URL, so we give a message instead of 'null'
		if (!dataArr[2]){
			dataArr[2] = "No preview URL available";
		}
		//send our results to the function that will display the results
		presentData(dataArr);
		});
	}
	
	//function to get the band the user wants concert information for
	function concert(rando){
		//if random choice is selected it is parsed here
		if (rando) {
			var userArtist = queryBuilder(rando);
			concertQuery(userArtist);
			return;
		}
		inquirer.prompt([{
		  name: 'artist',
		  type: 'input',
		  message: 'What artist or band do you want?'
		}]).then(function(response){
			//logging song name or lack thereof
			log(response.artist);
			//multi word queries need the words concatenated with a +
			var userArtist = queryBuilder(response.artist);
			//check if an artist was supplied
			if (!userArtist) {
				//if no song, we send them to get a default response
				concertQuery("Celine+Dion");
				return;
			}
			//
			concertQuery(queryBuilder(response.artist));
		});
	}

	function concertQuery(userArtist) {
		request("https://rest.bandsintown.com/artists/" + userArtist + "/events?app_id=d2570810ad69e1b20ec7f6a709deb0ec", function(error, response, body) {
			if (JSON.stringify(body).includes('Not')) {
				presentData(["Sorry, no concert information available"]);
				return;
			}
		  // If the request was successful...
		  if (!error && response.statusCode === 200) {
			var data = JSON.parse(body);
			// if no concert info is available, the result will return a zero data array
			if (data.length === 0) {
				presentData(["Sorry, no concert information available"]);	
			}else if (data.length > 5){
				var sizeLimiter = 5;
			} else {
				var sizeLimiter = data.length;
			}
			for(var i = 0; i<sizeLimiter; i++) {
				presentData(["\nVenue: " + data[i].venue.name, "City: " + data[i].venue.city, "Date: " + moment(data[i].datetime).format('M[/]D[/]YYYY') + "\n"]);
			}
		  }
		});

	}
	
	//function to search for movie data for the user
	function movieSearch(rando){
		//if random choice is selected it is parsed here
		if (rando) {
			var userMovie = queryBuilder(rando);
			movieQuery(userMovie);
			return;
		}
		inquirer.prompt([{
		  name: 'movie',
		  type: 'input',
		  message: 'What movie do you want?'
		}]).then(function(response){
			//logging movie name or lack thereof
			log(response.movie);
			//multi word queries need the words concatenated with a +
			var userMovie = queryBuilder(response.movie);
			//check if an artist was supplied
			if (!userMovie) {
				//if no movie, we send them to get a default response
				movieQuery("Mr+Nobody");
				return;
			}
			movieQuery(userMovie);
		});
	}
	
	//function for API query with movie title
	function movieQuery(userMovie) {
		request("https://www.omdbapi.com/?t=" + userMovie + "&y=&plot=short&apikey=dedeeaf2", function(error, response, body) {
		  // If the request was successful...
		  if (!error && response.statusCode === 200) {
			var data = JSON.parse(body);
			if (data.Response == "False") {
				presentData(["Sorry, no movie information available"]);
				return;
			}
			var imdbRatings;
			var rottenRatings;
			//if no imdb or rotten tomatoes ratings an error will be thrown, if attempting to get it
			if (!data.Ratings[0]){
				imdbRatings = "No imdb rating";
				rottenRatings = "No Rotten Tomatoes rating";
			} else if (!data.Ratings[1]) {
				imdbRatings = data.Ratings[0].Value;
				rottenRatings = "No Rotten Tomatoes rating";
			} else {
				imdbRatings = data.Ratings[0].Value;
				rottenRatings = data.Ratings[1].Value;
			}
			presentData(["\nMovie: " + data.Title, "Released: " + data.Released, "imdb Rating: " + imdbRatings, "Rotten Tomatoes Rating: " + rottenRatings, "Produced in: " + data.Country, "Language: " + data.Language, "Plot: " + data.Plot, "Actors: " + data.Actors]);
		  }
		});

	}
	
	//if the "do what it says" is chosen, we need to grab a random thing to query
	function randomSelection() {
		fs.readFile("random.txt", "utf8", function(error, data) {
			if (error) {
				return console.log(error);
			  }
			  //the file is read and split into an array
			  var dataArr = data.split(",");
			  //a random number is generated
			  var randomGen = Math.floor(Math.random() * dataArr.length)
				//the element that corresponds to the choice is always going to be an even number or 0
			  if (randomGen % 2 == 1){
				//if an odd is chosen, it is changed to an even  
				randomGen -= 1;
			  }
			  //the items to be queried are then sent to the switcher function and processed almost like a user choice
			  switcher(dataArr[randomGen], dataArr[randomGen+1]);
		});
	}
	
	//function to split user choices to ensure they can be processed correctly
	function queryBuilder(toBuild) {
		var thing = toBuild.split(' ').join('+');
		return thing;
		
	}
	
	//this function writes the data to the console
	function presentData(dataArr){
		dataArr.forEach(function(item){
			//logs what is written to the console
			log(item);
			console.log(item);
		});
	}
	
	//appends the data to the log file
	function log(data) {
		fs.appendFile("log.txt", data + "\n", function(err) {
			if (err) {
			  return console.log(err);
			}
		  });
	}
	