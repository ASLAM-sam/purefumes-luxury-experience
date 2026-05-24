import { memo, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

export type DataTableColumn<T> = {
  id: string;
  label: ReactNode;
  className?: string;
  headerClassName?: string;
  render: (item: T) => ReactNode;
};

type Props<T> = {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (item: T) => string;
  mobileCard?: (item: T) => ReactNode;
  emptyState?: ReactNode;
};

function DataTableComponent<T>({ columns, rows, rowKey, mobileCard, emptyState }: Props<T>) {
  if (!rows.length && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <>
      <div className="admin-table-surface hidden overflow-hidden rounded-[1.75rem] border border-border/70 bg-white/86 shadow-[0_18px_40px_rgba(7,31,63,0.08)] lg:block">
        <div className="max-h-[68vh] overflow-auto">
          <table className="min-w-full border-separate border-spacing-0">
            <thead className="sticky top-0 z-10 bg-[#f6f1e8]/95 backdrop-blur">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.id}
                    className={`px-5 py-4 text-left text-[0.68rem] uppercase tracking-[0.28em] text-navy/68 ${column.headerClassName || ""}`}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {rows.map((row) => (
                  <motion.tr
                    key={rowKey(row)}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="group border-b border-border/60 even:bg-[#fbf8f3]/75 hover:bg-[#f4eadb]"
                  >
                    {columns.map((column) => (
                      <td key={column.id} className={`px-5 py-4 align-top text-sm text-navy ${column.className || ""}`}>
                        {column.render(row)}
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {mobileCard ? (
        <div className="grid gap-4 lg:hidden">
          {rows.map((row) => (
            <motion.div
              key={rowKey(row)}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[1.5rem] border border-border/70 bg-white/86 p-4 shadow-[0_18px_40px_rgba(7,31,63,0.08)]"
            >
              {mobileCard(row)}
            </motion.div>
          ))}
        </div>
      ) : null}
    </>
  );
}

export const DataTable = memo(DataTableComponent) as typeof DataTableComponent;
