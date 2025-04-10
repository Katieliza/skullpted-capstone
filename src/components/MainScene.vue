<!-- eslint-disable no-unused-vars -->
<script setup>
import { onMounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

onMounted(() => {
 // Set up scene and renderer
  const canvas = document.getElementById('canvas')
  const scene = new THREE.Scene()
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })

  // Get window size
  const windowWidth = window.innerWidth / 1.5;
  const windowHeight = window.innerHeight;

  // Set up camera
  const camera = new THREE.PerspectiveCamera(75, windowWidth / windowHeight, 0.1, 1000);
  camera.position.set(0, 0, 2.5);

  // Handle window resize
  window.addEventListener("resize", () => {
    // Calculate new size
    const windowWidth = window.innerWidth / 1.5;
    const windowHeight = window.innerHeight;
    // Update aspect ratio and projection matrix
    camera.aspect = windowWidth / windowHeight;
    camera.updateProjectionMatrix();
    // Update renderer size
    renderer.setSize(windowWidth, windowHeight);
  });

  // Set up orbit controls
  const controls = new OrbitControls(camera, canvas);
  controls.update();


  const axesHelper = new THREE.AxesHelper(3);
  //scene.add(axesHelper)

  // Set renderer size to window
  renderer.setSize(windowWidth, windowHeight);

  // Set up lighting
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
  scene.add(directionalLight)
  const dLightHelper = new THREE.DirectionalLightHelper(directionalLight)
  //scene.add(dLightHelper)

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  scene.add(ambientLight)

  // Create model
  const modelGeo = new THREE.BoxGeometry();
  const modelMat = new THREE.MeshStandardMaterial(0xffffff);
  const model = new THREE.Mesh(modelGeo, modelMat);
  scene.add(model);

  const animate = () => {
    requestAnimationFrame(animate)
    model.rotation.y += 0.005

    controls.update();
    renderer.render(scene, camera)
  }
  animate()
})
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
