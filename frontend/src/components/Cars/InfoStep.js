import React, { useState, useEffect } from 'react';
import MaterialTable from 'material-table';

import { CarContext } from '.';
import useFetch from '../../utils/useFetch';
import useStyles from '../../utils/useStyles';
import tableConfig from '../../const/tableConfig';

const InfoStep = props => {
  const classes = useStyles()();
  const {
    parameter: { values },
    file: { files },
    showErrDialog,
    showLoading,
  } = props;
  // show fake data for now
  const [data, loadData] = useFetch('/api/car/path', {}, { method: 'POST' });
  useEffect(() => {
    async function fetchData() {
      // request pathDist
      let formData = new FormData();
      Object.keys(values).forEach(valueName => {
        formData.append(valueName, values[valueName]);
      });
      Object.keys(files).forEach(fileName => {
        formData.append(fileName, files[fileName], `${fileName}.xlsx`);
      });
      try {
        showLoading(true);
        await loadData({ headers: {}, body: formData });
      } catch (e) {
        showErrDialog(e.message);
      }
      showLoading(false);
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

const withContext = () => (
  <CarContext.Consumer>{props => <InfoStep {...props} />}</CarContext.Consumer>
);

export default withContext;
