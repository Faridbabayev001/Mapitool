(function () {

    this.Mapitool = function () {
        var options = {
            type: "Basic",
            source: 'https://maps.googleapis.com/maps/api/js',
            apiKey: '',
            language: 'az',
            center: {
                lat: 40.300,
                lng: 48.800
            },
            result: '',
            autoComplete: false,
            searchInput: '',
            findMe: false,
            findMeButton: '',
            cluster: false,
            clusterImagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
            zoom: 8,
            scrollwheel: false,
            streetViewControl: false,
            mapTypeControl: false,
            overViewMapControl: false,
            mapTypeId: 'roadmap',
            icon: '',
            markerClick: false,
            infoWindowMaxWidth: 200
        }

        var functionNameForType;

        if (arguments[1] && typeof arguments[1] === "object" && typeof (arguments[1] != "undefined")) {
            options = extendDefaults(options, arguments[1]);
        }
        switch (options.type) {
            case "Basic":
                functionNameForType = createBasicMap;;
                break;
            case "AutoComplete": ;
                functionNameForType = createAutoCompleteMap;
                break;
            default:
                console.log("Please enter a map type");
                break;
        }
        if (arguments[0] && typeof (arguments[0] != "undefined")) {
            if (options.cluster) {
                createScript(arguments[0], options, arguments[2], functionNameForType);
                createClusterScript();
            } else {
                createScript(arguments[0], options, arguments[2], functionNameForType);
            }
        } else {
            console.log('Element not found')
        }
    }


    function extendDefaults(defaultOption, properties) {
        for (var property in properties) {
            if (properties.hasOwnProperty(property)) {
                defaultOption[property] = properties[property];
            }
        }
        return defaultOption;
    }

    function createScript(element, options, data, callback) {
        var apiUrl = document.querySelector('.GoogleMapApiJS');
        if (!apiUrl) {
            var script = document.createElement('script');
            var prior = document.getElementsByTagName('script')[0];
            var apiUrl;
            script.async = 1;
            script.defer = 1;
            script.setAttribute('class', "GoogleMapApiJS");
            script.onload = script.onreadystatechange = function (_, isAbort) {
                if (isAbort || !script.readyState) {
                    script.onload = script.onreadystatechange = null;
                    script = undefined;
                    if (!isAbort) { if (callback) callback(element, options, data); }
                }
            };
            if (options.findMe || options.autoComplete) {
                apiUrl = options.source + "?key=" + options.apiKey + "&language=" + options.language + "&libraries=places";
            } else {
                apiUrl = options.source + "?key=" + options.apiKey + "&language=" + options.language;
            }
            script.src = apiUrl;
            prior.parentNode.insertBefore(script, prior);
        } else {
            if (callback) callback(element, options, data);
        }
    }

    function createClusterScript() {
        var clusterUrl = document.querySelector('.GoogleMapsApiClusterJS');
        if (!clusterUrl) {
            var script = document.createElement('script');
            var prior = document.getElementsByTagName('script')[1];
            script.async = 1;
            script.defer = 1;
            script.setAttribute('class', "GoogleMapsApiClusterJS")
            script.onload = script.onreadystatechange = function (_, isAbort) {
                if (isAbort || !script.readyState) {
                    script.onload = script.onreadystatechange = null;
                    script = undefined;
                }
            };

            script.src = 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/markerclusterer.js';
            prior.parentNode.insertBefore(script, prior);
        }
    }

    function createBasicMap(element, options, data) {
        var markers = [];
        // Create a map object and specify the DOM element for display.
        var map = new google.maps.Map(document.getElementById(element), {
            center: { lat: options.center.lat, lng: options.center.lng },
            zoom: options.zoom,
            scrollwheel: options.scrollwheel,
            streetViewControl: options.streetViewControl,
            mapTypeControl: options.mapTypeControl,
            overViewMapControl: options.overViewMapControl,
            mapTypeId: options.mapTypeId,
        });

        if (typeof (data != "undefined") && data) {
            var infowindow = new google.maps.InfoWindow({
                maxWidth: options.infoWindowMaxWidth
            });
            // Add markers
            for (var i = 0; i < data.length; i++) {
                var marker = new google.maps.Marker({
                    map: map,
                    position: new google.maps.LatLng(data[i].lat, data[i].lng),
                    title: data[i].title,
                    icon: options.icon
                });
                marker.addListener('click', (function (marker, content, infowindow, isClick) {
                    return function () {
                        infowindow.setContent(content);
                        if (isClick) {
                            infowindow.open(map, marker);
                        }

                    };

                })(marker, data[i].content, infowindow, options.markerClick));

                markers.push(marker);
            };
            // Add cluster
            if (options.cluster) {
                var markerCluster = new MarkerClusterer(map, markers,
                    {
                        imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
                        maxZoom: options.zoom
                    });
            };

        }

    }

    function createAutoCompleteMap(element, options, data) {
        var map = new google.maps.Map(document.getElementById(element), {
            center: { lat: options.center.lat, lng: options.center.lng },
            zoom: options.zoom,
            scrollwheel: options.scrollwheel,
            streetViewControl: options.streetViewControl,
            mapTypeControl: options.mapTypeControl,
            overViewMapControl: options.overViewMapControl,
            mapTypeId: options.mapTypeId,
        });
        var markers = [];
        var geocoder = new google.maps.Geocoder;
        if (options.findMe) {
            var findMeButton = document.getElementById(options.findMeButton)
            findMeButton.addEventListener('click', function () {
                if (navigator.geolocation) {
                    var geoSuccess = function (position) {
                        var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                        map.setCenter(latlng);
                        map.setZoom(15);
                        var marker = new google.maps.Marker({
                            position: latlng,
                            map: map,
                        });

                        geocodeLatLng(geocoder, map);
                        function geocodeLatLng(geocoder, map) {
                            geocoder.geocode({ 'location': latlng }, function (results, status) {
                                if (status === 'OK') {
                                    if (results[1]) {
                                        if (typeof (options.result) == "function") {
                                            options.result(results[1].formatted_address, position.coords.latitude, position.coords.longitude, false);
                                        }
                                    } else {
                                        window.alert('Heç bir nəticə tapılmadı');
                                    }
                                } else {
                                    window.alert('Geokod səhvi: ' + status);
                                }
                            });
                        }
                        markers.push(marker);
                    };
                    var geoError = function (error) {
                        options.result(undefined, undefined, undefined, error);
                        // error.code can be:
                        //   0: unknown error
                        //   1: permission denied
                        //   2: position unavailable (error response from location provider)
                        //   3: timed out
                    };
                    navigator.geolocation.getCurrentPosition(geoSuccess, geoError);
                } else {
                    window.alert('Brovser adres tapmaq funksiyasını dəstəkləmir');
                };
            });
        }
        if (options.autoComplete) {
            // Create the search box and link it to the UI element.
            var input = document.getElementById(options.searchInput);
            var searchBox = new google.maps.places.SearchBox(input);
            // map.controls[google.maps.ControlPosition.TOP_RIGHT].push(input);

            // Bias the SearchBox results towards current map's viewport.
            map.addListener('bounds_changed', function () {
                searchBox.setBounds(map.getBounds());
            });
            // Listen for the event fired when the user selects a prediction and retrieve
            // more details for that place.
            searchBox.addListener('places_changed', function () {
                var places = searchBox.getPlaces();

                if (places.length == 0) {
                    return;
                }

                // Clear out the old markers.
                markers.forEach(function (marker) {
                    marker.setMap(null);
                });
                markers = [];

                // For each place, get the icon, name and location.
                var bounds = new google.maps.LatLngBounds();
                places.forEach(function (place) {
                    var icon = {
                        url: place.icon,
                        size: new google.maps.Size(71, 71),
                        origin: new google.maps.Point(0, 0),
                        anchor: new google.maps.Point(17, 34),
                        scaledSize: new google.maps.Size(25, 25)
                    };

                    // Create a marker for each place.
                    markers.push(new google.maps.Marker({
                        map: map,
                        icon: icon,
                        title: place.name,
                        animation: google.maps.Animation.DROP,
                        position: place.geometry.location
                    })
                    );
                    if (typeof (options.result) == "function") {
                        // Only geocodes have viewport.
                        if (place.geometry.viewport) {
                            bounds.union(place.geometry.viewport);
                            options.result(input.value, place.geometry.location.lat(), place.geometry.location.lat(), false);
                        } else {
                            bounds.extend(place.geometry.location);
                            options.result(input.value, place.geometry.location.lat(), place.geometry.location.lng(), false);
                        }
                    }
                });
                map.fitBounds(bounds);
            });
        }

    }
})();
