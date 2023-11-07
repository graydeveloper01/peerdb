'use client';

import SearchBar from '@/components/Search';
import TimeLabel from '@/components/TimeComponent';
import { Button } from '@/lib/Button';
import { Icon } from '@/lib/Icon';
import { Label } from '@/lib/Label';
import { ProgressCircle } from '@/lib/ProgressCircle';
import { Table, TableCell, TableRow } from '@/lib/Table';
import moment from 'moment';
import { useState } from 'react';

type SyncStatusRow = {
  batchId: number;
  startTime: Date;
  endTime: Date | null;
  numRows: number;
};

type SyncStatusTableProps = {
  rows: SyncStatusRow[];
};

function TimeWithDurationOrRunning({
  startTime,
  endTime,
}: {
  startTime: Date;
  endTime: Date | null;
}) {
  if (endTime) {
    return (
      <>
        <TimeLabel timeVal={moment(endTime).format('YYYY-MM-DD HH:mm:ss')} />
        <Label>
          (
          {moment.duration(moment(endTime).diff(startTime)).humanize({ ss: 1 })}
          )
        </Label>
      </>
    );
  } else {
    return (
      <Label>
        <ProgressCircle variant='determinate_progress_circle' />
      </Label>
    );
  }
}

const ROWS_PER_PAGE = 10;

export const SyncStatusTable = ({ rows }: SyncStatusTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(rows.length / ROWS_PER_PAGE);

  const startRow = (currentPage - 1) * ROWS_PER_PAGE;
  const endRow = startRow + ROWS_PER_PAGE;
  const allRows = rows.slice(startRow, endRow);
  const [displayedRows, setDisplayedRows] = useState(
    rows.slice(startRow, endRow)
  );
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <Table
      title={<Label variant='headline'>CDC Syncs</Label>}
      toolbar={{
        left: (
          <>
            <Button variant='normalBorderless' onClick={handlePrevPage}>
              <Icon name='chevron_left' />
            </Button>
            <Button variant='normalBorderless' onClick={handleNextPage}>
              <Icon name='chevron_right' />
            </Button>
            <Label>{`${currentPage} of ${totalPages}`}</Label>
            <Button
              variant='normalBorderless'
              onClick={() => window.location.reload()}
            >
              <Icon name='refresh' />
            </Button>
          </>
        ),
        right: (
          <SearchBar
            allItems={allRows}
            setItems={setDisplayedRows}
            filterFunction={(query: string) =>
              allRows.filter((row: any) => {
                return row.batchId == parseInt(query, 10);
              })
            }
          />
        ),
      }}
      header={
        <TableRow>
          {['Batch ID', 'Start Time', 'End Time (Duration)', 'Rows Synced'].map(
            (heading, index) => (
              <TableCell as='th' key={index}>
                <Label as='label' style={{ fontWeight: 'bold' }}>
                  {heading}
                </Label>
              </TableCell>
            )
          )}
        </TableRow>
      }
    >
      {displayedRows.map((row, index) => (
        <TableRow key={index}>
          <TableCell>
            <Label>{row.batchId}</Label>
          </TableCell>
          <TableCell>
            <Label>
              {
                <TimeLabel
                  timeVal={moment(row.startTime).format('YYYY-MM-DD HH:mm:ss')}
                />
              }
            </Label>
          </TableCell>
          <TableCell>
            <TimeWithDurationOrRunning
              startTime={row.startTime}
              endTime={row.endTime}
            />
          </TableCell>
          <TableCell>{row.numRows}</TableCell>
        </TableRow>
      ))}
    </Table>
  );
};