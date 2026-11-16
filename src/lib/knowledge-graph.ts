import { PostSummary } from './posts';

export type KnowledgeNode = {
  id: string;
  label: string;
  type: 'category' | 'article' | 'tag';
  weight: number;
  slug?: string;
  category?: string;
};

export type KnowledgeLink = {
  source: string;
  target: string;
  relationship: 'belongs_to' | 'tagged_as';
  weight: number;
};

export type KnowledgeGraphData = {
  nodes: KnowledgeNode[];
  links: KnowledgeLink[];
};

export function buildStaticKnowledgeGraph(posts: PostSummary[]): KnowledgeGraphData {
  const nodesMap = new Map<string, KnowledgeNode>();
  const links: KnowledgeLink[] = [];

  // Count tag frequencies so the graph stays clean and readable
  const tagCounts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    }
  }

  for (const post of posts) {
    const catId = `cat:${post.category}`;
    const existingCat = nodesMap.get(catId);
    if (existingCat) {
      existingCat.weight += 1;
    } else {
      nodesMap.set(catId, {
        id: catId,
        label: post.category,
        type: 'category',
        weight: 3,
        category: post.category,
      });
    }

    const articleId = `post:${post.slug}`;
    nodesMap.set(articleId, {
      id: articleId,
      label: post.title.length > 18 ? post.title.slice(0, 18) + '…' : post.title,
      type: 'article',
      weight: 1,
      slug: post.slug,
      category: post.category,
    });

    links.push({
      source: articleId,
      target: catId,
      relationship: 'belongs_to',
      weight: 2,
    });

    for (const tag of post.tags.slice(0, 3)) {
      const count = tagCounts.get(tag) || 0;
      if (count < 2 && posts.length > 20) continue;

      const tagId = `tag:${tag}`;
      const existingTag = nodesMap.get(tagId);
      if (existingTag) {
        existingTag.weight += 1;
      } else {
        nodesMap.set(tagId, {
          id: tagId,
          label: tag,
          type: 'tag',
          weight: count,
        });
      }

      links.push({
        source: articleId,
        target: tagId,
        relationship: 'tagged_as',
        weight: 1,
      });
    }
  }

  return {
    nodes: Array.from(nodesMap.values()),
    links,
  };
}
