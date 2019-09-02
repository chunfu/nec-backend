import React, { useEffect } from 'react';
import Button from '@material-ui/core/Button';
import MaterialTable from 'material-table';

import useFetch from '../../utils/useFetch';
import useStyles from '../../utils/useStyles';

/**
 * TODO:
 * 1. read movetime.xlsx from server
 * 2. render as table in frontend
 * 3. UI to add new address (customer & office)
 * 4. send new addresses to server
 * 5. update movetime.xlsx
 * 6. request movetime.xlsx in frontend to get the latest
 */
const DrivingTimeStep = props => {
  const classes = useStyles()();

  const [data, loadData] = useFetch('/api/pos/movetime', {});
  const { columns, rows } = data;
  return (
    <>
      <Button
        className={classes.button}
        variant="contained"
        onClick={() => loadData()}
      >
        載入車行時間表
      </Button>
      <div className={classes.table}>
        {columns && (
          <MaterialTable title="車行時間" columns={columns} data={rows} />
        )}
      </div>
    </>
  );
};

export default DrivingTimeStep;
