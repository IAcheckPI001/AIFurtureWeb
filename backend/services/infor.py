

import json
from langchain.text_splitter import RecursiveCharacterTextSplitter


def getChunksInFile():
    try:
        with open("Q&A.json", "r", encoding="utf-8") as f:
            faqs = json.load(f)

        texts = [f"Q: {faq['question']}\nA: {faq['answer']}" for faq in faqs]
        big_text_document = "\n\n".join(texts)
        splitter = RecursiveCharacterTextSplitter(chunk_size = 300, chunk_overlap = 50)

        chunks = splitter.split_text(big_text_document)
        return chunks
    except Exception as e:
        print("Error:", e)
