"""
Configuration management for CAPA AI
Loads from config.yaml and environment variables
"""

from pathlib import Path
from typing import Any, Optional

import yaml
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


def load_yaml_config(config_path: Optional[Path] = None) -> dict[str, Any]:
    """Load configuration from YAML file."""
    if config_path is None:
        config_path = Path(__file__).parent.parent.parent / "config" / "config.yaml"
    
    if not config_path.exists():
        return {}
    
    with open(config_path) as f:
        return yaml.safe_load(f) or {}


class LLMSettings(BaseSettings):
    """LLM configuration."""
    vllm_base_url: str = Field(default="http://localhost:8000/v1", alias="vllm_base_url")
    openai_api_key: Optional[str] = Field(default=None, alias="OPENAI_API_KEY")
    anthropic_api_key: Optional[str] = Field(default=None, alias="ANTHROPIC_API_KEY")


class Settings(BaseSettings):
    """Application settings with environment override."""
    model_config = SettingsConfigDict(
        env_prefix="CAPA_",
        env_file=".env",
        extra="ignore",
    )
    
    app_name: str = "CAPA AI Management System"
    app_version: str = "0.1.0"
    environment: str = "development"
    debug: bool = True
    
    # Database
    database_url: str = Field(
        default="postgresql://user:pass@localhost:5432/capa_ai",
        alias="DATABASE_URL",
    )
    
    # Qdrant
    qdrant_url: str = Field(default="http://localhost:6333", alias="QDRANT_URL")
    
    # API
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    
    # Similarity
    similarity_threshold: float = 0.85
    
    # Agent
    confidence_threshold: float = 0.85


def get_config() -> dict[str, Any]:
    """Get merged configuration (YAML + env)."""
    yaml_config = load_yaml_config()
    return yaml_config


settings = Settings()
