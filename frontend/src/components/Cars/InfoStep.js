import React, { useState, useEffect } from 'react';
import MaterialTable from 'material-table';
import useFetch from '../../utils/useFetch';
import useStyles from '../../utils/useStyles';

const InfoStep = props => {
  const classes = useStyles()();
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
          <MaterialTable columns={data.columns} data={data.rows} />
        )}
      </div>
    </React.Fragment>
  );
};

export default InfoStep;
