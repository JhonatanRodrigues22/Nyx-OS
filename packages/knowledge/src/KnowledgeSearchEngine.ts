import { KeywordKnowledgeSearch } from "./KeywordKnowledgeSearch";
import { InMemoryKnowledgeStore, type KnowledgeStore } from "./KnowledgeStore";
import type { KnowledgeSearch, KnowledgeSearchQuery, KnowledgeSearchResult } from "./KnowledgeTypes";

export type KnowledgeSearchEngineOptions = {
  store?: KnowledgeStore;
  search?: KnowledgeSearch;
};

export class KnowledgeSearchEngine {
  private readonly store: KnowledgeStore;
  private readonly searchStrategy: KnowledgeSearch;

  constructor(options: KnowledgeSearchEngineOptions = {}) {
    this.store = options.store ?? new InMemoryKnowledgeStore();
    this.searchStrategy = options.search ?? new KeywordKnowledgeSearch();
  }

  search(query: KnowledgeSearchQuery): KnowledgeSearchResult[] {
    return this.searchStrategy.search(query, this.store.listChunks(query.documentId), this.store.listDocuments());
  }
}
