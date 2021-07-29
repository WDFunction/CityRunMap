import 'reset-css'
// @ts-ignore
import _data from './data.csv'
import '@amap/amap-jsapi-types'

const colors = ['#f44336', '#9c27b0', '#3f51b5', '#2196f3', '#009688', '#4caf50', '#ffeb3b', '#ff9800', '#795548', '#607d8b', '#ff5722', '#8bc34a']

const COLOR_POS = (c: string) => `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"  width="24" height="24" viewBox="0 0 24 24">
   <path fill="${c}" d="M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z" />
</svg>`

interface IRecord {
  sort: number;
  season: string;
  name: string;
  description: string;
  GDlng: number;
  Gdlat: number;
}

const data = _data.map((v: any) => {
  v.sort = +v.sort
  v.GDlng = +v.GDlng
  v.Gdlat = +v.Gdlat
  return v
}) as IRecord[]

// @ts-ignore
window.amapLoaded = function () {
  const map = new AMap.Map('app', {
    zoom: 9,
    mapStyle: 'amap://styles/whitesmoke'
  });
  const infoWindow = new AMap.InfoWindow({
    anchor: 'top-left'
  })
  const layer = new AMap.LabelsLayer({
    zooms: [3, 20],
    zIndex: 1000,
    collision: true,
    allowCollision: true,
  })
  for (const item of data) {
    const marker = new AMap.LabelMarker({
      name: item.name,
      position: [item.GDlng, item.Gdlat],
      icon: {
        image: `data:image/svg+xml;base64,${btoa(COLOR_POS(colors[item.sort % colors.length]))}`,
        size: [20, 20],
        anchor: 'bottom-center'
      },
      text: {
        content: item.name,
        style: {
          fillColor: '#1f1e33',
          strokeColor: '#fff',
          strokeWidth: 2,
          fold: true,
          padding: '2, 5'
        }
      }
    })

    marker.on('mouseover', function (e) {
      var position = e.data.data?.position;

      if (position) {
        infoWindow.setPosition(position)
        infoWindow.setContent(item.description.split("\\n").join("<br/>"))
        infoWindow.open(map, position, 100)
      }
    });

    marker.on('mouseout', function () {
      infoWindow.close()
    });
    // @ts-ignore
    layer.add(marker)
  }
  map.add(layer)
}
const url = `https://webapi.amap.com/maps?v=1.4.15&key=${import.meta.env.VITE_AMAP_KEY}&callback=amapLoaded`
var jsapi = document.createElement('script');
jsapi.src = url;
document.head.appendChild(jsapi);