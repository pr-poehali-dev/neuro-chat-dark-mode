import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { ChatInterface } from "@/components/chat-interface";
import { CreateModelDialog } from "@/components/create-model-dialog";
import { Brain } from "lucide-react";

type Model = {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: "image" | "video" | "code" | "custom";
};

const Index = () => {
  const [selectedModel, setSelectedModel] = useState("dall-e-3");
  const [customModels, setCustomModels] = useState<Model[]>([]);
  const [showNewModelDialog, setShowNewModelDialog] = useState(false);
  
  const handleCreateModel = (name: string, description: string) => {
    const newModel: Model = {
      id: `custom-${Date.now()}`,
      name,
      description: description || "Пользовательская нейросеть",
      icon: <Brain className="text-[#FF9839]" />,
      category: "custom"
    };
    
    setCustomModels(prev => [...prev, newModel]);
    setSelectedModel(newModel.id);
  };
  
  const allModelsInfo = [
    { id: "dall-e-3", name: "DALL-E 3", description: "Генерация изображений высокого качества" },
    { id: "midjourney", name: "Midjourney", description: "Художественные изображения в разных стилях" },
    { id: "sora", name: "Sora", description: "Генерация реалистичных видеороликов" },
    { id: "gemini", name: "Gemini", description: "Создание игр и написание кода" },
    ...customModels.map(model => ({ 
      id: model.id, 
      name: model.name, 
      description: model.description 
    }))
  ];
  
  return (
    <div className="flex h-screen">
      <Sidebar 
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        customModels={customModels}
        setShowNewModelDialog={setShowNewModelDialog}
      />
      
      <div className="flex-1 flex flex-col">
        <ChatInterface 
          selectedModel={selectedModel}
          models={allModelsInfo}
        />
      </div>
      
      <CreateModelDialog
        open={showNewModelDialog}
        onOpenChange={setShowNewModelDialog}
        onCreateModel={handleCreateModel}
      />
    </div>
  );
};

export default Index;
