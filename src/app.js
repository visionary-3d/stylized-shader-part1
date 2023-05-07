import * as THREE from 'three'
import {
  addPass,
  useCamera,
  useGui,
  useRenderSize,
  useRenderer,
  useScene,
  useTick,
} from './render/init.js'
// import postprocessing passes
import { SavePass } from 'three/examples/jsm/postprocessing/SavePass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { BlendShader } from 'three/examples/jsm/shaders/BlendShader.js'
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js'

import SWORD_MODEL from './models/sword.glb'
import TOON_TONE from './images/textures/threeTone.jpg'
import HDRI from './images/textures/env.exr'

const gltfLoader = new GLTFLoader()
const exrLoader = new EXRLoader()

const startApp = () => {
  const scene = useScene()
  const camera = useCamera()
  const gui = useGui()
  const { width, height } = useRenderSize()

  const ROTATION_SPEED = 0.02
  const MOTION_BLUR_AMOUNT = 0.25

  // lighting
  const dirLight = new THREE.DirectionalLight('#ffffff', 1.5)
  const dirLight2 = new THREE.DirectionalLight('#ffffff', 1.5)
  dirLight2.position.y += 5
  const dirLight3 = new THREE.DirectionalLight('#ffffff', 1.5)
  dirLight2.position.x -= 5
  const ambientLight = new THREE.AmbientLight('#ffffff', 1)
  scene.add(dirLight, dirLight3, ambientLight)
















  // Mesh setup

  const _addTorus = async () => {
    const geometry = new THREE.TorusKnotGeometry(1, 0.4, 100, 100)
    const material = new THREE.MeshPhysicalMaterial({
      color: '#4e62f9',
    })
    const torus = new THREE.Mesh(geometry, material)

    scene.add(torus)
  }

  _addTorus()

  const _addModel = async () => {
    let exrCubeRenderTarget

    const renderer = useRenderer()
    const pmremGenerator = new THREE.PMREMGenerator(renderer)
    pmremGenerator.compileEquirectangularShader()

    const gltf = await gltfLoader.loadAsync(SWORD_MODEL)

    const model = gltf.scene.children[0]

    const tex = await exrLoader.loadAsync(HDRI)
    tex.mapping = THREE.EquirectangularReflectionMapping
    exrCubeRenderTarget = pmremGenerator.fromEquirectangular(tex)

    model.material.envMap = exrCubeRenderTarget.texture

    scene.add(model)
  }

  // _addModel()











  // GUI
  const cameraFolder = gui.addFolder('Camera')
  cameraFolder.add(camera.position, 'z', 0, 10)
  cameraFolder.open()

  // postprocessing
  const renderTargetParameters = {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    stencilBuffer: false,
  }

  // save pass
  const savePass = new SavePass(new THREE.WebGLRenderTarget(width, height, renderTargetParameters))

  // blend pass
  const blendPass = new ShaderPass(BlendShader, 'tDiffuse1')
  blendPass.uniforms['tDiffuse2'].value = savePass.renderTarget.texture
  blendPass.uniforms['mixRatio'].value = MOTION_BLUR_AMOUNT

  // output pass
  const outputPass = new ShaderPass(CopyShader)
  outputPass.renderToScreen = true

  // adding passes to composer
  addPass(blendPass)
  addPass(savePass)
  addPass(outputPass)

  useTick(({ timestamp, timeDiff }) => {})
}

export default startApp
