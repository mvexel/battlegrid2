import 'ol/ol.css';
import {Map, View} from 'ol';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import VectorSource from 'ol/source/Vector';
import {bbox as bboxStrategy} from 'ol/loadingstrategy';
import Stamen from 'ol/source/Stamen';
import GeoJSON from 'ol/format/GeoJSON';
import {Stroke, Fill, Style} from 'ol/style';
import {fromLonLat, toLonLat} from 'ol/proj';

const cellClasses = [
  {'bounds': [-1, 0], 'color': [100, 100, 100, 0], 'legend': 'done!'},
  {'bounds': [0, 0.05], 'color': [253, 231, 37, 0.5], 'legend': 'nearly done'},
  {'bounds': [0.05, 0.10], 'color': [93, 201, 98, 0.5], 'legend': 'pretty good'},
  {'bounds': [0.10, 0.20], 'color': [32, 144, 141, 0.5], 'legend': 'so-so'},
  {'bounds': [0.20, 0.40], 'color': [58, 82, 139, 0.5], 'legend': 'pretty bad'},
  {'bounds': [0.40, 100], 'color': [68, 1, 84, 0.5], 'legend': 'very bad'},
];

var featureClassParameters = null;
var selected = null;
var status = document.getElementById('status');
var actions = document.getElementById('actions');

var selectedStyle = new Style({
  fill: new Fill({color: [200, 200, 200, 0.5]}),
  stroke: new Stroke({color: [0, 0, 0], width: 2})
})

// look up and return the 
function getClassParametersFor(feature) {
  const quality = feature.get('quality');
  for (var i = cellClasses.length - 1; i >= 0; i--) {
    const bounds = cellClasses[i].bounds;
    if (bounds[0] < quality && quality <= bounds[1])
      return cellClasses[i];
  }
  return null;
}

function getLonLatBoundingBox(feature) {
  const featureGeometry = feature.getGeometry();
  if (featureGeometry !== null) {
    const geometryExtent = featureGeometry.getExtent();
    if (geometryExtent !== null) {
      return [
        toLonLat([geometryExtent[0], geometryExtent[1]]),
        toLonLat([geometryExtent[2], geometryExtent[3]])
      ];
    }
  }
  return null;
}

function generateJosmLink(feature) {
  const extent = getLonLatBoundingBox(feature);
  // &search=${escape('type:way highway timestamp:2000-01-01/2010-01-01')}
  return `http://localhost:8111/load_and_zoom?left=${extent[0][0]}&right=${extent[1][0]}&bottom=${extent[0][1]}&top=${extent[1][1]}&layer_name=${feature.getId()}`;
}

function generateIdLink(feature) {
  const extent = getLonLatBoundingBox(feature);
  console.log(extent);
  const center_x = (extent[0][0] + extent[1][0]) / 2;
  const center_y = (extent[0][1] + extent[1][1]) / 2;
  console.log(center_x, center_y);
  return `https://openstreetmap.org/edit?editor=id#map=16/${center_y}/${center_x}`;
}

// generate dynamic fill style for battlegrid cells
function createBattleGridCellStyle(feature) {
  var cellClass = getClassParametersFor(feature);
  var color = cellClass.color;
  var fill = new Fill({
    color: color
  });
  return new Style({
    geometry: feature.getGeometry(),
    fill: fill,
  });
}

var vectorSource = new VectorSource({
  format: new GeoJSON(),
  url: function(extent) {
    const bottomleft = toLonLat([extent[0], extent[1]]);
    const topright = toLonLat([extent[2], extent[3]]);
    return `http://localhost:5000/coverage?minlon=${bottomleft[0]}&minlat=${bottomleft[1]}&maxlon=${topright[0]}&maxlat=${topright[1]}`
  },
  strategy: bboxStrategy
});

var battleGridWFSLayer = new VectorLayer({
  source: vectorSource,
  style: createBattleGridCellStyle
});

var baseMapRasterTileLayer = new TileLayer({
  //source: new OSM()
  source: new Stamen({layer: 'toner'})
});

var mapView = new View({
    center: fromLonLat([-80.5916, 38.8750]),
    maxZoom: 19,
    zoom: 8
})

const map = new Map({
  layers: [baseMapRasterTileLayer, battleGridWFSLayer],
  target: document.getElementById('map'),
  view: mapView
});

map.on('click', function(e) {
  if (selected !== null) {
    selected.setStyle(undefined);
    selected = null;
  }

  map.forEachFeatureAtPixel(e.pixel, function(f) {
    selected = f;
    f.setStyle(selectedStyle);
    featureClassParameters = getClassParametersFor(selected);
    mapView.fit(selected.getGeometry(), {
      duration: 500,
      padding: [50, 50, 50, 50]
    });
    return true;
  });

  if (selected) {
    status.innerHTML = `This is cell <strong>${selected.getId()}</strong>. This area looks ${featureClassParameters.legend}!`;
    editJosmHref.href = generateJosmLink(selected);
    editIdHref.href = generateIdLink(selected);
    actions.style.display = 'block';
  } else {
    status.innerHTML = '&nbsp;';
  }
});