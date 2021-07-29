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
window.amapLoaded  = function(){
  const map = new AMap.Map('app');
  for(const item of data){
    const marker = new AMap.Marker({
      position: [item.GDlng, item.Gdlat],
      title: "test"
    })
    map.add(marker)
  }
}
const url = `https://webapi.amap.com/maps?v=1.4.15&key=${import.meta.env.VITE_AMAP_KEY}&callback=amapLoaded`
var jsapi = document.createElement('script');
jsapi.src = url;
document.head.appendChild(jsapi);