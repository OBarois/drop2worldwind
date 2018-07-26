import React from 'react'

import './globe.css';

//import WorldWind from '@nasaworldwind/worldwind';
import WorldWind from '@nasaworldwind/worldwind';


// ... other declarations here

class Globe extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            wwdCreated: false,
            currentProjection: '3D',
            //supportedProjections = [ "3D", "Equirectangular", "Mercator" ]
        };

        //this.dropKML = this.dropKML.bind(this);
        this.addKML = this.addKML.bind(this);
        this.handleKey = this.handleKey.bind(this);
        this.toggleProjection = this.toggleProjection.bind(this);
        this.clearGlobe = this.clearGlobe.bind(this);
    }

    handleKey(e) {
        switch (e.key) {
            case "p": {
                this.toggleProjection();
                break;
            }
            case "c": {
                this.clearGlobe();
                break;
            }
            default:
                break;
        }
    }

    clearGlobe() {
        let LayersToRemove = this.wwd.layers;
        console.log(LayersToRemove.length);
        //LayersToRemove.shift();
        for(let i=0;i<LayersToRemove.length;i++) {
            if(LayersToRemove[i].displayName) this.wwd.removeLayer(LayersToRemove[i]);
        }
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

    addGeoJson(url, context) {
        function shapeConfigurationCallback(geometry, properties) {
            var configuration = {};
            configuration.attributes = new WorldWind.ShapeAttributes(null);
            configuration.attributes.interiorColor = new WorldWind.Color(0, 1, 1, 0.2);
            configuration.attributes.outlineColor = new WorldWind.Color(1, 1, 1, 1);
            return configuration;
        }

        let renderableLayer = new WorldWind.RenderableLayer("GeoJSON");
        context.wwd.addLayer(renderableLayer);
        let geoJson = new WorldWind.GeoJSONParser(url);
        geoJson.load(null, shapeConfigurationCallback, renderableLayer);
        context.wwd.redraw();
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

    handlePaste(clipboardData) {
        // detect if it is a geojson or a wkt
        try {
            JSON.parse(clipboardData.getData('Text'));
            this.addGeoJson(clipboardData.getData('Text'),this);
        } catch (e) {
            this.addWkt(clipboardData.getData('Text'),this);
        }
    }

    handleDrop(files) {
        var reader = new FileReader();
        var context = this;
        
        for(var i=0;i<files.length;i++) {
            if(files[i].type === 'application/vnd.google-earth.kml+xml') {
                reader.onload = (function() {
                    //console.log(this.result);
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
                    context.addGeoJson(this.result,context);
                });
                reader.readAsDataURL(files[i]);
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
                layerNames: "s2cloudless",
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
            <div className="Globe">
                <canvas id="globe"  style={globeStyle}></canvas>
            </div>
        )
    }

}
export default Globe