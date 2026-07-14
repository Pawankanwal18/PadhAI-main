import os
import re
import pandas as pd

# Paths
DATA_DIR = 'data'
CSV_FILES = ['training-dataset.csv', '2nd_year_questions.csv', '1st_year_questions.csv']

# Cleaning rules
NOISE_TOPICS = [
    r'^p\.?t\.?o\.?$', r'^q\d', r'^q\.\d', r'semester examination',
    r'^unit\s*[-–]', r'^section', r'^\[?p\.?t\.?o', r'^mm\.?:',
    r'^\(?[a-z]\)?$', r'^\d+$', r'^ds-', r'^tcs-', r'^beet-', r'^bitt-',
    r'^e\d+$', r'^attempt', r'^answer', r'^sem\b', r'^reg\b'
]

SUBJECT_MAPPINGS = [
    # Chemistry
    (r'\b(water|lubricat|hardness|edta|polymer|nylon|bakelite|lubrication|phase rule)\b', 'Engineering Chemistry'),
    # Physics
    (r'\b(heisenberg|uncertainty|maxwell|laser|optical fiber|numerical aperture|compton)\b', 'Physics'),
    # C programming
    (r'\b(structure of a c program|swap two numbers|calloc|malloc|realloc|pointers?|structure and union|recursion|storage class|c program|file handling)\b', 'Programming in C'),
    # Electrical
    (r'\b(voltage|current|kirchhoff|kvl|kcl|superposition|thevenin|transformer|three phase ac|star and delta)\b', 'Basic Electrical Engineering'),
    # Electronics
    (r'\b(diode|rectifier|transistor|bjt|fet|common emitter|depletion region)\b', 'Basic Electronics Engineering'),
    # Math
    (r'\b(eigenvalues|eigenvectors|cayley-hamilton|euler\'s theorem|homogeneous functions|taylor\'s series|gauss elimination|rank of a matrix|normal form|maxima and minima|jacobian)\b', 'Mathematics-I'),
    # DBMS
    (r'\b(dbms|database|relational|sql|schema|transaction|normalization|entity relationship|concurrency control|ddl|dml|2pl|acid)\b', 'Database Management System'),
    # Cryptography
    (r'\b(cryptography|rsa|cipher|encryption|decryption|key exchange|aes|des|hash function|network security|digital signature|md5|sha-1|ipsec|firewall)\b', 'Cryptography and Network Security'),
    # Computer Networks
    (r'\b(network|tcp|ip|router|switch|ethernet|ipv6|socket|dns|http|osi model|arp|sliding window|routing protocol|subnetting)\b', 'Computer Networks'),
    # Artificial Intelligence
    (r'\b(artificial intelligence|heuristic|neural network|a\* search|alpha beta pruning|expert system|agent|turing test|resolution|predicate logic)\b', 'Artificial Intelligence'),
    # Machine Learning
    (r'\b(machine learning|supervised|unsupervised|regression|clustering|classification|knn|support vector machine|decision tree|random forest)\b', 'Machine Learning'),
    # Compiler Design
    (r'\b(compiler|lexical|parser|grammar|syntax directed|intermediate code|lr\(1\)|lalr|cfg|code generation|dag)\b', 'Compiler Design'),
    # Cloud Computing
    (r'\b(cloud|saas|paas|iaas|virtualization|hypervisor|aws|azure|google cloud|salesforce)\b', 'Cloud Computing'),
    # Soft Computing
    (r'\b(fuzzy|membership|defuzzification|genetic algorithm|rough set|soft computing)\b', 'Soft Computing'),
    # Distributed Systems
    (r'\b(distributed|rpc|rts|concurrency control|mutual exclusion|deadlock|clock synchronization|middleware)\b', 'Distributed Systems'),
    # Web Technology
    (r'\b(web|html|css|javascript|servlet|jsp|ajax|xml|dom|http request|web server)\b', 'Web Technology'),
    # Computer Graphics
    (r'\b(graph|line clipping|cohen sutherland|bezier|raster|brensenham|transformation|projection|rendering|clipping|midpoint circle)\b', 'Computer Graphics'),
    # Discrete Structures
    (r'\b(discrete|set theory|graph theory|propositional|predicate|permutation|combination|recurrence relation|poset|lattice|boolean algebra)\b', 'Discrete Structures'),
    # Automata
    (r'\b(automata|turing machine|pda|dfa|nfa|context free|regular expression|chomsky|regular grammar|pumping lemma)\b', 'Theory of Automata'),
    # Unix / OS
    (r'\b(unix|shell|linux|kernel|process|inode|directory|system call|operating system|page replacement|critical section|semaphore|thrashing)\b', 'Operating Systems'),
    # Data Structures
    (r'\b(data structure|stack|queue|linked list|tree|binary search tree|avl tree|sorting|hashing|bst|b-tree|red-black tree)\b', 'Data Structures')
]

def clean_topic_name(topic):
    topic = str(topic).strip()
    # Check if noise
    for rx in NOISE_TOPICS:
        if re.search(rx, topic, re.I):
            return "General"
    return topic

def infer_subject(row):
    topic = str(row['topic']).strip()
    question = str(row['question_text']).strip().lower()
    source = str(row['source_file']).strip().lower()
    
    # 1. Check source filename first (very strong signal)
    if 'chemistry' in source:
        return 'Engineering Chemistry'
    if 'physics' in source:
        return 'Physics'
    if 'c-programming' in source or '1st-year-c' in source:
        return 'Programming in C'
    if 'math' in source:
        return 'Mathematics-I'
    if 'electrical' in source:
        return 'Basic Electrical Engineering'
    if 'electronics' in source:
        return 'Basic Electronics Engineering'
    
    # 2. Check topic field for keywords
    for rx, subject in SUBJECT_MAPPINGS:
        if re.search(rx, topic, re.I):
            return subject
            
    # 3. Check question text for keywords
    for rx, subject in SUBJECT_MAPPINGS:
        if re.search(rx, question, re.I):
            return subject
            
    # 4. Cleanup topic name if it's not noise
    cleaned = clean_topic_name(topic)
    if cleaned != "General" and len(cleaned) > 3:
        return cleaned
        
    return 'General Computer Science'

def clean_question_text(text):
    text = str(text).strip()
    # Remove exam headers or noise sometimes prepended to questions
    text = re.sub(r'^(Attempt any|Answer any|Explain|Discuss|Define)\s+(two|three|four|five|questions?)\s+(of the following|from the following)[\s\d\.:]*', '', text, flags=re.I)
    return text.strip()

def main():
    print("Starting dataset refinement and cleaning...")
    
    for filename in CSV_FILES:
        filepath = os.path.join(DATA_DIR, filename)
        if not os.path.exists(filepath):
            print(f"Warning: File not found: {filepath}")
            continue
            
        print(f"Processing {filename}...")
        df = pd.read_csv(filepath)
        
        # Clean question text and infer subjects
        df['question_text'] = df['question_text'].apply(clean_question_text)
        df['topic'] = df.apply(infer_subject, axis=1)
        
        # Save refined CSV
        df.to_csv(filepath, index=False, encoding='utf-8')
        print(f"Refined CSV saved to {filepath} with {len(df)} rows")

    print("Dataset refinement completed successfully!")

if __name__ == '__main__':
    main()
