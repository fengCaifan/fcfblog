import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), 'content/posts');

export type Post = {
  slug: string;
  title: string;
  date: string;
  category: string;
  description: string;
  tags: string[];
  content: string;
};

export type PostSummary = Omit<Post, 'content'>;

function normalizeDateStr(raw: unknown): string {
  const s = String(raw || '2025-01-01').trim();
  const m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (!m) return s;
  return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
}

function parsePostFile(fileName: string): Post | null {
  if (!fileName.endsWith('.md') || fileName === 'hello-world.md') {
    return null;
  }
  const slug = fileName.replace(/\.md$/, '');
  const fullPath = path.join(postsDirectory, fileName);
  if (!fs.existsSync(fullPath)) {
    return null;
  }
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  return {
    slug,
    content,
    title: data.title || slug,
    date: normalizeDateStr(data.date),
    category: data.category || '技术笔记',
    description: data.description || '',
    tags: Array.isArray(data.tags) ? data.tags : [],
  };
}

export function getAllPosts(): Post[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames
    .map(parsePostFile)
    .filter((post): post is Post => post !== null);

  return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getAllPostSummaries(): PostSummary[] {
  return getAllPosts().map(({ content: _content, ...summary }) => summary);
}

export function getPostBySlug(slug: string): Post | null {
  try {
    const decodedSlug = decodeURIComponent(slug);
    return parsePostFile(`${decodedSlug}.md`);
  } catch {
    return null;
  }
}
