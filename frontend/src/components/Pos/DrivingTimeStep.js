import React from 'react';
import UploadButton from '../../widget/UploadButton';
import useStyles from '../../utils/useStyles';

const DrivingTimeStep = props => {
  const classes = useStyles()();
  return (
    <UploadButton
      id="office2customerTime"
      label="服務據點到客戶門市車行時間"
      inputClass={classes.input}
      buttonClass={classes.button}
    />
  );
};

export default DrivingTimeStep;
