from dotenv import load_dotenv
import streamlit as st
from PyPDF2 import PdfReader
from langchain.text_splitter import CharacterTextSplitter
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.vectorstores import FAISS
from langchain.chains.question_answering import load_qa_chain
from langchain.llms import OpenAI
from langchain.callbacks import get_openai_callback
from gensim.summarization import summarize

def main():
    load_dotenv()
    st.set_page_config(page_title="PDFreader")
    st.header("PDFreader")
    
    # Upload file
    pdf = st.file_uploader("Upload your PDF", type="pdf")
    
    # Extract the text
    if pdf is not None:
        pdf_reader = PdfReader(pdf)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text()
        
        # Split into chunks
        text_splitter = CharacterTextSplitter(
            separator="\n",
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len
        )
        chunks = text_splitter.split_text(text)
      
        # Create embeddings
        embeddings = OpenAIEmbeddings()
        knowledge_base = FAISS.from_texts(chunks, embeddings)
      
        # Prompt user input
        user_question = st.text_input("Ask a question about your PDF:")
        if user_question:
            # Perform similarity search
            docs = knowledge_base.similarity_search(user_question)
        
            # Load question-answering chain
            llm = OpenAI()
            chain = load_qa_chain(llm, chain_type="stuff")
            
            # Handle OpenAI callback
            with get_openai_callback() as cb:
                # Execute question-answering chain
                response = chain.run(input_documents=docs, question=user_question)
                print(cb)
           
            # Display response
            st.write(response)

      from transformers import BartForConditionalGeneration, BartTokenizer

# ...

# Summarize the PDF
summarize_pdf = st.button("Summarize the PDF")
if summarize_pdf:
    model = BartForConditionalGeneration.from_pretrained("facebook/bart-large-cnn")
    tokenizer = BartTokenizer.from_pretrained("facebook/bart-large-cnn")
    inputs = tokenizer.encode(text, return_tensors="pt", max_length=1024, truncation=True)
    summary_ids = model.generate(inputs, num_beams=4, max_length=100, early_stopping=True)
    summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)
    st.write(summary)


if __name__ == '__main__':
    main()


