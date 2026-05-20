import logging
import sys

def setup_logger(name: str) -> logging.Logger:
    """Configures and returns a standardized logger for the backend."""
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)

    # Check if handler already exists to avoid duplicate logs
    if not logger.handlers:
        formatter = logging.Formatter(
            "[%(asctime)s] [%(levelname)s] [%(name)s]: %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )
        
        # Console handler
        console_handler = sys.stdout
        stream_handler = logging.StreamHandler(console_handler)
        stream_handler.setFormatter(formatter)
        logger.addHandler(stream_handler)

    return logger
