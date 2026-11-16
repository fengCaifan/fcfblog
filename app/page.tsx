import { getAllPostSummaries } from '../src/lib/posts';
import { buildStaticKnowledgeGraph } from '../src/lib/knowledge-graph';
import PostList from '../src/components/PostList';

export default function Home() {
  const posts = getAllPostSummaries();
  const graphData = buildStaticKnowledgeGraph(posts);

  return <PostList posts={posts} graphData={graphData} />;
}
