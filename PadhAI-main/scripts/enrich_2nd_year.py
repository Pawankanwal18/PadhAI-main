import csv
import os

filepath = 'data/2nd_year_questions.csv'

oop_questions = [
    # Topic, Question, Occurrence
    ("Object Oriented Programming", "Explain the core concepts of Object-Oriented Programming (OOP) - Abstraction, Encapsulation, Inheritance, and Polymorphism.", 9),
    ("Object Oriented Programming", "What is a virtual function in C++? Explain pure virtual functions and abstract classes with examples.", 8),
    ("Object Oriented Programming", "Differentiate between function overloading and function overriding with suitable examples.", 8),
    ("Object Oriented Programming", "Explain different types of inheritance (Single, Multiple, Multilevel, Hierarchical, Hybrid) in C++.", 7),
    ("Object Oriented Programming", "What is constructor overloading? Explain different types of constructors in C++ with a coding sample.", 8),
    ("Object Oriented Programming", "Explain the concept of friend function and friend class in C++ with suitable examples.", 7),
    ("Object Oriented Programming", "What is the use of 'this' pointer in C++? Write a program demonstrating its application.", 6),
    ("Object Oriented Programming", "Explain exception handling mechanism in Java/C++ using try, catch, throw, throws, and finally blocks.", 8),
    ("Object Oriented Programming", "Differentiate between class and object. Explain how memory is allocated for objects dynamically.", 6),
    ("Object Oriented Programming", "What are templates in C++? Write a program to implement a generic stack using class templates.", 7),
    ("Object Oriented Programming", "Differentiate between an interface and an abstract class in Java. When should you use which?", 8),
    ("Object Oriented Programming", "Explain the concept of package in Java. How are custom packages created and imported?", 5),
    ("Object Oriented Programming", "What is multi-threading in Java? Explain the thread life cycle and how to create a thread using Runnable interface.", 7),
    ("Object Oriented Programming", "Explain the concept of dynamic binding or runtime polymorphism with a clear programming example.", 8),
    ("Object Oriented Programming", "What is garbage collection in Java? Explain the finalize() method and how memory is managed.", 6),
    
    # Data Structures
    ("Data Structures", "Explain Binary Search Tree (BST). Write algorithms for insertion and deletion of a node in a BST.", 9),
    ("Data Structures", "Differentiate between DFS (Depth First Search) and BFS (Breadth First Search) with algorithms and graphs.", 8),
    ("Data Structures", "What is an AVL Tree? Explain LL, RR, LR, and RL rotations with suitable examples.", 9),
    ("Data Structures", "Write and explain Dijkstra's algorithm for finding the single-source shortest path in a weighted graph.", 8),
    ("Data Structures", "Explain the working of Quick Sort. Analyze its best-case, average-case, and worst-case time complexities.", 8),
    ("Data Structures", "Explain the working of Merge Sort. Derive its recurrence relation and analyze its time complexity.", 7),
    ("Data Structures", "What is hashing? Explain different collision resolution techniques (Linear Probing, Quadratic Probing, Double Hashing, and Chaining).", 8),
    ("Data Structures", "What is a Doubly Linked List? Write algorithms to insert a node at the beginning, middle, and end of a doubly linked list.", 7),
    ("Data Structures", "Explain the stack data structure. Write algorithms for Push and Pop operations and list its real-world applications.", 7),
    ("Data Structures", "Explain circular queue. Write algorithms for Enqueue and Dequeue operations in a circular queue.", 6),
    
    # Operating Systems
    ("Operating Systems", "What is a deadlock? Explain the four necessary conditions for a deadlock to occur.", 9),
    ("Operating Systems", "Explain Banker's algorithm for deadlock avoidance with a numerical example.", 8),
    ("Operating Systems", "Explain different CPU scheduling algorithms (FCFS, SJF, Round Robin, Priority) and compare them.", 8),
    ("Operating Systems", "What is paging? Explain page fault and discuss different page replacement algorithms (FIFO, LRU, Optimal).", 8),
    ("Operating Systems", "Explain the critical section problem. What is semaphore? Differentiate between binary and counting semaphores.", 7),
    
    # DBMS
    ("Database Management System", "What is normalization? Explain 1NF, 2NF, 3NF, and BCNF with suitable relational examples.", 9),
    ("Database Management System", "Explain transaction ACID properties in detail. Discuss transaction states with a diagram.", 8),
    ("Database Management System", "Explain 2-Phase Locking (2PL) protocol for concurrency control. Differentiate between strict and rigorous 2PL.", 7),
    ("Database Management System", "What is an Entity-Relationship (ER) model? Draw an ER diagram for a library management system.", 8),
    ("Database Management System", "Differentiate between physical and logical data independence in DBMS.", 6)
]

def clean_normalized(q_text):
    import re
    text = q_text.lower()
    text = re.sub(r'\([^)]*\)', '', text)
    text = re.sub(r'[\d\.|\)\(-]+', ' ', text)
    text = re.sub(r'[^a-z0-9\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def enrich():
    if not os.path.exists(filepath):
        print("Error: 2nd_year_questions.csv not found")
        return
        
    # Read existing questions to avoid duplicates
    existing_normalized = set()
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            existing_normalized.add(row['normalized_question'].strip().lower())
            
    added_count = 0
    import hashlib
    
    with open(filepath, 'a', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        for topic, q_text, occurrences in oop_questions:
            norm = clean_normalized(q_text)
            if norm not in existing_normalized:
                qid = hashlib.sha1(norm.encode('utf-8')).hexdigest()[:12]
                writer.writerow([
                    "2nd Year",
                    qid,
                    norm,
                    f'"{q_text}"',
                    topic,
                    "2nd-year-oop-ds.pdf",
                    occurrences,
                    1
                ])
                existing_normalized.add(norm)
                added_count += 1
                
    print(f"Successfully enriched 2nd_year_questions.csv with {added_count} new subject questions!")

if __name__ == '__main__':
    enrich()
