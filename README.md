This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).

## Quick set-up:

```sh
Download repository
npm install
npm start
```

Then open [http://localhost:3000/](http://localhost:3000/) to see the drop2worldwind app.<br>
To deploy in production, create a minified bundle with `npm run build`.

## Using the drop2worlwind App:
Simply drop a file on the globe to visualize it.<br>
Currently supports kml.
Could evolve towards an online swiss army knife for geo data visualisation.

## To do list:

* Plugin architecture to add support for new formats
* KML Style editor: panel to let user change and save the style of features (stroke and fill colors, stroke width, labels on/off, clamping)
* Time window selector to filter features
* Cycle Picking gesture to show feature attributes in a pop-up panel
* File Drag & Drop: kmz, geojson, WMS/WMTS capabilities (with pop-up dialog to select layer), 
* URL Cut & Paste: kml, kmz, geojson, WMS/WMTS getMap requests or Capabilities, shape,
* String Cut & Paste: WKT, geojson, kml
* Save/load as OWC Context file
* Export current view as image


