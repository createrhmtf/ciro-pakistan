from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from orchestration.realtime_hub import realtime_hub
from utils.logger import setup_logger

logger = setup_logger("RealtimeRoutes")
router = APIRouter()


@router.websocket("/ws")
async def crisis_events_ws(websocket: WebSocket):
    """Live workflow phases, traces, and completion events."""
    await realtime_hub.connect(websocket)
    try:
        await websocket.send_json({
            "type": "connected",
            "payload": {"message": "CIRO realtime channel active"},
        })
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        realtime_hub.disconnect(websocket)
    except Exception as e:
        logger.warning(f"WebSocket closed: {e}")
        realtime_hub.disconnect(websocket)
