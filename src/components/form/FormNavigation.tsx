
import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
  const halfLength = Math.ceil(sections.length / 2);
  const firstRow = sections.slice(0, halfLength);
  const secondRow = sections.slice(halfLength);

  return (
    <div className="space-y-2 w-full p-1">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {firstRow.map((section) => (
          <Button
            key={section.title}
            variant="outline"
            size="sm"
            className={cn(
              "w-full whitespace-normal text-xs md:text-sm h-auto py-2",
              currentSection === section.title && "bg-primary text-primary-foreground"
            )}
            onClick={() => onSectionChange(section.title)}
          >
            {section.title}
          </Button>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {secondRow.map((section) => (
          <Button
            key={section.title}
            variant="outline"
            size="sm"
            className={cn(
              "w-full whitespace-normal text-xs md:text-sm h-auto py-2",
              currentSection === section.title && "bg-primary text-primary-foreground"
            )}
            onClick={() => onSectionChange(section.title)}
          >
            {section.title}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default FormNavigation;
