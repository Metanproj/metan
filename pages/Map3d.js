import React, { useState, useRef, useEffect } from "react";
import { Wrapper } from "@googlemaps/react-wrapper";
import {
  PerspectiveCamera,
  Scene,
  AmbientLight,
  WebGLRenderer,
  Matrix4,
  Raycaster,
  Vector2,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import getFirstObjectWithName from "../utils/RayCastHelper";

const mapOptions = {
  mapId: process.env.NEXT_PUBLIC_MAP_ID,
  center: { lat: 43.661036, lng: -79.391277 },
  zoom: 19,
  disableDefaultUI: true,
  heading: 0,
  tilt: 90,
  // gestureHandling: 'none',
};

let roation = 0
export default function Map3d() {
  const overlayRef = useRef();
  const [_map, setMap] = useState();
  const ref = useRef();
  const [raycaster] = useState(() => new Raycaster());

  useEffect(() => {
    if (!overlayRef.current) {
      const instance = new window.google.maps.Map(ref.current, mapOptions);
      setMap(instance);
      overlayRef.current = createOverlay(instance);
    }
  }, []);

  useEffect(() => {

    const handleKeyDown = (event) => {
      if (event.key === 'w') {
        // Increment the latitude of the map and the object
        mapOptions.center.lat += 0.0001; // Adjust this value as needed
        roation = 3*Math.PI/2
        overlayRef.current.overlay.requestRedraw();
        overlayRef.current.overlay.map.moveCamera({center: mapOptions.center});
      }
      if (event.key === 's') {
        // Increment the latitude of the map and the object
        mapOptions.center.lat -= 0.0001; // Adjust this value as needed
        roation = Math.PI/2
        overlayRef.current.overlay.requestRedraw();
        overlayRef.current.overlay.map.moveCamera({center: mapOptions.center});
      }
      if (event.key === 'a') {
        // Increment the latitude of the map and the object
        mapOptions.center.lng -= 0.0001; // Adjust this value as needed
        roation = 0
        overlayRef.current.overlay.requestRedraw();
        overlayRef.current.overlay.map.moveCamera({center: mapOptions.center});
      }
      if (event.key === 'd') {
        // Increment the latitude of the map and the object
        mapOptions.center.lng += 0.0001; // Adjust this value as needed
        roation = Math.PI
        overlayRef.current.overlay.requestRedraw();
        overlayRef.current.overlay.map.moveCamera({center: mapOptions.center});
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [raycaster]);

  return <div ref={ref} id="map" />;
}

function createOverlay(map, rotation = 0) {
  const overlay = new google.maps.WebGLOverlayView();
  let renderer, scene, camera, loader;

  overlay.onAdd = () => {
    scene = new Scene();
    camera = new PerspectiveCamera();
    const light = new AmbientLight(0xffffff, 0.9);
    scene.add(light);

    loader = new GLTFLoader();
    loader.loadAsync("/low_poly_scooter/scene.gltf").then((object) => {
      const group = object.scene;
      group.scale.setScalar(25);
      group.rotation.set(Math.PI / 2, rotation, 0);
      group.position.setZ(-120);
      scene.add(group);
    });
    document.addEventListener('click', onClick);

    function onClick(event) {
      getFirstObjectWithName(event, window, camera, scene, "Wheel");
    }
  };

  overlay.onContextRestored = ({ gl }) => {
    renderer = new WebGLRenderer({
      canvas: gl.canvas,
      context: gl,
      ...gl.getContextAttributes(),
    });
    renderer.autoClear = false;
  };

  overlay.onDraw = ({ transformer }) => {
    const matrix = transformer.fromLatLngAltitude({
      lat: mapOptions.center.lat,
      lng: mapOptions.center.lng,
      altitude: 120,
    });
    camera.projectionMatrix = new Matrix4().fromArray(matrix);
    scene.children.forEach((object) => {
      if (object.isGroup) {
        object.rotation.y = roation;
      }
    });
    overlay.requestRedraw();
    renderer.render(scene, camera);
    renderer.resetState();
  };

  overlay.setMap(map);

  return { overlay, scene, camera };
}