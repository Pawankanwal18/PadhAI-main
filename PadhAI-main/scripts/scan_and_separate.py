import os
import re
import pandas as pd

DATA_DIR = 'data'
TRAINING_DATASET = os.path.join(DATA_DIR, 'training-dataset.csv')

# Clean rules
NOISE_TOPICS = [
    r'^p\.?t\.?o\.?$', r'^q\d', r'^q\.\d', r'semester examination',
    r'^unit\s*[-–]', r'^section', r'^\[?p\.?t\.?o', r'^mm\.?:',
    r'^\(?[a-z]\)?$', r'^\d+$', r'^ds-', r'^tcs-', r'^beet-', r'^bitt-',
    r'^e\d+$', r'^attempt', r'^answer', r'^sem\b', r'^reg\b'
]

SUBJECT_MAPPINGS = [
    (r'\b(water|lubricat|hardness|edta|polymer|nylon|bakelite|lubrication|phase rule)\b', 'Engineering Chemistry'),
    (r'\b(heisenberg|uncertainty|maxwell|laser|optical fiber|numerical aperture|compton)\b', 'Physics'),
    (r'\b(structure of a c program|swap two numbers|calloc|malloc|realloc|pointers?|structure and union|recursion|storage class|c program|file handling)\b', 'Programming in C'),
    (r'\b(voltage|current|kirchhoff|kvl|kcl|superposition|thevenin|transformer|three phase ac|star and delta)\b', 'Basic Electrical Engineering'),
    (r'\b(diode|rectifier|transistor|bjt|fet|common emitter|depletion region)\b', 'Basic Electronics Engineering'),
    (r'\b(eigenvalues|eigenvectors|cayley-hamilton|euler\'s theorem|homogeneous functions|taylor\'s series|gauss elimination|rank of a matrix|normal form|maxima and minima|jacobian)\b', 'Mathematics-I'),
    (r'\b(dbms|database|relational|sql|schema|transaction|normalization|entity relationship|concurrency control|ddl|dml|2pl|acid)\b', 'Database Management System'),
    (r'\b(cryptography|rsa|cipher|encryption|decryption|key exchange|aes|des|hash function|network security|digital signature|md5|sha-1|ipsec|firewall)\b', 'Cryptography and Network Security'),
    (r'\b(network|tcp|ip|router|switch|ethernet|ipv6|socket|dns|http|osi model|arp|sliding window|routing protocol|subnetting)\b', 'Computer Networks'),
    (r'\b(artificial intelligence|heuristic|neural network|a\* search|alpha beta pruning|expert system|agent|turing test|resolution|predicate logic)\b', 'Artificial Intelligence'),
    (r'\b(machine learning|supervised|unsupervised|regression|clustering|classification|knn|support vector machine|decision tree|random forest)\b', 'Machine Learning'),
    (r'\b(compiler|lexical|parser|grammar|syntax directed|intermediate code|lr\(1\)|lalr|cfg|code generation|dag)\b', 'Compiler Design'),
    (r'\b(cloud|saas|paas|iaas|virtualization|hypervisor|aws|azure|google cloud|salesforce)\b', 'Cloud Computing'),
    (r'\b(fuzzy|membership|defuzzification|genetic algorithm|rough set|soft computing)\b', 'Soft Computing'),
    (r'\b(distributed|rpc|rts|concurrency control|mutual exclusion|deadlock|clock synchronization|middleware)\b', 'Distributed Systems'),
    (r'\b(web|html|css|javascript|servlet|jsp|ajax|xml|dom|http request|web server)\b', 'Web Technology'),
    (r'\b(graph|line clipping|cohen sutherland|bezier|raster|brensenham|transformation|projection|rendering|clipping|midpoint circle)\b', 'Computer Graphics'),
    (r'\b(discrete|set theory|graph theory|propositional|predicate|permutation|combination|recurrence relation|poset|lattice|boolean algebra)\b', 'Discrete Structures'),
    (r'\b(automata|turing machine|pda|dfa|nfa|context free|regular expression|chomsky|regular grammar|pumping lemma)\b', 'Theory of Automata'),
    (r'\b(unix|shell|linux|kernel|process|inode|directory|system call|operating system|page replacement|critical section|semaphore|thrashing)\b', 'Operating Systems'),
    (r'\b(data structure|stack|queue|linked list|tree|binary search tree|avl tree|sorting|hashing|bst|b-tree|red-black tree)\b', 'Data Structures')
]

def clean_topic_name(topic):
    topic = str(topic).strip()
    for rx in NOISE_TOPICS:
        if re.search(rx, topic, re.I):
            return "General"
    return topic

def infer_subject(row):
    topic = str(row['topic']).strip()
    question = str(row['question_text']).strip().lower()
    source = str(row['source_file']).strip().lower()
    
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
    
    for rx, subject in SUBJECT_MAPPINGS:
        if re.search(rx, topic, re.I):
            return subject
            
    for rx, subject in SUBJECT_MAPPINGS:
        if re.search(rx, question, re.I):
            return subject
            
    cleaned = clean_topic_name(topic)
    if cleaned != "General" and len(cleaned) > 3:
        return cleaned
        
    return 'General Computer Science'

def clean_question_text(text):
    text = str(text).strip()
    text = re.sub(r'^(Attempt any|Answer any|Explain|Discuss|Define)\s+(two|three|four|five|questions?)\s+(of the following|from the following)[\s\d\.:]*', '', text, flags=re.I)
    return text.strip()

def main():
    print("Starting database separation by year...")
    
    if not os.path.exists(TRAINING_DATASET):
        print("Error: training-dataset.csv not found")
        return
        
    df = pd.read_csv(TRAINING_DATASET)
    
    # 1. Separate 3rd year questions
    df_3rd = df[(df['year'] == '3rd Year') | (df['source_file'].str.contains('3rd', case=False, na=False))].copy()
    df_3rd['question_text'] = df_3rd['question_text'].apply(clean_question_text)
    df_3rd['topic'] = df_3rd.apply(infer_subject, axis=1)
    df_3rd.to_csv(os.path.join(DATA_DIR, '3rd_year_questions.csv'), index=False, encoding='utf-8')
    print(f"Created 3rd_year_questions.csv with {len(df_3rd)} rows")

    # 2. Separate 4th year questions
    df_4th = df[(df['year'] == '4th Year') | (df['source_file'].str.contains('4th', case=False, na=False))].copy()
    df_4th['question_text'] = df_4th['question_text'].apply(clean_question_text)
    df_4th['topic'] = df_4th.apply(infer_subject, axis=1)
    df_4th.to_csv(os.path.join(DATA_DIR, '4th_year_questions.csv'), index=False, encoding='utf-8')
    print(f"Created 4th_year_questions.csv with {len(df_4th)} rows")
    
    # 3. Clean 1st and 2nd year questions CSVs as well
    for filename in ['1st_year_questions.csv', '2nd_year_questions.csv']:
        filepath = os.path.join(DATA_DIR, filename)
        if os.path.exists(filepath):
            df_year = pd.read_csv(filepath)
            df_year['question_text'] = df_year['question_text'].apply(clean_question_text)
            df_year['topic'] = df_year.apply(infer_subject, axis=1)
            df_year.to_csv(filepath, index=False, encoding='utf-8')
            print(f"Cleaned and saved {filename} with {len(df_year)} rows")
            
    print("Database separation and refinement complete!")

if __name__ == '__main__':
    main()
