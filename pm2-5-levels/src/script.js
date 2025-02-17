// The value for 'accessToken' begins with 'pk...'
mapboxgl.accessToken =
  "pk.eyJ1IjoieHVhbnFpMjcwIiwiYSI6ImNtNXdsMm9jcjBhOHUybHNhZWs0YXU1N28ifQ.QJ3BfDObnVYtDaQ4u17A4A";

const map = new mapboxgl.Map({
  container: "map", // container element id
  style: "mapbox://styles/mapbox/light-v10",
  center: [-0.089932, 51.514442],
  zoom: 6
});

const data_url =
  "https://api.mapbox.com/datasets/v1/xuanqi270/cm770tz3657iw1zqinpn3kpg9/features?access_token=pk.eyJ1IjoieHVhbnFpMjcwIiwiYSI6ImNtNXdsMm9jcjBhOHUybHNhZWs0YXU1N28ifQ.QJ3BfDObnVYtDaQ4u17A4A";

map.on("load", () => {
  map.addLayer({
    id: "test1",
    type: "circle",
    source: {
      type: "geojson",
      data: data_url
    },
    paint: {
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["to-number", ["get", "PM2.5"]],
        0,
        4, // PM2.5 = 0
        10,
        8, // PM2.5 = 10
        20,
        12, // PM2.5 = 20
        30,
        16, // PM2.5 = 30
        40,
        18, // PM2.5 = 40
        48,
        20 // PM2.5 = 48
      ],
      "circle-opacity": 1,
      "circle-color": [
        "case",
        ["<=", ["to-number", ["get", "PM2.5"]], 10],
        "#50F0E6",
        ["<=", ["to-number", ["get", "PM2.5"]], 20],
        "#50CCAA",
        ["<=", ["to-number", ["get", "PM2.5"]], 30],
        "#99FF66",
        ["<=", ["to-number", ["get", "PM2.5"]], 40],
        "#FFD700",
        ["<=", ["to-number", ["get", "PM2.5"]], 48],
        "#FF5050",
        "#000000"
      ]
    }
  });

  document.getElementById("slider").addEventListener("input", (event) => {
    const value = parseInt(event.target.value);
    let year, month;

    if (value <= 2) {
      year = 2023;
      month = 10 + value;
    } else if (value <= 14) {
      year = 2024;
      month = value - 2;
    } else {
      year = 2025;
      month = 1;
    }

    const formattedMonth = `${year}-${("0" + month).slice(-2)}`;
    console.log("Current selected month:", formattedMonth);

    selectedMonth = formattedMonth;

    if (map.getLayer("test1")) {
      updateMap(selectedZone, selectedMonth);
    }

    document.getElementById("active-month").innerText = formattedMonth;
  });
});

document.getElementById("zone").addEventListener("change", function () {
  selectedZone = this.value;
  updateMap(selectedZone, selectedMonth);
});

let selectedZone = "all";
let selectedMonth = "2023-11";

function updateMap(zone, month) {
  console.log(`Filtering data for Zone: ${zone}, Month: ${month}`);

  if (map.getLayer("test1")) {
    let filters = ["all", ["==", ["to-string", ["get", "Month"]], month]];

    if (zone !== "all") {
      filters.push(["==", ["to-string", ["get", "Zone"]], zone]);
    }

    map.setFilter("test1", filters);
  }
}

// Radio button interaction code goes below
map.on("click", (event) => {
  // Get the features at the clicked location
  const features = map.queryRenderedFeatures(event.point, {
    layers: ["test1"] // Ensure this is the correct layer name
  });
  console.log("Features at clicked point:", features);

  if (!features.length) {
    console.log("No features found at this location.");
    return;
  }

  const feature = features[0];

  // Create a popup with information about the feature
  const popup = new mapboxgl.Popup({ offset: [0, -5], className: "my-popup" })
    .setLngLat(feature.geometry.coordinates)
    .setHTML(
      `
      <h3>${feature.properties.city}</h3>
      <p><strong>Date:</strong> ${feature.properties.Date}</p>
      <p><strong>Site Type:</strong> ${feature.properties["Site Type"]}</p>
      <p><strong>Zone:</strong> ${feature.properties.Zone}</p>
      <p><strong>PM2.5:</strong> ${feature.properties["PM2.5"]}</p>
      <p><strong>Unit:</strong> ${feature.properties.Status}</p>
    `
    )
    .addTo(map);
});

map.addControl(new mapboxgl.NavigationControl(), "bottom-right");

map.addControl(
  new mapboxgl.GeolocateControl({
    positionOptions: { enableHighAccuracy: true },
    trackUserLocation: true,
    showUserHeading: true
  }),
  "bottom-right"
);

const geocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken,
  mapboxgl: mapboxgl,
  marker: false,
  placeholder: "Search for places in Glasgow",
  proximity: { longitude: -4.2518, latitude: 55.8642 },
  language: "en"
});

map.addControl(geocoder, "top-right");
