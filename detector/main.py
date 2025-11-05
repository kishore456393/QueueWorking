import base64
import io
from typing import List, Dict, Any

import numpy as np
import cv2
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ultralytics import YOLO
from PIL import Image
from detector.tts_service import text_to_speech_base64

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000", "http://127.0.0.1:5000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load YOLO model (prefer local model if present)
# You can place a .pt model in attached_assets/yolov8m_1762262649284.pt
MODEL_PATHS = [
    'attached_assets/yolov8m_1762262649284.pt',  # local bundled model
    'yolov8n.pt',  # fallback to ultralytics default (may download)
]

_model = None
for path in MODEL_PATHS:
    try:
        _model = YOLO(path)
        break
    except Exception:
        _model = None

if _model is None:
    # Last attempt: load smallest model
    _model = YOLO('yolov8n.pt')


class Point(BaseModel):
    x: float
    y: float

class Polygon(BaseModel):
    points: List[Point]

class DetectRequest(BaseModel):
    image_b64: str  # base64-encoded JPEG/PNG
    polygons: List[Polygon]
    conf: float | None = 0.04  # detection confidence (lower = more detections)

class DetectResponse(BaseModel):
    counts: List[int]
    annotated_frame_b64: str | None = None  # Optional annotated frame


def point_in_polygon(px: float, py: float, polygon: List[Point]) -> bool:
    # Ray casting algorithm
    inside = False
    n = len(polygon)
    if n < 3:
        return False
    j = n - 1
    for i in range(n):
        xi, yi = polygon[i].x, polygon[i].y
        xj, yj = polygon[j].x, polygon[j].y
        intersect = ((yi > py) != (yj > py)) and (
            px < (xj - xi) * (py - yi) / (yj - yi + 1e-9) + xi
        )
        if intersect:
            inside = not inside
        j = i
    return inside


@app.post('/detect', response_model=DetectResponse)
def detect(req: DetectRequest):
    # Decode image
    try:
        img_bytes = base64.b64decode(req.image_b64)
        img = Image.open(io.BytesIO(img_bytes)).convert('RGB')
        frame = np.array(img)
    except Exception as e:
        return DetectResponse(counts=[0 for _ in req.polygons], annotated_frame_b64=None)

    # Create a copy for annotation
    annotated_frame = frame.copy()

    # Draw polygons on the frame
    colors = [(255, 0, 0), (0, 255, 0), (0, 0, 255), (255, 255, 0), (255, 0, 255), (0, 255, 255)]
    for idx, poly in enumerate(req.polygons):
        color = colors[idx % len(colors)]
        # Convert polygon points to numpy array
        pts = np.array([[int(p.x), int(p.y)] for p in poly.points], np.int32)
        pts = pts.reshape((-1, 1, 2))
        # Draw polygon outline
        cv2.polylines(annotated_frame, [pts], True, color, 3)
        # Draw semi-transparent fill
        overlay = annotated_frame.copy()
        cv2.fillPoly(overlay, [pts], color)
        cv2.addWeighted(overlay, 0.2, annotated_frame, 0.8, 0, annotated_frame)
        # Add queue label
        if len(poly.points) > 0:
            label_x = int(poly.points[0].x)
            label_y = int(poly.points[0].y) - 10
            cv2.putText(annotated_frame, f'Queue {idx + 1}', (label_x, label_y), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)

    # Run YOLO detection for person class (0)
    results = _model.predict(frame, classes=[0], conf=req.conf or 0.15, verbose=False)

    # Aggregate counts per polygon using bbox center and draw boxes
    counts = [0 for _ in req.polygons]
    try:
        res = results[0]
        if res.boxes is not None and len(res.boxes) > 0:
            xyxy = res.boxes.xyxy.cpu().numpy().astype(float)  # (N, 4): x1,y1,x2,y2
            confs = res.boxes.conf.cpu().numpy() if res.boxes.conf is not None else [0.0] * len(xyxy)
            
            for box, conf in zip(xyxy, confs):
                x1, y1, x2, y2 = box
                cx = (x1 + x2) / 2.0
                cy = (y1 + y2) / 2.0
                
                # Assign to the first polygon that contains center
                assigned_queue = -1
                for idx, poly in enumerate(req.polygons):
                    if point_in_polygon(cx, cy, poly.points):
                        counts[idx] += 1
                        assigned_queue = idx
                        break
                
                # Draw bounding box (green if assigned to a queue, red otherwise)
                box_color = (0, 255, 0) if assigned_queue >= 0 else (0, 0, 255)
                cv2.rectangle(annotated_frame, (int(x1), int(y1)), (int(x2), int(y2)), box_color, 2)
                
                # Draw confidence and queue assignment
                label = f'{conf:.2f}'
                if assigned_queue >= 0:
                    label += f' Q{assigned_queue + 1}'
                cv2.putText(annotated_frame, label, (int(x1), int(y1) - 5),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.5, box_color, 2)
                
                # Draw center point
                cv2.circle(annotated_frame, (int(cx), int(cy)), 4, (255, 255, 0), -1)
    except Exception as e:
        print(f"Detection error: {e}")
        pass

    # Encode annotated frame to base64
    try:
        _, buffer = cv2.imencode('.jpg', cv2.cvtColor(annotated_frame, cv2.COLOR_RGB2BGR))
        annotated_b64 = base64.b64encode(buffer).decode('utf-8')
    except Exception:
        annotated_b64 = None

    return DetectResponse(counts=counts, annotated_frame_b64=annotated_b64)


@app.get('/')
def root():
    return {"status": "ok", "model": str(_model.model if hasattr(_model, 'model') else 'yolo')}


class TTSRequest(BaseModel):
    text: str
    language: str = 'en'

class TTSResponse(BaseModel):
    audio_b64: str | None = None
    error: str | None = None


@app.post('/tts', response_model=TTSResponse)
async def text_to_speech(req: TTSRequest):
    """
    Convert text to speech using Edge TTS and return as base64 MP3.
    """
    try:
        audio_b64 = await text_to_speech_base64(req.text, req.language)
        if audio_b64:
            return TTSResponse(audio_b64=audio_b64)
        else:
            return TTSResponse(error="Failed to generate speech")
    except Exception as e:
        return TTSResponse(error=str(e))
