#!/usr/bin/env python3
"""
Train the T5 model with updated dataset including 2nd year questions
Simplified version to avoid initialization issues
"""
import os
import pandas as pd
import torch
from torch.utils.data import Dataset, DataLoader
from torch.optim import AdamW
from transformers import T5Tokenizer, T5ForConditionalGeneration
from tqdm import tqdm

print("Loading training data...")
df = pd.read_csv('data/training-dataset.csv')
print(f"Total questions: {len(df)}\n")
print(f"Year distribution:\n{df['year'].value_counts()}\n")

# Preprocess
print("\n" + "="*60)
print("PREPROCESSING DATA")
print("="*60)
df['input_text'] = df['topic'].astype(str) + ' | ' + df['year'].astype(str) + ' | ' + df['normalized_question'].astype(str)
df = df.dropna(subset=['input_text', 'question_text'])
print(f"After removing NaN: {len(df)} rows")

# 80/20 split
train_df = df.iloc[:int(0.8*len(df))]
test_df = df.iloc[int(0.8*len(df)):]
print(f"Train: {len(train_df)} | Test: {len(test_df)}")

# Tokenize
print("\n" + "="*60)
print("TOKENIZING DATA")
print("="*60)

# Initialize tokenizer early (before model loading)
try:
    if os.path.exists('saved_model') and os.path.isdir('saved_model'):
        tokenizer = T5Tokenizer.from_pretrained('saved_model')
    else:
        tokenizer = T5Tokenizer.from_pretrained('t5-small')
except:
    tokenizer = T5Tokenizer.from_pretrained('t5-small')

def tokenize(texts, targets, max_len=128):
    inputs = tokenizer(texts, max_length=max_len, truncation=True, padding='max_length', return_tensors='pt')
    labels = tokenizer(targets, max_length=max_len, truncation=True, padding='max_length', return_tensors='pt').input_ids
    return inputs, labels

print("Tokenizing training data...")
train_inputs, train_labels = tokenize(train_df['input_text'].tolist(), train_df['question_text'].tolist())
print("Tokenizing test data...")
test_inputs, test_labels = tokenize(test_df['input_text'].tolist(), test_df['question_text'].tolist())

# Dataset and DataLoader
class PaperDataset(Dataset):
    def __init__(self, inputs, labels):
        self.inputs = inputs
        self.labels = labels

    def __len__(self):
        return self.labels.shape[0]

    def __getitem__(self, idx):
        return {
            'input_ids': self.inputs.input_ids[idx],
            'attention_mask': self.inputs.attention_mask[idx],
            'labels': self.labels[idx]
        }

train_loader = DataLoader(PaperDataset(train_inputs, train_labels), batch_size=8, shuffle=True)
test_loader = DataLoader(PaperDataset(test_inputs, test_labels), batch_size=8)

# Load model
print("\n" + "="*60)
print("LOADING MODEL")
print("="*60)
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

if os.path.exists('saved_model') and os.path.isdir('saved_model'):
    print("Loading from local saved_model...")
    model = T5ForConditionalGeneration.from_pretrained('saved_model').to(device)
else:
    print("Loading from t5-small pretrained model...")
    model = T5ForConditionalGeneration.from_pretrained('t5-small').to(device)

print(f"Using device: {device}")

# Training
print("\n" + "="*60)
print("TRAINING MODEL")
print("="*60)
optimizer = AdamW(model.parameters(), lr=5e-5)
epochs = 3

model.train()
for epoch in range(epochs):
    print(f"\nEpoch {epoch + 1}/{epochs}")
    total_loss = 0
    
    for batch in tqdm(train_loader, desc=f"Training"):
        optimizer.zero_grad()
        input_ids = batch['input_ids'].to(device)
        attention_mask = batch['attention_mask'].to(device)
        labels = batch['labels'].to(device)
        
        outputs = model(input_ids=input_ids, attention_mask=attention_mask, labels=labels)
        loss = outputs.loss
        loss.backward()
        optimizer.step()
        total_loss += loss.item()
    
    avg_loss = total_loss / len(train_loader)
    print(f"Average Loss: {avg_loss:.4f}")

# Evaluation
print("\n" + "="*60)
print("EVALUATING MODEL")
print("="*60)
model.eval()
total_eval_loss = 0

with torch.no_grad():
    for batch in tqdm(test_loader, desc="Evaluating"):
        input_ids = batch['input_ids'].to(device)
        attention_mask = batch['attention_mask'].to(device)
        labels = batch['labels'].to(device)
        
        outputs = model(input_ids=input_ids, attention_mask=attention_mask, labels=labels)
        loss = outputs.loss
        total_eval_loss += loss.item()

avg_eval_loss = total_eval_loss / len(test_loader)
print(f"Average Eval Loss: {avg_eval_loss:.4f}")

# Save model
print("\n" + "="*60)
print("SAVING MODEL")
print("="*60)
model.save_pretrained('saved_model')
tokenizer.save_pretrained('saved_model')
print("✅ Model saved to saved_model/")

# Test predictions
print("\n" + "="*60)
print("TESTING PREDICTIONS")
print("="*60)

def predict(topic, year, normalized_question):
    text = f'{topic} | {year} | {normalized_question}'
    inputs = tokenizer(text, return_tensors='pt').to(device)
    output = model.generate(**inputs, max_length=128)
    return tokenizer.decode(output[0], skip_special_tokens=True)

# Test with 2nd year data
second_year_data = df[df['year'].str.contains('2', case=False, na=False)]
if len(second_year_data) > 0:
    print("\n🎓 2nd Year Sample Predictions:")
    for i in range(min(3, len(second_year_data))):
        sample = second_year_data.iloc[i]
        prediction = predict(sample['topic'], sample['year'], sample['normalized_question'])
        print(f"\n  Topic: {sample['topic']}")
        print(f"  Question: {sample['question_text'][:60]}...")
        print(f"  Predicted: {prediction[:70]}...")

print("\n" + "="*60)
print("✅ TRAINING COMPLETE!")
print("="*60)
