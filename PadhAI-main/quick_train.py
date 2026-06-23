#!/usr/bin/env python3
"""Quick train with 2nd year data - single epoch"""
import os
import pandas as pd
import torch
from torch.utils.data import Dataset, DataLoader
from torch.optim import AdamW
from transformers import T5Tokenizer, T5ForConditionalGeneration
from tqdm import tqdm

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
print(f"Device: {device}\n")

# Load data
df = pd.read_csv('data/training-dataset.csv')
print(f"📊 Total questions: {len(df)}")
print(df['year'].value_counts().to_string())

# Prepare data
df['input_text'] = df['topic'] + ' | ' + df['year'] + ' | ' + df['normalized_question']
df = df.dropna(subset=['input_text', 'question_text'])
train_data = df.iloc[:int(0.9*len(df))]

# Load model and tokenizer
print("\n⏳ Loading model...")
tokenizer = T5Tokenizer.from_pretrained('t5-small')
model = T5ForConditionalGeneration.from_pretrained('t5-small').to(device)

# Tokenize
print("⏳ Tokenizing...")
inputs = tokenizer(train_data['input_text'].tolist(), max_length=128, truncation=True, padding='max_length', return_tensors='pt')
labels = tokenizer(train_data['question_text'].tolist(), max_length=128, truncation=True, padding='max_length', return_tensors='pt').input_ids

# Dataset
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

train_loader = DataLoader(PaperDataset(inputs, labels), batch_size=16, shuffle=True)

# Train (1 epoch only)
print("\n🚀 Training (1 epoch)...")
model.train()
optimizer = AdamW(model.parameters(), lr=5e-5)
total_loss = 0

for batch in tqdm(train_loader):
    optimizer.zero_grad()
    input_ids = batch['input_ids'].to(device)
    attention_mask = batch['attention_mask'].to(device)
    labels = batch['labels'].to(device)
    
    outputs = model(input_ids=input_ids, attention_mask=attention_mask, labels=labels)
    loss = outputs.loss
    loss.backward()
    optimizer.step()
    total_loss += loss.item()

print(f"Average Loss: {total_loss/len(train_loader):.4f}")

# Save
print("\n💾 Saving model...")
os.makedirs('saved_model', exist_ok=True)
model.save_pretrained('saved_model')
tokenizer.save_pretrained('saved_model')
print("✅ Model trained and saved!\n")

# Test
model.eval()
test_2nd = df[df['year'].str.contains('2nd')].iloc[0]
text = f"{test_2nd['topic']} | 2nd Year | {test_2nd['normalized_question']}"
inputs = tokenizer(text, return_tensors='pt').to(device)
out = model.generate(**inputs, max_length=128)
pred = tokenizer.decode(out[0], skip_special_tokens=True)
print(f"Sample Prediction from 2nd Year:")
print(f"  Original: {test_2nd['question_text'][:60]}...")
print(f"  Predicted: {pred[:80]}...")
