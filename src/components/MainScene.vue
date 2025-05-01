<script setup>
import { onMounted, watch, ref } from "vue";
import { useControlStore } from "@/stores/controlStore.js";
import { useModelStore } from "@/stores/modelStore.js";
import { useMaterialStore } from "@/stores/materialStore.js";
import * as THREE from "three";
import * as DAT from "dat.gui";
import { ObjectControls } from "threejs-object-controls"
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Init stores
const controlStore = useControlStore();
const modelStore = useModelStore();
const materialStore = useMaterialStore();

// Init texture loaders
const textureLoader = new THREE.TextureLoader();
const gltfLoader = new GLTFLoader();

// Init 3D model
let model = new THREE.Object3D();
let colorParams, colorController;

// region [colorBlack] TEXTURE MAP LOADER
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

// region [colorBlack] MATERIAL LOADER
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

  // #region [colorBlack] HEX COLOR LOADER
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

  // #region [colorBlack] CUBIC FUNCTION
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

// #region [colorBlack] COLOR ANIMATOR
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
 *   - Updates the GUI color picker in real-time
 *   - Schedules next frame if animation not complete
 *   - Clears animation reference when complete
 * 8. Start the animation by requesting first frame.
 *
 * @requires EaseInOutCubic - Easing function
 * @requires currentAnimation - Global variable for tracking animation state
 * @requires colorParams - Object containing the current color parameter for the GUI
 * @requires colorController - The gui controller for the color picker
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

        // Update GUI with the current color of the first mesh (real-time update)
        if (i === 0) {
          // Convert the current color to hex string
          const currentHex = '#' + currentColor.getHexString();

          // Only update if the color has changed enough (to avoid constant updates)
          if (colorParams.color !== currentHex) {
            colorParams.color = currentHex;
            // Update the GUI without triggering onChange event to avoid recursion
            const oldOnChange = colorController.__onChange;
            colorController.__onChange = function() {};
            colorController.updateDisplay();
            colorController.__onChange = oldOnChange;
          }
        }
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

// #region [colorBlack] FIND MESH BY NAME
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

  // GUI settings
  colorParams = {
    color: "#ffffff",
  }

  // Ambient light options
  const ambientLightParams = {
    intensity: 0.5,
  }

  // Key light options
  const keyLightParams = {
    intensity: 1.0,
    posX: 5,
    posY: 5,
    posZ: 5,
    showHelper: false,
  }

  // Fill light options
  const fillLightParams = {
    intensity: 0.5,
    posX: 5,
    posY: 5,
    posZ: 5,
    showHelper: false,
  }

  // Rim Light options
  const rimLightParams = {
    intensity: 0.5,
    posX: 0,
    posY: 5,
    posZ: -5,
    showHelper: false,
  }

  // GUI color controller
  colorController = gui.addColor(colorParams, "color")
    .name("Color")
    .onChange((value) => {
      const hex = new THREE.Color(value).getHex();
      LoadColor(hex);
    })

  // Lighting folder
  const lightingFolder = gui.addFolder("Lighting");
  lightingFolder.open();

    // Ambient light folder
    const ambientLightFolder = lightingFolder.addFolder("Ambient Light");
    ambientLightFolder.add(ambientLightParams, "intensity", 0, 1, 0.01)
      .name("Intensity")
      .onChange((value) => {
        ambientLight.intensity = value;
      });

    // Key light folder
    const keyLightFolder = lightingFolder.addFolder("Key Light");
    keyLightFolder.add(keyLightParams, "intensity", 0, 1, 0.01)
      .name("Intensity")
      .onChange((value) => {
        keyLight.intensity = value;
        keyLightHelper.update();
      });
    keyLightFolder.add(keyLightParams, "posX", -5, 5, 0.01)
      .name("X-Axis Position")
      .onChange((value) => {
        keyLight.position.x = value;
        keyLightHelper.update();
      });
    keyLightFolder.add(keyLightParams, "posY", -5, 5, 0.01)
      .name("Y-Axis Position")
      .onChange((value) => {
        keyLight.position.y = value;
        keyLightHelper.update();
      });
    keyLightFolder.add(keyLightParams, "posZ", -5, 5, 0.01)
      .name("Z-Axis Position")
      .onChange((value) => {
        keyLight.position.z = value;
        keyLightHelper.update();
      });
    keyLightFolder.add(keyLightParams, 'showHelper')
      .name("Toggle Helper")
      .onChange(value => {
        keyLightHelper.visible = value;
        keyLightHelper.update();
      });

    // Fill light folder
    const fillLightFolder = lightingFolder.addFolder("Fill Light");
    fillLightFolder.add(fillLightParams, "intensity", 0, 1, 0.01)
      .name("Intensity")
      .onChange((value) => {
        fillLight.intensity = value;
      });
      fillLightFolder.add(fillLightParams, "posX", -5, 5, 0.01)
      .name("X-Axis Position")
      .onChange((value) => {
        fillLight.position.x = value;
      });
      fillLightFolder.add(fillLightParams, "posY", -5, 5, 0.01)
      .name("Y-Axis Position")
      .onChange((value) => {
        fillLight.position.y = value;
      });
      fillLightFolder.add(fillLightParams, "posZ", -5, 5, 0.01)
      .name("Z-Axis Position")
      .onChange((value) => {
        fillLight.position.z = value;
      });
      fillLightFolder.add(fillLightParams, 'showHelper')
      .name("Toggle Helper")
      .onChange(value => {
        fillLightHelper.visible = value;
        fillLightHelper.update();
      });

    // Rim Light folder
    const rimLightFolder = lightingFolder.addFolder("Rim Light");
    rimLightFolder.add(rimLightParams, "intensity", 0, 1, 0.01)
      .name("Intensity")
      .onChange((value) => {
        rimLight.intensity = value;
      });
      rimLightFolder.add(rimLightParams, "posX", -5, 5, 0.01)
      .name("X-Axis Position")
      .onChange((value) => {
        rimLight.position.x = value;
      });
      rimLightFolder.add(rimLightParams, "posY", -5, 5, 0.01)
      .name("Y-Axis Position")
      .onChange((value) => {
        rimLight.position.y = value;
      });
      rimLightFolder.add(rimLightParams, "posZ", -5, 5, 0.01)
      .name("Z-Axis Position")
      .onChange((value) => {
        rimLight.position.z = value;
      });
      rimLightFolder.add(rimLightParams, 'showHelper')
      .name("Toggle Helper")
      .onChange(value => {
        rimLightHelper.visible = value;
        rimLightHelper.update();
      });

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

  // Controls
  const controls = new ObjectControls(camera, canvas, model);
  controls.enableHorizontalRotation();
  controls.enableVerticalRotation();
  controls.setRotationSpeed(0.5);
  controls.setZoomSpeed(0.5);
  controls.setDistance(2, 15);

  // Axes visualizer
  const axesHelper = new THREE.AxesHelper(3);

  // Ambient Light (soft global light)
  const ambientLight = new THREE.AmbientLight(0xffffff, ambientLightFolder.intensity);
  scene.add(ambientLight);

  // Key light (main bright light)
  const keyLight = new THREE.DirectionalLight(0xffffff, keyLightFolder.intensity);
  keyLight.position.set(keyLightParams.posX, keyLightParams.posY, keyLightParams.posZ);
  keyLight.castShadow = true;
  scene.add(keyLight)

  // Key light helper (visualize position)
  const keyLightHelper = new THREE.DirectionalLightHelper(keyLight, 2);
  keyLightHelper.visible = keyLightParams.showHelper;
  scene.add(keyLightHelper)
  keyLightHelper.update();

  // Fill Light (secondary top left light)
  const fillLight = new THREE.DirectionalLight(0xffffff, fillLightFolder.intensity);
  fillLight.castShadow = false;
  scene.add(fillLight);

  // Fill light helper (visualize position)
  const fillLightHelper = new THREE.DirectionalLightHelper(fillLight, 2);
  fillLightHelper.visible = fillLightParams.showHelper;
  scene.add(fillLightHelper)
  fillLightHelper.update();

  // Rim Light (backlit light to crispen edges)
  const rimLight = new THREE.DirectionalLight(0xffffff, rimLightFolder.intensityy);
  rimLight.castShadow = false;
  scene.add(rimLight);

  // Rim light helper (visualize position)
  const rimLightHelper = new THREE.DirectionalLightHelper(rimLight, 2);
  rimLightHelper.visible = rimLightParams.showHelper;
  scene.add(rimLightHelper)
  rimLightHelper.update();

  // Floor (only show shadows)
  const floorGeo = new THREE.PlaneGeometry(50, 50);
  const floorMat = new THREE.ShadowMaterial({ opacity: 0.3 });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2; // Lie the plane flat
  floor.position.y = -2.5; // Position below model
  floor.receiveShadow = true;
  scene.add(floor);

  // #region [colorBlack] GLTF MODEL LOADER
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

  function animate() {
    if (!controls.isUserInteractionActive()) {
      model.rotation.y += 0.01;
    }
    renderer.render(scene, camera);
  }
  renderer.setAnimationLoop(animate);

  // #region [colorBlack] WATCHERS

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

watch(
  () => controlStore.zoomLevel,
  (newZoom) => {
    if (controls && typeof controls.setDistance === 'function') {
      console.log("zoom watch triggered")
      if (camera) {
        camera.position.z = newZoom
      }
    }
  }
)

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
