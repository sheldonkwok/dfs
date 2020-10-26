import React from "react";
import { useTable, useSortBy } from "react-table";

import { RankingPlayer } from './processor';

export interface TableParams {
  data: RankingPlayer[];
}

export const COLUMNS = {
  Header: "Ranks",
  columns: [
    { Header: "Position", accessor: "position" },
    { Header: "Name", accessor: "name" },
    { Header: "Cost", accessor: "cost", sortDescFirst: true },
    { Header: "Matchup Rating", accessor: "matchupRating", sortDescFirst: true },
    { Header: "Projected Points", accessor: "projectedPoints", sortDescFirst: true },
    { Header: "Points per Dollar", accessor: "pointsPerDollar", sortDescFirst: true },
  ],
};

export default function Table({ data }: TableParams) {
  const columns = React.useMemo(() => [COLUMNS], []);

  // Use the state and functions returned from useTable to build your UI
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
    { columns, data },
    useSortBy
  );

  // Render the UI for your table
  return (
    <table {...getTableProps()}>
      <thead>
        {headerGroups.map((headerGroup) => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => (
              <th {...column.getHeaderProps(column.getSortByToggleProps())} style={{ padding: "5px 10px" }}>
                {column.render("Header")}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row, i) => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()} style={{ textAlign: "center" }}>
              {row.cells.map((cell) => {
                return <td {...cell.getCellProps()}>{cell.render("Cell")}</td>;
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
