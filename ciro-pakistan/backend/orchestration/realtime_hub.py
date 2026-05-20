"""In-memory WebSocket broadcast hub for live CIRO updates."""
import asyncio
import json
from typing import Any, Dict, List, Set

from fastapi import WebSocket
from utils.logger import setup_logger

logger = setup_logger("RealtimeHub")


class RealtimeHub:
    def __init__(self):
        self._connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self._connections.add(websocket)
        logger.info(f"WebSocket client connected ({len(self._connections)} total)")

    def disconnect(self, websocket: WebSocket):
        self._connections.discard(websocket)

    def broadcast(self, event_type: str, payload: Dict[str, Any]):
        if not self._connections:
            return
        message = json.dumps({"type": event_type, "payload": payload}, default=str)
        try:
            loop = asyncio.get_running_loop()
            loop.create_task(self._send_all(message))
        except RuntimeError:
            pass

    async def _send_all(self, message: str):
        dead: List[WebSocket] = []
        for ws in list(self._connections):
            try:
                await ws.send_text(message)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws)


realtime_hub = RealtimeHub()
