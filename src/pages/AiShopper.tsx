import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { JsonView } from "./tracking/JsonView";
import { tools, availableFunctions, Tool } from "./tools";
import { toJson } from "../lib/datalayer/api";
import { useFacetMap } from "../hooks/searchHooks";
import { useAdmin } from "../hooks/appState";
import { Loader } from "../components/Loader";
import { Link } from "react-router-dom";
import Markdown from "react-markdown";
import firebaseApp from "../firebase";
import {
  Content,
  FunctionCallPart,
  FunctionDeclaration,
  FunctionResponsePart,
  getAI,
  getGenerativeModel,
  Part,
} from "firebase/ai";
import { isDefined } from "../utils";

type Model =
  | "llama3.2"
  | "llama3.1"
  | "qwen3"
  | "qwen2.5"
  | "qwen2.5:14b"
  | "gemini-2.5-flash"
  | "phi4-mini:3.8b-q8_0";

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
  loading: boolean;
  addMessage: (message: Message) => void;
  restart?: () => void;
} | null>(null);

const systemMessage: Message = {
  role: "system",
  content:
    "You are a shopping assistant that make recommendations based on the data from tool calls. ask the user for product type, brand and other details. Use broad searches to start with and refine based on properties.",
};

const model: Model = "gemini-2.5-flash";

type OllamaResponse = {
  model: string;
  created_at: string;
  message: Message;
  done: boolean;
};

type CustomTool = Tool & {
  tool: (args: unknown) => Promise<string>;
};

const toGoogleTool = ({
  function: { description, name, parameters },
}: Tool): FunctionDeclaration => {
  return {
    name,
    description,
    parameters: parameters as FunctionDeclaration["parameters"] | undefined,
  };
};

export const AiShoppingProvider = ({
  children,
  customTools = [],
  messages: startMessages,
}: PropsWithChildren<{ messages: Message[]; customTools?: CustomTool[] }>) => {
  const ai = getAI(firebaseApp);
  const aiModel = getGenerativeModel(ai, {
    model,
    systemInstruction:
      startMessages.find((d) => d.role === "system")?.content ??
      systemMessage.content,
    tools: [
      {
        functionDeclarations: [
          ...tools,
          ...customTools.map(({ tool, ...rest }) => rest),
        ].map(toGoogleTool),
      },
    ],
  });
  const { data: facets } = useFacetMap();
  const [messageReference, setMessageReference] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>(startMessages);
  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message]);
    setMessageReference(message.content);
  }, []);
  const restart = useCallback(() => {
    setMessages([]);
    setMessageReference(null);
  }, []);

  useEffect(() => {
    if (!messageReference || loading) {
      return;
    }

    const run = async () => {
      setLoading(true);

      // Convert message history to the format expected by the API
      const history = messages
        .map((message): Content | null => {
          const parts: Part[] = [];
          if (message.role === "system") {
            parts.push({ text: message.content });
          }

          const role = message.role === "assistant" ? "model" : "user";

          if (message.content) {
            parts.push({ text: message.content });
          }

          if (message.tool_calls) {
            parts.push(
              ...message.tool_calls.map(
                (tc): FunctionCallPart => ({
                  functionCall: {
                    name: tc.function.name,
                    args: tc.function.arguments,
                  },
                })
              )
            );
          }
          return { role, parts };
        })
        .filter(isDefined);

      // First call to get the initial response (text or function calls)
      console.log("AI History:", history);
      const { response: initialResponse } = await aiModel.generateContent({
        contents: history,
      });

      const { text } = initialResponse;
      const functionCalls = initialResponse.functionCalls();

      const assistantMessage: Message = {
        role: "assistant",
        content: text() ?? "",
      };

      if (functionCalls && functionCalls.length > 0) {
        assistantMessage.tool_calls = functionCalls.map((fc) => ({
          function: {
            name: fc.name,
            arguments: fc.args,
          },
        }));

        setMessages((prev) => [...prev, assistantMessage]);

        // Execute the tool calls and get responses
        const toolResponses: FunctionResponsePart[] = await Promise.all(
          functionCalls.map(async (fc) => {
            const toCall =
              availableFunctions[fc.name as keyof typeof availableFunctions] ??
              customTools.find((tool) => tool.function.name === fc.name)?.tool;

            let content: string;
            if (toCall) {
              content = await toCall(fc.args as any, facets);
            } else {
              content = `Unknown function: ${fc.name}`;
              console.error("Unknown function:", fc.name, fc.args);
            }
            return {
              functionResponse: {
                name: fc.name,
                response: { content },
              },
            };
          })
        );

        // Add tool responses to history and make a second call to get the final text response
        const newHistory: Content[] = [
          ...history,
          {
            role: "model",
            parts: assistantMessage.tool_calls.map((tc) => ({
              functionCall: {
                name: tc.function.name,
                args: tc.function.arguments,
              },
            })),
          },
          { role: "user", parts: toolResponses },
        ];

        const { response: finalResponse } = await aiModel.generateContent({
          contents: newHistory,
        });

        const finalMessage: Message = {
          role: "assistant",
          content: finalResponse.text() ?? "",
        };
        setMessages((prev) => [...prev, finalMessage]);
        setMessageReference(null);
      } else {
        setMessages((prev) => [...prev, assistantMessage]);
        setMessageReference(null);
      }

      setLoading(false);
    };

    run().catch((err) => {
      console.error("AI Error:", err);
      setLoading(false);
      // Optionally, add an error message to the chat
    });
  }, [messageReference, aiModel, facets, customTools, loading, messages]);

  return (
    <AiShopperContext.Provider
      value={{ messages, model, addMessage, restart, loading }}
    >
      {children}
    </AiShopperContext.Provider>
  );
};

export const useAiContext = () => {
  const context = useContext(AiShopperContext);
  if (!context) {
    throw new Error("useAiContext must be used within an AiShoppingProvider");
  }
  return context;
};

const ChatResetButton = () => {
  const { restart, messages } = useAiContext();
  if (messages.length <= 1) {
    return null; // Hide button if there are no messages
  }
  return (
    <button
      onClick={restart}
      className="text-sm text-gray-600 hover:text-red-500 flex items-center gap-1"
    >
      <span>New conversation</span>
    </button>
  );
};

export const AiShopper = () => {
  return (
    <AiShoppingProvider messages={[systemMessage]}>
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
            <ChatResetButton />
          </div>

          <div className="flex-1 overflow-auto">
            <MessageList />
          </div>

          <QueryInput />
        </div>
      </div>
    </AiShoppingProvider>
  );
};

export const QueryInput = ({
  placeholderText = "Ask me anything...",
}: {
  placeholderText?: string;
}) => {
  const { addMessage, loading } = useAiContext();
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      addMessage({ role: "user", content: query });
      setQuery("");
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
        placeholder={placeholderText}
      />
      <button
        type="submit"
        disabled={loading}
        className="absolute disabled:opacity-50 right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white rounded-md px-4 py-2 font-medium transition-colors"
      >
        Send
      </button>
    </form>
  );
};

function splitTinking(content: string): { content: any; think: any } {
  const startIndex = content.indexOf("<think>");
  const endIndex = content.indexOf("</think>");
  if (startIndex !== -1 && endIndex !== -1) {
    const think = content.substring(startIndex + 7, endIndex);
    const contentWithoutThink = content.substring(endIndex + 8);
    return { content: contentWithoutThink, think };
  }
  return { content, think: null };
}

export const MessageList = () => {
  const { loading, messages } = useAiContext();
  const [isAdmin] = useAdmin();
  useEffect(() => {
    document.querySelector(".item-list > div:last-child")?.scrollIntoView({
      behavior: "smooth",
      block: "end",
      inline: "nearest",
    });
  }, [messages]);
  return (
    <div className="flex flex-col gap-6 item-list">
      {messages.map((message, index) => {
        if (message.role === "tool") {
          try {
            const parsed = JSON.parse(message.content);
            if (parsed && Array.isArray(parsed)) {
              if (parsed?.[0].title != null) {
                return (
                  <div className="grid grid-cols-2 gap-4" key={index}>
                    {parsed.map((d) => (
                      <Link
                        to={`/product/${d.id}`}
                        key={d.id}
                        className="flex flex-col items-center"
                      >
                        <span>{d.title}</span>
                        <img
                          src={d.img}
                          alt={d.title}
                          className="size-32 object-contain"
                        />
                        <ul>
                          {d.bulletPoints.split("\n").map((value: string) => (
                            <li key={value} className="text-sm text-gray-500">
                              {value}
                            </li>
                          ))}
                        </ul>
                      </Link>
                    ))}
                  </div>
                );
              }
            }
          } catch (e) {
            // Ignore parsing errors
          }

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
          (message.content == null && message.tool_calls == null) ||
          (message.content === "" &&
            (message.tool_calls == null || message.tool_calls.length === 0))
        ) {
          return null; // Hide system messages and empty assistant messages
        }
        const { content, think } = splitTinking(message.content);
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
              className={`max-w-[85%] px-4 py-2 rounded-2xl shadow-sm ${
                message.role === "user"
                  ? "bg-blue-500 text-white rounded-br-none"
                  : "bg-white border rounded-bl-none"
              }`}
            >
              {message.role === "assistant" && (
                <div className="text-xs text-gray-500 mb-1">Assistant</div>
              )}
              {message.tool_calls && (
                <div className="text-xs text-gray-500 mb-1">
                  <span className="font-bold">Tools used:</span>{" "}
                  {message.tool_calls.map((tc) => tc.function.name).join(", ")}
                </div>
              )}
              {think && (
                <div className="text-xs text-gray-500 mb-1">
                  <span className="font-bold">Thinking:</span> {think}
                </div>
              )}
              <div className="ai-response overflow-hidden">
                <Markdown>{content}</Markdown>
              </div>
            </div>
          </div>
        );
      })}
      {loading && (
        <div className="my-4">
          <Loader size={"sm"} />
        </div>
      )}
    </div>
  );
};
