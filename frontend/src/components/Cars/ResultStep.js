import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import MaterialTable from 'material-table';
import useFetch from '../../utils/useFetch';

const useStyles = makeStyles(theme => ({
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 250,
  },
  input: {
    display: 'none',
  },
  button: {
    margin: theme.spacing(1),
  },
  table: {
    marginTop: theme.spacing(2),
  },
}));

const ResultStep = props => {
  const classes = useStyles();
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

