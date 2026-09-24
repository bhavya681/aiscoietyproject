import { TextLoader } from "@langchain/classic/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "@langchain/classic/text_splitter";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

const loader = new TextLoader("knowledge/society.txt");

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 300,
  chunkOverlap: 50,
});

const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "gemini-embedding-001",
});

let vectorStore: MemoryVectorStore | null = null;

async function getVectorStore() {
  if (vectorStore) {
    return vectorStore;
  }

  const documents = await loader.load();

  const chunks = await splitter.splitDocuments(documents);

  vectorStore = await MemoryVectorStore.fromDocuments(
    chunks,
    embeddings
  );

  return vectorStore;
}

export async function retrieveSocietyKnowledge(
  question: string
) {
  const store = await getVectorStore();

  const results =
    await store.similaritySearchVectorWithScore(
      question,
      3
    );

  const MIN_SCORE = 0.65;

  return results
    .filter(([, score]) => score >= MIN_SCORE)
    .map(([document, score]) => ({
      content: document.pageContent,
      score,
    }));
}