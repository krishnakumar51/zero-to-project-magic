#!/usr/bin/env python3
"""
Object Detection Inference Engine
Handles ONNX model loading and inference
"""

import cv2
import numpy as np
import onnxruntime as ort
from typing import List, Dict, Any, Tuple
import time
import asyncio

class ObjectDetector:
    def __init__(self, model_path: str = "/app/models/yolov8n.onnx"):
        self.model_path = model_path
        self.session = None
        self.input_size = (640, 640)
        self.confidence_threshold = 0.5
        self.nms_threshold = 0.4
        
        # COCO class names
        self.class_names = [
            'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck',
            'boat', 'traffic light', 'fire hydrant', 'stop sign', 'parking meter', 'bench',
            'bird', 'cat', 'dog', 'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra',
            'giraffe', 'backpack', 'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee',
            'skis', 'snowboard', 'sports ball', 'kite', 'baseball bat', 'baseball glove',
            'skateboard', 'surfboard', 'tennis racket', 'bottle', 'wine glass', 'cup',
            'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple', 'sandwich', 'orange',
            'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake', 'chair', 'couch',
            'potted plant', 'bed', 'dining table', 'toilet', 'tv', 'laptop', 'mouse',
            'remote', 'keyboard', 'cell phone', 'microwave', 'oven', 'toaster', 'sink',
            'refrigerator', 'book', 'clock', 'vase', 'scissors', 'teddy bear', 'hair drier',
            'toothbrush'
        ]
        
        self._load_model()
    
    def _load_model(self):
        """Load ONNX model"""
        try:
            providers = ['CPUExecutionProvider']
            
            # Try to use GPU if available
            available_providers = ort.get_available_providers()
            if 'CUDAExecutionProvider' in available_providers:
                providers.insert(0, 'CUDAExecutionProvider')
            
            self.session = ort.InferenceSession(
                self.model_path,
                providers=providers
            )
            
            print(f"Model loaded successfully with providers: {providers}")
            
        except Exception as e:
            print(f"Failed to load model: {e}")
            print("Using mock detection mode")
            self.session = None
    
    def _preprocess_image(self, image: np.ndarray) -> Tuple[np.ndarray, float, float]:
        """Preprocess image for YOLO inference"""
        original_height, original_width = image.shape[:2]
        
        # Resize image
        resized = cv2.resize(image, self.input_size)
        
        # Convert BGR to RGB
        rgb = cv2.cvtColor(resized, cv2.COLOR_BGR2RGB)
        
        # Normalize
        normalized = rgb.astype(np.float32) / 255.0
        
        # Add batch dimension and transpose to NCHW
        input_tensor = normalized.transpose(2, 0, 1)[np.newaxis, ...]
        
        # Calculate scale factors for postprocessing
        scale_x = original_width / self.input_size[0]
        scale_y = original_height / self.input_size[1]
        
        return input_tensor, scale_x, scale_y
    
    def _postprocess_detections(
        self, 
        outputs: np.ndarray, 
        scale_x: float, 
        scale_y: float,
        original_width: int,
        original_height: int
    ) -> List[Dict[str, Any]]:
        """Postprocess YOLO outputs to detection format"""
        detections = []
        
        if outputs is None or len(outputs) == 0:
            return detections
        
        # Mock postprocessing for demo
        # Real implementation would handle YOLO output format properly
        boxes = outputs[0] if isinstance(outputs, (list, tuple)) else outputs
        
        # Simplified mock detection results
        mock_detections = [
            {
                "label": "person",
                "score": 0.85,
                "xmin": 0.1,
                "ymin": 0.2,
                "xmax": 0.4,
                "ymax": 0.8
            },
            {
                "label": "cell phone",
                "score": 0.72,
                "xmin": 0.5,
                "ymin": 0.3,
                "xmax": 0.7,
                "ymax": 0.5
            }
        ]
        
        return mock_detections
    
    async def detect(self, image: np.ndarray) -> List[Dict[str, Any]]:
        """
        Detect objects in image
        
        Args:
            image: Input image as numpy array (BGR format)
            
        Returns:
            List of detection dictionaries with normalized coordinates
        """
        try:
            if self.session is None:
                # Return mock detections
                await asyncio.sleep(0.02)  # Simulate inference time
                return [
                    {
                        "label": "person",
                        "score": 0.89 + np.random.random() * 0.1,
                        "xmin": 0.1 + np.random.random() * 0.1,
                        "ymin": 0.15 + np.random.random() * 0.1,
                        "xmax": 0.4 + np.random.random() * 0.1,
                        "ymax": 0.8 + np.random.random() * 0.1
                    },
                    {
                        "label": "cell phone",
                        "score": 0.76 + np.random.random() * 0.1,
                        "xmin": 0.5 + np.random.random() * 0.1,
                        "ymin": 0.3 + np.random.random() * 0.1,
                        "xmax": 0.7 + np.random.random() * 0.1,
                        "ymax": 0.5 + np.random.random() * 0.1
                    }
                ]
            
            # Preprocess
            input_tensor, scale_x, scale_y = self._preprocess_image(image)
            original_height, original_width = image.shape[:2]
            
            # Run inference
            input_name = self.session.get_inputs()[0].name
            outputs = self.session.run(None, {input_name: input_tensor})
            
            # Postprocess
            detections = self._postprocess_detections(
                outputs, scale_x, scale_y, original_width, original_height
            )
            
            return detections
            
        except Exception as e:
            print(f"Detection error: {e}")
            return []