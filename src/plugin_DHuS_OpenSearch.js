import React from 'react'
import axios from 'axios';
import wellknown from 'wellknown';


// Plugin to manage DHuS OpenSearch URL
class DHuS_OpenSearch extends React.Component {

    constructor(props) {
      super(props);
      this.state = {
      }
      this.canSupport = this.canSupport.bind(this);
    }
    
    componentDidMount() {

    }
    
    componentWillUnmount() {

    }

    canSupport() {
        return true;
    }

    addDataHubOpenSearchResults(url, context) {
        axios.get(url,{ crossdomain: true }).then(response => handleDHuSResponse(response));
        function loadCompleteCallback() {context.wwd.redraw();}
        //function shapeConfigurationCallback() {}
        function shapeConfigurationCallback(geometry, properties) {
              
            var configuration = {};
        
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
        
              configuration.attributes.interiorColor = new WorldWind.Color(0, 1, 1, 0.3);
              configuration.attributes.outlineColor = new WorldWind.Color(0, 1, 1, 0.8);
        
              configuration.attributes.outlineWidth = 1;
            
              configuration.userProperties = properties;
            }
            return configuration;
        }
        
        function mapFromHubOpenSearch(item) {
	
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
        
                console.log("item: "+JSON.stringify(newItem));
        
                return newItem;
            } catch (err) {
                console.log("error: "+err.message);
                return null;
            }
        }
    }
        
    handleDHuSResponse(json) {
        console.log(json);
        let features = new WorldWind.GeoJSONParser(json.data.feed.entry.map(function(a) {return mapFromHubOpenSearch(a);}));
        console.log(JSON.stringify(features));
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
                features: features._dataSource
            };
        console.log(JSON.stringify(geojson));
        let geometryCollectionGeoJSON = new WorldWind.GeoJSONParser(JSON.stringify(geojson));
        let geometryCollectionLayer = new WorldWind.RenderableLayer("OpenSearchResults");
        geometryCollectionGeoJSON.load(
            loadCompleteCallback,
            shapeConfigurationCallback,
            geometryCollectionLayer
            );
            context.wwd.addLayer(geometryCollectionLayer); 
    }


    
    
    render() {
        return null;
    }
}
  
export default DHuS_OpenSearch