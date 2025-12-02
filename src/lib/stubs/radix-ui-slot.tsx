// Stub implementation for @radix-ui/react-slot
import * as React from "react";

export interface SlotProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
}

export const Slot: React.FC<SlotProps> = ({ children, ...props }) => {
  // If children is a single element, clone it with the props
  if (React.isValidElement(children)) {
    return React.cloneElement(children, props);
  }
  
  // Otherwise, return the children as-is
  return <>{children}</>;
};
