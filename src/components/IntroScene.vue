<!-- eslint-disable no-unused-vars -->
<script setup>
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GUI } from 'dat.gui'
import { onMounted } from 'vue'

onMounted(() => {
  // Set up scene and renderer
  const canvas = document.getElementById('canvas')
  const scene = new THREE.Scene()
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  const gui = new GUI()

  // Get window size
  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight

  // Set up camera
  const camera = new THREE.PerspectiveCamera(75, windowWidth / windowHeight, 0.1, 1000)
  camera.position.set(0, 5, 5)
  const cameraHelper = new THREE.CameraHelper(camera)
  scene.add(cameraHelper)

  const axesHelper = new THREE.AxesHelper(3)
  scene.add(axesHelper)

  // Set renderer size to window
  renderer.setSize(windowWidth, windowHeight)

  // Set up orbit controls
  const controls = new OrbitControls(camera, canvas)

  // Set up lighting
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
  scene.add(directionalLight)
  const dLightHelper = new THREE.DirectionalLightHelper(directionalLight)
  scene.add(dLightHelper)

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.2)
  scene.add(ambientLight)

  // Create box
  const geometry = new THREE.BoxGeometry()
  const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 })
  const cube = new THREE.Mesh(geometry, material)
  scene.add(cube)

  const animate = () => {
    requestAnimationFrame(animate)
    cube.rotation.x += 0.01
    cube.rotation.y += 0.01

    controls.update
    cameraHelper.update()
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
