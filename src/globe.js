import React from 'react'

import './globe.css';
import Url from 'url-parse';
import axios from 'axios';
import wellknown from 'wellknown';


import WorldWind from '@nasaworldwind/worldwind';



// ... other declarations here

class Globe extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            wwdCreated: false,
            currentProjection: (props.hasOwnProperty('projection'))?props.projection:"Equirectangular"
            //supportedProjections = [ "3D", "Equirectangular", "Mercator" ]
        };

        //this.dropKML = this.dropKML.bind(this);
        this.addKML = this.addKML.bind(this);
        this.handleKey = this.handleKey.bind(this);
        this.toggleProjection = this.toggleProjection.bind(this);
        this.clearGlobe = this.clearGlobe.bind(this);
        this.clearLastLayer = this.clearLastLayer.bind(this);
        this.handlePaste = this.handlePaste.bind(this);
        this.addHeatMap = this.addHeatMap.bind(this);
        this.handleDropFiles = this.handleDropFiles.bind(this);
        this.handleDropText = this.handleDropText.bind(this);
    }

    showSettings (event) {
        event.preventDefault();
      }
    

    handleKey(e) {
        switch (e.key) {
            case "p": {
                this.toggleProjection();
                break;
            }
            case "c": {
                this.clearLastLayer();
                break;
            }
            case "C": {
                this.clearGlobe();
                break;
            }
            default:
                break;
        }
    }

    clearGlobe() {
        let LayersToRemove = this.wwd.layers;
        console.log("nb layers to remove:"+LayersToRemove.length);
        //LayersToRemove.shift();
        for(let i=LayersToRemove.length;i>1;i--) {
            this.wwd.removeLayer(LayersToRemove.pop());        }
        this.wwd.redraw();
    }

    clearLastLayer() {
        let LayersToRemove = this.wwd.layers;
        this.wwd.removeLayer(LayersToRemove.pop());
        this.wwd.redraw();
    }

    addKML(url,context) {
        var kmlFilePromise = new WorldWind.KmlFile(url, []);
        kmlFilePromise.then(function (kmlFile) {
            var renderableLayer = new WorldWind.RenderableLayer("Surface Shapes");
            renderableLayer.addRenderable(kmlFile);
            context.wwd.removeLayer(context.state.kmlLayer);

            context.wwd.addLayer(renderableLayer);
            context.wwd.redraw();
            context.setState({kmlLayer: renderableLayer});
        });

    }

    addJson(data, context) {
        console.log(data);
        let jsonObject = JSON.parse(data);
        if(!Array.isArray(jsonObject)) {
            this.addGeoJson(data,this);
        } else {
            if(jsonObject[0].hasOwnProperty('count') && jsonObject[0].hasOwnProperty('lat') && jsonObject[0].hasOwnProperty('lon') ) {
                //console.log("heat");
                this.addHeatMap(jsonObject,this);
            }
        }

    }

    addGeoJson(url, context) {
        function shapeConfigurationCallback(geometry, properties) {
            var configuration = {};
            configuration.attributes = new WorldWind.ShapeAttributes(null);
            configuration.attributes.interiorColor = new WorldWind.Color(0, 1, 1, 0.2);
            configuration.attributes.outlineColor = new WorldWind.Color(1, 1, 1, 1);
            return configuration;
        }
        function loadCompleteCallback() {
            context.wwd.redraw();
        }


        let renderableLayer = new WorldWind.RenderableLayer("GeoJSON");
        context.wwd.addLayer(renderableLayer);
        let geoJson = new WorldWind.GeoJSONParser(url);
        geoJson.load(loadCompleteCallback, shapeConfigurationCallback, renderableLayer);
    }

    addWkt(wktString, context) {
        function shapeConfigurationCallback(geometry, properties) {
            var configuration = {};
            configuration.attributes = new WorldWind.ShapeAttributes(null);
            configuration.attributes.interiorColor = new WorldWind.Color(0, 1, 1, 0.2);
            configuration.attributes.outlineColor = new WorldWind.Color(1, 1, 1, 1);
            return configuration;
        }

        let renderableLayer = new WorldWind.RenderableLayer("WKT");
        context.wwd.addLayer(renderableLayer);
        let wkt = new WorldWind.Wkt(wktString);
        wkt.load(null, shapeConfigurationCallback, renderableLayer);
        context.wwd.redraw();
    }

    addWMS(wmsurl, context) {
        var loc = new Url(wmsurl.replace(/\s|\u200B/g, ''),true); // removes spaces which might be added when dragging a URL directly from a browser console log)
        console.log(loc);
        console.log("URL without spaces: " + wmsurl.replace(/\s/g, ''));
        console.log("Should add background WMS");
        console.log(loc.query);
        console.log("format: " + loc.query.FORMAT);
        console.log(("FORMAT" in loc.query));
        var time = ("time" in loc.query)?loc.query.time:loc.query.TIME
        console.log("time: " + time);
        var wmsConfig = {
            service: loc.protocol + "//" + loc.host + loc.pathname,
            layerNames: ("layers" in loc.query)?loc.query.layers:loc.query.LAYERS,
            numLevels: 19,
            format: ("format" in loc.query)?loc.query.format:loc.query.FORMAT,
            coordinateSystem: ("crs" in loc.query)?loc.query.crs:loc.query.CRS,
            size: 256,
            sector: WorldWind.Sector.FULL_SPHERE,
            levelZeroDelta : new WorldWind.Location(90, 90)
        };
        console.log(wmsConfig);

        let renderableLayer = new WorldWind.WmsLayer(wmsConfig,time);
        context.wwd.addLayer(renderableLayer);
        context.wwd.redraw();
    }


    addHeatMap(jsonObject, context) {
        var locations = [];
        for(let i=0;i<jsonObject.length;i++) {
            if(jsonObject[i].type == "GRDH") {
                locations.push(                
                    new WorldWind.MeasuredLocation(
                        jsonObject[i].lon,
                        jsonObject[i].lat,
                        jsonObject[i].count
                    )
                );
            }
            //console.log(locations.length);
            
        }
        context.wwd.addLayer(new WorldWind.HeatMapLayer("HeatMap", locations));
        context.wwd.redraw();
    }

    addGeoTiff(url, context) {
        var geotiffObject = new WorldWind.GeoTiffReader(url);

        geotiffObject.readAsImage(function (canvas) {
            var surfaceGeoTiff = new WorldWind.SurfaceImage(
                geotiffObject.metadata.bbox,
                new WorldWind.ImageSource(canvas)
            );

            var geotiffLayer = new WorldWind.RenderableLayer("GeoTiff");
            geotiffLayer.addRenderable(surfaceGeoTiff);
            context.wwd.addLayer(geotiffLayer);
        });
    }


    mapFromHubOpenSearch(item) {
	
        function reshuffle(array) {
            let json = {};
            for(let i=0; i < array.length; i++) {
                json[array[i].name] =  array[i].content;
            }
            return json;
        }
    
        try {
            let hubItem = {};
            if(item.date) Object.assign(hubItem,reshuffle(item.date));
            if(item.int) Object.assign(hubItem,reshuffle(item.int));
            if(item.double) Object.assign(hubItem,reshuffle(item.double));
            if(item.str) Object.assign(hubItem,reshuffle(item.str));
    
    
            var sizeArray = hubItem.size.split(" ");
            var sizeInBytes;
            switch (sizeArray[1]) {
                case "B":
                    sizeInBytes = Math.round(parseFloat(sizeArray[0]));
                    break;
                case "MB":
                    sizeInBytes = Math.round(parseFloat(sizeArray[0])*1024);
                    break;
                case "GB":
                    sizeInBytes = Math.round(parseFloat(sizeArray[0])*1024*1024);
                    break;
                case "TB":
                    sizeInBytes = Math.round(parseFloat(sizeArray[0])*1024*1024*1024);
                    break;
            }
            
    
            var newItem = {
                id: item.title,
                geometry: wellknown(hubItem.footprint),
                type: "Feature",
                properties: {
                    updated: new Date(hubItem.ingestiondate),
                    title: item.title,
                    name: item.title,
                    date: hubItem.beginposition  +'/'+  hubItem.endposition,
                    links: {
                        data: [{
                            href: item.link[0].href,
                        }]
                    },
                    earthObservation: {
                        parentIdentifier: "",
                        status: "ARCHIVED",
                        acquisitionInformation: [{
                            platform: {
                                platformShortName: hubItem.platformname,
                                platformSerialIdentifier: hubItem.platformserialidentifier
                            },
                            sensor: {
                                instrument: hubItem.instrumentshortname,
                                operationalMode: hubItem.sensoroperationalmode
                            },
                            acquisitionParameter: {
                                acquisitionStartTime: new Date(hubItem.beginposition),
                                acquisitionStopTime: new Date(hubItem.endposition),
                                relativePassNumber: parseInt(hubItem.relativeorbitnumber),
                                orbitNumber: parseInt(hubItem.orbitnumber),
                                startTimeFromAscendingNode: null,
                                stopTimeFromAscendingNode: null,
                                orbitDirection: hubItem.orbitdirection
    
                            }
                        }],
                        productInformation: {
                            productType: hubItem.producttype,
                            //timeliness: indexes["product"]["Timeliness Category"],
                            size: sizeInBytes
                        }
                    }
                }
            };
    
            //console.log("item: "+JSON.stringify(newItem));
    
            return newItem;
        } catch (err) {
            console.log("error: "+err.message);
            return null;
        }
    }



    addDataHubOpenSearchResults(url, context, mapFunction) {
        axios.get(url,{ crossdomain: true }).then(response => handleDHuSResponse(response,mapFunction));

        var i = 0;
        var intervalId = setInterval(function(){
        if(i === 1000){
            clearInterval(intervalId);
        }
        console.log("Repeat: "+i);
        axios.get(url,{ crossdomain: true }).then(response => handleDHuSResponse(response,mapFunction));
        i++;
        }, 10000);

        function loadCompleteCallback() {
            context.wwd.redraw();
        }
        //function shapeConfigurationCallback() {}
        function shapeConfigurationCallback(geometry, properties) {

            //console.log(properties);
            var configuration = {};
            var name = properties.name || properties.Name || properties.NAME;
            if (name) {
                configuration.name = name;
            }
        
            if (geometry.isPointType() || geometry.isMultiPointType()) {
              configuration.attributes = new WorldWind.PlacemarkAttributes();
        
              if (
                properties && (properties.name || properties.Name || properties.NAME)
              ) {
                configuration.name = properties.name || properties.Name ||
                  properties.NAME;
              }
              if (properties && properties.POP_MAX) {
                var population = properties.POP_MAX;
                configuration.attributes.imageScale = 0.01 * Math.log(population);
              }
            } else if (
              geometry.isLineStringType() || geometry.isMultiLineStringType()
            ) {
              configuration.attributes = new WorldWind.ShapeAttributes(null);
              configuration.attributes.drawOutline = true;
              configuration.attributes.outlineColor = new WorldWind.Color(
                0.1 * configuration.attributes.interiorColor.red,
                0.3 * configuration.attributes.interiorColor.green,
                0.7 * configuration.attributes.interiorColor.blue,
                1
              );
              configuration.attributes.outlineWidth = 1;
            } else if (geometry.isPolygonType() || geometry.isMultiPolygonType()) {
              configuration.attributes = new WorldWind.ShapeAttributes(null);
        
              configuration.attributes.interiorColor = new WorldWind.Color(0, 0.8, 0.8, 0.7);
              // Paint the outline in a darker variant of the interior color.
              configuration.attributes.outlineColor = new WorldWind.Color(0, 0.8, 0.8, 0.7);
        
              configuration.attributes.outlineWidth = 1;
                
        
              configuration.attributes.applyLighting = true;
              configuration.userProperties = properties;
            }
            return configuration;
        }
        
        
        function handleDHuSResponse(json,mapFunction) {
            
            let features = [];
            if (json.data.feed.entry) {
                console.log(json.data.feed.entry.length+" items found");
                try {
                    features = json.data.feed.entry.map(function(a) {return mapFunction(a);});
                } catch (err) {
                    console.log(json);
                    console.log("Error: ");
                    console.log(err);
                    return;
                }
                //console.log(JSON.stringify(features));
                let geojson = {   
                        type: "FeatureCollection",
                        id: "search",
                        properties: {
                            totalResults: json.data.feed["opensearch:totalResults"],
                            startIndex: (json.data.feed["opensearch:startIndex"])?json.data.feed["opensearch:startIndex"]:1,
                            itemsPerPage: json.data.feed["opensearch:itemsPerPage"],
                            title: "DHuS search response",
                            updated: new Date()
                        },
                        features: features
                    };
                //console.log(JSON.stringify(geojson));
                //let geometryCollectionGeoJSON = new WorldWind.GeoJSONParser(JSON.stringify(geojson));
                //let geometryCollectionLayer = new WorldWind.RenderableLayer("DHuSOpenSearchResults");
                class myGeoJSONParser extends WorldWind.GeoJSONParser {
                    constructor(json) {
                        super(json)
                    }
                    addRenderablesForPolygon(layer, geometry, properties) {
                        var name = properties.name || properties.Name || properties.NAME;   
                        var existingRenderable = null;
                        for (let i=0;i<layer.renderables.length;i++) {
                            if(layer.renderables[i].displayName == name) existingRenderable = layer.renderables[i];
                        }

                        if(!existingRenderable) {
                            //console.log("adding item: "+name);
                            super.addRenderablesForPolygon(layer, geometry, properties);
                            layer.renderables[layer.renderables.length-1].displayName=name;
                        } else {
                            //console.log("Not adding item: "+name);
                        }
                    }
                    addRenderablesForMultiPolygon(layer, geometry, properties) {
                        var name = properties.name || properties.Name || properties.NAME;   
                        var existingRenderable = null;
                        for (let i=0;i<layer.renderables.length;i++) {
                            if(layer.renderables[i].displayName == name) existingRenderable = layer.renderables[i];
                        }

                        if(!existingRenderable) {
                            //console.log("adding item: "+name);
                            super.addRenderablesForMultiPolygon(layer, geometry, properties);
                            layer.renderables[layer.renderables.length-1].displayName=name;
                        } else {
                            //console.log("Not adding item: "+name);
                        }
                    }
            
                }

                let geometryCollectionGeoJSON = new myGeoJSONParser(JSON.stringify(geojson));

                let geometryCollectionLayer = null;
                for (let i=0;i<context.wwd.layers.length;i++) {
                    if(context.wwd.layers[i].displayName === "DHuSOpenSearchResults") {
                        geometryCollectionLayer = context.wwd.layers[i];
                        
                        //console.log(geometryCollectionLayer);
                    }
                }
                if(!geometryCollectionLayer) {
                    console.log("DHuS Layer not found!");
                    geometryCollectionLayer = new WorldWind.RenderableLayer("DHuSOpenSearchResults");
                    context.wwd.addLayer(geometryCollectionLayer); 
                } else {
                    console.log("Found DHuS Layer with "+geometryCollectionLayer.renderables.length+" items");
                    for (let i=0;i<geometryCollectionLayer.renderables.length;i++) {
                        console.log("Red shift");
                        let r = geometryCollectionLayer.renderables[i].attributes.interiorColor.red *256;
                        let g = geometryCollectionLayer.renderables[i].attributes.interiorColor.green*256;
                        let b = geometryCollectionLayer.renderables[i].attributes.interiorColor.blue*256;

                        let factor = 0.1;

                        r=Math.round(r + factor*(200-r));
                        g=Math.round(g + factor*(0-g));
                        b=Math.round(b + factor*(0-b));

                        //var newColor = _interpolateColor(geometryCollectionLayer.renderables[i].attributes.interiorColor,)

                          geometryCollectionLayer.renderables[i].attributes.interiorColor.red = r/256;
                          geometryCollectionLayer.renderables[i].attributes.interiorColor.green = g/256;
                          geometryCollectionLayer.renderables[i].attributes.interiorColor.blue = b/256;
                          geometryCollectionLayer.renderables[i].attributes.outlineColor.red = r/256;
                          geometryCollectionLayer.renderables[i].attributes.outlineColor.green = g/256;
                          geometryCollectionLayer.renderables[i].attributes.outlineColor.blue = b/256;
                          geometryCollectionLayer.renderables[i].attributes.stateKeyInvalid = true;


                        /*
                        geometryCollectionLayer.renderables[i].attributes.interiorColor.red = 
                            (geometryCollectionLayer.renderables[i].attributes.interiorColor.red >=1)? 1: geometryCollectionLayer.renderables[i].attributes.interiorColor.red+0.05;
                        geometryCollectionLayer.renderables[i].attributes.interiorColor.green = 
                            (geometryCollectionLayer.renderables[i].attributes.interiorColor.green <=0.1)? 0.1: geometryCollectionLayer.renderables[i].attributes.interiorColor.green-0.05;
                        geometryCollectionLayer.renderables[i].attributes.interiorColor.blue = 
                            (geometryCollectionLayer.renderables[i].attributes.interiorColor.blue <=0.1)? 0.1: geometryCollectionLayer.renderables[i].attributes.interiorColor.blue-0.05;
                        geometryCollectionLayer.renderables[i].attributes.stateKeyInvalid = true;
                        */
                    }
                }


                geometryCollectionGeoJSON.load(
                    loadCompleteCallback,
                    shapeConfigurationCallback,
                    geometryCollectionLayer
                );
                
                //console.log(context.wwd.layers);
            } else {
                console.log("No items found!");
            }
        }
    }


    toggleProjection(proj) {
        let supportedProjections = [ "3D", "Equirectangular", "Mercator"];
        this.setState({currentProjection:(proj)?proj:supportedProjections[(supportedProjections.indexOf(this.state.currentProjection)+ 1) % supportedProjections.length]});
        switch (this.state.currentProjection) {
        case "3D":
            this.wwd.globe.projection = new WorldWind.ProjectionWgs84();
            break;
        case "Equirectangular":
            this.wwd.globe.projection = new WorldWind.ProjectionEquirectangular();
            break;
        case "Mercator":
            this.wwd.globe.projection = new WorldWind.ProjectionMercator();
            break;
        case "North Polar":
            this.wwd.globe.projection = new WorldWind.ProjectionPolarEquidistant("North");
            break;
        case "South Polar":
            this.wwd.globe.projection = new WorldWind.ProjectionPolarEquidistant("South");
            break;
        default:
            this.wwd.globe = this.state.roundGlobe;
        }
        this.wwd.redraw();
    }


    
    handlePaste(text) {
        console.log("pasted: "+text);
        // detect if it is a geojson or a wkt or a wms url
        var isValidJSON = true; 
        try { JSON.parse(text) } catch (e) { isValidJSON = false; }
        
        if(isValidJSON) {
            this.addJson(text,this);
        } else {
            if (text.includes("apihub/search?") || text.includes("dhus/search?")) {
                this.addDataHubOpenSearchResults(text,this,this.mapFromHubOpenSearch);
                
            } else {
                if(text.includes("opensearch/request?")|| text.includes("finder.creodias.eu")) {
                    console.log("fedeo !!");
                    this.addGeoJson(text,this);
                } else {
                    if (text.includes("GetMap")) {
                        this.addWMS(text,this);
                    } else {
                        this.addWkt(text,this);
                    }
                }
            }
        }
    }

    handleDropText(text) {
        console.log("dropped: "+text);
        this.handlePaste(text);
    }


    handleDropFiles(files) {
        var reader = new FileReader();
        var context = this;
        
        for(var i=0;i<files.length;i++) {
            if(files[i].type === 'application/vnd.google-earth.kml+xml') {
                reader.onload = (function() {
                    console.log("kml");
                    context.addKML(this.result,context);
                });
                reader.readAsDataURL(files[i]);
            }

            if(files[i].type === 'image/tiff') {
                reader.onload = (function() {
                    //console.log(this.result);
                    context.addGeoTiff(this.result,context);
                });
                reader.readAsDataURL(files[i]);
            }

            if(files[i].name.endsWith('.geojson') || files[i].name.endsWith('.json')) {
                reader.onload = (function() {
                    //console.log(this.result);
                    context.addJson(this.result,context);
                });
                reader.readAsText(files[i]);
            }
        }
        
    }

    componentDidMount() {
        if(!this.state.wwd) {
            var elevationModel = new WorldWind.EarthElevationModel();
            var wwd = new WorldWind.WorldWindow("globe", elevationModel);
            wwd.navigator.minAllowedRange = 15000;  // works using worlwind branch @ https://github.com/OBarois/WebWorldWind/tree/inertia 
            this.setState({
                wwd: wwd, 
            });
            this.wwd = wwd;

            var wmsConfig = {
                service: "https://tiles.maps.eox.at/wms",
                layerNames: "s2cloudless-2018",
                numLevels: 19,
                format: "image/png",
                size: 256,
                sector: WorldWind.Sector.FULL_SPHERE,
                levelZeroDelta : new WorldWind.Location(90, 90)
            };



            var layers = [
                {layer: new WorldWind.WmsLayer(wmsConfig,""), enabled: true}
            ];

            for (var l = 0; l < layers.length; l++) {
                layers[l].layer.enabled = layers[l].enabled;
                wwd.addLayer(layers[l].layer);
            }

            this.toggleProjection((this.props.hasOwnProperty('projection'))?this.props.projection:"Equirectangular");

            wwd.goToAnimator.travelTime = 1000;
            wwd.goTo(new WorldWind.Location(41.827424, 12.674346));

            window.addEventListener('keydown', this.handleKey);
        }
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.handleKey);
    }

    render() {
        var globeStyle = {
            width: "100%",
            height: "100%"
        }

          
          return (
    
            <div className="Globe" id="outer-container">
                <canvas id="globe"  style={globeStyle}></canvas>
            </div>
        )
    }

}
export default Globe