mapboxgl.accessToken = 'pk.eyJ1IjoianNlcmZhc3MiLCJhIjoiY2w5eXA5dG5zMDZydDN2cG1zeXduNDF5eiJ9.6-9p8CxqQlWrUIl8gSjmNw'
const map = new mapboxgl.Map({
container: 'map', // container ID
style: 'mapbox://styles/mapbox/satellite-v9', // style URL
center: [-121.1316, 48.5539], // starting position [lng, lat]
zoom: 8, // starting zoom
pitch: 85,
//bearing: 80,
projection: 'globe', //globe projection rather than the default web mercator
attributionControl: false
});
//listener => replaces function
map.on('load', () => {
    // Add a source for the trails feature class.
    map.addSource('trails', {
        type: 'geojson',
        data: 'data/NorthCascadesTrails.geojson' 
    });

    map.addLayer({
      'id': 'trails-layer',
      'type': 'line',
      'source': 'trails',
      'layout': {
        // Make the layer visible by default.
        'visibility': 'visible'
        },
      'paint': {
          'line-width': 3,
          'line-color': ['match', ['get', 'TRLCLASS'],
          'Class 1: Minimally Developed', 'red',
          'Class 2: Moderately Developed', 'orange',
          'Class 3: Developed', 'yellow',
          'Class 4: Highly Developed', 'light green',
          'Class 5: Fully Developed', 'green',
          /*else,*/'purple',
      ]
      }
    });  
    // add the boundary file
    map.addSource('bounds', {
        type: 'geojson',
        data: 'data/NorthCascadesBounds.geojson'
    });
    map.addLayer({
      'id': 'boundary-line',
      'type': 'line',
      'source': 'bounds',
      'layout': {
        // Make the layer visible by default.
        'visibility': 'visible',
        },
      'paint': {
          'line-width': 4,
          'line-color': 'lightblue',
          'line-opacity': .4,
      }
    });
    // add the boundary polygon
    map.addSource('boundspoly', {
        'type': 'geojson',
        'data':'data/NorthCascadesBoundsPoly.geojson'
    });
    map.addLayer({
        'id': 'boundary-polygon',
        'type': 'fill',
        'source': 'boundspoly', // reference the data source
        'layout': {
           // Make the layer visible by default.
           'visibility': 'visible',  
        },
        'paint': {
        'fill-color': 'lightblue', // brown color fill
        'fill-opacity': 0.2
        }
        });
    // Adding a control to let the user adjust their view
    const navControl = new mapboxgl.NavigationControl({
        visualizePitch: true
    });
    map.addControl(navControl, 'top-right');
    // Adding Geo Location
    map.addControl(new mapboxgl.GeolocateControl({
        positionOptions: {
            enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserHeading: true
    }));
    // Adding Scale Control
    const scale = new mapboxgl.ScaleControl({
        maxWidth: 150,
        unit: 'miles'
    });
    map.addControl(scale);
    scale.setUnit('imperial');
    // Adding Attribution Control
    map.addControl(new mapboxgl.AttributionControl
        ({customAttribution: 'Map design by Joshua Serfass, Data Retrieved From: https://public-nps.opendata.arcgis.com/, Background Photo: Joshua Serfass',
          compact: true,
        }))
    });

// When a click event occurs on a feature in the trails layer, open a popup at the
// location of the feature, with description HTML from its properties.
map.on('click', 'trails-layer', (e) => {
    new mapboxgl.Popup()
    .setLngLat(e.lngLat)
    .setHTML("<b>Trail Name: </b>" + e.features[0].properties.TRLNAME + "<br><b>Trail Class: </b>" + e.features[0].properties.TRLCLASS + 
    "<br><b>Trail Length (Miles): </b>" + e.features[0].properties.MILES)
    .addTo(map);
    });
     
    // Change the cursor to a pointer when the mouse is over the trails layer.
    map.on('mouseenter', 'trails-layer', () => {
    map.getCanvas().style.cursor = 'pointer';
    });
     
    // Change it back to a pointer when it leaves.
    map.on('mouseleave', 'trails-layer', () => {
    map.getCanvas().style.cursor = '';
    });
// add terrain layer
map.on('load', function () {
    map.addSource('mapbox-dem', {
        "type": "raster-dem",
        "url": "mapbox://mapbox.mapbox-terrain-dem-v1",
        'tileSize': 512,
        'maxzoom': 15,
    });
     map.setTerrain({"source": "mapbox-dem", "exaggeration": 1.5})
     map.setFog({
        'range': [-1, 2],
        'horizon-blend': 0.3,
        'color': 'white',
        'high-color': '#add8e6',
        'space-color': '#d8f2ff',
        'star-intensity': 0.0
    });
    });
// After the last frame rendered before the map enters an "idle" state.
map.on('idle', () => {    
    // If these two layers were not added to the map, abort
    if (!map.getLayer('trails-layer') || !map.getLayer('boundary-line')|| !map.getLayer('boundary-polygon')) {
    return;
    }


    // Enumerate ids of the layers.
    const toggleableLayerIds = ['trails-layer', 'boundary-line', 'boundary-polygon'];
 
    // Set up the corresponding toggle button for each layer.
    for (const id of toggleableLayerIds) {
        // Skip layers that already have a button set up.
        if (document.getElementById(id)) {
            continue;
        }
    
        // Create a link.
        const link = document.createElement('a');
        link.id = id;
        link.href = '#';
        link.textContent = id;
        link.className = 'active';
        
        // Show or hide layer when the toggle is clicked.
        link.onclick = function (e) {
            const clickedLayer = this.textContent;
            e.preventDefault();
            e.stopPropagation();
        
            const visibility = map.getLayoutProperty(
                clickedLayer,
                'visibility'
        );
        
        // Toggle layer visibility by changing the layout object's visibility property.
        if (visibility === 'visible') {
            map.setLayoutProperty(clickedLayer, 'visibility', 'none');
            this.className = '';
        } else {
            this.className = 'active';
            map.setLayoutProperty(
                clickedLayer,
                'visibility',
                'visible'
            );
        }
        };    
        
            const layers = document.getElementById('menu');
            layers.appendChild(link);
        }
});        

    
