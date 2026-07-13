import type { KnowledgeChunk, KnowledgeDocument, KnowledgeSearch, KnowledgeSearchQuery, KnowledgeSearchResult } from "./KnowledgeTypes";

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function tokenize(value: string): string[] {
  return normalize(value)
    .split(/\s+/)
    .map((term) => term.trim())
    .filter(Boolean);
}

function countOccurrences(content: string, term: string): number {
  if (!term) {
    return 0;
  }

  let count = 0;
  let index = content.indexOf(term);

  while (index !== -1) {
    count += 1;
    index = content.indexOf(term, index + term.length);
  }

  return count;
}

export class KeywordKnowledgeSearch implements KnowledgeSearch {
  search(
    query: KnowledgeSearchQuery,
    chunks: KnowledgeChunk[],
    documents: KnowledgeDocument[]
  ): KnowledgeSearchResult[] {
    const terms = tokenize(query.text);

    if (terms.length === 0) {
      return [];
    }

    const documentsById = new Map(documents.map((document) => [document.id, document]));

    return chunks
      .filter((chunk) => !query.documentId || chunk.documentId === query.documentId)
      .map((chunk) => {
        const document = documentsById.get(chunk.documentId);

        if (!document) {
          return null;
        }

        const score = this.score(chunk, document, terms);

        if (score <= 0) {
          return null;
        }

        return {
          chunk,
          document,
          score
        };
      })
      .filter((result): result is KnowledgeSearchResult => Boolean(result))
      .sort((left, right) => right.score - left.score || left.chunk.index - right.chunk.index)
      .slice(0, query.limit ?? Number.POSITIVE_INFINITY);
  }

  private score(chunk: KnowledgeChunk, document: KnowledgeDocument, terms: string[]): number {
    const chunkContent = normalize(chunk.content);
    const title = normalize(document.title);

    return terms.reduce((score, term) => {
      const chunkMatches = countOccurrences(chunkContent, term);
      const titleMatches = countOccurrences(title, term);

      return score + chunkMatches * 10 + titleMatches * 3;
    }, 0);
  }
}
