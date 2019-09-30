import React, { useState } from 'react';
import useStyles from '../utils/useStyles';
import CircularProgress from '@material-ui/core/CircularProgress';

const LoadingMask = ({ show }) => {
  const classes = useStyles()();
  const containerClass = show ? classes.loadingMaskContainer : classes.hide;
  return (
    <div className={containerClass}>
      <CircularProgress disableShrink className={classes.loadingInCenter} />
    </div>
  );
};

export default LoadingMask;
