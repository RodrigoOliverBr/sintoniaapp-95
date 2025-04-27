
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface FormNavigationProps {
  sections: { title: string }[];
  currentSection: string;
  onSectionChange: (value: string) => void;
}

const FormNavigation: React.FC<FormNavigationProps> = ({
  sections,
  currentSection,
  onSectionChange,
}) => {
  return (
    <ScrollArea className="w-full">
      <div className="flex justify-start overflow-x-auto p-1">
        <ToggleGroup
          type="single"
          value={currentSection}
          onValueChange={(value) => value && onSectionChange(value)}
          className="inline-flex space-x-1 p-1 bg-muted/40 rounded-lg"
        >
          {sections.map((section) => (
            <ToggleGroupItem
              key={section.title}
              value={section.title}
              aria-label={section.title}
              className="px-4 py-2 whitespace-nowrap text-sm"
            >
              {section.title}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </ScrollArea>
  );
};

export default FormNavigation;
