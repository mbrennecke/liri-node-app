	function whatUserWants(query, callback) {
		inquirer
		  .prompt([
			{
			  type: "input",
			  message: query,
			  name: "choice"
			}
			]).then(function(inquirerResponse) {
				callback(inquirerResponse.choice);
				});
		
	}
	
		function switcher (choice) {
			switch(choice){
				case "Find a concert":
					var song = whatUserWants("What artist or band?");
					break;
				case "Spotify a song":
					var queryArr = artist();
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
	}
	
		//function if a user did not supply an artist or song title
	function track2() {
		//this request is fashioned using a promise
		spotify
		//request is specifically for Ace of Base: the Sign. Using its track id from spotify
		//otherwise strange data may be received
		  .request('https://api.spotify.com/v1/tracks/0hrBpAOgrt8RXigk83LLNE')
		  .then(function(data) {
			var dataArr = [data.album.artists[0].name, data.name, data.preview_url, data.album.name];
			//call to the function which will display the data
			presentData(dataArr); 
		  })
		  .catch(function(err) {
			console.error('Error occurred: ' + err); 
		  });
	}
	

	
	//---------------------------------------------------------------------
		} else {
			//if no song requested we default them to Ace of Base: The Sign
			//sucks for them
			var query ="track%3A" + theSign + "+artist%3A" + artist;
			//call to the spotify API call
			track(query);
		}
		
	}
	
					} else {
					//if it includes an artist, we need to shape the query
					//artist names with a space need concatenated with a +
					res = artist.replace(" ", "+");
					//query request for a song with an artist
					//otherwise one gets what one may not have wanted in results
					var query ="track%3A" + userSong + "+artist%3A" + res;
					//call to the spotify API call
					track(query);
				}
	
		//This will prompt to whether they know the artist to search for
	function artist() {
		inquirer.prompt([{
		  name: 'artist',
		  type: 'confirm',
		  message: 'Do you know the artist or band?'
		}, {
			//if they know the artist, the confirm will return a true, if false, will just 
			//move on the the log and song functions
		  when: function (response) {
			return response.artist;
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
			song(band);

		});

	}
	
		//function to prompt the user for an song name
	function song(artist, theSign) {
		if (!theSign){
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
				if (!artist){
					//check if a song was supplied
					if (!userSong) {
						//if no song, we send them to get a default response
						song("Ace+of+Base", "The+Sign");
						return;
					}
					//if they gave a song title, we send it to the query
					track(userSong);
				} else {
					//if it includes an artist, we need to shape the query
					//artist names with a space need concatenated with a +
					res = artist.replace(" ", "+");
					//query request for a song with an artist
					//otherwise one gets what one may not have wanted in results
					var query ="track%3A" + userSong + "+artist%3A" + res;
					//call to the spotify API call
					track(query);
				}
			});
		} else {
			//if no song requested we default them to Ace of Base: The Sign
			//sucks for them
			var query ="track%3A" + theSign + "+artist%3A" + artist;
			//call to the spotify API call
			track(query);
		}
		
	}