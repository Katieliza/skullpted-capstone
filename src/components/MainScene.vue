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
 * Auto-load texture maps for given material.
 *
 * @param {string} basePath - Base directory path where texture files are located
 * @param {string} baseName - Base filename for the texture set
 * @param {Object} mapSuffix - Object map material properties to filename suffixes
 * @param {string} mapSuffix.map - Suffix for the diffuse/color map (default: "BaseColor")
 * @param {string} mapSuffix.roughnessMap - Suffix for the roughness map (default: "Roughness")
 * @param {string} mapSuffix.metalnessMap - Suffix for the metalness map (default: "Metallic")
 * @param {string} mapSuffix.normalMap - Suffix for the normal map (default: "Normal")
 * @returns {Object} Object containing loaded texture maps keyed by material property names
 *
 * Process:
 * Init empty maps object to store loaded textures.
 * Iterate through each entry in the mapSuffix object:
 *    - Extract the property name (key) and suffix value.
 *    - Construct the full URL path using pattern: basePath/baseName_suffix.jpg
 *    - Load the texture using textureLoader.
 *    - Store the loaded texture in the maps object.
 * Return the completed maps object containing all loaded textures.
 *
 * @requires textureLoader - THREE.TextureLoader instance for loading image files
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
 * Loads material onto the active mesh or all meshes if none are selected.
 *
 * @param {string} mat - Display name of material to be loaded.
 *
 * Process:
 * Retrieve the active mesh from modelStore.
 * Retrieve the base filename for the selected material.
 * Load the texture maps from the texture folder.
 * Traverse through all meshes in the model.
 * Skip non-mesh objects or meshes that don't match the active mesh.
 * Dispose of any existing material.
 * Create an apply new material with the loaded textures.
 * Update material state in the store.
 * Update store flag to indicate material has been reset.
 *
 * @requires textureLoader - THREE.TextureLoader instance for loading image files
 * @requires model - The loaded 3D model must be available.
 * @requires modelStore - Contains active mesh information.
 * @requires materialStore - Contains material information.
 * @requires LoadTextureMaps - Function to load texture maps based on material name.
 */
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

  // #region [colorTeal] HEX COLOR LOADER
    /**
     * Apply a color to the active mesh or entire model if no active mesh.
     *
     * @param {number} hex - Target color as a hexadecimal number
     *
     * Process:
     * Retrieve the active mesh name from modelStore.
     * Verify the model is loaded, exit with error if not.
     * Init empty array to track meshes to be animated.
     * Determine which meshes to animate based on selection state:
     *    a. If a specific mesh is selected (activeMeshName exists):
     *      - Find the target mesh by name.
     *      - Add only this mesh to the animation array if found.
     *      - Log error and exit if mesh not found.
     *    b. If no specific mesh is selected:
     *      - Check if modelStore.meshNames array exists and has entries:
     *         - Find each mesh by name and add to animation array if found.
     *       - If meshNames is empty, fallback to traversing all meshes:
     *         - Add all mesh objects with materials to animation array.
     * Check if any meshes were found to animate:
     *    a. If meshes found, call LerpColors to animate color transition.
     *    b. If no meshes found, log warning.
     *
     * @requires model - Loaded 3D model
     * @requires modelStore - Store with mesh information
     * @requires FindMeshByName - Function to locate meshes by name
     * @requires LerpColors - Function to animate color transitions
     */
    // #endregion

  function LoadColor(hex) {
    // console.log("Color to be loaded:", hex);
    const activeMeshName = modelStore.activeMesh;
    if (!model) {
      console.error("Model not loaded");
      return;
    }
    var meshesToAnimate = [];
    // If a specific mesh is selected, only animate that one
    if (activeMeshName) {
      const targetMesh = FindMeshByName(activeMeshName);
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
      // console.log('No mesh selected - applying to all meshes');
      // If meshNames is populated, use those names
      if (modelStore.meshNames && modelStore.meshNames.length > 0) {
        modelStore.meshNames.forEach(meshName => {
          const mesh = FindMeshByName(meshName);
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
    // If there are meshes to animate, do it
    if (meshesToAnimate.length > 0) {
      LerpColors(meshesToAnimate, hex, 0.5);
    } else {
      console.warn("No meshes found to apply color to");
    }
  }

  // #region [colorTeal] CUBIC FUNCTION
  /**
  * Implements a cubic easing function.
  *
  * @param {number} x - Input value between 0 and 1
  * @returns {number} - Eased value between 0 and 1
  *
  * Process:
  * Check if input value is in first or second half of animation.
  * For first half (x < 0.5): Apply cubic acceleration using 4x³
  * For second half (x ≥ 0.5): Apply cubic deceleration using 1-(-2x+2)³/2
  * Return the calculated eased value
  */
  // #endregion

var currentAnimation = null;
function EaseInOutCubic(x) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3)/2;
}

// #region [colorTeal] COLOR ANIMATOR
/**
 * Animates a smooth color transition.
 * @param {Array<THREE.Mesh>} meshesToAnimate - Array of meshes to animate
 * @param {number} endHex - Target color as a hexadecimal number
 * @param {number} [duration=0.5] - Duration of the animation in seconds
 *
 * Process:
 * Cancel any existing animation by calling cancelAnimationFrame.
 * Reset the currentAnimation tracking variable.
 * Convert target hex color to THREE.Color object.
 * Init startTime as null (will be set on first animation frame).
 * Store starting colors for each mesh to be animated.
 * Clone materials to prevent shared material modifications.
 * Define nested animation function that:
 *   - Sets startTime on first call
 *   - Calculates elapsed time and animation progress
 *   - Applies easing function to progress value
 *   - Updates each mesh's color using color interpolation
 *   - Schedules next frame if animation not complete
 *   - Clears animation reference when complete
 * 8. Start the animation by requesting first frame.
 *
 * @requires EaseInOutCubic - Easing function
 * @requires currentAnimation - Global variable for tracking animation state
 */
// #endregion
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

// #region [colorTeal] FIND MESH BY NAME
/**
 * Find mesh by name within the model.
 * @param {string} meshName - The name of the mesh to find
 * @returns {THREE.Mesh|null} - The found mesh or null if no matching mesh is found.
 *
 * Process:
 * Init targetMesh variable as null.
 * Verify model exists, return null if not available.
 * Traverse through all objects in the model hierarchy.
 * For each child object, check if it's a mesh and has matching name.
 * If match found, store reference to the mesh.
 * Return the found mesh or null if no match.
 *
 *  @requires model - Loaded 3D model.
 */
// #endregion

function FindMeshByName(meshName) {
  let targetMesh = null;
  if (!model) return null;

  model.traverse((child) => {
    if (child.isMesh && child.name === meshName) {
      targetMesh = child;
    }
  });

  return targetMesh;
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
