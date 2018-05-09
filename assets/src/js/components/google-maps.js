import GoogleMapsLoader from 'google-maps'

// google API Config
GoogleMapsLoader.KEY = 'AIzaSyAfuq-Nr2TThk2jHkmPJzToDTheGyE1ngE'
GoogleMapsLoader.LIBRARIES = ['geometry', 'places']
GoogleMapsLoader.LANGUAGE = 'fr'
GoogleMapsLoader.REGION = 'FR'

var googleMap = () => {
  GoogleMapsLoader.load(function (google) {
    // new google.maps.Map(el, options)
    // This example displays an address form, using the autocomplete feature
    // of the Google Places API to help users fill in the information.
    // This example requires the Places library. Include the libraries=places
    // parameter when you first load the API. For example:
    // <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places">
    var autocomplete
    var componentForm = {
      street_number: 'short_name',
      route: 'long_name',
      locality: 'long_name',
      administrative_area_level_1: 'short_name',
      country: 'long_name',
      postal_code: 'short_name'
    }

    function initMap (lat, lng) {
      var uluru = {lat: lat, lng: lng}
      var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 10,
        center: uluru
      })
      var marker = new google.maps.Marker({
        position: uluru,
        map: map
      })
      return marker
    }

    function initAutocomplete () {
      if (document.getElementById('latitude') !== null && document.getElementById('longitude').value !== null) {
        // Create the autocomplete object, restricting the search to geographical
        // location types.
        autocomplete = new google.maps.places.Autocomplete(
          /** @type {!HTMLInputElement} */(document.getElementById('autocomplete')),
          {types: ['geocode']})

        var latitude = document.getElementById('latitude').value * 1
        var longitude = document.getElementById('longitude').value * 1
        if (latitude !== 0 && longitude !== 0) {
          initMap(latitude, longitude)
        } else {
          initMap(48.0667, -2.9833)
        }
        // When the user selects an address from the dropdown, populate the address
        // fields in the form.
        autocomplete.addListener('place_changed', fillInAddress)
      }
    }

    function fillInAddress () {
      // Get the place details from the autocomplete object.
      var place = autocomplete.getPlace()
      // GMAPS
      var latitude = (place.geometry.viewport.f.b + place.geometry.viewport.f.f) / 2
      var longitude = (place.geometry.viewport.b.f + place.geometry.viewport.b.b) / 2

      initMap(latitude, longitude)
      document.getElementById('latitude').value = latitude
      document.getElementById('longitude').value = longitude

      for (var component in componentForm) {
        document.getElementById(component).value = ''
        document.getElementById(component).disabled = false
      }

      // Get each component of the address from the place details
      // and fill the corresponding field on the form.
      for (var i = 0; i < place.address_components.length; i++) {
        var addressType = place.address_components[i].types[0]
        if (componentForm[addressType]) {
          var val = place.address_components[i][componentForm[addressType]]
          document.getElementById(addressType).value = val
        }
      }
    }

    // Bias the autocomplete object to the user's geographical location,
    // as supplied by the browser's 'navigator.geolocation' object.
    function geolocate () {
      try {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function (position) {
            // var geolocation = {
            //   lat: position.coords.latitude,
            //   lng: position.coords.longitude
            // }
            var geolocation = new google.maps.LatLng(
              position.coords.latitude, position.coords.longitude)
            var circle = new google.maps.Circle({
              center: geolocation,
              radius: position.coords.accuracy
            })
            autocomplete.setBounds(circle.getBounds())
          })
        }
      } catch (err) {
        console.log(err)
      }
    }

    initAutocomplete()

    geolocate()
  })
}

export default googleMap()
