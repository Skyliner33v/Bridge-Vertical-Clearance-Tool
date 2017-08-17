// Disclaimer opens automatically on page load
        var modal = document.getElementById("disclaimerModal");
        var accept = document.getElementsByClassName("close")[0];

        // Open disclaimer first    
        modal.style.display = "block";

        // When the user clicks on <span> (x), close the modal
        accept.onclick = function () {
            modal.style.display = "none";
        }

        // When the user clicks anywhere outside of the modal, close it
        window.onclick = function (event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }

        //Maps

        // Initialize map on page, centered on WA state
        function initMap() {
            var map = new google.maps.Map(document.getElementById('map'), {
                center: {
                    lat: 47.591103,
                    lng: -120.767221
                },
                zoom: 7,
                mapTypeId: 'roadmap'
            });
            new AutocompleteDirectionsHandler(map);
        }
        // Autocomplete
        function AutocompleteDirectionsHandler(map) {
            this.map = map;
            this.originPlaceId = null;
            this.destinationPlaceId = null;
            this.travelMode = 'DRIVING';
            var originInput = document.getElementById('origin-input');
            var destinationInput = document.getElementById('destination-input');
            var modeSelector = document.getElementById('mode-selector');
            this.directionsService = new google.maps.DirectionsService;
            this.directionsDisplay = new google.maps.DirectionsRenderer;
            this.directionsDisplay.setMap(map);

            var originAutocomplete = new google.maps.places.Autocomplete(
                originInput, {
                    placeIdOnly: true
                });
            var destinationAutocomplete = new google.maps.places.Autocomplete(
                destinationInput, {
                    placeIdOnly: true
                });

             this.setupClickListener('changemode-walking', 'WALKING');
            this.setupClickListener('changemode-transit', 'TRANSIT');
            this.setupClickListener('changemode-driving', 'DRIVING');

            this.setupPlaceChangedListener(originAutocomplete, 'ORIG');
            this.setupPlaceChangedListener(destinationAutocomplete, 'DEST'); 
        }

         // Sets a listener on a radio button to change the filter type on Places
        // Autocomplete.
        AutocompleteDirectionsHandler.prototype.setupClickListener = function (id, mode) {
            var radioButton = document.getElementById(id);
            var me = this;
            radioButton.addEventListener('click', function () {
                me.travelMode = mode;
                me.route();
            });
        };

        AutocompleteDirectionsHandler.prototype.setupPlaceChangedListener = function (autocomplete, mode) {
            var me = this;
            autocomplete.bindTo('bounds', this.map);
            autocomplete.addListener('place_changed', function () {
                var place = autocomplete.getPlace();
                if (!place.place_id) {
                    window.alert("Please select an option from the dropdown list.");
                    return;
                }
                if (mode === 'ORIG') {
                    me.originPlaceId = place.place_id;
                } else {
                    me.destinationPlaceId = place.place_id;
                }
                me.route();
            });

        };

        AutocompleteDirectionsHandler.prototype.route = function () {
            if (!this.originPlaceId || !this.destinationPlaceId) {
                return;
            }
            var me = this;

            // alert(this.originPlaceId);


            this.directionsService.route({
                origin: {
                    'placeId': this.originPlaceId
                },
                destination: {
                    'placeId': this.destinationPlaceId
                },
                travelMode: this.travelMode
            }, function (response, status) {
                if (status === 'OK') {
                    me.directionsDisplay.setDirections(response);
                    me.directionsDisplay.setPanel(document.getElementById('directionsResults'));


                } else {
                    window.alert('Directions request failed due to ' + status);
                }
            });
        }; 


        // Get Data
        // AJAX call to WSDOT api to get route specific bridge clearance info
        function getRoute() {

            // Initilize call from user input
            // var userHeight = (document.getElementById("inputFeet").value * 12) + document.getElementById("inputInches").value;
            var key = "59a077ad-7ee3-49f8-9966-95a788d7052f"
            var url = "https://wsdot.wa.gov/Traffic/api/Bridges/ClearanceREST.svc/GetClearancesAsJson?AccessCode=" + key;

            //Call to WSDOT Bridge Clearances API
            $.ajax({
                url: url,
                dataType: 'jsonp',
                success: function (data) {
                    var retValue = "";
                    var latLong = "";

                    //Iterate through all values returned 
                    for (var i = 0; i < data.length; i++) {

                        //We only want Under records where Begin and End Coordinates are the same
                        if (data[i].BeginLatitude === data[i].EndLatitude && data[i].BeginLongitude ===
                            data[i].EndLongitude) {


                            //Return lat/long, bridge name, and minimum vertical clearance values
                            retValue +=
                                data[i].BridgeName + "<br>" + 
                                " Lat = " + data[i].BeginLatitude + 
                                " Long = " + data[i].BeginLongitude + 
                                " Min Clearance = " + data[i].MinimumVerticalClearance + "<br>"
                        }
                    }

                    //Add returned info to page
                    document.getElementById("bridgeInfo").innerHTML = retValue;
                }
            });

        }

        function clearResults() {
            document.getElementById("directionsResults").innerHTML = "";
            document.getElementById("bridgeInfo").innerHTML = "";
        }