import { FaceDetector } from "@mediapipe/tasks-vision";

const FACE_DETECTOR_MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/latest/blaze_face_short_range.tflite";
const VISION_WASM_LOADER_PATH = "/mediapipe/vision_wasm_internal.js";
const VISION_WASM_BINARY_PATH = "/mediapipe/vision_wasm_internal.wasm";

const MIN_FACE_AREA_RATIO = 0.08;
const MIN_AVERAGE_BRIGHTNESS = 55;
const BRIGHTNESS_SAMPLE_SIZE = 256;

let faceDetectorPromise: Promise<FaceDetector> | null = null;

function getFaceDetector() {
  faceDetectorPromise ??= FaceDetector.createFromOptions(
    {
      wasmLoaderPath: VISION_WASM_LOADER_PATH,
      wasmBinaryPath: VISION_WASM_BINARY_PATH,
    },
    {
      baseOptions: {
        modelAssetPath: FACE_DETECTOR_MODEL_URL,
        delegate: "CPU",
      },
      runningMode: "IMAGE",
      minDetectionConfidence: 0.5,
    },
  );

  return faceDetectorPromise;
}

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("이미지를 불러오지 못했어요."));
    };

    image.src = objectUrl;
  });
}

function getAverageBrightness(image: HTMLImageElement) {
  const canvas = document.createElement("canvas");
  const scale = Math.min(
    1,
    BRIGHTNESS_SAMPLE_SIZE / Math.max(image.naturalWidth, image.naturalHeight),
  );
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));

  const context = canvas.getContext("2d", { willReadFrequently: true });

  if (!context) {
    throw new Error("이미지를 검사하지 못했어요.");
  }

  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
  let brightnessSum = 0;

  for (let index = 0; index < data.length; index += 4) {
    brightnessSum +=
      0.299 * data[index] + 0.587 * data[index + 1] + 0.114 * data[index + 2];
  }

  return brightnessSum / (data.length / 4);
}

export async function validateDiagnosisImage(file: File) {
  if (!file.type.startsWith("image/")) {
    return false;
  }

  try {
    const image = await loadImage(file);
    const imageArea = image.naturalWidth * image.naturalHeight;

    if (!imageArea) {
      return false;
    }

    const detector = await getFaceDetector();
    const faceResult = detector.detect(image);
    const faceCount = faceResult.detections.length;

    if (faceCount !== 1) {
      return false;
    }

    const boundingBox = faceResult.detections[0].boundingBox;
    const faceArea = (boundingBox?.width ?? 0) * (boundingBox?.height ?? 0);

    if (faceArea / imageArea < MIN_FACE_AREA_RATIO) {
      return false;
    }

    const averageBrightness = getAverageBrightness(image);

    if (averageBrightness < MIN_AVERAGE_BRIGHTNESS) {
      return false;
    }

    // TODO: Add occlusion, blur, and filter checks after the MVP validation scope.
    return true;
  } catch {
    return false;
  }
}
