import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Typography from '@material-ui/core/Typography';

import ParameterStep from './ParameterStep';
import FileStep from './FileStep';
import SimpleTable from '../../widget/SimpleTable';
import useFetch from '../../utils/useFetch';

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

const steps = [
  {
    label: 'Select campaign settings',
    comp: FileStep,
  },
  { label: 'Create an ad group', comp: ParameterStep },
  { label: 'Create an ad', comp: null },
];

const Cars = props => {
  const classes = useStyles();

  const [data, loadData] = useFetch('/api/carModule', {});

  const [activeStep, setActiveStep] = React.useState(0);
  function handleNext() {
    setActiveStep(prevActiveStep => prevActiveStep + 1);
  }
  function handleBack() {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
  }
  function handleReset() {
    setActiveStep(0);
  }

  const ActiveComp = steps[activeStep].comp || (() => <h1>No Comp</h1>);
  return (
    <React.Fragment>
      <ActiveComp />
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
      <div>
        {activeStep === steps.length ? (
          <div>
            <Typography>All steps completed - you&apos;re finished</Typography>
            <Button onClick={handleReset} className={classes.button}>
              Reset
            </Button>
          </div>
        ) : (
          <div>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              className={classes.button}
            >
              Back
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              className={classes.button}
            >
              {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
            </Button>
          </div>
        )}
      </div>
      <Button
        className={classes.button}
        variant="contained"
        color="primary"
        onClick={() => loadData()}
      >
        最佳化資源配置
      </Button>
      <div className={classes.table}>
        {data.columns && (
          <SimpleTable columns={data.columns} rows={data.rows} />
        )}
      </div>
    </React.Fragment>
  );
};

export default Cars;
