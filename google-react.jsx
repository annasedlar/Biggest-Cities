//**************************Google/maps stuff****************************************
//***********************************************************************************
var mapOptions = {
	center: {lat: 33.7490, lng: -84.3880},
	zoom: 7
};

var map = new google.maps.Map(
	document.getElementById('map'), 
	mapOptions
);

var infoWindow = new google.maps.InfoWindow({});

var markers = [];

var directionsService = new google.maps.DirectionsService();

var directionsDisplay = new google.maps.DirectionsRenderer();
directionsDisplay.setMap(map); 

function calcRoute() {
  var request = {
    origin: start,
    destination: end,
    travelMode: 'DRIVING'
  };

  directionsService.route(request, function(result, status) {
    if (status == 'OK') {
    	directionsDisplay.setMap(null);
    	directionsDisplay.setMap(map);
      	directionsDisplay.setDirections(result);
    }
  });
}

var start = "Atlanta, GA"
var end; 

//a function to place a marker at a city location
function createMarker(city){
	var cityLL = {
		lat: city.lat,
		lng: city.lon
	}
	var marker = new google.maps.Marker({
		position: cityLL, 
		map: map, 
		title: city.city,
		icon: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2%7CFE7569'
	});
	google.maps.event.addListener(marker, 'click', function(){
		infoWindow.setContent(`<h2> ${city.city}</h2><div>${city.state}</div><div>${city.yearEstimate}</div>`),
		infoWindow.open(map, marker);
	});
	//push the just-created marker above onto the gloabl array "markers"
	markers.push(marker); 
};

function createPoI(place){
	console.log(place);
	var infoWindow = new google.maps.InfoWindow({});
	var marker = new google.maps.Marker({
		map: map,
		position: place.geometry.location,
		icon: place.icon
	})
	google.maps.event.addListener(marker, 'click', () =>{
		infoWindow.setContent(place.name);
		infoWindow.open(map, marker);
	})
};



//**************************React stuff**********************************************
//***********************************************************************************
var GoogleCity = React.createClass({
	handleClickedCity: function(event){
		google.maps.event.trigger(markers[this.props.cityObject.yearRank-1], "click")
	},

	findDirections: function(start, end){
		start = cityObject.city
	},

	getDirections: function(){
		end = this.props.cityObject.city; 
		calcRoute();
	},
	
	zoomToCity: function(){
		var cityLL = new google.maps.LatLng(this.props.cityObject.lat,this.props.cityObject.lon);
		map = new google.maps.Map(
			document.getElementById('map'),
				{
					zoom: 10,
					center: cityLL
				}
		)
		var service = new google.maps.places.PlacesService(map);
		service.nearbySearch({
			location: cityLL, 
			radius: 500,
			type: ['store']
		}, 
		function(results, status){
			console.log(results);
			if(status == 'OK'){
				//good response
				results.map(function(currPlace, index){
					createPoI(currPlace);
				})
			}
		}
		);
	},

	render: function(){
		return(
			<tr>
				<td className="city-name" onClick={this.handleClickedCity}>{this.props.cityObject.city}</td>
				<td className="city-rank">{this.props.cityObject.yearRank}</td>
				<td><button onClick={this.getDirections}>Get Directions</button></td>
				<td><button onClick={this.zoomToCity}> Zoom </button></td>
			</tr>
		)
	}
});

var Cities = React.createClass({
	getInitialState: function() {
		return{
			currCities: this.props.cities
		}
	},

	handleInputChange: function(event){
		var newFilterValue = event.target.value;
		var filteredCitiesArray = [];
		//loops through list of cities
		this.props.cities.map(function(currCity, index){
			if(currCity.city.indexOf(newFilterValue) !== -1){
				filteredCitiesArray.push(currCity);
			}
		});
		this.setState({
				currCities: filteredCitiesArray
		}) 
		// console.log(filteredCitiesArray);
	},

	setStartingLocation: function(event){
		start = event.target.value

	},

	updateMarkers: function(event){
		event.preventDefault(); 
		// console.log("update markers");
		markers.map(function(marker, index){
			marker.setMap(null); 
		});
		//adds back filtered markers
		this.state.currCities.map(function(city,index){
			createMarker(city)
		})

	},

	render: function(){
		var cityRows = [];
		this.state.currCities.map(function(currentCity, index){
			createMarker(currentCity);
			cityRows.push(<GoogleCity cityObject={currentCity} key={index} />)
		});
		return(
			<div>
				<form onSubmit={this.updateMarkers} >
					<input type="text" onChange={this.handleInputChange}/>
					<input type="submit" value="Update Markers" />
				</form>
				<form>
					<input type="text" placeholder="please enter starting location" onChange={this.setStartinglocation} />
				</form>
				<table>
					<thead>
						<tr>
						<th>City Name</th>
						<th>City Rank</th>
						</tr>
					</thead>
					<tbody>
					{cityRows}
					</tbody>
				</table>
			</div>
		)
	}
});

ReactDOM.render(
	<Cities cities={cities} />,
	document.getElementById('cities-container')
	)








