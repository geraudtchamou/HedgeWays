import logging
from typing import Optional
from datetime import datetime
from pythonjsonlogger import jsonlogger


class CustomJsonFormatter(jsonlogger.JsonFormatter):
    """Custom JSON formatter for structured logging."""
    
    def add_fields(self, log_record: dict, record: logging.LogRecord, message_dict: dict) -> None:
        super(CustomJsonFormatter, self).add_fields(log_record, record, message_dict)
        if not log_record.get('timestamp'):
            now = datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S.%fZ')
            log_record['timestamp'] = now
        if log_record.get('level'):
            log_record['level'] = log_record['level'].upper()
        else:
            log_record['level'] = record.levelname


def setup_logging(level: str = "INFO") -> logging.Logger:
    """Setup structured logging for the application."""
    
    logger = logging.getLogger("em_platform")
    logger.setLevel(getattr(logging, level.upper()))
    
    # Console handler with JSON formatting
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(CustomJsonFormatter(
        '%(timestamp)s %(level)s %(name)s %(message)s'
    ))
    logger.addHandler(console_handler)
    
    # Prevent duplicate logs
    logger.propagate = False
    
    return logger


# Global logger instance
logger = setup_logging()


def get_logger(name: Optional[str] = None) -> logging.Logger:
    """Get a logger instance with optional custom name."""
    if name:
        return logging.getLogger(f"em_platform.{name}")
    return logger
