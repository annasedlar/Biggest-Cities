//**************************Google/maps stuff****************************************
//***********************************************************************************
var map = new google.maps.Map(
	document.getElementById('map'), 
	{
		center:{lat: 39.8282, lng: -98.5795},
		zoom: 4
	}
);

var infoWindow = new google.maps.InfoWindow({});

var markers = [];

//a function to place a marker at a city location
function createMarker(city){
	var cityLL = {
		lat:city.lat,
		lng:city.lon
	}
	var marker = new google.maps.Marker({
		position: cityLL, 
		map: map, 
		title: city.city,
		icon: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2%7CFE7569'
	});
	google.maps.event.addListener(marker, 'click', function(){
		infoWindow.setContent(`<h2> ${city.city}</h2><div>${city.state}</div><div>{city.yearEstimate}</div>`),
		infoWindow.open(map, marker);
	});
	//push the just-created marker above onto the gloabl array "markers"
	markers.push(marker); 
};





//**************************React stuff**********************************************
//***********************************************************************************
var GoogleCity = React.createClass({
	handleClickedCity: function(event){
		console.log("someone clicked on a city");
		google.maps.event.trigger(markers[this.props.cityObject.yearRank-1], "click")
	},

	render: function(){
		return(
			<tr>
				<td className="city-name" onClick={this.handleClickedCity}>${this.props.cityObject.city}</td>
				<td className="city-rank">{this.props.cityObject.yearRank}</td>
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








