import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, TrendingUp, PlusCircle, Loader2 } from "lucide-react";
import { PostCard } from "./community/PostCard";
import { CreatePost } from "./community/CreatePost";
import { ResearchPost } from "./community/types";

const API_URL = "http://localhost:3000";

export const ResearchCommunity = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [posts, setPosts] = useState<ResearchPost[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get token from memory (you'll need to pass this as a prop from Index.tsx)
  const getAuthToken = () => {
    // For now, we'll get it from a simple variable
    // In production, you might want to use React Context or a state management solution
    return (window as any).authToken || "";
  };

  // Fetch posts on component mount
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();

      const response = await fetch(`${API_URL}/api/posts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }

      const data = await response.json();
      setPosts(data);
      setError("");
    } catch (err) {
      setError("Failed to load posts. Please try again.");
      console.error("Fetch posts error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      searchQuery === "" ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesTab =
      activeTab === "all" ||
      post.category.toLowerCase() === activeTab.replace("_", " ").toLowerCase();

    return matchesSearch && matchesTab;
  });

  const handleCreatePost = async (
    newPost: Omit<
      ResearchPost,
      "id" | "likes" | "comments" | "shares" | "createdAt"
    >
  ) => {
    try {
      const token = getAuthToken();

      const response = await fetch(`${API_URL}/api/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newPost.title,
          content: newPost.content,
          category: newPost.category,
          tags: newPost.tags,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create post");
      }

      // Refresh posts after creating
      await fetchPosts();
      setShowCreatePost(false);
    } catch (err) {
      console.error("Create post error:", err);
      alert("Failed to create post. Please try again.");
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3 glow-text">
            Research Community
          </h1>
          <p className="text-muted-foreground text-lg">
            Connect with researchers worldwide working on NASA's exoplanet AI
            challenge
          </p>
        </div>

        {/* Search and Create Post */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search posts, researchers, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card/50 border-border/50 backdrop-blur-sm"
            />
          </div>
          <Button
            onClick={() => setShowCreatePost(!showCreatePost)}
            className="stellar-gradient gap-2"
          >
            <PlusCircle className="h-5 w-5" />
            Create Post
          </Button>
        </div>

        {/* Create Post Form */}
        {showCreatePost && (
          <div className="mb-6 animate-fade-in">
            <CreatePost
              onSubmit={handleCreatePost}
              onCancel={() => setShowCreatePost(false)}
            />
          </div>
        )}

        {/* Tabs for Categories */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="bg-card/50 border border-border/50 backdrop-blur-sm">
            <TabsTrigger value="all">All Posts</TabsTrigger>
            <TabsTrigger value="ai_model">AI Models</TabsTrigger>
            <TabsTrigger value="observation">Observations</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="discussion">Discussion</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Trending Topics */}
        <Card className="p-4 mb-6 bg-card/50 backdrop-blur-sm border-border/50">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Trending Topics</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              "AI Models",
              "Kepler",
              "Transit Detection",
              "Light Curves",
              "TESS",
              "Deep Learning",
              "Classification",
            ].map((tag) => (
              <Button
                key={tag}
                variant="outline"
                size="sm"
                onClick={() => setSearchQuery(tag)}
                className="hover:bg-primary/20 transition-stellar"
              >
                #{tag}
              </Button>
            ))}
          </div>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="p-4 mb-6 bg-red-500/10 border-red-500/30">
            <p className="text-red-400">{error}</p>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <Card className="p-12 text-center bg-card/50 backdrop-blur-sm border-border/50">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading posts...</p>
          </Card>
        )}

        {/* Posts Feed */}
        {!loading && (
          <div className="space-y-6">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))
            ) : (
              <Card className="p-12 text-center bg-card/50 backdrop-blur-sm border-border/50">
                <p className="text-muted-foreground">
                  No posts found. Try a different search or create the first
                  post!
                </p>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
