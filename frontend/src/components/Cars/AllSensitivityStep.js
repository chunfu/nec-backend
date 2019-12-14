import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';
import Dialog from '@material-ui/core/Dialog';
import MaterialTable from 'material-table';
import * as _ from 'lodash';

import { CarContext } from '.';
import useFetch from '../../utils/useFetch';
import useStyles from '../../utils/useStyles';
import tableConfig from '../../const/tableConfig';

const AllSensitivityStep = props => {
  const classes = useStyles()();
  const {
    parameter: { values },
    file: { files },
    prevData,
    setPrevData,
    showErrDialog,
    showLoading,
  } = props;
  const resultPrevData = prevData.allSensitivityStep || {};

  const [data, loadData] = useFetch('/api/car/sensitivity/all', {}, { method: 'POST' });

  const onClickAllSensitivityBtn = async () => {
    try {
      showLoading(true);
      const resp = await loadData({ body: JSON.stringify(values) });
      setPrevData({ ...prevData, allSensitivityStep: resp });
    } catch (e) {
      showErrDialog(e.message);
    }
    showLoading(false);
  };

  const renderedData = _.isEmpty(data) ? resultPrevData : data;
  return (
    <React.Fragment>
      <Button
        className={classes.button}
        variant="contained"
        color="primary"
        onClick={onClickAllSensitivityBtn}
      >
        所有敏感度分析
      </Button>
      <label>執行時間可達數小時，敬請稍候</label>
      {renderedData.columns && (
        <React.Fragment>
          <div className={classes.table}>
            <MaterialTable
              title="所有敏感度分析"
              columns={renderedData.columns}
              data={renderedData.rows}
            />
          </div>
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

const withContext = () => (
  <CarContext.Consumer>
    {props => <AllSensitivityStep {...props} />}
  </CarContext.Consumer>
);

export default withContext;
