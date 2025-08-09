import * as React from "react";

export const Table: React.FC<React.HTMLAttributes<HTMLTableElement>> = ({ className, ...props }) => (
  <table className={"w-full text-sm " + (className ?? "")} {...props} />
);
export const Thead: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className, ...props }) => (
  <thead className={className} {...props} />
);
export const Tbody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className, ...props }) => (
  <tbody className={className} {...props} />
);
export const Tr: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({ className, ...props }) => (
  <tr className={className} {...props} />
);
export const Th: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({ className, ...props }) => (
  <th className={"text-left p-2 font-medium " + (className ?? "")} {...props} />
);
export const Td: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ className, ...props }) => (
  <td className={"p-2 " + (className ?? "")} {...props} />
);
