// WebRTC VLM Detection Worker
// Handles WASM-based object detection on device

let model = null;
let isInitialized = false;

// Initialize ONNX Runtime Web for WASM inference
const initializeModel = async () => {
  try {
    // Import ONNX Runtime Web
    importScripts('https://cdn.jsdelivr.net/npm/onnxruntime-web@1.16.3/dist/ort.webgpu.min.js');
    
    // Load YOLOv8 model (placeholder - replace with actual model)
    const modelPath = '/models/yolov8n.onnx';
    model = await ort.InferenceSession.create(modelPath, {
      executionProviders: ['wasm'],
      graphOptimizationLevel: 'all'
    });
    
    isInitialized = true;
    console.log('WASM detection model initialized');
  } catch (error) {
    console.error('Failed to initialize WASM model:', error);
    // Fallback to mock detection
    isInitialized = false;
  }
};

// Process image data and return detections
const detectObjects = async (imageData, width, height) => {
  const startTime = performance.now();
  
  if (!isInitialized) {
    // Return mock detections for demo
    return {
      detections: [
        {
          label: 'person',
          score: 0.89,
          xmin: 0.1,
          ymin: 0.15,
          xmax: 0.4,
          ymax: 0.8
        },
        {
          label: 'phone',
          score: 0.76,
          xmin: 0.5,
          ymin: 0.3,
          xmax: 0.7,
          ymax: 0.5
        }
      ],
      processingTime: performance.now() - startTime
    };
  }

  try {
    // Preprocess image data
    const preprocessed = preprocessImage(imageData, width, height);
    
    // Run inference
    const results = await model.run({ images: preprocessed });
    
    // Postprocess results
    const detections = postprocessResults(results, width, height);
    
    return {
      detections,
      processingTime: performance.now() - startTime
    };
  } catch (error) {
    console.error('Detection inference failed:', error);
    return {
      detections: [],
      processingTime: performance.now() - startTime
    };
  }
};

// Preprocess image for YOLO input
const preprocessImage = (imageData, width, height) => {
  const inputSize = 640;
  const tensor = new Float32Array(3 * inputSize * inputSize);
  
  // Simple resize and normalize (production would use proper preprocessing)
  const scaleX = width / inputSize;
  const scaleY = height / inputSize;
  
  for (let y = 0; y < inputSize; y++) {
    for (let x = 0; x < inputSize; x++) {
      const srcX = Math.floor(x * scaleX);
      const srcY = Math.floor(y * scaleY);
      const srcIdx = (srcY * width + srcX) * 4;
      
      const dstIdx = y * inputSize + x;
      
      // RGB normalization
      tensor[dstIdx] = imageData[srcIdx] / 255.0; // R
      tensor[inputSize * inputSize + dstIdx] = imageData[srcIdx + 1] / 255.0; // G
      tensor[inputSize * inputSize * 2 + dstIdx] = imageData[srcIdx + 2] / 255.0; // B
    }
  }
  
  return new ort.Tensor('float32', tensor, [1, 3, inputSize, inputSize]);
};

// Postprocess YOLO output
const postprocessResults = (results, originalWidth, originalHeight) => {
  // This is a simplified postprocessing
  // Production implementation would handle NMS, confidence thresholding, etc.
  
  const detections = [];
  const confidenceThreshold = 0.5;
  
  // Mock postprocessing for demo
  // Real implementation would parse YOLO output format
  
  return detections;
};

// Worker message handler
self.onmessage = async (event) => {
  const { imageData, width, height, timestamp } = event.data;
  
  if (!isInitialized) {
    await initializeModel();
  }
  
  const result = await detectObjects(imageData, width, height);
  
  self.postMessage({
    ...result,
    timestamp,
    frameId: `frame_${timestamp}`
  });
};

// Initialize on worker load
initializeModel();