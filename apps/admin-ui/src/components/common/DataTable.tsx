import React from "react";

export type TableColumn<T> = {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  width?: string;
};

export type DataTableProps<T> = {
  columns: TableColumn<T>[];
  data: T[];
  /** Optional className for the outer container */
  className?: string;
};

export function DataTable<T extends object>({
  columns,
  data,
  className = "",
}: DataTableProps<T>) {
  return (
    <div className={`overflow-x-auto rounded-lg shadow ${className}`}>
      <table className="min-w-full bg-white dark:bg-gray-800">
        <thead className="bg-gray-100 dark:bg-gray-700">
          <tr>
            {columns.map((col, idx) => (
              <th
                key={idx}
                className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200"
                style={{ width: col.width }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              className={rowIdx % 2 === 0 ? "bg-gray-50 dark:bg-gray-900" : "bg-white dark:bg-gray-800"}
            >
              {columns.map((col, colIdx) => {
                const value =
                  typeof col.accessor === "function"
                    ? col.accessor(row as any)
                    : (row as any)[col.accessor];
                return (
                  <td key={colIdx} className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">
                    {value}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
