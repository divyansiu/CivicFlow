import React from 'react';

export const DataTable = ({
  columns,
  data,
  onRowClick,
  selectedId,
  highlightRowId,
  idKey = 'asset_id',
  emptyMessage = 'No records available.',
  className = ''
}) => {
  const activeSelectedId = selectedId || highlightRowId;
  return (
    <div className={`overflow-x-auto border border-[#DDE1E5] rounded bg-white ${className}`}>
      <table className="gov-table text-left border-collapse w-full">
        <thead>
          <tr className="bg-[#F7F8FA] border-b border-[#DDE1E5] text-[#5F6368]">
            {columns.map((col, idx) => (
              <th
                key={idx}
                className={`px-3.5 py-2.5 text-xs font-semibold uppercase tracking-wider ${col.headerClassName || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#EDEFF2]">
          {data && data.length > 0 ? (
            data.map((row, rowIdx) => {
              const isSelected = activeSelectedId && row[idKey] === activeSelectedId;
              return (
                <tr
                  key={row[idKey] || rowIdx}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`transition-colors ${
                    onRowClick ? 'cursor-pointer' : ''
                  } ${
                    isSelected
                      ? 'bg-[#DCFCE7]/40 font-medium border-l-4 border-l-[#168A44]'
                      : 'hover:bg-[#F9FAFB]'
                  }`}
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={colIdx}
                      className={`px-3.5 py-3 text-xs text-[#1A1A1A] ${col.cellClassName || ''}`}
                    >
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              );
            })
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-[#5F6368]"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
