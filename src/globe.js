import React from 'react'

import './globe.css';

//import WorldWind from '@nasaworldwind/worldwind';
import WorldWind from '@nasaworldwind/worldwind';


// ... other declarations here

class Globe extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            wwdCreated: false
        };

        //this.dropKML = this.dropKML.bind(this);
        this.addKML = this.addKML.bind(this);
    }

    addKML(url,context) {
        var kmlFilePromise = new WorldWind.KmlFile(url, []);
        kmlFilePromise.then(function (kmlFile) {
            var renderableLayer = new WorldWind.RenderableLayer("Surface Shapes");
            renderableLayer.addRenderable(kmlFile);
            context.state.wwd.removeLayer(context.state.kmlLayer);

            context.state.wwd.addLayer(renderableLayer);
            context.state.wwd.redraw();
            context.setState({kmlLayer: renderableLayer});
        });

    }

    addGeoJson(url, context) {
        let renderableLayer = new WorldWind.RenderableLayer("GeoJSON");
        context.state.wwd.addLayer(renderableLayer);
        let geoJson = new WorldWind.GeoJSONParser(url);
        geoJson.load(null, null, renderableLayer);
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

            if(files[i].name.endsWith('.geojson')) {
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
            this.setState({wwd: wwd});

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
        }
    }

    componentWillUnmount() {
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