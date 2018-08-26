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
	
function switcher(choice, rando) {
	switch(choice){
		case "Find a concert":
			
			break;
		case "Spotify a song":
		// call to spotify stuff
			songSearch(rando);
			break;
		case "Get info on a movie":
			
			break;
		case 'Make Liri "do what it says"':
			fs.readFile("random.txt", "utf8", function(error, data) {
				if (error) {
					return console.log(error);
				  }
				  var dataArr = data.split(",");
				  switcher(dataArr[0], dataArr[1]);
				  console.log(dataArr.toString());
			});
			break;
		default:
			break;
	}
}
	
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

		//function to prompt the user for an song name
	function songSearch(rando) {
		if (rando) {
			track(rando);
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
			var userSong = response.song.replace(" ", "+");
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
			return console.log('Error occurred: ' + err);
		  }
		  //parsed response from spotify, which returns a very complicated response
		var dataArr = [data.tracks.items[0].artists[0].name, data.tracks.items[0].name, data.tracks.items[0].preview_url, data.tracks.items[0].album.name];
		//some artists do not have a preview URL, so we give a message instead of 'null'
		if (!dataArr[2]){
			dataArr[2] = "No preview URL available";
		}
		//send our results to the function that will display the results
		presentData(dataArr);
		});
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
	

	

	
	