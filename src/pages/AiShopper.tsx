import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { JsonView } from "./tracking/JsonView";
import { tools, availableFunctions } from "./tools";
import { toJson } from "../lib/datalayer/api";
import { useFacetMap } from "../hooks/searchHooks";

type Model = "llama3.2" | "qwen3" | "phi4-mini:3.8b-q8_0";

type ToolCall = {
  function: {
    name: string;
    arguments: Record<string, any>;
  };
};

type Message = {
  role: "user" | "assistant" | "system" | "tool";
  tool_calls?: ToolCall[];
  content: string;
};

const AiShopperContext = createContext<{
  model: Model;
  messages: Message[];
  addMessage: (message: Message) => void;
  restart?: () => void;
} | null>(null);

const systemMessage: Message = {
  role: "system",
  content:
    "You are a helpful shopping assistant. start by asking for a product type and perhaps a brand.",
};

const model: Model = "llama3.2";

type OllamaResponse = {
  model: string;
  created_at: string;
  message: Message;
  done: boolean;
};

export const AiShopper = () => {
  const [messageReference, setMessageReference] = useState<string | null>(null);
  const { data: facets } = useFacetMap();

  const [messages, setMessages] = useState<Message[]>([systemMessage]);

  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message]);
    setMessageReference(message.content);
  }, []);
  const restart = useCallback(() => {
    setMessages([systemMessage]);
    setMessageReference(null);
  }, []);

  useEffect(() => {
    if (messageReference) {
      fetch("/api/chat", {
        method: "POST",
        headers: { accept: "application/json" },
        body: JSON.stringify({
          model,
          messages,
          stream: false,
          tools,
        }),
      }).then((d) => {
        return toJson<OllamaResponse>(d).then(async (data) => {
          console.log("llm answer", data);
          if (data.message) {
            setMessages((prev) => [...prev, data.message]);
          }
          if (data.message.tool_calls != null) {
            for (const {
              function: { name, arguments: args },
            } of data.message.tool_calls) {
              const toCall =
                availableFunctions[name as keyof typeof availableFunctions];
              if (toCall) {
                await toCall(args as any, facets).then((content) => {
                  const message: Message = {
                    role: "tool",
                    content,
                  };
                  console.log("tool call result:", content);
                  setMessages((prev) => [...prev, message]);
                });
              }
            }
            setMessageReference(Date.now().toString());
          }

          return data;
        });
      });
    }
  }, [messageReference]);

  return (
    <AiShopperContext.Provider value={{ messages, model, addMessage, restart }}>
      <div className="container mx-auto p-4">
        <div className="flex flex-col gap-4">
          <div className="text-2xl font-bold">Ai Shopper</div>
          <div className="text-sm text-gray-500">
            This is a simple AI shopper that can help you find products.
          </div>

          <MessageList messages={messages} />
          <QueryInput />
        </div>
      </div>
    </AiShopperContext.Provider>
  );
};

const useAiContext = () => {
  const context = useContext(AiShopperContext);
  if (!context) {
    throw new Error("useAiContext must be used within an AiShopperProvider");
  }
  return context;
};

const QueryInput = () => {
  const { addMessage } = useAiContext();

  const [query, setQuery] = useState("can you find me a gaming headset?");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      addMessage({ role: "user", content: query });
      setQuery("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="border border-gray-300 rounded p-2 flex-grow"
        placeholder="Ask me anything..."
      />
      <button type="submit" className="bg-blue-500 text-white rounded p-2">
        Send
      </button>
    </form>
  );
};

const MessageList = ({ messages }: { messages: Message[] }) => {
  return (
    <div className="flex flex-col gap-4">
      {messages.map((message, index) => {
        if (message.role === "tool") {
          return (
            <div key={index} className="max-h-[400px] overflow-y-auto">
              <JsonView data={message.content} />
            </div>
          );
        }
        return (
          <div
            key={index}
            className={`p-2 rounded ${
              message.role === "user" ? "bg-blue-100" : "bg-green-100"
            }`}
          >
            <div>
              <strong>{message.role}:</strong>
              <pre>{message.content}</pre>
            </div>
          </div>
        );
      })}
    </div>
  );
};
