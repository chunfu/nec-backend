import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import useStyles from '../utils/useStyles';

const StepsComp = props => {
  const { steps } = props;
  const classes = useStyles()();

  const [activeStep, setActiveStep] = useState(0);
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

export default StepsComp;