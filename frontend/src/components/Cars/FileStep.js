import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import useStyles from '../../utils/useStyles';

const FileStep = props => {
  const classes = useStyles()();
  return (
    <React.Fragment>
      <input
        accept=".csv,.xls,.xlsx"
        className={classes.input}
        id="upload-history"
        multiple
        type="file"
      />
      <label htmlFor="upload-history">
        <Button className={classes.button} variant="contained" component="span">
          年度歷史工作紀錄
        </Button>
      </label>
      <input
        accept=".csv,.xls,.xlsx"
        className={classes.input}
        id="upload-taxi"
        multiple
        type="file"
      />
      <label htmlFor="upload-history">
        <Button className={classes.button} variant="contained" component="span">
          各地區計程車費率
        </Button>
      </label>
    </React.Fragment>
  );
};

export default FileStep;
