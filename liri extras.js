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