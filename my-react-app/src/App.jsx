import { useRef, useEffect } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css';

import './App.css'

function App() {

  const mapRef = useRef()
  const mapContainerRef = useRef()

  useEffect(() => {
    if (!mapContainerRef.current) return
    
    mapboxgl.accessToken = import.meta.env.MAPBOX_API_KEY
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      center: [-79.3957, 43.6629],
      zoom: 12
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
      }
    }
  }, [])

  return (
    <>
      <div id='map-container' ref={mapContainerRef}/>
    </>
  )
}
export default App
