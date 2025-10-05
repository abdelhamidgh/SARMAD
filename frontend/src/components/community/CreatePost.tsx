import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { ResearchPost } from "./types";

interface CreatePostProps {
  onSubmit: (
    post: Omit<
      ResearchPost,
      "id" | "likes" | "comments" | "shares" | "createdAt"
    >
  ) => void;
  onCancel: () => void;
}

export const CreatePost = ({ onSubmit, onCancel }: CreatePostProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] =
    useState<ResearchPost["category"]>("DISCUSSION");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim()) && tags.length < 6) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) return;

    onSubmit({
      author: {
        name: "You",
        title: "Researcher",
        institution: "Your Institution",
        avatar: "YU",
        badges: ["New Member"],
      },
      title: title.trim(),
      content: content.trim(),
      tags,
      category,
    });

    setTitle("");
    setContent("");
    setTags([]);
    setCategory("DISCUSSION");
  };

  return (
    <Card className="p-6 bg-card/80 backdrop-blur-md border-border/50">
      <h3 className="text-2xl font-bold mb-4">Create New Post</h3>

      <div className="space-y-4">
        {/* Category */}
        <div>
          <Label htmlFor="category">Category</Label>
          <Select
            value={category}
            onValueChange={(value) =>
              setCategory(value as ResearchPost["category"])
            }
          >
            <SelectTrigger className="bg-background/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AI_MODEL">AI Model</SelectItem>
              <SelectItem value="OBSERVATION">Observation</SelectItem>
              <SelectItem value="ANALYSIS">Analysis</SelectItem>
              <SelectItem value="DISCUSSION">Discussion</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Title */}
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder="Enter a descriptive title for your post..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-background/50"
          />
        </div>

        {/* Content */}
        <div>
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            placeholder="Share your research findings, questions, or insights..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="bg-background/50 resize-none"
          />
        </div>

        {/* Tags */}
        <div>
          <Label htmlFor="tags">Tags (max 6)</Label>
          <div className="flex gap-2 mb-2">
            <Input
              id="tags"
              placeholder="Add a tag and press Enter..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && (e.preventDefault(), handleAddTag())
              }
              className="bg-background/50"
              disabled={tags.length >= 6}
            />
            <Button onClick={handleAddTag} disabled={tags.length >= 6}>
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                #{tag}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => handleRemoveTag(tag)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || !content.trim()}
            className="stellar-gradient"
          >
            Publish Post
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </Card>
  );
};
