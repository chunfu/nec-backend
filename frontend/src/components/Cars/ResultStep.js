import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import MaterialTable from 'material-table';
import useFetch from '../../utils/useFetch';
import useStyles from '../../utils/useStyles';

const ResultStep = props => {
  const classes = useStyles()();
  const [data, loadData] = useFetch('/api/carModule', {});

  return (
    <React.Fragment>

      <Button
        className={classes.button}
        variant="contained"
        color="primary"
        onClick={() => loadData()}
      >
        最佳化資源配置
      </Button>
      <div className={classes.table}>
        {data.columns && (
          <MaterialTable columns={data.columns} data={data.rows} />
        )}
      </div>
    </React.Fragment>
  );
};

export default ResultStep;

