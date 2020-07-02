//zc,Load Geohash map from blockchain
// Load data tiles from a blockchain data source
L.GeohashLayer.blockchain = L.GeohashLayer.extend({
    _requests: [],
    _addTile: function (tilePoint) {
    		 var tile = { datum: null, processed: false };	 			
	    		 this._tiles[tilePoint] = tile;
	         this._loadTile(tile, tilePoint);
    },
    // XMLHttpRequest handler; closure over the XHR object, the layer, and the tile
    _xhrHandler: function (req, layer, tile, tilePoint) {
        return function () {
            if (req.readyState !== 4) {
                return;
            }
            var s = req.status;
            if ((s >= 200 && s < 300 && s != 204) || s === 304) {
                tile.datum = JSON.parse(req.responseText);
                layer._tileLoaded(tile, tilePoint);
            } else {
                layer._tileLoaded(tile, tilePoint);
            }
        };
    },
    // Load the requested geohash map via AJAX
    _loadTile: function (tile, tilePoint) {
       //        this._adjustTilePoint(tilePoint);
       var layer = this;
//从服务器获取数据
//        var req = new XMLHttpRequest();
//        this._requests.push(req);
//        req.onreadystatechange = this._xhrHandler(req, layer, tile, tilePoint);
//        req.open('GET', this.getTileUrl(tilePoint), true);
//        req.send();

//临时测试数据
	var tmptilePoint = ["wvsvz"];
	var tiledata = this.jsReadFiles(tmptilePoint);
	tile.datum = tiledata;
	layer._tileLoaded(tile, tilePoint);	
    },
      jsReadFiles:function(tilePoint){
      	var geohash1_name=["0","wvsvz"];
 				
      	var geohash1_data = [
      	{"type":"FeatureCollection","totalFeatures":0,"features":[],"crs":null},
//geohash_data-----------------------------------------
//china-geohash14-----------------------------------tertiary
{"crs":{"properties":{"name":"urn:ogc:def:crs:EPSG::4326"},"type":"name"},"features":[
{"properties":{"highway":"trunk","adcode":460000,"name":"海南省"},"geometry":{"coordinates":[[["w7t9j","w7t9r","w7tc5","w7tct","w7w1b","w7w19","w7w1w","w7w3c","w7w64","w7w6j","w7w6q","w7wd5","w7wd7","w7wdx","w7wf0","w7wcf","w7wcv","w7qzx","w7qzh","w7qyd","w7qwp","w7qsv","w7qdu","w7qdd","w7qd4","w7q6n","w7q3u","w7q33","w7q29","w7q0r","w7q0t","w7q06","w7np9","w7jzj","w7jz8","w7jxy","w7jxg","w7m85","w7m2p","w7m2t","w7m2c","w7m30","w7m60","w7m5p","w7m78","w7mhz","w7mjx","w7mq0","w7mq7","w7mx9","w7t8k","w7t8e","w7t9j"]],[["w92gr","w935d","w93hq","w93kb","w93m5","w93mn","w93kw","w93k5","w9376","w935j","w934c","w92gr"]],[["w6zkk","w6zk5","w6zk4","w6zkk"]],[["w9943","w9945","w991f","w9943"]],[["w6zsy","w6zsu","w6ztj","w6zsy"]],[["w9dr5","w9drt","w9drj","w9dr5"]],[["w3mcf","w3mfk","w3mgp","w3q50","w3q4u","w3q4t","w3q4f","w3mfx","w3mcs","w3mcf"]],[["wdb52","wdb56","wdb51","w6zgn","wdb52"]],[["w9cms","w9cqp","w9cmw","w9cms"]],[["w6zut","wdbhb","wdbh8","w6zut"]],[["w9fg4","w9ffg","w9ffy","w9ffs","w9ffd","w9fg4"]],[["w93zs","w96p8","w93zr","w93zm","w93zs"]],[["w3qht","w3qhy","w3qm0","w3qk8","w3qhq","w3qht"]],[["w9cw9","w9cx5","w9cxh","w9cw9"]],[["w3qw1","w3qwk","w3qw5","w3qtc","w3qw1"]],[["w9gku","w9gmn","w9gkx","w9gku"]],[["we2vm","we3j2","we2uz","we2vm"]]],"type":"MultiPolygon"},"type":"Feature"}
],"totalFeatures":35,"type":"FeatureCollection"}
      	];

      	var i=0;
      	for(i=0;i<geohash1_name.length;i++){
      		if(tilePoint == geohash1_name[i]){
      				break;
      			}
      	}
      	//暂时设置，当数据不存在时，赋予空值
      	if(i==geohash1_name.length){
      		i = 0;
      	}
      	return geohash1_data[i];
      },
    _reset: function () {
        L.GeohashLayer.prototype._reset.apply(this, arguments);
        for (var i = 0; i < this._requests.length; i++) {
            this._requests[i].abort();
        }
        this._requests = [];
    },
    _update: function () {
        if (this._map && this._map._panTransition && this._map._panTransition._inProgress) { return; }
        if (this._tilesToLoad < 0) { this._tilesToLoad = 0; }
        L.GeohashLayer.prototype._update.apply(this, arguments);
    }
});

L.GeohashLayer.GeoJSON = L.GeohashLayer.blockchain.extend({
	// Store each GeometryCollection's layer by key, if options.unique function is present
    _keyLayers: {},

    // Used to calculate svg path string for clip path elements
    _clipPathRectangles: {},

    initialize: function (url, options, geojsonOptions) {
        L.GeohashLayer.blockchain.prototype.initialize.call(this, url, options);
        this.geojsonLayer = new L.GeoJSON(null, geojsonOptions);
    },
    onAdd: function (map) {
        this._map = map;
        L.GeohashLayer.blockchain.prototype.onAdd.call(this, map);
        map.addLayer(this.geojsonLayer);
    },
    onRemove: function (map) {
        map.removeLayer(this.geojsonLayer);
        L.GeohashLayer.blockchain.prototype.onRemove.call(this, map);
    },
    _reset: function () {
        this.geojsonLayer.clearLayers();
        this._keyLayers = {};
        this._removeOldClipPaths();
        L.GeohashLayer.blockchain.prototype._reset.apply(this, arguments);
    },

    // Remove clip path elements from other earlier zoom levels
    _removeOldClipPaths: function  () {
        for (var clipPathId in this._clipPathRectangles) {
            var clipPathZXY = clipPathId.split('_').slice(1);
            var zoom = parseInt(clipPathZXY[0], 10);
            if (zoom !== this._map.getZoom()) {
                var rectangle = this._clipPathRectangles[clipPathId];
                this._map.removeLayer(rectangle);
                var clipPath = document.getElementById(clipPathId);
                if (clipPath !== null) {
                    clipPath.parentNode.removeChild(clipPath);
                }
                delete this._clipPathRectangles[clipPathId];
            }
        }
    },

    // Recurse LayerGroups and call func() on L.Path layer instances
    _recurseLayerUntilPath: function (func, layer) {
        if (layer instanceof L.Path) {
            func(layer);
        }
        else if (layer instanceof L.LayerGroup) {
            // Recurse each child layer
            layer.getLayers().forEach(this._recurseLayerUntilPath.bind(this, func), this);
        }
    },

    _clipLayerToTileBoundary: function (layer, tilePoint) {
        // Only perform SVG clipping if the browser is using SVG
        if (!L.Path.SVG) { return; }
        if (!this._map) { return; }

        if (!this._map._pathRoot) {
            this._map._pathRoot = L.Path.prototype._createElement('svg');
            this._map._panes.overlayPane.appendChild(this._map._pathRoot);
        }
        var svg = this._map._pathRoot;

        // create the defs container if it doesn't exist
        var defs = null;
        if (svg.getElementsByTagName('defs').length === 0) {
            defs = document.createElementNS(L.Path.SVG_NS, 'defs');
            svg.insertBefore(defs, svg.firstChild);
        }
        else {
            defs = svg.getElementsByTagName('defs')[0];
        }

        // Create the clipPath for the tile if it doesn't exist
        var clipPathId = 'tileClipPath_' + tilePoint.z + '_' + tilePoint.x + '_' + tilePoint.y;
        var clipPath = document.getElementById(clipPathId);
        if (clipPath === null) {
            clipPath = document.createElementNS(L.Path.SVG_NS, 'clipPath');
            clipPath.id = clipPathId;

            // Create a hidden L.Rectangle to represent the tile's area
            var tileSize = this.options.tileSize,
            nwPoint = tilePoint.multiplyBy(tileSize),
            sePoint = nwPoint.add([tileSize, tileSize]),
            nw = this._map.unproject(nwPoint),
            se = this._map.unproject(sePoint);
            this._clipPathRectangles[clipPathId] = new L.Rectangle(new L.LatLngBounds([nw, se]), {
                opacity: 0,
                fillOpacity: 0,
                clickable: false,
                noClip: true
            });
            this._map.addLayer(this._clipPathRectangles[clipPathId]);

            // Add a clip path element to the SVG defs element
            // With a path element that has the hidden rectangle's SVG path string  
            var path = document.createElementNS(L.Path.SVG_NS, 'path');
            var pathString = this._clipPathRectangles[clipPathId].getPathString();
            path.setAttribute('d', pathString);
            clipPath.appendChild(path);
            defs.appendChild(clipPath);
        }

        // Add the clip-path attribute to reference the id of the tile clipPath
        this._recurseLayerUntilPath(function (pathLayer) {
            pathLayer._container.setAttribute('clip-path', 'url(#' + clipPathId + ')');
        }, layer);
    },

    // Add a geojson object from a tile to the GeoJSON layer
    // * If the options.unique function is specified, merge geometries into GeometryCollections
    // grouped by the key returned by options.unique(feature) for each GeoJSON feature
    // * If options.clipTiles is set, and the browser is using SVG, perform SVG clipping on each
    // tile's GeometryCollection 
    addTileData: function (geojson, tilePoint) {
        var features = L.Util.isArray(geojson) ? geojson : geojson.features,
            i, len, feature;

        if (features) {
            for (i = 0, len = features.length; i < len; i++) {
                // Only add this if geometry or geometries are set and not null
                feature = features[i];
                if (feature.geometries || feature.geometry || feature.features || feature.coordinates) {
                    this.addTileData(features[i], tilePoint);
                }
            }
            return this;
        }

        var options = this.geojsonLayer.options;

        if (options.filter && !options.filter(geojson)) { return; }

        var parentLayer = this.geojsonLayer;
        var incomingLayer = null;
        if (this.options.unique && typeof(this.options.unique) === 'function') {
            var key = this.options.unique(geojson);

            // When creating the layer for a unique key,
            // Force the geojson to be a geometry collection
            if (!(key in this._keyLayers && geojson.geometry.type !== 'GeometryCollection')) {
                geojson.geometry = {
                    type: 'GeometryCollection',
                    geometries: [geojson.geometry]
                };
            }

            // Transform the geojson into a new Layer
            try {
                incomingLayer = L.GeoJSON.geometryToLayer(geojson, options.pointToLayer, options.coordsToLatLng);
            }
            // Ignore GeoJSON objects that could not be parsed
            catch (e) {
                return this;
            }

            incomingLayer.feature = L.GeoJSON.asFeature(geojson);
            // Add the incoming Layer to existing key's GeometryCollection
            if (key in this._keyLayers) {
                parentLayer = this._keyLayers[key];
                parentLayer.feature.geometry.geometries.push(geojson.geometry);
            }
            // Convert the incoming GeoJSON feature into a new GeometryCollection layer
            else {
                this._keyLayers[key] = incomingLayer;
            }
        }
        // Add the incoming geojson feature to the L.GeoJSON Layer
        else {
            // Transform the geojson into a new layer
            try {
                incomingLayer = L.GeoJSON.geometryToLayer(geojson, options.pointToLayer, options.coordsToLatLng);
            }
            // Ignore GeoJSON objects that could not be parsed
            catch (e) {
                return this;
            }
            incomingLayer.feature = L.GeoJSON.asFeature(geojson);
        }
        incomingLayer.defaultOptions = incomingLayer.options;

        this.geojsonLayer.resetStyle(incomingLayer);

        if (options.onEachFeature) {
            options.onEachFeature(geojson, incomingLayer);
        }
        parentLayer.addLayer(incomingLayer);

        // If options.clipTiles is set and the browser is using SVG
        // then clip the layer using SVG clipping
        if (this.options.clipTiles) {
            this._clipLayerToTileBoundary(incomingLayer, tilePoint);
        }
        return this;
    },

    _tileLoaded: function (tile, tilePoint) {
        L.GeohashLayer.blockchain.prototype._tileLoaded.apply(this, arguments);
        if (tile.datum === null) { 
        	//alert(tilePoint);
        	return null; }
        this.addTileData(tile.datum, tilePoint);
    }
}); 
 
