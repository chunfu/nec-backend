import React, { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import SimpleTable from '../../widget/SimpleTable';
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
    marginTop: theme.spacing(1),
  },
}));

const InfoStep = props => {
  const classes = useStyles();
  // show fake data for now
  const [data, loadData] = useFetch('/api/carModule', {});
  useEffect(() => {
    async function fetchData() {
      await loadData();
    }
    fetchData();
  }, []);

  return (
    <React.Fragment>
      <div className={classes.table}>
        {data.columns && (
          <SimpleTable columns={data.columns} rows={data.rows} />
        )}
      </div>
    </React.Fragment>
  );
};

export default InfoStep;
