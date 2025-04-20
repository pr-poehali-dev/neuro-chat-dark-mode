import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Send, Download, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  attachments?: {
    type: "image" | "video" | "code";
    url: string;
    alt?: string;
  }[];
};

type ModelInfo = {
  id: string;
  name: string;
  avatar?: string;
  description?: string;
};

interface ChatInterfaceProps {
  selectedModel: string;
  models: ModelInfo[];
}

export function ChatInterface({ selectedModel, models }: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSaved, setIsSaved] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const activeModel = models.find(model => model.id === selectedModel) || models[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    
    // Simulate AI response based on selected model
    setTimeout(() => {
      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: getResponseByModelAndPrompt(activeModel.id, input),
        role: "assistant",
        timestamp: new Date(),
        attachments: getAttachmentByModel(activeModel.id)
      };
      
      setMessages(prev => [...prev, responseMessage]);
    }, 1000);
  };

  const getAttachmentByModel = (modelId: string): Message["attachments"] => {
    if (modelId.includes("dall") || modelId.includes("midjourney")) {
      return [{ type: "image", url: "/placeholder.svg", alt: "Сгенерированное изображение" }];
    }
    if (modelId.includes("sora")) {
      return [{ type: "video", url: "/placeholder.svg", alt: "Сгенерированное видео" }];
    }
    if (modelId.includes("gemini")) {
      return [{ 
        type: "code", 
        url: "console.log('Пример сгенерированного кода игры');\n\n// Тут мог бы быть рабочий код вашей игры\nconst game = {\n  init() {\n    console.log('Игра инициализирована');\n  },\n  start() {\n    console.log('Игра запущена!');\n  }\n};\n\ngame.init();\ngame.start();" 
      }];
    }
    return undefined;
  };

  const getResponseByModelAndPrompt = (modelId: string, prompt: string): string => {
    if (modelId.includes("dall") || modelId.includes("midjourney")) {
      return `Вот изображение по запросу "${prompt}". Вы можете сохранить его, нажав на кнопку загрузки.`;
    }
    if (modelId.includes("sora")) {
      return `Видео по запросу "${prompt}" готово. Вы можете просмотреть и сохранить его.`;
    }
    if (modelId.includes("gemini")) {
      return `Я создал код игры по вашему запросу "${prompt}". Вы можете скопировать код и запустить его.`;
    }
    if (modelId.includes("custom")) {
      return `Как ваша персонализированная нейросеть, я готов помочь с запросом "${prompt}". Что бы вы хотели создать сегодня?`;
    }
    return `Я обработал ваш запрос "${prompt}". Чем еще могу помочь?`;
  };

  const handleSave = (messageId: string) => {
    setIsSaved(prev => ({ ...prev, [messageId]: true }));
    setTimeout(() => {
      setIsSaved(prev => ({ ...prev, [messageId]: false }));
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <div className="mb-4 p-4 rounded-full bg-primary/10">
              {activeModel.avatar ? (
                <img src={activeModel.avatar} alt={activeModel.name} className="w-16 h-16" />
              ) : (
                <div className="w-16 h-16 flex items-center justify-center text-primary text-2xl">
                  {activeModel.name.charAt(0)}
                </div>
              )}
            </div>
            <h3 className="text-xl font-semibold mb-2">{activeModel.name}</h3>
            <p className="max-w-md">
              {activeModel.description || "Задайте вопрос или опишите, что вы хотите создать"}
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 max-w-5xl",
                message.role === "user" ? "ml-auto" : ""
              )}
            >
              {message.role === "assistant" && (
                <Avatar className="h-8 w-8 bg-primary">
                  <span>{activeModel.name.charAt(0)}</span>
                </Avatar>
              )}
              
              <div className={cn(
                "flex flex-col rounded-lg p-4",
                message.role === "user" 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-card"
              )}>
                <div className="whitespace-pre-wrap">{message.content}</div>
                
                {/* Render attachments */}
                {message.attachments?.map((attachment, i) => (
                  <div key={i} className="mt-3">
                    {attachment.type === "image" && (
                      <div className="relative">
                        <img 
                          src={attachment.url} 
                          alt={attachment.alt} 
                          className="rounded-md max-w-md h-auto" 
                        />
                        <Button 
                          size="icon" 
                          variant="secondary" 
                          className="absolute top-2 right-2"
                          onClick={() => handleSave(message.id)}
                        >
                          {isSaved[message.id] ? <Check className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                        </Button>
                      </div>
                    )}
                    
                    {attachment.type === "video" && (
                      <div className="relative rounded-md bg-secondary aspect-video flex items-center justify-center max-w-md">
                        <div className="text-center">
                          <div className="text-4xl mb-2">🎬</div>
                          <p className="text-muted-foreground">Видеофайл</p>
                          <Button 
                            variant="secondary"
                            size="sm"
                            className="mt-2"
                            onClick={() => handleSave(message.id)}
                          >
                            {isSaved[message.id] ? <Check className="h-4 w-4 mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                            {isSaved[message.id] ? "Сохранено" : "Сохранить"}
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {attachment.type === "code" && (
                      <div className="mt-3 relative">
                        <pre className="bg-secondary p-4 rounded-md overflow-x-auto text-sm">
                          <code>{attachment.url}</code>
                        </pre>
                        <Button 
                          size="sm" 
                          variant="secondary" 
                          className="absolute top-2 right-2"
                          onClick={() => handleSave(message.id)}
                        >
                          {isSaved[message.id] ? <Check className="h-4 w-4 mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                          {isSaved[message.id] ? "Скопировано" : "Копировать"}
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {message.role === "user" && (
                <Avatar className="h-8 w-8 bg-secondary">
                  <span>🧑</span>
                </Avatar>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="border-t p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <Input
            placeholder={`Напишите сообщение для ${activeModel.name}...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
