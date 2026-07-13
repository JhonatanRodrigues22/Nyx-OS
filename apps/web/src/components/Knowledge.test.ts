import {
  FixedSizeChunkingStrategy,
  InMemoryKnowledgeStore,
  KnowledgeIngestor,
  KnowledgeSearchEngine,
  type KnowledgeDocument
} from "@nyx-os/knowledge";

function createDocument(overrides: Partial<KnowledgeDocument> = {}): KnowledgeDocument {
  return {
    id: "doc-1",
    title: "Nyx Manual",
    source: {
      type: "text",
      label: "Manual"
    },
    content: "abcdefghijklmnopqrstuvwxyz",
    metadata: {},
    ...overrides
  };
}

describe("Knowledge Engine", () => {
  it("ingests a document into fixed-size chunks with overlap", () => {
    const store = new InMemoryKnowledgeStore();
    const ingestor = new KnowledgeIngestor({
      store,
      chunking: new FixedSizeChunkingStrategy({
        chunkSize: 10,
        overlap: 2
      })
    });

    const result = ingestor.ingest(createDocument());

    expect(result.chunks.map((chunk) => chunk.content)).toEqual(["abcdefghij", "ijklmnopqr", "qrstuvwxyz", "yz"]);
    expect(result.chunks.map((chunk) => chunk.index)).toEqual([0, 1, 2, 3]);
    expect(result.chunks.map((chunk) => chunk.documentId)).toEqual(["doc-1", "doc-1", "doc-1", "doc-1"]);
  });

  it("returns relevant chunks ordered by keyword score", () => {
    const store = new InMemoryKnowledgeStore();
    const ingestor = new KnowledgeIngestor({
      store,
      chunking: new FixedSizeChunkingStrategy({
        chunkSize: 20,
        overlap: 0
      })
    });
    const search = new KnowledgeSearchEngine({ store });

    ingestor.ingest(
      createDocument({
        content: "alpha beta beta. gamma delta. beta zeta."
      })
    );

    const results = search.search({
      text: "beta"
    });

    expect(results.map((result) => result.chunk.content)).toEqual([
      "alpha beta beta. gam",
      "ma delta. beta zeta."
    ]);
    expect(results[0].score).toBeGreaterThan(0);
  });

  it("returns an empty list when no chunk matches", () => {
    const store = new InMemoryKnowledgeStore();
    const ingestor = new KnowledgeIngestor({ store });
    const search = new KnowledgeSearchEngine({ store });

    ingestor.ingest(createDocument());

    expect(search.search({ text: "semantics" })).toEqual([]);
  });

  it("rejects duplicated document ids explicitly", () => {
    const store = new InMemoryKnowledgeStore();
    const ingestor = new KnowledgeIngestor({ store });

    ingestor.ingest(createDocument());

    expect(() => ingestor.ingest(createDocument())).toThrow("Knowledge document already exists: doc-1");
  });
});
