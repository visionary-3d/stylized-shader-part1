/* eslint-disable arrow-parens */
/* eslint-disable semi */
/* eslint-disable object-curly-spacing */
/* eslint-disable linebreak-style */
import metaversefile from 'metaversefile'
import * as THREE from 'three'

import {
  dotParticlesFragment,
  dotParticlesVertex,
} from './shaders/dotParticles.js'

import {
  environmentFragment,
  environmentVertex,
} from './shaders/environment.js'
import { rainbowFragment, rainbowVertex } from './shaders/rainbow.js'
import {
  starParticlesFragment,
  starParticlesVertex,
} from './shaders/starParticles.js'

import { smokeFragment, smokeVertex } from './shaders/smokes.js'
import { rgbFragment, rgbVertex } from './shaders/rgb.js'

const { useApp, useLoaders, useFrame, useCleanup, usePhysics, useInternals } =
  metaversefile

const baseUrl = import.meta.url.replace(/(\/)[^\/\/]*$/, '$1')

let physicsIds = []
let elapsedTime = 0
let spaceship = []

// let rotationAnimation = false
// let lastRotationNumber = 0

const thickenGeometry = (geometry, ratio) => {
  var positionAttribute = geometry.attributes.position
  var normalAttribute = geometry.attributes.normal

  for (var i = 0; i < positionAttribute.count; i++) {
    // access single vertex (x,y,z)
    var x = positionAttribute.getX(i)
    var y = positionAttribute.getY(i)
    var z = positionAttribute.getZ(i)
    x += normalAttribute.getX(i) * ratio
    y += normalAttribute.getY(i) * ratio
    z += normalAttribute.getZ(i) * ratio
    positionAttribute.setXYZ(i, x, y, z)
  }
}
export default (e) => {
  const app = useApp()
  app.name = 'neon-club'
  const localPlayer = metaversefile.useLocalPlayer()

  // const camera = useInternals().camera
  const gl = useInternals().renderer
  const physics = usePhysics()
  gl.outputEncoding = THREE.sRGBEncoding
  gl.autoClear = false
  // const customOutline = new CustomOutlinePass(
  //   new THREE.Vector2(window.innerWidth, window.innerHeight),
  //   rootScene,
  //   camera
  // )
  // const uniforms = customOutline.fsQuad.material.uniforms
  // uniforms.outlineColor.value = new THREE.Color('black')
  // uniforms.outlineThickness.value = 1.5
  // composer.addPass(customOutline)
  // composer.addPass(
  //   new UnrealBloomPass(
  //     new THREE.Vector2(window.innerWidth, window.innerHeight),
  //     0.2,
  //     0,
  //     0
  //   )
  // )

  const threeTone = new THREE.TextureLoader().load(
    baseUrl + 'textures/threeTone.jpg'
  )
  threeTone.minFilter = threeTone.magFilter = THREE.NearestFilter

  const stroke = 0.2
  const outlineStroke = 0.013
  const airplaneGeometry = new THREE.TorusKnotBufferGeometry(
    0.5,
    stroke,
    200,
    200
  )
  const airplaneOutlineGeometry = new THREE.TorusKnotBufferGeometry(
    0.5,
    stroke + outlineStroke,
    200,
    200
  )
  const airplaneMaterial = new THREE.MeshToonMaterial({
    color: '#466272',
    gradientMap: threeTone,
  })
  const airplaneOutlineMaterial = new THREE.MeshBasicMaterial({
    color: '#000000',
    side: THREE.BackSide,
  })
  const airplane = new THREE.Mesh(airplaneGeometry, airplaneMaterial)
  const airplaneOutline = new THREE.Mesh(
    airplaneOutlineGeometry,
    airplaneOutlineMaterial
  )
  airplane.add(airplaneOutline)
  // airplane.rotation.y -= Math.PI / 2
  airplane.updateMatrixWorld()
  // app.add(airplane)

  const outlineMaterial = new THREE.MeshBasicMaterial({
    color: '#000000',
    side: THREE.BackSide,
  })

  const rainbowMaterial = new THREE.ShaderMaterial({
    vertexShader: rainbowVertex,
    fragmentShader: rainbowFragment,
    vertexColors: true,
    // wireframe:true,
    transparent: true,
    side: THREE.FrontSide,
    uniforms: {
      uTime: { value: 0 },
      uResolution: {
        value: new THREE.Vector2(window.innerWidth, window.innerHeight),
      },
      uTexture: { value: null },
    },
  })

  class CustomSinCurve extends THREE.Curve {
    constructor(scale = 1) {
      super()

      this.scale = scale
    }

    getPoint(t, optionalTarget = new THREE.Vector3()) {
      const tx = t * 3 - 1.5
      const ty = Math.sin(2 * Math.PI * t) / 7
      const tz = 0

      return optionalTarget.set(tx, ty, tz).multiplyScalar(this.scale)
    }
  }

  const path = new CustomSinCurve(2)
  const rainbowGasGeometry = new THREE.TubeGeometry(path, 100, 0.1, 100, false)
  const rainbowGas = new THREE.Mesh(rainbowGasGeometry, rainbowMaterial)
  rainbowGas.position.z = -3.8
  rainbowGas.updateMatrixWorld()
  // app.add(rainbowGas)
  // console.log(path)

  const smokes = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2, 10, 10),
    new THREE.ShaderMaterial({
      depthWrite: false,
      vertexShader: smokeVertex,
      fragmentShader: smokeFragment,
      vertexColors: true,
      // wireframe:true,
      transparent: true,
      // side: THREE.DoubleSide,
      uniforms: {
        uTime: { value: 0 },
        uResolution: {
          value: new THREE.Vector2(window.innerWidth, window.innerHeight),
        },
      },
    })
  )
  smokes.position.z = -1.2
  smokes.position.y = 0.5
  smokes.position.x = -0.4
  // smokes.rotation.z -= Math.PI / 20
  smokes.updateMatrixWorld()
  // app.add(smokes)
  const smokes2 = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2, 10, 10),
    new THREE.ShaderMaterial({
      depthWrite: false,
      vertexShader: smokeVertex,
      fragmentShader: smokeFragment,
      vertexColors: true,
      // wireframe:true,
      transparent: true,
      // side: THREE.DoubleSide,
      uniforms: {
        uTime: { value: 0 },
        uResolution: {
          value: new THREE.Vector2(window.innerWidth, window.innerHeight),
        },
      },
    })
  )
  smokes2.position.z = -1.2
  smokes2.position.y = 0.5
  smokes2.position.x = 0.8
  // smokes2.rotation.z -= Math.PI / 15
  smokes2.updateMatrixWorld()
  // app.add(smokes2)

  const rgbMaterial = new THREE.ShaderMaterial({
    vertexShader: rgbVertex,
    fragmentShader: rgbFragment,
    vertexColors: true,
    // wireframe:true,
    // transparent: true,
    side: THREE.FrontSide,
    uniforms: {
      uTime: { value: 0 },
      uResolution: {
        value: new THREE.Vector2(window.innerWidth, window.innerHeight),
      },
      uTexture: { value: null },
    },
  })

  const toonMaterial = new THREE.MeshToonMaterial({
    color: '#b0b7ba',
    gradientMap: threeTone,
  })

  const loadCloudPlanetModel = (params) => {
    return new Promise((resolve, reject) => {
      const { gltfLoader } = useLoaders()
      const { dracoLoader } = useLoaders()
      gltfLoader.setDRACOLoader(dracoLoader).setCrossOrigin('anonymous')

      gltfLoader.load(params.filePath + params.fileName, (gltf) => {
        gltf.scene.traverse((child) => {
          if (child.isMesh) {
            // console.log(child.name)
            child.rotation.set(
              params.rotation.x,
              params.rotation.y,
              params.rotation.z
            )
            child.updateMatrixWorld()
            if (child.name === 'Planet02') {
              child.material = rgbMaterial
            } else {
              child.material = toonMaterial
            }
            const outline = new THREE.Mesh(
              child.geometry.clone(),
              outlineMaterial
            )
            outline.rotation.set(
              params.rotation.x,
              params.rotation.y,
              params.rotation.z
            )
            thickenGeometry(outline.geometry, 0.15)
            gltf.scene.add(outline)
          }
        })
        gltf.scene.position.set(
          params.position.x,
          params.position.y,
          params.position.z
        )
        gltf.scene.updateMatrixWorld()
        resolve(gltf.scene)
      })
    })
  }
  const loadEarthPlanetModel = (params) => {
    return new Promise((resolve, reject) => {
      const { gltfLoader } = useLoaders()
      const { dracoLoader } = useLoaders()
      gltfLoader.setDRACOLoader(dracoLoader).setCrossOrigin('anonymous')

      gltfLoader.load(params.filePath + params.fileName, (gltf) => {
        gltf.scene.traverse((child) => {
          if (child.isMesh) {
            // console.log(child.name)
            child.rotation.set(
              params.rotation.x,
              params.rotation.y,
              params.rotation.z
            )
            child.updateMatrixWorld()
            if (child.name === 'Planet01') {
              child.material = new THREE.MeshBasicMaterial({
                map: child.material.map,
              })
            } else {
              child.material = toonMaterial
            }
            const outline = new THREE.Mesh(
              child.geometry.clone(),
              outlineMaterial
            )
            outline.rotation.set(
              params.rotation.x,
              params.rotation.y,
              params.rotation.z
            )
            thickenGeometry(outline.geometry, 0.15)
            gltf.scene.add(outline)
          }
        })
        gltf.scene.position.set(
          params.position.x,
          params.position.y,
          params.position.z
        )
        gltf.scene.updateMatrixWorld()
        resolve(gltf.scene)
      })
    })
  }
  const loadRingPlanetModel = (params) => {
    return new Promise((resolve, reject) => {
      const { gltfLoader } = useLoaders()
      const { dracoLoader } = useLoaders()
      gltfLoader.setDRACOLoader(dracoLoader).setCrossOrigin('anonymous')

      gltfLoader.load(params.filePath + params.fileName, (gltf) => {
        gltf.scene.traverse((child) => {
          if (child.isMesh) {
            // console.log(child.name)
            child.rotation.set(
              params.rotation.x,
              params.rotation.y,
              params.rotation.z
            )
            child.updateMatrixWorld()
            // if (
            //   child.name === 'Planet05' ||
            //   child.name === 'Planet05_Moon01' ||
            //   child.name === 'Planet05_Moon02'
            // ) {
            child.material = new THREE.MeshBasicMaterial({
              map: child.material.map,
            })
            // } else {
            //   child.material = rgbMaterial
            // }
            const outline = new THREE.Mesh(
              child.geometry.clone(),
              outlineMaterial
            )
            outline.rotation.set(
              params.rotation.x,
              params.rotation.y,
              params.rotation.z
            )
            thickenGeometry(outline.geometry, 0.15)
            gltf.scene.add(outline)
          }
        })
        gltf.scene.position.set(
          params.position.x,
          params.position.y,
          params.position.z
        )
        gltf.scene.updateMatrixWorld()
        resolve(gltf.scene)
      })
    })
  }
  const loadMountainPlanetModel = (params) => {
    return new Promise((resolve, reject) => {
      const { gltfLoader } = useLoaders()
      const { dracoLoader } = useLoaders()
      gltfLoader.setDRACOLoader(dracoLoader).setCrossOrigin('anonymous')

      gltfLoader.load(params.filePath + params.fileName, (gltf) => {
        gltf.scene.traverse((child) => {
          if (child.isMesh) {
            // console.log(child.name)

            if (
              child.name === 'Planet_Cloud_1' ||
              child.name === 'Planet_Cloud_2'
            ) {
              child.material = new THREE.MeshBasicMaterial({ color: '#eed46d' })
            } else {
              // child.material = rgbMaterial
            }
            const outline = new THREE.Mesh(
              child.geometry.clone(),
              outlineMaterial
            )
            thickenGeometry(outline.geometry, 0.15)
            gltf.scene.add(outline)
          }
        })
        gltf.scene.position.set(
          params.position.x,
          params.position.y,
          params.position.z
        )
        gltf.scene.updateMatrixWorld()
        resolve(gltf.scene)
      })
    })
  }
  const loadTreePlanetModel = (params) => {
    return new Promise((resolve, reject) => {
      const { gltfLoader } = useLoaders()
      const { dracoLoader } = useLoaders()
      gltfLoader.setDRACOLoader(dracoLoader).setCrossOrigin('anonymous')

      gltfLoader.load(params.filePath + params.fileName, (gltf) => {
        gltf.scene.traverse((child) => {
          if (child.isMesh) {
            // console.log(child.name)
            child.scale.set(params.scale, params.scale, params.scale)
            if (
              child.name === 'Planet_Cloud_1' ||
              child.name === 'Planet_Cloud_2'
            ) {
              child.material = new THREE.MeshBasicMaterial({ color: '#eed46d' })
            } else {
              // child.material = rgbMaterial
            }
            const outline = new THREE.Mesh(
              child.geometry.clone(),
              outlineMaterial
            )
            outline.scale.set(params.scale, params.scale, params.scale)
            thickenGeometry(outline.geometry, 0.01)
            gltf.scene.add(outline)
          }
        })
        gltf.scene.position.set(
          params.position.x,
          params.position.y,
          params.position.z
        )
        gltf.scene.updateMatrixWorld()
        const planet = physics.addGeometry(gltf.scene)
        physicsIds.push(planet)
        resolve(gltf.scene)
      })
    })
  }
  // const loadSpaceshipModel = (params) => {
  //   return new Promise((resolve, reject) => {
  //     const { gltfLoader } = useLoaders()
  //     const { dracoLoader } = useLoaders()
  //     gltfLoader.setDRACOLoader(dracoLoader).setCrossOrigin('anonymous')

  //     gltfLoader.load(params.filePath + params.fileName, (gltf) => {
  //       gltf.scene.traverse((child) => {
  //         if (child.isMesh) {
  //           const box = new THREE.Box3().setFromObject(child)
  //           // console.log(box.min, box.max, box.getSize())
  //           console.log((box.min.x + box.max.x) / 2)

  //           if (child.material.name === 'Vehicle_RGB') {
  //             child.material = rgbMaterial
  //           }
  //           if (child.material.name === 'Vehicle_white') {
  //             child.material = toonMaterial
  //             child.scale.set(1.01, 1.01, 1.01)
  //           }

  //           child.updateMatrixWorld()
  //           const outline = new THREE.Mesh(
  //             child.geometry.clone(),
  //             outlineMaterial
  //           )
  //           // thickenGeometry(outline.geometry, 0.01)
  //           outline.scale.set(
  //             child.scale.x + 0.01,
  //             child.scale.y + 0.025,
  //             child.scale.z + 0.035
  //           )
  //           if (child.name === 'Vehicle034' || child.name === 'Vehicle036') {
  //             outline.scale.set(
  //               child.scale.x + 0.01,
  //               child.scale.y + 0.05,
  //               child.scale.z + 0.05
  //             )
  //           }
  //           if (
  //             child.name === 'Vehicle032' ||
  //             child.name === 'Vehicle033' ||
  //             child.name === 'Vehicle039' ||
  //             child.name === 'Vehicle040' ||
  //             child.name === 'Vehicle041' ||
  //             child.name === 'Vehicle042' ||
  //             child.name === 'Vehicle043'
  //           ) {
  //             outline.scale.set(
  //               child.scale.x + 0.01,
  //               child.scale.y + 0.02,
  //               child.scale.z + 0.02
  //             )
  //           }

  //           // outline.scale.set(
  //           //   0.2 + (box.min.x + box.max.x) / 2,
  //           //   0.2 + (box.min.y + box.max.y) / 2,
  //           //   0.2 + (box.min.z + box.max.z) / 2
  //           // )
  //           outline.position.set(
  //             child.position.x,
  //             child.position.y,
  //             child.position.z
  //           )
  //           outline.updateMatrixWorld()
  //           gltf.scene.add(outline)

  //           if (child.name === 'Vehicle010') {
  //             child.add(rainbowGas)
  //             child.add(smokes)
  //             child.add(smokes2)
  //           }

  //           // console.log(child.name)

  //           // if (child.material.name === 'Vehicle_RGB') {
  //           //   child.material = rgbMaterial
  //           // }
  //           // if (child.material.name === 'Vehicle_white') {
  //           //   child.material = toonMaterial
  //           // }
  //           // // child.position.set(0, 0, 0)
  //           // // child.updateMatrixWorld()

  //           // const outline = new THREE.Mesh(
  //           //   child.geometry.clone(),
  //           //   outlineMaterial
  //           // )
  //           // thickenGeometry(outline.geometry, 0.01)
  //           // // outline.position.set(0, 0, 0)
  //           // // outline.updateMatrixWorld()

  //           // gltf.scene.add(outline)
  //         }
  //       })
  //       // const physicsId = physics.addGeometry(gltf.scene)
  //       // physicsIds.push(physicsId)
  //       // gltf.scene.position.set(0, 0, 0)
  //       // gltf.scene.rotation.set(Math.PI, 0, 0)
  //       // gltf.scene.updateMatrixWorld()
  //       resolve(gltf.scene)
  //     })
  //   })
  // }

  // const spaceshipInfo = {
  //   fileName: 'test.glb',
  //   filePath: baseUrl + 'models/',
  // }
  // const spaceship = loadSpaceshipModel(spaceshipInfo)

  const cloudPlanetInfo = {
    fileName: 'ToonPlanet1_v2.glb',
    filePath: baseUrl + 'models/',
    position: {
      x: -20,
      y: 220,
      z: -20,
    },
    rotation: {
      x: Math.PI / 7,
      y: -Math.PI / 10,
      z: 0,
    },
  }
  const cloudPlanet = loadCloudPlanetModel(cloudPlanetInfo)
  const ringPlanetInfo = {
    fileName: 'ToonPlanet3_v2.glb',
    filePath: baseUrl + 'models/',
    position: {
      x: -90,
      y: 190,
      z: -90,
    },
    rotation: {
      x: Math.PI / 5,
      y: Math.PI / 5,
      z: 0,
    },
  }
  const ringPlanet = loadRingPlanetModel(ringPlanetInfo)

  const earthPlanetInfo = {
    fileName: 'ToonPlanet5_v2.glb',
    filePath: baseUrl + 'models/',
    position: {
      x: 40,
      y: 180,
      z: -80,
    },
    rotation: {
      x: Math.PI / 5,
      y: Math.PI / 5,
      z: 0,
    },
  }
  const earthPlanet = loadEarthPlanetModel(earthPlanetInfo)

  const mountainPlanetInfo = {
    fileName: 'ToonPlanet2_v2.glb',
    filePath: baseUrl + 'models/',

    position: {
      x: 30,
      y: 200,
      z: -40,
    },
  }
  const mountainPlanet = loadMountainPlanetModel(mountainPlanetInfo)

  const treePlanetInfo = {
    fileName: 'ToonPlanet4_v2.glb',
    filePath: baseUrl + 'models/',
    position: {
      x: 0,
      y: 0,
      z: 0,
    },
    scale: 30,
  }
  const treePlanet = loadTreePlanetModel(treePlanetInfo)

  Promise.all([
    cloudPlanet,
    ringPlanet,
    mountainPlanet,
    earthPlanet,
    treePlanet,
  ]).then((values) => {
    values.forEach((model) => {
      app.add(model)
    })
  })

  const environmentGeometry = new THREE.SphereBufferGeometry(500)
  const environmentMaterial = new THREE.ShaderMaterial({
    vertexShader: environmentVertex,
    fragmentShader: environmentFragment,
    vertexColors: true,
    // wireframe:true,
    // transparent: true,
    side: THREE.BackSide,
    uniforms: {
      uTime: { value: 0 },
      uResolution: {
        value: new THREE.Vector2(window.innerWidth, window.innerHeight),
      },
      uTexture: { value: null },
    },
  })
  const environment = new THREE.Mesh(environmentGeometry, environmentMaterial)
  environment.rotation.y += Math.PI / 2
  environment.updateMatrixWorld()
  app.add(environment)

  // new THREE.TextureLoader().load(baseUrl + 'textures/ref.png', (texture) => {
  //   texture.encoding = THREE.sRGBEncoding
  //   environmentMaterial.uniforms.uTexture.value = texture
  // })

  let starParticles
  new THREE.TextureLoader().load(baseUrl + 'textures/star.png', (texture) => {
    texture.encoding = THREE.sRGBEncoding
    const particleGeo = new THREE.IcosahedronBufferGeometry(470, 1)
    const particleMaterial = new THREE.ShaderMaterial({
      vertexShader: starParticlesVertex,
      fragmentShader: starParticlesFragment,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      // wireframe:true,
      transparent: true,
      // side: THREE.DoubleSide,
      uniforms: {
        uTime: { value: 0 },
        uResolution: {
          value: new THREE.Vector2(window.innerWidth, window.innerHeight),
        },
        uRot: {
          value: 0,
        },
        uTexture: { value: texture },
        uSize: { value: 200 * gl.getPixelRatio() },
      },
    })
    starParticles = new THREE.Points(particleGeo, particleMaterial)
    app.add(starParticles)
  })

  let dotParticles1
  let dotParticles2
  new THREE.TextureLoader().load(baseUrl + '/textures/dot.png', (texture) => {
    const particleGeo1 = new THREE.SphereBufferGeometry(430, 15, 15)
    const particleGeo2 = new THREE.SphereBufferGeometry(450, 15, 15)
    const particleMaterial = new THREE.ShaderMaterial({
      vertexShader: dotParticlesVertex,
      fragmentShader: dotParticlesFragment,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      // wireframe:true,
      transparent: true,
      // side: THREE.DoubleSide,
      uniforms: {
        uTime: { value: 0 },
        uResolution: {
          value: new THREE.Vector2(window.innerWidth, window.innerHeight),
        },
        uTexture: { value: texture },
        uSize: { value: 25 * gl.getPixelRatio() },
      },
    })
    dotParticles1 = new THREE.Points(particleGeo1, particleMaterial)
    app.add(dotParticles1)
    dotParticles2 = new THREE.Points(particleGeo2, particleMaterial)
    dotParticles2.rotation.z += 0.5
    app.add(dotParticles2)
  })

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.MeshBasicMaterial()
  )
  ground.rotation.x -= Math.PI / 2
  ground.position.y -= 2
  const groundPhysicsId = physics.addGeometry(ground)
  physicsIds.push(groundPhysicsId)

  const light = new THREE.PointLight('#ffffff', 100)
  light.position.set(-2, 250, 10)
  app.add(light)

  useFrame(({ timestamp }) => {
    elapsedTime = timestamp
    light.position.z = Math.sin(elapsedTime / 1000) * 100 + 20
    light.updateMatrixWorld()
    environment.material.uniforms.uTime.value = elapsedTime
    rainbowMaterial.uniforms.uTime.value = elapsedTime
    rgbMaterial.uniforms.uTime.value = elapsedTime
    smokes.material.uniforms.uTime.value = elapsedTime / 400
    smokes2.material.uniforms.uTime.value = elapsedTime / 500
    if (starParticles) {
      starParticles.material.uniforms.uTime.value = elapsedTime / 1000
      starParticles.material.uniforms.uRot.value +=
        Math.cos(elapsedTime / 1000) / 17.1
    }
    if (dotParticles1) {
      dotParticles1.material.uniforms.uTime.value = elapsedTime / 1000
      dotParticles2.material.uniforms.uTime.value = elapsedTime / 200
      starParticles.rotation.y -= 0.0003
      starParticles.rotation.z += 0.0001
      starParticles.updateMatrixWorld()
      dotParticles1.rotation.y += 0.02
      dotParticles1.rotation.x = Math.sin(elapsedTime / 10000) / 10
      dotParticles1.updateMatrixWorld()
      dotParticles2.rotation.y += 0.0005
      dotParticles2.updateMatrixWorld()
    }

    Promise.all([cloudPlanet, mountainPlanet]).then((values) => {
      values.forEach((model) => {
        model.position.x += Math.cos(elapsedTime / 600) / 2 / 70
        model.position.y += Math.sin(elapsedTime / 1000) / 10 / 70
        // model.position.z += -Math.abs(Math.sin(elapsedTime / 2000) / 3) / 70
        model.rotation.x += Math.sin(elapsedTime / 500) / 8 / 70
        model.rotation.y += Math.sin(elapsedTime / 1000) / 10 / 70
        model.rotation.z += Math.sin(elapsedTime / 600) / 20 / 70
        model.updateMatrixWorld()
      })
    })
    spaceship.forEach((model) => {
      model.position.x += Math.cos(elapsedTime / 600) / 2 / 500
      model.position.y += Math.sin(elapsedTime / 1000) / 10 / 500
      // model.position.z += -Math.abs(Math.sin(elapsedTime / 2000) / 3) / 70
      model.rotation.x += Math.sin(elapsedTime / 500) / 8 / 40
      model.rotation.y += Math.sin(elapsedTime / 1000) / 10 / 40
      model.rotation.z += Math.sin(elapsedTime / 600) / 20 / 40
      model.updateMatrixWorld()
    })
    // rainbowGas.rotation.z = Math.sin(elapsedTime / 600) / 20
    rainbowGas.rotation.y += 0.2
    rainbowGas.scale.y = Math.abs(Math.sin(elapsedTime / 500) / 5 + 1)
    rainbowGas.scale.z = Math.abs(Math.cos(elapsedTime / 500) / 5 + 1)
    rainbowGas.updateMatrixWorld()
    smokes.position.x = Math.cos(elapsedTime / 500) / 10 - 1
    smokes.position.y = Math.sin(elapsedTime / 700) / 15 + 2
    smokes.position.z = Math.sin(elapsedTime / 400) / 15 - 2
    smokes.scale.y = Math.abs(Math.sin(elapsedTime / 500) / 7 + 1)
    smokes.scale.z = Math.abs(Math.cos(elapsedTime / 500) / 5 + 1)
    smokes.updateMatrixWorld()
    smokes2.position.x = Math.cos(elapsedTime / 600) / 10 - 0.5
    smokes2.position.y = Math.sin(elapsedTime / 1000) / 15 + 1.5
    smokes2.position.z = Math.sin(elapsedTime / 1000) / 15 + 1.5
    smokes2.scale.y = Math.abs(Math.sin(elapsedTime / 400) / 5 + 1)
    smokes2.scale.z = Math.abs(Math.cos(elapsedTime / 500) / 4 + 1)
    // smokes2.rotation.z = -Math.abs(Math.cos(elapsedTime / 800) / 10)
    smokes2.updateMatrixWorld()
  })
  useCleanup(() => {
    for (const physicsId of physicsIds) {
      physics.removeGeometry(physicsId)
    }
  })

  const customizeSpaceship = () => {
    setTimeout(() => {
      const rootScene = useInternals().scene
      rootScene.traverse((child) => {
        if (child.isMesh) {
          // console.log(child.name)
          if (child.geometry.attributes.normal) {
            // console.log(child.name)
          }
          if (child.name.includes('Vehicle')) {
            if (child.material.name === 'Vehicle_RGB') {
              child.material = rgbMaterial
            }
            if (child.material.name === 'Vehicle_white') {
              child.material = new THREE.MeshBasicMaterial({
                map: child.material.map,
              })
              // child.scale.set(1.01, 1.01, 1.01)
            }

            const outline = new THREE.Mesh(
              child.geometry.clone(),
              outlineMaterial
            )

            // thickenSpaceshipGeometry(outline.geometry, 0.01)
            outline.scale.set(
              outline.scale.x + 0.01,
              outline.scale.y + 0.025,
              outline.scale.z + 0.035
            )
            if (child.name === 'Vehicle034' || child.name === 'Vehicle036') {
              outline.scale.set(
                outline.scale.x + 0.01,
                outline.scale.y + 0.05,
                outline.scale.z + 0.05
              )
            }
            if (
              child.name === 'Vehicle032' ||
              child.name === 'Vehicle033' ||
              child.name === 'Vehicle039' ||
              child.name === 'Vehicle040' ||
              child.name === 'Vehicle041' ||
              child.name === 'Vehicle042' ||
              child.name === 'Vehicle043'
            ) {
              outline.scale.set(
                outline.scale.x + 0.01,
                outline.scale.y + 0.01,
                outline.scale.z + 0.01
              )
            }
            // outline.position.set(0, 0, 0)
            outline.updateMatrixWorld()
            child.add(outline)

            if (child.name === 'Vehicle010') {
              rainbowGas.rotation.x -= Math.PI / 2
              rainbowGas.updateMatrixWorld()
              rainbowGas.rotation.z -= Math.PI / 2
              rainbowGas.updateMatrixWorld()
              smokes.rotation.y -= Math.PI / 1.8
              smokes.updateMatrixWorld()
              smokes2.rotation.y -= Math.PI / 1.8
              smokes2.updateMatrixWorld()

              child.add(rainbowGas)
            }
            spaceship.push(child)
            // console.log(outline.geometry)
          }
        }
      })
    }, 10000)
  }

  customizeSpaceship()

  return app
}
