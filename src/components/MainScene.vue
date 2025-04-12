<script setup>
import { onMounted, watch } from "vue";
import { useStore } from "@/stores/store";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const store = useStore();

onMounted(() => {
  // Init canvas, scene, renderer
  const canvas = document.getElementById("canvas");
  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });

  // Get window size
  const windowWidth = window.innerWidth / 1.5;
  const windowHeight = window.innerHeight;

  // Calculate aspect ratio
  const aspect = windowWidth / windowHeight;

  // Set renderer size to window
  renderer.setSize(windowWidth, windowHeight);

  // Handle window resize
  window.addEventListener("resize", () => {
    // Calculate new size
    const windowWidth = window.innerWidth / 1.5;
    const windowHeight = window.innerHeight;
    // Update aspect and projection matrix
    camera.aspect = windowWidth / windowHeight;
    camera.updateProjectionMatrix();
    // Update renderer size
    renderer.setSize(windowWidth, windowHeight);
  });

  // Init perspective camera
  const camera = new THREE.PerspectiveCamera(75, windowWidth / windowHeight, 0.1, 1000);
  camera.position.set(0, 0, 2.5);

  // Config orbit controls
  const controls = new OrbitControls(camera, canvas);
  controls.autoRotate = true;
  controls.enableZoom = true;
  controls.minDistance = 2;
  controls.maxDistance = 5;
  controls.update();

  const axesHelper = new THREE.AxesHelper(3);
  // scene.add(axesHelper)

  // Init directional light & helper
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  const dLightHelper = new THREE.DirectionalLightHelper(directionalLight);
  //scene.add(dLightHelper);

  // Init ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(directionalLight, ambientLight);

  // Create model
  const modelGeo = new THREE.BoxGeometry();
  const modelMat = new THREE.MeshStandardMaterial(0xffffff);
  const model = new THREE.Mesh(modelGeo, modelMat);
  scene.add(model);

  const animate = () => {
    requestAnimationFrame(animate);
    controls.update(); // Update orbit controls
    renderer.render(scene, camera); // Update renderer
  };
  animate();

  // *************************************** FUNCTIONS ****************************************** //

  var zoomInterval;

  function ZoomIn() {
    console.log("Zooming in...");
    camera.position.multiplyScalar(0.99);
  }
  function ZoomInStart() {
    clearInterval(zoomInterval);
    zoomInterval = setInterval(ZoomIn, 16);
  }
  function ZoomOut() {
    console.log("Zooming out...");
    camera.position.multiplyScalar(1.01);
  }
  function ZoomOutStart() {
    clearInterval(zoomInterval);
    zoomInterval = setInterval(ZoomOut, 16);
  }
  function ZoomStop() {
    clearInterval(zoomInterval);
  }
  function ZoomReset() {
    clearInterval(zoomInterval);
    controls.reset();
  }

  // Watch these functions for updates
  watch(
    () => store.zoomIn,
    (val) => {
      if (val) {
        ZoomInStart();
      } else {
        ZoomStop();
      }
    },
  );
  watch(
    () => store.zoomOut,
    (val) => {
      if (val) {
        ZoomOutStart();
      } else {
        ZoomStop();
      }
    },
  );
  watch(
    () => store.zoomReset,
    (val) => {
      if (val) {
        ZoomReset();
      } else {
        ZoomStop();
      }
    },
  );
});
</script>

<template>
  <canvas id="canvas"></canvas>
</template>

<style scoped>
canvas {
  display: block;
  z-index: 0;
  width: 100%;
  height: 100%;
  position: absolute;
}
</style>
