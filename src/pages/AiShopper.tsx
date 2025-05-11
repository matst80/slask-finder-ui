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
import { useAdmin } from "../hooks/appState";
import { Loader } from "../components/Loader";

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
    "You are a shopping assistant that make recommendations based on the data from tool calls. ask the user for product type, brand and other details. You can also ask the user for more details if needed.",
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
  const [loading, setLoading] = useState(false);
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
      if (loading) {
        return;
      }
      setLoading(true);
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
        return toJson<OllamaResponse>(d)
          .then(async (data) => {
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
          })
          .finally(() => {
            setLoading(false);
          });
      });
    }
  }, [messageReference]);

  return (
    <AiShopperContext.Provider value={{ messages, model, addMessage, restart }}>
      <div className="container mx-auto p-6 max-w-3xl">
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center border-b pb-4">
            <div>
              <h1 className="text-2xl font-bold text-blue-600">
                AI Shopping Assistant
              </h1>
              <p className="text-sm text-gray-500">
                I can help you find the perfect products for your needs.
              </p>
            </div>
            {messages.length > 1 && (
              <button
                onClick={restart}
                className="text-sm text-gray-600 hover:text-red-500 flex items-center gap-1"
              >
                <span>New conversation</span>
              </button>
            )}
          </div>

          <div className="flex-1 overflow-auto">
            <MessageList messages={messages} />
            {loading && (
              <div className="my-4">
                <Loader size={"sm"} />
              </div>
            )}
          </div>

          <QueryInput loading={loading} />
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

const QueryInput = ({ loading }: { loading: boolean }) => {
  const { addMessage } = useAiContext();
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      addMessage({ role: "user", content: query });
      setQuery("");
      setTimeout(() => {
        e.currentTarget.scrollTo({ behavior: "smooth", top: 0 });
      }, 300);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative border rounded-lg shadow-sm overflow-hidden"
    >
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full p-4 pr-20 border-0 focus:ring-2 focus:ring-blue-300 focus:outline-none"
        placeholder="Ask me anything..."
      />
      <button
        type="submit"
        disabled={loading}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white rounded-md px-4 py-2 font-medium transition-colors"
      >
        Send
      </button>
    </form>
  );
};

const MessageList = ({ messages }: { messages: Message[] }) => {
  const [isAdmin] = useAdmin();
  return (
    <div className="flex flex-col gap-6">
      {messages.map((message, index) => {
        if (message.role === "tool") {
          if (!isAdmin) {
            return null;
          }
          return (
            <div
              key={index}
              className="bg-gray-50 rounded-lg border p-3 max-h-[400px] overflow-y-auto"
            >
              <div className="text-xs text-gray-500 mb-2">Tool Response:</div>
              <JsonView data={message.content} />
            </div>
          );
        }

        if (
          message.role === "system" ||
          message.content == null ||
          message.content === ""
        ) {
          return null; // Hide system messages
        }

        return (
          <div
            key={index}
            onClick={() => {
              console.log("clicked message", message);
            }}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${
                message.role === "user"
                  ? "bg-blue-500 text-white rounded-br-none"
                  : "bg-white border rounded-bl-none"
              }`}
            >
              {message.role === "assistant" && (
                <div className="text-xs text-gray-500 mb-1">Assistant</div>
              )}
              <div className="whitespace-pre-wrap overflow-hidden">
                {message.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
