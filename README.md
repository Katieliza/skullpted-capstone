## 🎧 Skullpted
Skullpted is an interactive 3D headphone configurator built with Vue.js and Three.js. It allows users to customize a 3D model of headphones in real time—changing textures, colors, and scene lighting with intuitive controls. Designed with modularity and extensibility in mind, Skullpted can support different 3D models beyond headphones.


## 💡 Motivation

Skullpted is designed for users who want personalized audio gear—whether for style, ergonomics, or expression. Instead of browsing static images, users can visualize and experiment with design elements in real-time.


## 🌟 Features
* Real-time customization of 3D headphone models

* Individual mesh selection for fine-grained control or global coloring

* Hex color picker + predefined color swatches with hover previews

* Scene lighting controls via a dynamic GUI

* Toggleable Three.js helpers to visualize light direction

* Smooth color transitions using lerp for visual polish

* Component-based architecture for clean separation between UI and 3D scene logic

* Dynamic model setup for easy reuse with different 3D assets
  

## 🛠️ Tech Stack
* Vue.js — UI framework

* Vuetify — UI component library

* Three.js — 3D rendering engine
  
* Pinia — State management
  
* Blender — 3D modeling

* Vite — Build tool & dev server

* JavaScript / HTML / CSS


## 📦 Key Dependencies
* [Vue.js](https://vuejs.org/) v3.5.13 — Reactive front-end framework
  
* [Vuetify](https://vuetifyjs.com/en/) v3.8.0-beta.0 - Material Design component framework for Vue 3
  
* [Pinia](https://pinia.vuejs.org/) v3.0.1 - Lightweight state management library for Vue
  
* [Three.js](https://threejs.org/) v0.175.0 — JavaScript 3D rendering engine
  
* [GLTFLoader](https://threejs.org/docs/#examples/en/loaders/GLTFLoader) — Three.js extension for loading `.gltf`/`.glb` 3D models
  
* [dat.GUI](https://github.com/dataarts/dat.gui) — Lightweight GUI for real-time variable manipulation
  
* [Vite](https://vitejs.dev/) — Build tool and development server for modern web apps
  

## 🚀 Getting Started

### Prerequisites

* Node.js (v16 or higher)
* npm (v8 or higher)

### Installation

```bash
git clone https://github.com/yourusername/skullpted.git
cd skullpted
npm install
```
## 📁 Project Structure

<details>
<summary><strong>📂 public/</strong></summary>

```plaintext
public/
├── models/
│   └── skullpted_headphones/
│       ├── scene.bin
│       └── scene.gltf
├── textures/
│   ├── texture_name_BaseColor.jpg
│   ├── texture_name_Normal.jpg
│   ├── texture_name_Roughness.jpg
│   └── texture_name_Metallic.jpg
```
</details> <br> <details> <summary><strong>📂 src/</strong></summary>
  
```plaintext
src/
├── components/
│   ├── AppIntro.vue       # Landing page UI
│   ├── AppMain.vue        # Main UI for controls and customization
│   ├── IntroScene.vue     # Three.js canvas for landing page
│   └── MainScene.vue      # Three.js scene with logic and model interaction
├── stores/
│   ├── controlStore.js    # Controls and app state
│   ├── materialStore.js   # Material/color data
│   └── modelStore.js      # Model and mesh data
├── App.vue
└── main.js
```
</details>

## Customizing Models
Skullpted supports any .gltf model structured with individually named meshes. To add your own model:

* Place the folder containing the model and scene information in public/

* In MainScene, update gltfLoader with the path to the .gltf file to load your model
   
* Adjust mesh interaction logic as needed

## Customizing Textures
Skullpted also supports dynamic texture loading to easily add new textures to the project. To add your own textures:

* Place the textures in public/textures/
   
* Ensure the files follow this naming convention for each map
 
   * texture_name_BaseColor
   
   * texture_name_Normal
   
   * texture_name_Roughness
   
   * texture_name_Metallic

  *Note: You may change the naming conventions by modifying the LoadTextureMaps function within MainScene. Just ensure the function names align with the file names.*
