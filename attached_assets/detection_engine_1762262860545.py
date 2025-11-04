#!/usr/bin/env python3
"""
Backend Detection Engine for QueueGuidance Web
Handles video processing, polygon drawing, queue detection, and live updates
"""

import cv2
import numpy as np
import json
import time
import os
import sys
from pathlib import Path
from collections import deque
from typing import List, Dict, Tuple, Optional
from datetime import datetime
import threading

# Add parent QueueGuidance directory to path
queue_guidance_path = Path(__file__).parent.parent.parent / 'QueueGuidance'
sys.path.insert(0, str(queue_guidance_path))

try:
    from ultralytics import YOLO
    from config_manager import get_config_manager
    from professional_audio import get_audio_system
except ImportError as e:
    print(f"Import error: {e}")
    print(f"Please ensure QueueGuidance folder is at: {queue_guidance_path}")

class WebPolygonDrawer:
    """Interactive polygon drawing for web interface"""
    
    def __init__(self, video_path: str):
        self.video_path = video_path
        self.polygons = []
        self.current_polygon = []
        self.temp_point = None
        self.frame = None
        self.window_name = "Draw Queue Zones - QueueGuidance"
        self.colors = [
            (0, 255, 0), (255, 0, 0), (0, 0, 255), (255, 255, 0),
            (255, 0, 255), (0, 255, 255), (128, 0, 128), (255, 165, 0)
        ]
        
    def mouse_callback(self, event, x, y, flags, param):
        """Handle mouse events for polygon drawing"""
        if event == cv2.EVENT_MOUSEMOVE:
            self.temp_point = (x, y)
        
        elif event == cv2.EVENT_LBUTTONDOWN:
            self.current_polygon.append((x, y))
            print(f"📍 Point {len(self.current_polygon)} added at ({x}, {y})")
            
        elif event == cv2.EVENT_RBUTTONDOWN:
            if len(self.current_polygon) >= 3:
                self.polygons.append(self.current_polygon.copy())
                print(f"✅ Queue {len(self.polygons)} completed with {len(self.current_polygon)} points")
                self.current_polygon = []
                self.temp_point = None
                self.save_polygons()
            else:
                print("⚠️ Need at least 3 points")
        
        elif event == cv2.EVENT_MBUTTONDOWN:
            if self.polygons:
                self.polygons.pop()
                print(f"🗑️ Deleted last queue")
                self.save_polygons()
    
    def draw_interface(self, frame):
        """Draw polygons and UI"""
        overlay = frame.copy()
        
        # Draw completed polygons
        for i, polygon in enumerate(self.polygons):
            color = self.colors[i % len(self.colors)]
            if len(polygon) >= 3:
                pts = np.array(polygon, dtype=np.int32)
                cv2.fillPoly(overlay, [pts], color)
                cv2.polylines(frame, [pts], True, color, 3)
                
                center = np.mean(pts, axis=0).astype(int)
                cv2.putText(frame, f"Q{i+1}", (center[0]-15, center[1]+8),
                          cv2.FONT_HERSHEY_SIMPLEX, 1.2, (255, 255, 255), 3)
        
        # Blend overlay
        cv2.addWeighted(overlay, 0.3, frame, 0.7, 0, frame)
        
        # Draw current polygon
        if len(self.current_polygon) > 0:
            for i, pt in enumerate(self.current_polygon):
                cv2.circle(frame, pt, 5, (0, 255, 255), -1)
                if i > 0:
                    cv2.line(frame, self.current_polygon[i-1], pt, (0, 255, 255), 2)
            
            if self.temp_point and len(self.current_polygon) > 0:
                cv2.line(frame, self.current_polygon[-1], self.temp_point, (0, 255, 255), 2)
        
        # Instructions
        instructions = [
            "LEFT CLICK: Add point",
            "RIGHT CLICK: Complete polygon",
            "MIDDLE CLICK: Delete last",
            "S: Save & Continue | Q: Quit",
            f"Queues defined: {len(self.polygons)}"
        ]
        
        y_offset = 30
        for i, text in enumerate(instructions):
            cv2.putText(frame, text, (10, y_offset + i*30),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        
        return frame
    
    def save_polygons(self):
        """Save polygons to data file"""
        data_dir = Path(__file__).parent.parent / 'data'
        data_dir.mkdir(exist_ok=True)
        
        polygon_data = {
            'video_path': self.video_path,
            'timestamp': datetime.now().isoformat(),
            'queue_count': len(self.polygons),
            'polygons': self.polygons
        }
        
        with open(data_dir / 'polygons.json', 'w') as f:
            json.dump(polygon_data, f, indent=2)
        
        print(f"💾 Saved {len(self.polygons)} queues")
    
    def run(self):
        """Main drawing loop"""
        cap = cv2.VideoCapture(self.video_path)
        if not cap.isOpened():
            print(f"❌ Cannot open video: {self.video_path}")
            return []
        
        ret, self.frame = cap.read()
        cap.release()
        
        if not ret:
            print("❌ Cannot read video frame")
            return []
        
        cv2.namedWindow(self.window_name, cv2.WINDOW_NORMAL)
        cv2.resizeWindow(self.window_name, 1280, 720)
        cv2.setMouseCallback(self.window_name, self.mouse_callback)
        
        print("\n🎯 Polygon Drawing Started")
        print("=" * 50)
        print("📍 LEFT CLICK: Add point")
        print("✅ RIGHT CLICK: Complete polygon")
        print("🗑️ MIDDLE CLICK: Delete last")
        print("💾 S: Save & Continue")
        print("❌ Q: Quit")
        print("=" * 50)
        
        while True:
            display_frame = self.frame.copy()
            display_frame = self.draw_interface(display_frame)
            
            cv2.imshow(self.window_name, display_frame)
            
            key = cv2.waitKey(1) & 0xFF
            if key == ord('q'):
                break
            elif key == ord('s'):
                if len(self.polygons) > 0:
                    self.save_polygons()
                    print(f"✅ Saved and continuing with {len(self.polygons)} queues")
                    break
                else:
                    print("⚠️ No polygons to save")
        
        cv2.destroyAllWindows()
        return self.polygons


class WebQueueDetector:
    """Queue detection for web interface"""
    
    def __init__(self, video_path: str, polygons: List):
        self.video_path = video_path
        self.polygons = polygons
        self.model = None
        self.is_running = False
        self.data_dir = Path(__file__).parent.parent / 'data'
        self.data_dir.mkdir(exist_ok=True)
        # Smoothing window for queue counts to reduce noise
        self.count_history = deque(maxlen=5)
        # Minimum relative box area to filter tiny false positives
        self.min_box_area_ratio = 0.003  # 0.3% of frame area
        
    def load_model(self):
        """Load YOLO model"""
        try:
            model_path = str(queue_guidance_path / 'yolov8s.pt')
            if not os.path.exists(model_path):
                model_path = str(queue_guidance_path / 'yolov8m.pt')
            
            print(f"🤖 Loading model: {model_path}")
            self.model = YOLO(model_path)
            print("✅ Model loaded")
            return True
        except Exception as e:
            print(f"❌ Model load error: {e}")
            return False
    
    def point_in_polygon(self, point, polygon):
        """Check if point is inside polygon"""
        x, y = point
        n = len(polygon)
        inside = False
        
        p1x, p1y = polygon[0]
        for i in range(1, n + 1):
            p2x, p2y = polygon[i % n]
            if y > min(p1y, p2y):
                if y <= max(p1y, p2y):
                    if x <= max(p1x, p2x):
                        if p1y != p2y:
                            xinters = (y - p1y) * (p2x - p1x) / (p2y - p1y) + p1x
                        if p1x == p2x or x <= xinters:
                            inside = not inside
            p1x, p1y = p2x, p2y
        
        return inside
    
    def detect_and_count(self, frame):
        """Detect people and count per queue"""
        # Lower confidence threshold for more sensitive detection
        results = self.model(frame, conf=0.04, iou=0.5, classes=[0], verbose=False)[0]
        
        queue_counts = [0] * len(self.polygons)
        all_detections = []
        h, w = frame.shape[:2]
        min_area = self.min_box_area_ratio * (w * h)
        
        for box in results.boxes:
            x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
            conf = float(box.conf[0])
            # Filter out extremely small boxes (often false positives)
            box_area = max(0.0, float((x2 - x1) * (y2 - y1)))
            if box_area < min_area:
                continue
            
            # Use bottom center as person position
            center_x = int((x1 + x2) / 2)
            center_y = int(y2)
            
            # Check which queue this person is in
            for i, polygon in enumerate(self.polygons):
                if self.point_in_polygon((center_x, center_y), polygon):
                    queue_counts[i] += 1
                    break
            
            all_detections.append({
                'bbox': [float(x1), float(y1), float(x2), float(y2)],
                'conf': conf,
                'center': [center_x, center_y]
            })
        
        return queue_counts, all_detections
    
    def draw_detections(self, frame, queue_counts, detections):
        """Draw detections on frame"""
        overlay = frame.copy()
        
        # Draw polygons
        colors = [(0, 255, 0), (255, 0, 0), (0, 0, 255), (255, 255, 0),
                 (255, 0, 255), (0, 255, 255), (128, 0, 128), (255, 165, 0)]
        
        for i, polygon in enumerate(self.polygons):
            color = colors[i % len(colors)]
            pts = np.array(polygon, dtype=np.int32)
            cv2.fillPoly(overlay, [pts], color)
            cv2.polylines(frame, [pts], True, color, 3)
            
            # Queue label
            center = np.mean(pts, axis=0).astype(int)
            label = f"Q{i+1}: {queue_counts[i]}"
            cv2.putText(frame, label, (center[0]-40, center[1]),
                       cv2.FONT_HERSHEY_SIMPLEX, 1.0, (255, 255, 255), 3)
        
        cv2.addWeighted(overlay, 0.3, frame, 0.7, 0, frame)
        
        # Draw bounding boxes
        for det in detections:
            x1, y1, x2, y2 = [int(v) for v in det['bbox']]
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
            cv2.circle(frame, tuple(det['center']), 5, (0, 0, 255), -1)
        
        return frame
    
    def save_frame_and_data(self, frame, queue_counts):
        """Save current frame and data"""
        # Save frame
        cv2.imwrite(str(self.data_dir / 'live_frame.jpg'), frame)
        
        # Calculate recommendations
        if sum(queue_counts) > 0:
            best_queue = queue_counts.index(min(queue_counts)) + 1
            worst_queue = queue_counts.index(max(queue_counts)) + 1
        else:
            best_queue = 1
            worst_queue = 1
        
        # Save data
        data = {
            'timestamp': datetime.now().isoformat(),
            'total_queues': len(self.polygons),
            'queue_counts': queue_counts,
            'total_people': sum(queue_counts),
            'best_queue': best_queue,
            'worst_queue': worst_queue,
            'recommendation': f"Queue {best_queue} is fastest with {queue_counts[best_queue-1]} people"
        }
        
        with open(self.data_dir / 'queues.json', 'w') as f:
            json.dump(data, f, indent=2)
    
    def run(self, show_window=True):
        """Run detection loop"""
        if not self.load_model():
            return
        
        cap = cv2.VideoCapture(self.video_path)
        if not cap.isOpened():
            print(f"❌ Cannot open video")
            return
        
        self.is_running = True
        print(f"\n🎯 Detection Started - {len(self.polygons)} queues")
        
        if show_window:
            cv2.namedWindow('Queue Detection', cv2.WINDOW_NORMAL)
            cv2.resizeWindow('Queue Detection', 1280, 720)
        
        frame_count = 0
        while self.is_running and cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                continue
            
            frame_count += 1
            
            # Detect every 2 frames for performance
            if frame_count % 2 == 0:
                queue_counts, detections = self.detect_and_count(frame)
                # Smooth counts over last N frames to reduce jitter
                self.count_history.append(queue_counts)
                if len(self.count_history) > 1:
                    # Average per-queue counts across the window
                    smoothed = [
                        int(round(sum(history[i] for history in self.count_history) / len(self.count_history)))
                        for i in range(len(queue_counts))
                    ]
                else:
                    smoothed = queue_counts

                display_frame = self.draw_detections(frame.copy(), smoothed, detections)
                
                # Save data
                self.save_frame_and_data(display_frame, smoothed)
                
                if show_window:
                    cv2.imshow('Queue Detection', display_frame)
                
                print(f"📊 Queues: {queue_counts} | Total: {sum(queue_counts)}")
            
            if show_window and cv2.waitKey(1) & 0xFF == ord('q'):
                break
        
        cap.release()
        if show_window:
            cv2.destroyAllWindows()
        
        self.is_running = False
        print("✅ Detection stopped")


def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description='QueueGuidance Web Backend')
    parser.add_argument('--video', type=str, required=True, help='Path to video file')
    parser.add_argument('--mode', type=str, default='full', choices=['polygon', 'detect', 'full'],
                       help='Mode: polygon=draw only, detect=detect only, full=both')
    parser.add_argument('--headless', action='store_true', 
                       help='Run without displaying video window (detection only)')
    
    args = parser.parse_args()
    
    print("\n" + "="*60)
    print("🎯 QueueGuidance Web Backend")
    print("="*60)
    
    video_path = args.video
    
    if args.mode in ['polygon', 'full']:
        # Polygon drawing
        drawer = WebPolygonDrawer(video_path)
        polygons = drawer.run()
        
        if len(polygons) == 0:
            print("❌ No polygons defined")
            return
    else:
        # Load existing polygons
        data_dir = Path(__file__).parent.parent / 'data'
        polygon_file = data_dir / 'polygons.json'
        
        if not polygon_file.exists():
            print("❌ No polygons found. Run with --mode polygon first")
            return
        
        with open(polygon_file) as f:
            polygon_data = json.load(f)
            polygons = polygon_data['polygons']
    
    if args.mode in ['detect', 'full']:
        # Start detection
        detector = WebQueueDetector(video_path, polygons)
        # Don't show window if headless mode is enabled
        detector.run(show_window=not args.headless)


if __name__ == '__main__':
    main()
