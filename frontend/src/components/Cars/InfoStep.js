import React, { useState, useEffect } from 'react';
import MaterialTable from 'material-table';
import useFetch from '../../utils/useFetch';
import useStyles from '../../utils/useStyles';
import tableConfig from '../../const/tableConfig';

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
          <MaterialTable
            title="還原工作服務路徑"
            columns={data.columns}
            data={data.rows}
            {...tableConfig}
          />
        )}
      </div>
    </React.Fragment>
  );
};

export default InfoStep;
