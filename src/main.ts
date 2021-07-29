import 'reset-css'
// @ts-ignore
import _data from './data.csv'
import '@amap/amap-jsapi-types'

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
    zoom: 9
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
        image: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
        size: [15, 20],
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