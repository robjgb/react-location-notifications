import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  GoogleMap,
  Marker,
  Circle,
} from "@react-google-maps/api";
import Places from "./places";
import Distance from "./distance";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type LatLngLiteral = google.maps.LatLngLiteral;
type DirectionsResult = google.maps.DirectionsResult;
type MapOptions = google.maps.MapOptions;

function pointInCircle(point: LatLngLiteral, radius: number, center: LatLngLiteral)
{
    return (google.maps.geometry.spherical.computeDistanceBetween(point, center) <= radius)
}

export default function Map() {
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const [business, setBusiness] = useState<LatLngLiteral>();
  const [currentLoc, setCurrentLoc] = useState<LatLngLiteral>({lat: 0, lng: 0})
  const [locationNotify, setLocationNotify] = useState<boolean>()
  const [message, setMessage] = useState<string>("No message set.");
  const [name, setName] = useState<string>();
  const mapRef = useRef<GoogleMap>();
  const center = useMemo(()=> ({lat: 34, lng: -118}), []);
  const options = useMemo<MapOptions>(()=>({
    mapId: "4296ec98cc814bd6",
    disableDefaultUI: true,
    clickableIcons: false
  }), []);
  const radius = 4828

  const locationButton = document.createElement("button");
  locationButton.textContent = "Pan to Current Location";
  locationButton.classList.add("custom-map-control-button");

  const onLoad = useCallback(map => (mapRef.current = map), []);

  const geoOptions = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
  };

  const onChange = (position: GeolocationPosition) => {
      setCurrentLoc({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
  };

  useEffect(()=> {
    const interval = setInterval(() => {
      console.log("searching")
      if (navigator.geolocation) {
        const id = navigator.geolocation.getCurrentPosition(
          onChange
        ,
        (error) => {
          alert('Error: ' + error.code)
        }, 
        geoOptions
        );
      }
    }, 2000);
  }, []);

  useEffect(()=> {
    if(currentLoc != undefined && business!= undefined && name!= undefined){
        setLocationNotify(pointInCircle(currentLoc, radius, business)) 
    }
  }, [currentLoc])

  useEffect(()=> {
    if(currentLoc != undefined && business!= undefined && name !=undefined && locationNotify != undefined){
      locationNotify ? toast(message) : null
      if(locationNotify === false) {
        setLocationNotify(undefined)
      }
    }
  }, [locationNotify])

  const handleSetNotification = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setMessage(messageRef.current?.value)
    alert("Message set!");
  }

  return <div className="container">
    <div className="controls">
      <ToastContainer />
      <h1>Set business location:</h1>
      <Places setBusiness={(position)=>{
        setBusiness(position)
        mapRef.current?.panTo(position);
      }}
        setName = {(name)=> {
          setName(name);
        }}
        />
        <form onSubmit={handleSetNotification}>
          <label className="formLabel">
            Message:
          <textarea ref={messageRef} className="formText" placeholder={business === undefined? "Choose a business to set notification": "Enter message"} required></textarea>
          </label>
          <input disabled={business === undefined} className="button" type="submit" value="Set Notification Message"></input>
        </form>
      </div>

    <div className="map">
      <GoogleMap 
      zoom={10} 
      center={center}  
      mapContainerClassName="map-container"
      options={options}
      onLoad={onLoad}
      >

        {business && (
        <>
          <Marker position={business} icon="https://img.icons8.com/color/48/000000/online-store.png"
          />
          <Circle center={business} radius={radius} options={defaultOptions}/>
        </>
        )}

        {currentLoc && (<Marker position={currentLoc} icon="https://img.icons8.com/fluency/48/000000/street-view.png"
          />)}

      </GoogleMap>
    </div>
  </div>;
}

const defaultOptions = {
  strokeOpacity: 0.5,
  strokeWeight: 2,
  clickable: false,
  draggable: false,
  editable: false,
  visible: true,
  zIndex: -1,
  // fillOpacity: 0.05,
  // strokeColor: "#8BC34A",
  // fillColor: "#8BC34A",
};
