import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';

import DrivingTimeStep from './DrivingTimeStep';
import ParamterStep from './ParameterStep';
import FileStep from './FileStep';
import SLAStep from './SLAStep';
import ResultStep from './ResultStep';

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
  fixBottom: {
    position: 'absolute',
    width: '100%',
    bottom: 0,
  }
}));

const steps = [
  { label: '車行時間', comp: DrivingTimeStep },
  { label: '參數設定', comp: ParamterStep },
  { label: '讀取資料', comp: FileStep },
  { label: '調整SLA無法滿足之客戶', comp: SLAStep },
  { label: '輸出結果', comp: ResultStep },
];

const Pos = props => {
  const classes = useStyles();

  const [activeStep, setActiveStep] = React.useState(0);
  function handleNext() {
    setActiveStep(prevActiveStep => prevActiveStep + 1);
  }
  function handleBack() {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
  }
  const ActiveComp = steps[activeStep].comp || (() => <h1>No Comp</h1>);

  return (
    <React.Fragment>
      <ActiveComp />
      <div className={classes.fixBottom}>
        <Stepper activeStep={activeStep}>
          {steps.map(({ label }) => {
            const stepProps = {};
            const labelProps = {};
            return (
              <Step key={label} {...stepProps}>
                <StepLabel {...labelProps}>{label}</StepLabel>
              </Step>
            );
          })}
        </Stepper>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          className={classes.button}
        >
          Back
        </Button>
        {activeStep < steps.length - 1 && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleNext}
            className={classes.button}
          >
            Next
          </Button>
        )}
      </div>
    </React.Fragment>
  );
};

export default Pos;
