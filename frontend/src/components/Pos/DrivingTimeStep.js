import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import UploadButton from '../../widget/UploadButton';

const useStyles = makeStyles(theme => ({
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
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
const DrivingTimeStep = props => {
  const classes = useStyles();
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
