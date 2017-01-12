
/******************* GOOGLE *******************/
// Create the google map
// First set mapOptions so when we make the Map constructor it's easier to read

var mapOptions = {
	center: {lat: 39.8282, lng: -98.5795},
	zoom: 4
};
// Now make the map
var map = new google.maps.Map(
	document.getElementById('map'),
	mapOptions
);
// Make an infoWindow for use later
var infoWindow = new google.maps.InfoWindow({});
// Make a markers array for use later
var markers = [];
// Make an array to hold our PoI
var poIMarkers = [];
// Set up the directionsService so we can use it
var directionsService = new google.maps.DirectionsService();
// Set up directionsDisplay so we can use it
var directionsDisplay = new google.maps.DirectionsRenderer();
directionsDisplay.setMap(map);


function calcRoute() {
  var request = {
    origin: start,
    destination: end,
    travelMode: 'DRIVING'
  };
  // console.log(request);
  directionsService.route(request, function(result, status) {
  	// console.log(status);
  	// console.log(result);
    if (status == 'OK') {
      	directionsDisplay.setDirections(result);
    }
  });


}
var start = "Atlanta, GA";
var end;



// A function place a marker at a city location
function createMarker(city){
	var icon = 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|FE7569';
	// icon = "http://s2.quickmeme.com/img/0e/0e1bc9ee47057d1886a4f9537e392f1bb675b97d56d719e119903f49339cf0a5.jpg";	
	var cityLL = {
		lat: city.lat,
		lng: city.lon
	}
	var marker = new google.maps.Marker({
		position: cityLL,
		map: map,
		title: city.city,
		icon: icon,
		animation: google.maps.Animation.DROP
	});
	// We only want ONE infowindow!
	// var infoWindow = new google.maps.InfoWindow({});
	google.maps.event.addListener(marker,'click', function(){
		infoWindow.setContent(`<h2> ${city.city}</h2><div>${city.state}</div><div>${city.yearEstimate}</div><a href="">CLick to zoom</a>`);
		infoWindow.open(map, marker)
	});
	// Push the marker just created above onto the global array "markers"
	markers.push(marker);
}

function createPoI(place){
	// console.log(place);
	var infoWindow = new google.maps.InfoWindow({});
	var marker = new google.maps.Marker({
		map: map,
		position: place.geometry.location,
		icon: place.icon
	});
	google.maps.event.addListener(marker, 'click', () =>{
		infoWindow.setContent(place.name);
		infoWindow.open(map, marker);
	});
	poIMarkers.push(marker);
}

/******************* REACT *******************/

var GoogleCity = React.createClass({

	// componentDidMount: function() {
	// 	console.log("A City Component Just Mounted Hook!")
	// },

	// componentWillMount: function() {
	// 	console.log("City Component Mounted Hook!")
	// },

	// componentWillReceiveProps: function(nextProps) {
	// 	console.log("Just received",nextProps)	
	// },

	getDirections: function(){
		console.log("Test")
		end = this.props.cityObject.city;
		calcRoute();
	},

	handleClickedCity: function(event){
		console.log("Someone Clicked on a city!");
		google.maps.event.trigger(markers[this.props.cityObject.yearRank-1],"click");
	},
	zoomToCity: function(event){
		var cityLL = new google.maps.LatLng(this.props.cityObject.lat, this.props.cityObject.lon);
		// Create a new map at this cities center
		map = new google.maps.Map(
			document.getElementById('map'),
			{
				zoom: 15,
				center: cityLL
			}
		)
		// Add direction service to new map
		// directionsDisplay.setMap(map);
		var service = new google.maps.places.PlacesService(map);
		service.nearbySearch(
			{
				location: cityLL,
				radius: 500,
				type: ['store']
			}, 
			function(results, status){
				console.log(status);
				console.log(results);
				if(status === 'OK'){
					// We got a good response.
					results.map(function(currPlace,index){
						createPoI(currPlace);
					})
				}
			}
		);

		// var bounds = new google.maps.LatLngBounds(cityLL);
		// poIMarkers.map(function(currMarker, index){
		// 	bounds.extend(currMarker.getPosition());
		// })
		// map.fitBounds(bounds);


	},
	render: function(){
		return(
			<tr>
				<td className="city-name" onClick={this.handleClickedCity}>{this.props.cityObject.city}</td>
				<td className="city-rank">{this.props.cityObject.yearRank}</td>
				<td><button className="btn btn-primary" onClick={this.getDirections}>Get Directions</button></td>
				<td><button className="btn btn-success" onClick={this.zoomToCity}>Zoom</button></td>				
			</tr>
		)
	}
});

var Cities = React.createClass({

	getInitialState: function() {
		console.log(this.props);
		return{
			currCities: this.props.routes[1].cities
		}
	},

	// componentDidMount: function() {
	// 	console.log("Component Just Mounted Hook!")
	// },

	// componentWillMount: function() {
	// 	console.log("Component Mounted Hook!")
	// },

	setStartingLocation: function(event){
		start = event.target.value
	},

	handleInputChange: function(event){
		var newFiltervalue = event.target.value;
		// console.log(newFiltervalue);
		var filteredCitiesArray = [];
		// Loop through the list of cities!!
		this.props.routes[1].cities.map(function(currCity, index){
			if(currCity.city.indexOf(newFiltervalue) !== -1){
				// hit! I dont care where it's at, but it's in the word
				filteredCitiesArray.push(currCity);
			}
		});
		console.log(filteredCitiesArray);
		// this.state.currCities = filteredCitiesArray;
		this.setState({
			currCities: filteredCitiesArray
		})
		
	},

	updateMarkers: function(event){
		event.preventDefault();
		// console.log("Update Markers!");
		markers.map(function(marker, index){
			marker.setMap(null);
		});
		this.state.currCities.map(function(city,index){
			createMarker(city)
		})

	},

	render: function(event){
		var cityRows = [];
		this.state.currCities.map(function(currentCity, index){
			createMarker(currentCity);
			cityRows.push(<GoogleCity cityObject={currentCity} key={index} />)
		});
		return(
			<div>
				<form onSubmit={this.updateMarkers}>
					<input type="text" onChange={this.handleInputChange} />
					<input type="submit" value="Update Markers" />
				</form>
				<form>
					<input type="text" placeholder="Please enter starting location" onChange={this.setStartingLocation} />
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
})

function Test(props){
	return(
		<h1>This is the Test route</h1>
	)
}

var App = React.createClass({
	render: function(){
		return(
			<div>
				<BootstrapNavBar />
				{this.props.children}
			</div>
		)
	}
});

var BootstrapNavBar = React.createClass({
	render: function(){
		return(
			<nav className="navbar navbar-default">
  			<div className="container-fluid">
    			<div className="navbar-header">
      				<a className="navbar-brand" href="#">WebSiteName</a>
    			</div>
    			<ul className="nav navbar-nav">
    				<li><ReactRouter.IndexLink activeClassName="active" to="/">Home</ReactRouter.IndexLink></li>
    				<li><ReactRouter.Link activeClassName="active" to="cities">Cities</ReactRouter.Link></li>
    			</ul>
  			</div>
			</nav>			
		)
	}
});


ReactDOM.render(
	<ReactRouter.Router>
		<ReactRouter.Route path="/" component={App} >
			<ReactRouter.IndexRoute component={Cities} cities={cities} />
			<ReactRouter.Route path="/cities" component={Test} />
		</ReactRouter.Route>
	</ReactRouter.Router>,
	document.getElementById('cities-container')
)

