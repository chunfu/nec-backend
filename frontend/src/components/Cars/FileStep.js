import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';

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
    marginTop: theme.spacing(5),
  },
}));

const FileStep = props => {
  const classes = useStyles();
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
          讀取歷史工作
        </Button>
      </label>
    </React.Fragment>
  );
};

export default FileStep;
