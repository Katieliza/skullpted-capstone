<script setup>
import { onMounted, watch } from "vue";
import { useControlStore } from "@/stores/controlStore.js";
import { useModelStore } from "@/stores/modelStore.js";
import { useMaterialStore } from "@/stores/materialStore.js";
import * as THREE from "three";
import * as DAT from "dat.gui";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Init stores
const controlStore = useControlStore();
const modelStore = useModelStore();
const materialStore = useMaterialStore();

// Init texture loaders
const textureLoader = new THREE.TextureLoader();
const gltfLoader = new GLTFLoader();

// Init 3D model
let model;

// region [colorTeal] TEXTURE MAP LOADER
/**
 * Auto-load texture maps for given material
 *
 * @param {string} basePath - Folder where teexture files are stored
 * @param {string} baseName - Base name of the material
 * @param {Object} mapSuffix - Optional suffix for texture types
 * @returns {Object} - Object with loaded texture maps
 */
// endregion

function LoadTextureMaps(basePath, baseName, mapSuffix = {
  map: "BaseColor",
  roughnessMap: "Roughness",
  metalnessMap: "Metallic",
  normalMap: "Normal"
}) {

  const maps = {};
  for (const [key, suffix] of Object.entries(mapSuffix)) {
    const url = `${basePath}/${baseName}_${suffix}.jpg`;
    maps[key] = textureLoader.load(url);
  }
  return maps;
}

// region [colorTeal] MATERIAL LOADER
/**
 * Load and apply material with texture maps to the selected mesh in the model.
 *
 * @param {string} mat - Display name of selected material.
 *
 * Process:
 * Retrieve the mesh currently selected in store.
 * Retrieve the base filename for the selected material.
 * Load the texture maps from the texture folder.
 * Traverse model and apply the material to only the selected mesh.
 * Dispose of any existing material.
 * Update store flag to indicate material has been reset.
**/
// endregion

function LoadMaterial(mat) {
  console.log("Material to be loaded: ", mat)

  if (textureLoader && model ) {
    const activeMesh = modelStore.activeMesh;
    const baseName = materialStore.GetBaseName(mat);

    if (!textureLoader || !model) return;
    if (!baseName) {
      console.error("No base name found for material: ", mat)
      return;
    }
    const basePath = "/textures";
    const maps = LoadTextureMaps(basePath, baseName);
    model.traverse((child) => {
      if (!child.isMesh) return;

      if (activeMesh && child.name !== activeMesh) return;
      if (child.material) {
        child.material.dispose();
      }

      child.material = new THREE.MeshStandardMaterial({...maps, color: 0xffffff});

    });
        materialStore.materialSet = false;
      }
  }
var currentAnimation = null;
function EaseInOutCubic(x) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3)/2;
}

// Utility function to find a mesh by name
function findMeshByName(meshName) {
  let targetMesh = null;
  if (!model) return null;

  model.traverse((child) => {
    if (child.isMesh && child.name === meshName) {
      targetMesh = child;
    }
  });

  return targetMesh;
}

// Function to animate color changes with smooth transitions
function LerpColors(meshesToAnimate, endHex, duration = 0.5) {
  // Cancel any existing animation
  if (currentAnimation) {
    cancelAnimationFrame(currentAnimation);
    currentAnimation = null;
  }

  // Convert end hex to THREE.Color
  const endColor = new THREE.Color(endHex);
  let startTime = null;

  // Store starting colors for each mesh
  const startingColors = meshesToAnimate.map(mesh => {
    // Ensure mesh has proper material
    if (mesh.material && !mesh.material._isCloned) {
      mesh.material = mesh.material.clone();
      mesh.material._isCloned = true;
    }
    return new THREE.Color(mesh.material.color.getHex());
  });

  // Animation function
  function animate(time) {
    if (!startTime) startTime = time;

    const elapsed = (time - startTime) / 1000;
    const progress = Math.min(elapsed / duration, 1);
    const ease = EaseInOutCubic(progress);

    // Update all meshes
    for (let i = 0; i < meshesToAnimate.length; i++) {
      const mesh = meshesToAnimate[i];
      const startColor = startingColors[i];

      if (mesh && mesh.material) {
        const currentColor = new THREE.Color();
        currentColor.lerpColors(startColor, endColor, ease);
        mesh.material.color.copy(currentColor);
      }
    }

    if (progress < 1) {
      currentAnimation = requestAnimationFrame(animate);
    } else {
      currentAnimation = null;
    }
  }

  currentAnimation = requestAnimationFrame(animate);
}


  // #region [colorTeal] HEX COLOR LOADER
  /**
   * Load and apply color to model's material.
   *
   * @param hex
   *
   * Process:
   * Parse hex color string to an integer.
   * Apply parsed color value to model's material.
   * Update store flag to indicate color has been set.
   */
  // #endregion

// Main function to load a color onto selected or all meshes
function LoadColor(hex) {
  console.log("Color to be loaded:", hex);
  const activeMeshName = modelStore.activeMesh;

  if (!model) {
    console.error("Model not loaded");
    return;
  }

  // Prepare array of meshes to animate
  let meshesToAnimate = [];

  // If a specific mesh is selected, only animate that one
  if (activeMeshName) {
    const targetMesh = findMeshByName(activeMeshName);
    if (targetMesh) {
      meshesToAnimate = [targetMesh];
      console.log(`Applying color ${hex} to selected mesh: ${activeMeshName}`);
    } else {
      console.error(`Could not find mesh: ${activeMeshName}`);
      return;
    }
  }
  // If no mesh is selected, apply to all meshes in meshNames
  else {
    console.log('No mesh selected - applying to all meshes');

    // If meshNames is populated, use those names
    if (modelStore.meshNames && modelStore.meshNames.length > 0) {
      modelStore.meshNames.forEach(meshName => {
        const mesh = findMeshByName(meshName);
        if (mesh) {
          meshesToAnimate.push(mesh);
        }
      });
    }
    // Fallback: if meshNames is empty, find all meshes in the model
    else {
      model.traverse((child) => {
        if (child.isMesh && child.material) {
          meshesToAnimate.push(child);
        }
      });
    }
  }

  // If we have meshes to animate, do it
  if (meshesToAnimate.length > 0) {
    LerpColors(meshesToAnimate, hex, 0.5);
  } else {
    console.warn("No meshes found to apply color to");
  }
}


// #region [colorTeal] RESET COLOR
/**
 * Reset the color of the selected mesh within the model.
 *
 * Process:
 * Verify the model and selected mesh are accessible.
 * Traverse the model to find the matching mesh.
 * Clone existing material to prevent shared material editing.
 * Set the color to white (default color).
 * Update store flag to indicate color has been reset.
 */
// #endregion

function ResetColor() {
  console.log("Resetting color...")
  const activeMesh = modelStore.activeMesh;
  var found = false;

  if (!model) {
    console.error("Model not loaded");
    return;
  };
  if (!activeMesh) {
    console.error("No mesh selected");
    return;
  };

  model.traverse((child)=> {
    if (child.isMesh && child.name === activeMesh) {
      if (child.material.isMaterial) {
        child.material = child.material.clone();
      };
      found = true;
      child.material.color.setHex(0xffffff);
    }
  });

  if(found) {
    console.log(`Color reset successfully for ${activeMesh}`);
  } else {
    console.error(`Could not find mesh: ${activeMesh}`);
  };
  materialStore.colorReset = false;
}

onMounted(() => {
  // Canvas & Scene
  const canvas = document.getElementById("canvas");
  const scene = new THREE.Scene();

  // Renderer
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // GUI
  const gui = new DAT.GUI( { autoPlace: false});
  document.getElementById('gui-container').appendChild(gui.domElement);

  const guiOptions = {
    color: "#ffffff",
  }
  const colorController = gui.addColor(guiOptions, "color").name("Custom Color");

  colorController.onChange((value) => {
    const activeMesh = modelStore.activeMesh;
    if (model) {
      model.traverse((child) => {
        if (child.isMesh) {
          child.material.color.set(value);
        }
      });
    }
  })

  // #region [colorTeal] GLTF MODEL LOADER
  /**
   * Load GLTF headphone model into scene
   *
   * Process:
   * Use GLTFLoader to load 3D model from specified path.
   * Recenter the model by offsetting it to the origin.
   * Shift the model so its center is at (0, 0, 0).
   * Add model to the scene.
   * Traverse model to find all mesh objects.
   * Update store with the array of mesh names for UI access.
   */
  // #endregion

  gltfLoader.load('models/skullpted_headphones/scene.gltf',
    function ( gltf ) {
      model = gltf.scene;
      model.scale.set(1, 1, 1)

      const bbox = new THREE.Box3().setFromObject(model);
      const center = bbox.getCenter(new THREE.Vector3());
      model.position.sub(center);
      model.castShadow = true;
      model.receiveShadow = true;
      scene.add(model);

      const modelMeshes = []
      model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          modelMeshes.push(child.name);
        }
      });
      modelStore.SetMeshNames(modelMeshes);
    },
  );

  // Get window size
  const windowWidth = window.innerWidth;
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
  camera.position.set(0, 0, 5);

  // Orbit controls
  const controls = new OrbitControls(camera, canvas);
  controls.autoRotate = true;
  controls.enableZoom = true;
  controls.enablePan = false;
  controls.minDistance = 3; // Closest zoom level
  controls.maxDistance = 8; // Furthest zoom level


  controls.target.set(0,0,0);
  controls.update();

  // Axes visualizer
  const axesHelper = new THREE.AxesHelper(3);

  // Ambient Light (soft global light)
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambientLight);

  // Key light (main bright light)
  const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
  keyLight.position.set(5, 10, 5);
  keyLight.castShadow = true;
  scene.add(keyLight)
  const keyLightHelper = new THREE.DirectionalLightHelper(keyLight);
  scene.add(keyLightHelper)

  // Fill Light (secondary top left light)
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.2);
  fillLight.position.set(-5, 5, 5);
  fillLight.castShadow = false;

  // Rim Light (backlit light to crispen edges)
  const rimLight = new THREE.DirectionalLight(0xffffff, 0.6);
  rimLight.position.set(0, 5, -5);
  rimLight.castShadow = false;

  // Floor (only show shadows)
  const floorGeo = new THREE.PlaneGeometry(50, 50);
  const floorMat = new THREE.ShadowMaterial({ opacity: 0.3 });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2; // Lie the plane flat
  floor.position.y = -2.5; // Position below model
  floor.receiveShadow = true;
  scene.add(floor);

/*
  CUBE FOR TESTING
  const cg = new THREE.BoxGeometry(1, 1, 1);
  const cm = new THREE.MeshStandardMaterial({color: 0x00ff00})
  const c = new THREE.Mesh(cg, cm);
  c.castShadow = true;
  scene.add(c) */

  const animate = () => {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);

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
  function ViewReset() {
    clearInterval(zoomInterval);
    controls.reset();
  }
  function RotatePause() {
    controls.autoRotate = false;
  }
  function RotatePlay() {
    controls.autoRotate = true;
  }

  // #region [colorRed] WATCHERS
  watch(
    () => controlStore.zoomIn,
    (val) => {
      if (val) {
        ZoomInStart();
      } else {
        ZoomStop();
      }
    },
  );
  watch(
    () => controlStore.zoomOut,
    (val) => {
      if (val) {
        ZoomOutStart();
      } else {
        ZoomStop();
      }
    },
  );
  watch(
    () => controlStore.viewReset,
    (val) => {
      if (val) {
        ViewReset();
      } else {
        ZoomStop();
      }
    },
  );
  watch(
    () => controlStore.rotate,
    (val) => {
      if (val) {
        RotatePlay();
      } else {
        RotatePause();
      }
    },
  );
  watch(
    () => materialStore.colorSet,
    (val) => {
      if (val) {
        LoadColor(materialStore.color);
      }
    },
  );
  watch(
    () => materialStore.colorReset,
    (val) => {
      if (val) {
        ResetColor();
      }
    },
  );
  watch(
    () => materialStore.selectedMaterial,
    (newMaterial) => {
    if (newMaterial) {
      LoadMaterial(newMaterial);
    }
  });
watch(
  () => [materialStore.previewColor, materialStore.activeColor],
  ([preview, active]) => {
    if (preview) {
      LoadColor(preview);
    } else {
      LoadColor(active);
    }
  },
  { immediate: true }
);
  // #endregion
});
</script>
<template>
  <canvas id="canvas"></canvas>
  <div id="gui-container"></div>
</template>
<style scoped>
  canvas {
    display: block;
    z-index: 0;
    width: 100%;
    height: 100%;
    position: absolute;
  }

  #gui-container {
    position: absolute;
    top: 20px;
    left: 20px;
    z-index: 10;
  }
</style>
