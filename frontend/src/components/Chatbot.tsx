import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const Chatbot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your AI assistant for exoplanet research. I can help you understand Kepler mission data, explain detection methods, and answer questions about exoplanets. How can I assist you today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const { toast } = useToast();

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "The Kepler mission used the transit method to discover exoplanets. When a planet passes in front of its host star, it causes a small, periodic dimming of the star's light. By monitoring thousands of stars simultaneously, Kepler was able to detect these subtle changes.",
        "The transit depth tells us about the planet's size relative to its star. A larger planet blocks more light, creating a deeper transit. We can calculate the planet's radius by measuring how much the star's brightness decreases during a transit.",
        "The habitable zone, also called the 'Goldilocks zone', is the region around a star where conditions might be right for liquid water to exist on a planet's surface. Kepler-452b, for example, orbits within its star's habitable zone.",
        "Kepler discovered over 2,600 confirmed exoplanets during its mission from 2009-2018. The spacecraft monitored more than 150,000 stars in the constellation Cygnus, revolutionizing our understanding of planetary systems.",
        "False positives can occur when other astronomical phenomena mimic transit signals. These include eclipsing binary stars, stellar variability, or instrumental artifacts. That's why machine learning models are trained to distinguish real exoplanets from false positives."
      ];
      
      const assistantMessage: Message = {
        role: "assistant",
        content: responses[Math.floor(Math.random() * responses.length)]
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 2000);
  };

  const suggestedQuestions = [
    "How does the transit method work?",
    "What is a habitable zone?",
    "How many exoplanets did Kepler find?",
    "Explain light curve analysis"
  ];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4 animate-fade-in">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 rounded-full stellar-gradient animate-pulse-glow">
            <Bot className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground glow-text">AI Research Assistant</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Ask questions about exoplanets, Kepler mission data, and detection methods
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Chat Interface */}
        <Card className="bg-card/80 backdrop-blur-sm border-border/20">
          {/* Messages */}
          <div className="p-6 space-y-4 h-[500px] overflow-y-auto">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  message.role === "user" 
                    ? "bg-primary" 
                    : "stellar-gradient"
                }`}>
                  {message.role === "user" ? (
                    <User className="h-5 w-5 text-primary-foreground" />
                  ) : (
                    <Bot className="h-5 w-5 text-primary-foreground" />
                  )}
                </div>
                <div className={`flex-1 ${message.role === "user" ? "text-right" : "text-left"}`}>
                  <div className={`inline-block p-4 rounded-lg ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50 text-foreground"
                  }`}>
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full stellar-gradient flex items-center justify-center">
                  <Bot className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <div className="inline-block p-4 rounded-lg bg-muted/50">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-foreground/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 rounded-full bg-foreground/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 rounded-full bg-foreground/50 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Suggested Questions */}
          {messages.length === 1 && (
            <div className="px-6 pb-4">
              <p className="text-sm text-muted-foreground mb-3">Suggested questions:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setInput(question)}
                    className="text-xs border-border/30 hover:bg-muted/50"
                  >
                    <Sparkles className="h-3 w-3 mr-1" />
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-6 border-t border-border/20">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask about exoplanets, Kepler data, or detection methods..."
                className="bg-background/50 border-border/30"
                disabled={isTyping}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="stellar-gradient"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Note: This is a demo interface. Connect to Lovable AI for real-time responses.
            </p>
          </div>
        </Card>

        {/* Info Card */}
        <Card className="mt-6 p-6 bg-card/80 backdrop-blur-sm border-border/20">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-accent/20">
              <Sparkles className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground mb-2">AI Capabilities</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Explain exoplanet detection methods and terminology</li>
                <li>• Provide insights about Kepler mission discoveries</li>
                <li>• Help interpret light curve data and transit signals</li>
                <li>• Answer questions about planetary properties and habitability</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
