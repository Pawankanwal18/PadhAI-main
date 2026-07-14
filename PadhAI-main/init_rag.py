#!/usr/bin/env python3
"""
Quick RAG System Initialization Script
Run this to set up and test the RAG system
"""

import os
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

def main():
    print("=" * 70)
    print("PadhAI RAG System - Quick Setup")
    print("=" * 70)
    
    # Try to import RAG system
    try:
        from rag_system import RAGSystem
        print("RAG system module imported successfully")
    except Exception as e:
        print(f"Failed to import RAG system: {e}")
        print("\nInstalling required packages...")
        os.system("pip install pandas scikit-learn sentence-transformers numpy")
        try:
            from rag_system import RAGSystem
            print("RAG system module imported successfully after installing dependencies")
        except Exception as e2:
            print(f"Still failed to import: {e2}")
            return False
    
    # Initialize RAG
    print("\n" + "=" * 70)
    print("Initializing RAG System...")
    print("=" * 70)
    
    rag = RAGSystem(data_dir="./data")
    
    # Load datasets
    print("\nLoading datasets...")
    if not rag.load_datasets():
        print("Failed to load datasets")
        return False
    
    # Optimize dataset
    print("\nOptimizing dataset...")
    rag.optimize_dataset()
    
    # Generate embeddings
    print("\nGenerating embeddings...")
    rag.generate_embeddings()
    
    # Save optimized dataset
    print("\nSaving optimized dataset...")
    rag.save_optimized_dataset()
    
    # Save embeddings
    print("\nSaving embeddings...")
    rag.save_embeddings()
    
    # Print report
    print("\n" + "=" * 70)
    print("RAG System Report")
    print("=" * 70)
    report = rag.generate_report()
    for key, value in report.items():
        print(f"{key}: {value}")
    
    # Test retrieval
    print("\n" + "=" * 70)
    print("Testing Retrieval")
    print("=" * 70)
    
    test_queries = [
        "artificial intelligence machine learning",
        "database management system",
        "computer networks TCP/IP",
    ]
    
    for query in test_queries:
        print(f"\nQuery: '{query}'")
        similar = rag.retrieve_similar_questions(query, top_k=2)
        print(f"Found {len(similar)} similar questions:")
        for i, q in enumerate(similar, 1):
            print(f"  {i}. {q.get('question_text', q.get('normalized_question', 'N/A'))[:100]}...")
    
    # Test context building
    print("\n" + "=" * 70)
    print("Sample Context Prompt")
    print("=" * 70)
    context = rag.build_context_prompt("artificial intelligence", user_topic="ARTIFICIAL INTELLIGENCE")
    print(context[:500] + "...\n[truncated]")
    
    # Topic statistics
    print("\n" + "=" * 70)
    print("Topic Statistics (Top 10)")
    print("=" * 70)
    stats = rag.get_topic_statistics()
    sorted_stats = sorted(stats.items(), key=lambda x: x[1]['count'], reverse=True)[:10]
    for topic, data in sorted_stats:
        print(f"{topic}: {data['count']} questions")
        print(f"  Difficulties: Easy={data['difficulties']['easy']}, " 
              f"Medium={data['difficulties']['medium']}, "
              f"Hard={data['difficulties']['hard']}")
    
    print("\n" + "=" * 70)
    print("RAG System initialized successfully!")
    print("=" * 70)
    print("\nNext Steps:")
    print("1. Start backend: cd 'ai projeect/backend' && node server.js")
    print("2. Test RAG endpoints: curl http://localhost:3001/api/rag/health")
    print("3. Check documentation: RAG_SETUP_GUIDE.md")
    
    return True


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
