require("dotenv").config();
var Spotify = require('node-spotify-api');
var inquirer = require("inquirer");
var keys = require("./keys.js");
var request = require('request');
var moment = require('moment');
var fs = require("fs");

var spotify = new Spotify(keys.spotify);


inquirer
  .prompt([
	{
      type: "list",
      message: "Which option would you like?",
      choices: ["Find a concert", "Spotify a song", "Get info on a movie", 'Make Liri "do what it says"'],
      name: "choice"
    }
	])
	.then(function(inquirerResponse) {
		switcher (inquirerResponse.choice);
	});
	
	function switcher (choice) {
			switch(choice){
				case "Find a concert":
					whatUserWants("What artist or band?");
					break;
				case "Spotify a song":
					whatUserWants("What song?");
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
						   (dataArr[0], dataArr[1]);
					});
					break;
				default:
					break;
			}
	}
	
	function whatUserWants(query) {
		
		inquirer
		  .prompt([
			{
			  type: "input",
			  message: query,
			  name: "choice"
			}
			]).then(function(inquirerResponse) {
				console.log(inquirerResponse.choice);
				return inquirerResponse.choice;
				});
		
	}