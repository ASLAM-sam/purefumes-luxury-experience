import { type ReactNode } from "react";

type ContainerProps = {
  children: ReactNode;
  className?: string;
};

export function Container({ children, className = "" }: ContainerProps) {
  return (
    <div
      className={`mx-auto w-full min-w-0 max-w-[var(--container-max)] px-[var(--page-gutter)] ${className}`}
    >
      {children}
    </div>
  );
}
