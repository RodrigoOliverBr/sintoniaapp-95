
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ open, onOpenChange, children }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
    </Dialog>
  );
};

export const ModalContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <DialogContent>{children}</DialogContent>;
};

export const ModalHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <DialogHeader>
      <DialogTitle>{children}</DialogTitle>
    </DialogHeader>
  );
};

export const ModalDescription: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <DialogDescription>{children}</DialogDescription>;
};

export const ModalBody: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="py-4">{children}</div>;
};

export const ModalFooter: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <DialogFooter>{children}</DialogFooter>;
};

export const ModalCloseButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return <button onClick={onClick} className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100">×</button>;
};
