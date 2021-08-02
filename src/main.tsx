import 'reset-css'
import './style.css'
// @ts-ignore
import _data from './data.csv'
import '@amap/amap-jsapi-types'
import React, { useState } from 'react'
import ReactDOM from 'react-dom'

const colors = ['#f44336', '#9c27b0', '#3f51b5', '#2196f3', '#009688', '#4caf50', '#ffeb3b', '#ff9800', '#795548', '#607d8b', '#ff5722', '#8bc34a']

const COLOR_POS = (c: string) => `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"  width="24" height="24" viewBox="0 0 24 24">
   <path fill="${c}" d="M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z" />
</svg>`

const names = ["XX-潇湘赛", "SD-山东赛", "WZ-温州赛", "CQ-重庆赛", "WH-武汉赛", "SY-沈阳赛", "TJ-天津赛", "SZ-深圳赛", "NJ-南京赛", "CD-成都赛", "QD-青岛赛", "GZ-广州赛", "ZH-珠海赛", "FZ-福州赛", "NC-南昌赛", "BJ-北京赛", "HZ-杭州赛", "SH-上海赛", "BR-环渤海赛", "FJ-八闽赛", "JJ-京津赛", "JJJ-京津冀赛", "YD-长三角赛", "YDM-长三角赛"]

// 不会
// type Test<T extends string> = T extends `${infer S}-${infer N}` ? [S,N] : unknown

const markers: Record<string, AMap.LabelMarker[]> = {}

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
  const map = new AMap.Map('map', {
    zoom: 9,
    mapStyle: 'amap://styles/whitesmoke'
  });
  const infoWindow = new AMap.InfoWindow({
    anchor: 'top-left'
  })
  let massMarks: Record<string, AMap.MassMarks> = {}

  let massItems: Record<string, AMap.MassData[]> = {}

  const layer = new AMap.LabelsLayer({
    zooms: [17, 20],
    zIndex: 1000,
    collision: false
  })
  for (const item of data) {
    let s = item.season.split("-")[0].match(/([A-Z]+)[0-9]+/)?.[1] as string
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
    massItems[s] ||= []
    massItems[s].push({
      lnglat: new AMap.LngLat(item.GDlng, item.Gdlat),
      style: item.sort % colors.length
    })

    const startEvt = (e: any) => {
      var position = e.data.data?.position;

      if (position) {
        infoWindow.setPosition(position)
        infoWindow.setContent(item.description.split("\\n").join("<br/>"))
        infoWindow.open(map, position, 100)
      }
    }

    marker.on('mouseover', startEvt);
    marker.on('touchstart', startEvt);

    marker.on('mouseout', function () {
      infoWindow.close()
    });
    markers[s!] ||= []
    markers[s!].push(marker)
    // @ts-ignore
    layer.add(marker)
  }
  map.add(layer)
  Object.keys(massItems).forEach(k => {
    massMarks[k] = new AMap.MassMarks(massItems[k], {
      zIndex: 1000,
      zooms: [3, 16],
      // @ts-ignore
      style: colors.map(v => COLOR_POS(v)).map(v => ({
        url: `data:image/svg+xml;base64,${btoa(v)}`,
        size: new AMap.Size(11, 11),
        anchor: new AMap.Pixel(5, 5)
      })),
      alwaysRender: false
    })

    massMarks[k].setMap(map)
  })

  const Filter: React.FunctionComponent<{
    names: typeof names
    onChange: (action: string, data: string) => any
  }> = ({ names, onChange }) => {
    const [selected, setSelected] = useState<string[]>(names.map(v => v.split("-")[0]))
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      console.log(e.target.checked, e.target.name, markers, markers[e.target.name])
      if (e.target.checked) {
        setSelected([...selected, e.target.name])
        onChange('add', e.target.name)
      } else {
        setSelected(selected.filter(v => v !== e.target.name))
        onChange('remove', e.target.name)
      }
    }

    return <ul>
      {names.map(v => {
        const name = v.split("-")[0]
        return (
          <li>
            <label>
              <span>{v}</span>
              <input type="checkbox" onChange={handleChange} checked={selected.includes(name)} name={name} />
            </label>
          </li>
        )
      })}
    </ul>
  }

  ReactDOM.render(<Filter names={names} onChange={(action, data) => {
    // @ts-ignore
    layer[action](markers[data])
    massMarks[data][action === 'add' ? 'show' : 'hide']()
  }} />, document.getElementById("root"))
}
const url = `https://webapi.amap.com/maps?v=1.4.15&key=${import.meta.env.VITE_AMAP_KEY}&callback=amapLoaded`
var jsapi = document.createElement('script');
jsapi.src = url;
document.head.appendChild(jsapi);