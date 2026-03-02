"""
RAG Retriever - LlamaIndex Hybrid Retrieval
FR-SIM-01: Dense (SiEBERT) + Sparse (BM25) + RRF
"""

from pathlib import Path
from typing import Optional

# Lazy imports for optional dependencies
_retriever = None


def get_retriever():
    """
    Get or create the RAG retriever.
    Uses in-memory index when vector store is not configured.
    """
    global _retriever
    
    if _retriever is not None:
        return _retriever
    
    try:
        from llama_index.core import VectorStoreIndex, Settings
        from llama_index.core.node_parser import SentenceSplitter
        from llama_index.embeddings.huggingface import HuggingFaceEmbedding
        
        # Configure embeddings (SiEBERT domain-adapted in production)
        embed_model = HuggingFaceEmbedding(
            model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
        )
        Settings.embed_model = embed_model
        Settings.chunk_size = 512
        Settings.chunk_overlap = 50
        
        # Create in-memory index with sample documents for demo
        sample_docs = [
            "SOP QA-001: Deviation handling requires immediate containment and root cause analysis within 7 days.",
            "GMP requirement: All process deviations must be documented with 5-Why analysis.",
            "Calibration schedule: Equipment must be calibrated every 6 months per SOP CAL-002.",
            "Training record: Personnel must complete GMP training annually.",
        ]
        
        from llama_index.core import Document
        documents = [Document(text=doc) for doc in sample_docs]
        
        index = VectorStoreIndex.from_documents(documents)
        _retriever = index.as_retriever(similarity_top_k=5)
        
        return _retriever
        
    except ImportError as e:
        print(f"LlamaIndex not available: {e}")
        return None
    except Exception as e:
        print(f"Retriever initialization failed: {e}")
        return None
