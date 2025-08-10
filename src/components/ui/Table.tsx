import React, { useState } from "react";

interface SimpleTableProps {
  headers: string[];
  rows: (string | number)[][];
  className?: string;
}

const SimpleTable: React.FC<SimpleTableProps> = ({
  headers,
  rows,
  className = "",
}) => {
  const [sortColumn, setSortColumn] = useState<number | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (colIndex: number) => {
    if (sortColumn === colIndex) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(colIndex);
      setSortDirection("asc");
    }
  };

  const getSortedRows = () => {
    if (sortColumn === null) return rows;

    return [...rows].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }

      return sortDirection === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  };

  const getSortIcon = (colIndex: number) => {
    if (colIndex !== sortColumn) return "↕";
    return sortDirection === "asc" ? "⬆️" : "⬇️";
  };

  const sortedRows = getSortedRows();

  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      <div className="flex border-b  border-gray-300">
        {headers.map((header, idx) => (
          <div
            key={idx}
            className={`w-full max-w-[calc(100%/${
              headers.length
            })] py-2 text-sm text-gray-800 
                ${
                  idx === 0
                    ? "text-left"
                    : idx === headers.length - 1
                    ? "text-right"
                    : "text-center"
                }`}
            onClick={() => handleSort(idx)}
          >
            <div className="inline-flex bg-red-400  items-center gap-[2px] w-full ">
              <span>{header}</span>
              <span className="text-xs">{getSortIcon(idx)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Rows */}
      {sortedRows.map((row, rowIdx) => (
        <div key={rowIdx} className="flex border-b border-gray-200">
          {row.map((cell, colIdx) => (
            <div
              key={colIdx}
              className={`w-full max-w-[calc(100%/${
                headers.length
              })] py-2 text-sm text-gray-800 
                ${
                  colIdx === 0
                    ? "text-left"
                    : colIdx === headers.length - 1
                    ? "text-right"
                    : "text-center"
                }`}
            >
              {cell}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default SimpleTable;
