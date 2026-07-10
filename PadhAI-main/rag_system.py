"""
RAG (Retrieval-Augmented Generation) System for PadhAI
Optimizes dataset and provides context-aware question generation using Anthropic API
"""

import os
import json
import csv
import numpy as np
from pathlib import Path
from typing import List, Dict, Tuple
import pickle

# Try to import optional dependencies
try:
    from sentence_transformers import SentenceTransformer
    HAS_EMBEDDINGS = True
except ImportError:
    HAS_EMBEDDINGS = False
    print("⚠️  sentence-transformers not installed. Install with: pip install sentence-transformers")

try:
    from sklearn.metrics.pairwise import cosine_similarity
    HAS_SKLEARN = True
except ImportError:
    HAS_SKLEARN = False
    print("⚠️  scikit-learn not installed. Install with: pip install scikit-learn")


class RAGSystem:
    """
    Retrieval-Augmented Generation system for exam questions.
    Creates embeddings, manages vector store, and retrieves relevant context.
    """
    
    def __init__(self, data_dir: str = "./data"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(exist_ok=True)
        
        # Initialize embedding model if available
        self.embedding_model = None
        self.embeddings_cache = {}
        self.vector_store = {}
        
        if HAS_EMBEDDINGS:
            print("📚 Loading embedding model...")
            self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        
        self.questions_data = []
        self.topics_data = []
        self.optimized_dataset = []
        
    def load_datasets(self) -> bool:
        """Load training and topics datasets"""
        try:
            # Load training dataset
            training_file = self.data_dir / "training-dataset.csv"
            if training_file.exists():
                with open(training_file, 'r', encoding='utf-8') as f:
                    reader = csv.DictReader(f)
                    self.questions_data = list(reader)
                print(f"✅ Loaded {len(self.questions_data)} questions")
            
            # Load important topics
            topics_file = self.data_dir / "important_topics_3rd_year.csv"
            if topics_file.exists():
                with open(topics_file, 'r', encoding='utf-8') as f:
                    reader = csv.DictReader(f)
                    self.topics_data = list(reader)
                print(f"✅ Loaded {len(self.topics_data)} topics")
            
            return len(self.questions_data) > 0
        except Exception as e:
            print(f"❌ Error loading datasets: {e}")
            return False
    
    def optimize_dataset(self) -> List[Dict]:
        """
        Optimize dataset by:
        - Removing duplicates
        - Normalizing text
        - Categorizing by difficulty
        - Enriching metadata
        """
        print("\n🔄 Optimizing dataset...")
        
        seen_questions = set()
        optimized = []
        
        for idx, item in enumerate(self.questions_data):
            # Normalize question text
            normalized = item.get('normalized_question', '').lower().strip()
            
            # Skip empty or duplicate questions
            if not normalized or normalized in seen_questions:
                continue
            
            seen_questions.add(normalized)
            
            # Estimate difficulty based on question text length and complexity
            question_length = len(item.get('question_text', ''))
            difficulty = 'easy' if question_length < 50 else 'medium' if question_length < 150 else 'hard'
            
            # Enrich item with metadata
            enriched_item = {
                **item,
                'id': f"q_{idx}",
                'difficulty': difficulty,
                'length_score': question_length,
                'occurrence_count': int(item.get('occurrence_count', 1)),
                'year': item.get('year', 'Unknown'),
                'topic': item.get('topic', 'General'),
                'source': item.get('source_file', 'unknown'),
                'embedding': None  # Will be filled if embedding available
            }
            
            optimized.append(enriched_item)
        
        self.optimized_dataset = optimized
        print(f"✅ Optimized dataset: {len(optimized)} unique questions")
        return optimized
    
    def generate_embeddings(self) -> bool:
        """Generate embeddings for all questions"""
        if not HAS_EMBEDDINGS or not self.embedding_model:
            print("⚠️  Embeddings disabled (sentence-transformers not installed)")
            return False
        
        print("\n📈 Generating embeddings...")
        
        try:
            for item in self.optimized_dataset:
                text_to_embed = f"{item['normalized_question']} {item.get('topic', '')}"
                embedding = self.embedding_model.encode(text_to_embed, convert_to_numpy=True)
                item['embedding'] = embedding.tolist()
                self.embeddings_cache[item['id']] = embedding
            
            print(f"✅ Generated embeddings for {len(self.optimized_dataset)} questions")
            return True
        except Exception as e:
            print(f"❌ Error generating embeddings: {e}")
            return False
    
    def retrieve_similar_questions(self, query: str, top_k: int = 5) -> List[Dict]:
        """
        Retrieve top-k similar questions based on query.
        Uses embeddings if available, falls back to keyword matching.
        """
        if not self.optimized_dataset:
            return []
        
        results = []
        
        if HAS_EMBEDDINGS and self.embedding_model and self.optimized_dataset[0].get('embedding'):
            # Use embedding-based similarity
            query_embedding = self.embedding_model.encode(query, convert_to_numpy=True)
            
            similarities = []
            for item in self.optimized_dataset:
                if item.get('embedding'):
                    item_embedding = np.array(item['embedding'])
                    similarity = cosine_similarity([query_embedding], [item_embedding])[0][0]
                    similarities.append((item, similarity))
            
            # Sort by similarity and get top-k
            similarities.sort(key=lambda x: x[1], reverse=True)
            results = [item for item, _ in similarities[:top_k]]
        else:
            # Fall back to keyword-based matching
            query_lower = query.lower()
            query_words = set(query_lower.split())
            
            scored_items = []
            for item in self.optimized_dataset:
                text = f"{item.get('normalized_question', '')} {item.get('topic', '')}".lower()
                text_words = set(text.split())
                score = len(query_words & text_words)  # Intersection count
                if score > 0:
                    scored_items.append((item, score))
            
            scored_items.sort(key=lambda x: x[1], reverse=True)
            results = [item for item, _ in scored_items[:top_k]]
        
        return results
    
    def build_context_prompt(self, query: str, user_topic: str = None, user_year: str = None) -> str:
        """
        Build an enriched context prompt for Anthropic API.
        Includes relevant examples from dataset and context.
        """
        context_items = self.retrieve_similar_questions(query, top_k=3)
        
        # Filter by user preferences if provided
        if user_topic:
            context_items = [item for item in context_items 
                           if user_topic.lower() in item.get('topic', '').lower()]
            if not context_items:
                context_items = self.retrieve_similar_questions(query, top_k=3)
        
        if user_year:
            year_items = [item for item in context_items 
                         if item.get('year') == user_year]
            if year_items:
                context_items = year_items
        
        context = f"""You are an expert exam question generator for computer science students.

CONTEXT FROM KNOWLEDGE BASE:
"""
        
        if context_items:
            context += "\nSimilar Questions in Dataset:\n"
            for i, item in enumerate(context_items, 1):
                context += f"\n{i}. Topic: {item.get('topic', 'General')}\n"
                context += f"   Year: {item.get('year', 'Unknown')}\n"
                context += f"   Question: {item.get('question_text', item.get('normalized_question', ''))}\n"
                context += f"   Difficulty: {item.get('difficulty', 'medium')}\n"
        
        context += f"""
USER REQUEST:
{query}
"""
        
        if user_topic:
            context += f"\nTopic Focus: {user_topic}"
        
        if user_year:
            context += f"\nYear Level: {user_year}"
        
        context += "\n\nGENERATE: A high-quality exam question following the patterns and style of similar questions in the dataset above."
        
        return context
    
    def get_topic_statistics(self) -> Dict:
        """Get statistics about topics in the dataset"""
        if not self.optimized_dataset:
            return {}
        
        stats = {}
        for item in self.optimized_dataset:
            topic = item.get('topic', 'Unknown')
            if topic not in stats:
                stats[topic] = {'count': 0, 'difficulties': {'easy': 0, 'medium': 0, 'hard': 0}}
            
            stats[topic]['count'] += 1
            difficulty = item.get('difficulty', 'medium')
            stats[topic]['difficulties'][difficulty] += 1
        
        return stats
    
    def save_optimized_dataset(self, output_file: str = None) -> bool:
        """Save optimized dataset to JSON"""
        if not self.optimized_dataset:
            return False
        
        if output_file is None:
            output_file = self.data_dir / "optimized_dataset.json"
        else:
            output_file = Path(output_file)
        
        try:
            # Prepare data for JSON (remove numpy arrays)
            serializable_data = []
            for item in self.optimized_dataset:
                item_copy = {k: v for k, v in item.items() if k != 'embedding'}
                serializable_data.append(item_copy)
            
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(serializable_data, f, indent=2, ensure_ascii=False)
            
            print(f"✅ Saved optimized dataset to {output_file}")
            return True
        except Exception as e:
            print(f"❌ Error saving dataset: {e}")
            return False
    
    def save_embeddings(self, output_file: str = None) -> bool:
        """Save embeddings cache to pickle file"""
        if not self.embeddings_cache:
            return False
        
        if output_file is None:
            output_file = self.data_dir / "embeddings_cache.pkl"
        else:
            output_file = Path(output_file)
        
        try:
            with open(output_file, 'wb') as f:
                pickle.dump(self.embeddings_cache, f)
            
            print(f"✅ Saved embeddings to {output_file}")
            return True
        except Exception as e:
            print(f"❌ Error saving embeddings: {e}")
            return False
    
    def generate_report(self) -> Dict:
        """Generate a comprehensive report about the RAG system"""
        return {
            'total_questions': len(self.optimized_dataset),
            'total_topics': len(self.get_topic_statistics()),
            'has_embeddings': bool(self.embeddings_cache),
            'dataset_optimization_status': 'complete' if self.optimized_dataset else 'pending',
            'topic_statistics': self.get_topic_statistics(),
            'difficulty_distribution': self._get_difficulty_distribution()
        }
    
    def _get_difficulty_distribution(self) -> Dict:
        """Get distribution of difficulty levels"""
        distribution = {'easy': 0, 'medium': 0, 'hard': 0}
        for item in self.optimized_dataset:
            difficulty = item.get('difficulty', 'medium')
            distribution[difficulty] = distribution.get(difficulty, 0) + 1
        return distribution


def main():
    """Main function to set up and test the RAG system"""
    print("🚀 PadhAI RAG System Initialization\n")
    
    # Initialize RAG system
    rag = RAGSystem(data_dir="./data")
    
    # Load datasets
    if not rag.load_datasets():
        print("❌ Failed to load datasets")
        return
    
    # Optimize dataset
    rag.optimize_dataset()
    
    # Generate embeddings (if available)
    rag.generate_embeddings()
    
    # Save optimized dataset
    rag.save_optimized_dataset()
    
    # Save embeddings
    rag.save_embeddings()
    
    # Print report
    print("\n📊 RAG System Report:")
    report = rag.generate_report()
    print(json.dumps(report, indent=2))
    
    # Test retrieval
    print("\n🧪 Testing Retrieval (sample query):")
    test_query = "artificial intelligence machine learning"
    similar = rag.retrieve_similar_questions(test_query, top_k=3)
    print(f"Found {len(similar)} similar questions")
    for i, q in enumerate(similar, 1):
        print(f"  {i}. {q.get('question_text', q.get('normalized_question', 'N/A'))[:80]}...")
    
    # Test context building
    print("\n📝 Sample Context Prompt:")
    context = rag.build_context_prompt(test_query, user_topic="ARTIFICIAL INTELLIGENCE")
    print(context[:500] + "...")
    
    print("\n✅ RAG System initialized successfully!")


if __name__ == "__main__":
    main()
