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
		//switch to manage user's choice
		log(inquirerResponse.choice);
		switch(inquirerResponse.choice){
				case "Find a concert":
					var song = whatUserWants("What artist or band?");
					break;
				case "Spotify a song":
					artist();
					break;
				case "Get info on a movie":
					whatUserWants("What movie?");
					break;
				case 'Make Liri "do what it says"':
					fs.readFile("random.txt", "utf8", function(error, data) {
						if (error) {
							return console.log(error);
						  }
						  var dataArr = data.split(",");
					});
					break;
				default:
					break;
			}
	});
	
	function artist() {
		inquirer.prompt([{
		  name: 'artist',
		  type: 'confirm',
		  message: 'Do you know the artist or band?'
		}, {
		  when: function (response) {
			  
			return response.artist;
		  },
		  name: 'yes',
		  type: 'input',
		  message: 'Artist or band?'
		}], function (response) {
			
		}).then(function(response){
			var band = response.yes;
			log(band);
			song(band);

		});

	}

	function song(artist) {
		inquirer.prompt([{
		  name: 'song',
		  type: 'input',
		  message: 'What song do you want?'
		}]).then(function(response){
			log(response.song);
			var song = response.song.replace(" ", "+");
			if (!artist){
				if (!song) {
					track2();
					return;
				}
				track(song);
			} else {
				res = artist.replace(" ", "+");
				var query ="track%3A" + song + "+artist%3A" + res;
				track(query);
			}
		});
	}
	
	function track(userQuery) {
		
		spotify.search({ type: 'track', query: userQuery , limit: 1 }, function(err, data) {
		  if (err) {
			return console.log('Error occurred: ' + err);
		  }
		var dataArr = [data.tracks.items[0].artists[0].name, data.tracks.items[0].name, data.tracks.items[0].preview_url, data.tracks.items[0].album.name];
		if (!dataArr[2]){
			dataArr[2] = "No preview URL available";
		}
		presentData(dataArr);
		});
	}
	
	function track2() {
		
		spotify
		  .request('https://api.spotify.com/v1/tracks/0hrBpAOgrt8RXigk83LLNE')
		  .then(function(data) {
			var dataArr = [data.album.artists[0].name, data.name, data.preview_url, data.album.name];
			if (!dataArr[2]){
				dataArr[2] = "No preview URL available";
			}
			presentData(dataArr); 
		  })
		  .catch(function(err) {
			console.error('Error occurred: ' + err); 
		  });
	}
	
	function presentData(dataArr){
		dataArr.forEach(function(item){
			log(item);
			console.log(item);
		});
	}
	
	function log(data) {
		fs.appendFile("log.txt", data + "\n", function(err) {
			if (err) {
			  return console.log(err);
			}
		  });
	}
	

	

	
	