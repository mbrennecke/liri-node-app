var inquirer = require("inquirer");
var data;
var data2;

function artist() {
inquirer.prompt([{
  name: 'artist',
  type: 'confirm',
  message: 'Do you know the artist or band?'
}, {
  when: function (response) {
	  console.log(response);
    return response.artist;
  },
  name: 'good',
  type: 'input',
  message: 'Artist or band?'
}], function (response) {
	
}).then(function(response){
	data = response.good;
	song(data);
});

}

function song(data) {
inquirer.prompt([{
  name: 'song',
  type: 'input',
  message: 'What song do you want?'
}]).then(function(response){
	data2 = response.song;
	console.log(data);
	console.log(data2);
});
}

artist();
