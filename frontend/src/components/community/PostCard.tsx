import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreVertical,
} from "lucide-react";
import { ResearchPost } from "./types";
import { formatDistanceToNow } from "date-fns";

interface PostCardProps {
  post: ResearchPost;
}

export const PostCard = ({ post }: PostCardProps) => {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [localLikes, setLocalLikes] = useState(post.likes);

  const handleLike = () => {
    setLiked(!liked);
    setLocalLikes(liked ? localLikes - 1 : localLikes + 1);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "AI_MODEL":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "OBSERVATION":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      case "ANALYSIS":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "DISCUSSION":
        return "bg-orange-500/20 text-orange-300 border-orange-500/30";
      default:
        return "bg-muted/20 text-muted-foreground";
    }
  };

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50 transition-stellar hover:border-primary/30 animate-fade-in">
      {/* Author Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12 stellar-gradient">
            <AvatarFallback className="bg-transparent text-primary-foreground font-semibold">
              {post.author.avatar}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-foreground">
              {post.author.name}
            </h3>
            <p className="text-sm text-muted-foreground">{post.author.title}</p>
            <p className="text-xs text-muted-foreground">
              {post.author.institution}
            </p>
            <div className="flex gap-1 mt-1">
              {post.author.badges.map((badge) => (
                <Badge key={badge} variant="outline" className="text-xs">
                  {badge}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </span>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Category Badge */}
      <Badge className={`mb-3 ${getCategoryColor(post.category)}`}>
        {post.category.replace("_", " ")}
      </Badge>

      {/* Post Content */}
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2 text-foreground">{post.title}</h2>
        <p className="text-muted-foreground leading-relaxed">{post.content}</p>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {post.tags.map((tag) => (
          <Button
            key={tag}
            variant="ghost"
            size="sm"
            className="h-7 text-xs hover:bg-primary/20"
          >
            #{tag}
          </Button>
        ))}
      </div>

      {/* Interaction Buttons */}
      <div className="flex items-center gap-1 pt-4 border-t border-border/50">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          className={`gap-2 ${
            liked ? "text-red-400" : ""
          } hover:text-red-400 transition-stellar`}
        >
          <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
          <span className="text-sm font-medium">{localLikes}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 hover:text-blue-400 transition-stellar"
        >
          <MessageCircle className="h-4 w-4" />
          <span className="text-sm font-medium">{post.comments}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 hover:text-green-400 transition-stellar"
        >
          <Share2 className="h-4 w-4" />
          <span className="text-sm font-medium">{post.shares}</span>
        </Button>
        <div className="flex-1" />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setBookmarked(!bookmarked)}
          className={`${
            bookmarked ? "text-yellow-400" : ""
          } hover:text-yellow-400 transition-stellar`}
        >
          <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-current" : ""}`} />
        </Button>
      </div>
    </Card>
  );
};
