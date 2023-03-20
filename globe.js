import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

(function() {
    const container = document.getElementById("globe");
    const canvas = container.getElementsByTagName("canvas")[0];
  
    const globeRadius = 100;
    const globeWidth = 4098 / 2;
    const globeHeight = 1968 / 2;
  
    function convertFlatCoordsToSphereCoords(x, y) {
      let latitude = ((x - globeWidth) / globeWidth) * -180;
      let longitude = ((y - globeHeight) / globeHeight) * -90;
      latitude = (latitude * Math.PI) / 180;
      longitude = (longitude * Math.PI) / 180;
      const radius = Math.cos(longitude) * globeRadius;
  
      return {
        x: Math.cos(latitude) * radius,
        y: Math.sin(longitude) * globeRadius,
        z: Math.sin(latitude) * radius
      };
    }
  
    function makeMagic(points) {
      const { width, height } = container.getBoundingClientRect();
  
      // 1. Setup scene
      const scene = new THREE.Scene();
      // 2. Setup camera
      const camera = new THREE.PerspectiveCamera(45, width / height);
      // 3. Setup renderer
      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true
      });
      renderer.setSize(width, height);
      // 4. Add points to canvas
      // - Single geometry to contain all points.
      const mergedGeometry = new THREE.Geometry();
      // - Material that the dots will be made of.
      const pointGeometry = new THREE.SphereGeometry(0.5, 1, 1);
      const pointMaterial = new THREE.MeshBasicMaterial({
        color: "#888",
      });
  
      for (let point of points) {
        const { x, y, z } = convertFlatCoordsToSphereCoords(
          point.x,
          point.y,
          width,
          height
        );
  
        if (x && y && z) {
          pointGeometry.translate(x, y, z);
          mergedGeometry.merge(pointGeometry);
          pointGeometry.translate(-x, -y, -z);
        }
      }
  
      const globeShape = new THREE.Mesh(mergedGeometry, pointMaterial);
      scene.add(globeShape);
  
      container.classList.add("peekaboo");
  
      // Setup orbital controls
      camera.orbitControls = new OrbitControls(camera, canvas);
      camera.orbitControls.enableKeys = false;
      camera.orbitControls.enablePan = false;
      camera.orbitControls.enableZoom = false;
      camera.orbitControls.enableDamping = false;
      camera.orbitControls.enableRotate = true;
      camera.orbitControls.autoRotate = true;
      camera.position.z = -265;
  
      function animate() {
        // orbitControls.autoRotate is enabled so orbitControls.update
        // must be called inside animation loop.
        camera.orbitControls.update();
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
      }
      animate();
    }
  
    function hasWebGL() {
      const gl =
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (gl && gl instanceof WebGLRenderingContext) {
        return true;
      } else {
        return false;
      }
    }
  
    function init() {
      if (hasWebGL()) {
        window
          .fetch("/assets/points.json")
          .then(response => response.json())
          .then(data => {
            makeMagic(data.points);
          });
      }
      // manage stars
      // for (let i = 0; i < 200; i++) {
      //   const star = document.createElement("div");
      //   star.classList.add("star");
        
      //   const size = Math.floor(Math.random() * 3) + 1;
      //   star.classList.add(`star--${size}`);
        
      //   const x = Math.floor(Math.random() * window.innerWidth);
      //   const y = Math.floor(Math.random() * window.innerHeight);
      //   star.style.transform = `translate(${x}px, ${y}px)`;
        
      //   document.body.appendChild(star);
      // }
    }
    init();
  })();
  