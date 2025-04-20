import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sparkles, Plus, Image, Video, GamepadIcon, Brain } from "lucide-react";

type Model = {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: "image" | "video" | "code" | "custom";
};

const models: Model[] = [
  {
    id: "dall-e-3",
    name: "DALL-E 3",
    description: "Генерация изображений",
    icon: <Image className="text-[#FF6AC2]" />,
    category: "image"
  },
  {
    id: "midjourney",
    name: "Midjourney",
    description: "Художественные изображения",
    icon: <Image className="text-[#7C61DD]" />,
    category: "image"
  },
  {
    id: "sora",
    name: "Sora",
    description: "Генерация видео",
    icon: <Video className="text-[#5EA9FF]" />,
    category: "video"
  },
  {
    id: "gemini",
    name: "Gemini",
    description: "Создание игр и кода",
    icon: <GamepadIcon className="text-[#47D16C]" />,
    category: "code"
  }
];

interface SidebarProps {
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  customModels: Model[];
  setShowNewModelDialog: (show: boolean) => void;
}

export function Sidebar({ 
  selectedModel, 
  setSelectedModel, 
  customModels, 
  setShowNewModelDialog 
}: SidebarProps) {
  const allModels = [...models, ...customModels];

  return (
    <div className="h-full w-64 flex flex-col bg-sidebar border-r border-sidebar-border">
      <div className="p-3">
        <Button 
          variant="outline" 
          className="w-full justify-start bg-sidebar-accent hover:bg-sidebar-accent/90"
          onClick={() => setShowNewModelDialog(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Создать нейросеть
        </Button>
      </div>
      
      <div className="px-2 py-2">
        <h2 className="mb-2 px-4 text-xs font-semibold text-muted-foreground">
          Нейросети
        </h2>
        <div className="space-y-1">
          {allModels.map((model) => (
            <Button
              key={model.id}
              variant="ghost"
              className={cn(
                "w-full justify-start font-normal",
                selectedModel === model.id && "bg-sidebar-accent text-sidebar-accent-foreground"
              )}
              onClick={() => setSelectedModel(model.id)}
            >
              <div className="mr-2">{model.icon}</div>
              <span>{model.name}</span>
            </Button>
          ))}
        </div>
      </div>
      
      <div className="mt-auto p-4">
        <div className="flex items-center gap-2 rounded-lg bg-sidebar-accent p-3 text-sidebar-accent-foreground">
          <Sparkles className="h-5 w-5 text-primary" />
          <div className="text-xs">
            Наши нейросети могут создавать изображения, видео и игры
          </div>
        </div>
      </div>
    </div>
  );
}
