//load our custom elements
require("component-leaflet-map");
require("component-responsive-frame");

//get access to Leaflet and the map
var element = document.querySelector("leaflet-map");
var L = element.leaflet;
var map = element.map;

var $ = require("jquery");

var data = require("./homicides16.geo.json");
data.features.sort((a, b) => a.properties.order - b.properties.order);

//ICH code for popup template if needed----------
var ich = require("icanhaz");
var templateFile = require("./_popup.html");
ich.addTemplate("popup", templateFile);

function highlightFeature(e) {
    var layer = e.target;
    layer.setStyle({
      radius: 8,
      fillColor: "rgb(60, 60, 60)",
      color: "#ffffff",
      weight: 2,
      opacity: .5,
      fillOpacity:1
    });

    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
    }
}
function resetHighlight(e) {

  geojson.resetStyle(e.target);
}

var currentItem = null;

var onEachFeature = function(feature, layer) {
  feature.layer = layer;

  layer.on('click', function(e) {
    currentItem = feature;
    var index = data.features.indexOf(feature);
    $(".goto.back").toggleClass("disabled", index == 0);
    $(".goto.next").toggleClass("disabled", index == data.features.length - 1);
    map.fitBounds(e.target.getBounds(), {maxZoom: 14});
    var container = $(".pop-container");
    container.html(ich.popup(feature.properties));
    $(".close").click(function() {
      container.html("");
    });
  });
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight
  })

};

map.scrollWheelZoom.disable();

function getColor(d) {
  return d == "OIS" ? "#eaa238" :
                       "#6e016b"
}

function geojsonMarkerOptions(feature) {

  return {
    radius: 7,
    fillColor: getColor(feature.properties.type),
    color: "#ffffff",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.75
  }
};

var geojson = L.geoJson(data, {
    pointToLayer: function (features, latlng) {
      var marker = L.circleMarker([latlng.lng, latlng.lat]);
      return marker;
    },
    style: geojsonMarkerOptions,
    onEachFeature: onEachFeature
}).addTo(map);


$(".goto").on("click", function() {
  if (currentItem === null) {
    data.features[0].layer.fire("click");
    return;
  }
  var shift = this.classList.contains("next") ? 1 : -1;
  var index = data.features.indexOf(currentItem);
  geojson.resetStyle(data.features[index].layer);
  index += shift;

  if (index < 0) return;
  if (index >= data.features.length) return;

  data.features[index].layer.fire("click");
  data.features[index].layer.setStyle({
    radius: 8,
    fillColor: "rgb(12, 12, 12)",
    color: "#ffffff",
    weight: 2,
    opacity: 1,
    fillOpacity:1
  });

});

// $(".goto").on("mouseout", function() {
//   if (currentItem === null) {
//     data.features[0].layer.fire("click");
//     return;
//   }
//   var shift = this.classList.contains("next") ? 1 : -1;
//   var index = data.features.indexOf(currentItem);
//   geojson.resetStyle(data.features[index].layer);
// });

map.fitBounds(geojson.getBounds());
