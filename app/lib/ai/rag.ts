import path from "node:path";

import { TextLoader } from "@langchain/classic/document_loaders/fs/text";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

/**
 * Retrieval-Augmented Generation over the static society policy document.
 *
 * The AI assistant answers *policy* questions from this knowledge base and
 * personal account questions from MongoDB tools. The two are kept separate on
 * purpose: RAG returns text, tools return real rows.
 */

const KNOWLEDGE_FILE = path.join(
  process.cwd(),
  "app",
  "knowledge",
  "society.txt"
);

const CHUNK_SIZE = 400;
const CHUNK_OVERLAP = 80;
const TOP_K = 4;

/**
 * Minimum cosine similarity for a chunk to be handed to the LLM.
 * Anything below this is treated as "not in the knowledge base" so the model
 * is told to say the information is unavailable instead of guessing.
 */
const MIN_RELEVANCE = 0.55;

function getGoogleApiKey(): string {
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY is not defined");
  }

  return apiKey;
}

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: CHUNK_SIZE,
  chunkOverlap: CHUNK_OVERLAP,
});

/**
 * The vector store is expensive to build (it embeds every chunk), so we build
 * it once per server process and reuse it for every chat request.
 *
 * A promise is cached rather than the resolved store so that two concurrent
 * first requests cannot both start an embedding job.
 */
let vectorStorePromise: Promise<MemoryVectorStore> | null = null;

async function getVectorStore(): Promise<MemoryVectorStore> {
  if (vectorStorePromise) {
    return vectorStorePromise;
  }

  vectorStorePromise = (async () => {
    const loader = new TextLoader(KNOWLEDGE_FILE);

    const documents = await loader.load();

    const chunks = await splitter.splitDocuments(documents);

    const embeddings = new GoogleGenerativeAIEmbeddings({
      model: "gemini-embedding-001",
      apiKey: getGoogleApiKey(),
    });

    return MemoryVectorStore.fromDocuments(chunks, embeddings);
  })().catch((error: unknown) => {
    // Do not cache a failure; the next request should try again.
    vectorStorePromise = null;

    throw error;
  });

  return vectorStorePromise;
}

export type RetrievedChunk = {
  content: string;
  /** Cosine similarity in the 0..1 range. */
  score: number;
};

/**
 * Embeds the question and returns the most similar knowledge chunks.
 *
 * @returns only chunks at or above MIN_RELEVANCE. An empty array means the
 * knowledge base has nothing relevant to the question.
 */
export async function retrieveSocietyKnowledge(
  question: string
): Promise<RetrievedChunk[]> {
  const store = await getVectorStore();

  const results = await store.similaritySearchWithScore(question, TOP_K);

  return results
    .filter(([, score]) => score >= MIN_RELEVANCE)
    .map(([document, score]) => ({
      content: document.pageContent,
      score,
    }));
}
