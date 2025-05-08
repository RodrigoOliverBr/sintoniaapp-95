
import React from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Section } from "@/types/form";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Save } from "lucide-react";

interface FormNavigationProps {
  sections: Section[];
  currentSectionIndex: number;
  onNavigate: (index: number) => void;
  onSave: () => void;
  isSaving?: boolean;
  isComplete?: boolean;
}

const FormNavigation: React.FC<FormNavigationProps> = ({
  sections,
  currentSectionIndex,
  onNavigate,
  onSave,
  isSaving = false,
  isComplete = false
}) => {
  const handlePrevious = () => {
    if (currentSectionIndex > 0) {
      onNavigate(currentSectionIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentSectionIndex < sections.length - 1) {
      onNavigate(currentSectionIndex + 1);
    }
  };

  const isLastSection = currentSectionIndex === sections.length - 1;

  return (
    <Card className="p-4 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
      <div className="md:w-1/4">
        <Button 
          variant="outline" 
          onClick={handlePrevious}
          disabled={currentSectionIndex === 0 || isSaving}
          className="flex items-center"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Anterior
        </Button>
      </div>
      
      <div className="flex-1 overflow-x-auto">
        <Tabs 
          value={currentSectionIndex.toString()}
          onValueChange={(value) => onNavigate(parseInt(value))}
          className="w-full justify-center"
        >
          <TabsList className="w-full justify-start md:justify-center overflow-x-auto">
            {sections.map((section, index) => (
              <TabsTrigger 
                key={section.id} 
                value={index.toString()}
                disabled={isSaving}
                className="whitespace-nowrap"
              >
                {section.ordem}. {section.titulo}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      
      <div className="md:w-1/4 flex justify-end gap-2">
        {!isLastSection ? (
          <Button 
            onClick={handleNext}
            disabled={isSaving} 
            className="flex items-center"
          >
            Próximo
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        ) : (
          <Button 
            onClick={onSave}
            disabled={isSaving}
            variant={isComplete ? "outline" : "default"}
            className="flex items-center"
          >
            <Save className="mr-1 h-4 w-4" />
            {isSaving ? "Salvando..." : isComplete ? "Atualizar" : "Concluir"}
          </Button>
        )}
      </div>
    </Card>
  );
};

export default FormNavigation;
