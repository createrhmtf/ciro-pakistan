import os
from dotenv import load_dotenv

# Load environment variables first
load_dotenv()

import uvicorn
from fastapi import FastAPI
from middleware.cors import setup_cors
from routes.crisis_routes import router as crisis_router
from routes.realtime_routes import router as realtime_router
from utils.logger import setup_logger


logger = setup_logger("Main")

app = FastAPI(
    title="CIRO Pakistan - Crisis Intelligence API",
    description="Multi-agent crisis response orchestrator backend system.",
    version="1.0.0"
)

# Set up CORS middleware
setup_cors(app)

# Include routes under both /api and root / prefixes
app.include_router(crisis_router, prefix="/api")
app.include_router(crisis_router)
app.include_router(realtime_router, prefix="/api")

@app.get("/")
async def root():
    return {
        "message": "CIRO Pakistan Backend API is active.",
        "docs": "/docs",
        "health": "/api/health"
    }

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    logger.info(f"Starting server on port {port}...")
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
