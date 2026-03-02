import * as faceapi from 'face-api.js'

let modelsLoaded = false

export async function loadModels() {
  if (modelsLoaded) return
  const MODEL_URL = '/models'
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  ])
  modelsLoaded = true
  console.log('Face recognition models loaded ✅')
}

export async function getFaceDescriptor(videoElement) {
  const detection = await faceapi
    .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor()

  if (!detection) return null
  return detection.descriptor
}

export async function matchFace(descriptor, labeledDescriptors) {
  if (!labeledDescriptors.length) return null

  const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.5)
  const match = faceMatcher.findBestMatch(descriptor)

  if (match.label === 'unknown') return null
  return { label: match.label, distance: match.distance }
}

export function buildLabeledDescriptors(employees) {
  return employees
    .filter(e => e.face_descriptor && e.face_descriptor.length > 0)
    .map(e => {
      const descriptor = new Float32Array(e.face_descriptor)
      return new faceapi.LabeledFaceDescriptors(e.id, [descriptor])
    })
}