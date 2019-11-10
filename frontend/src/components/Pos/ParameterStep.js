import React, { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

import { PosContext } from '.';
import useFetch from '../../utils/useFetch';
import useStyles from '../../utils/useStyles';

const ParameterStep = props => {
  const classes = useStyles()();
  const { parameter: { values, setValues }} = props;

  const [locations, loadLocations] = useFetch('/api/pos/locations', []);

  const handleChange = name => event => {
    setValues({ ...values, [name]: event.target.value });
  };

  const handleLocationChange = id => e => {
    const checked = e.target.checked;
    let newLocations = values.reservationSite.slice();
    if (checked) {
      // add to new locations
      newLocations.push(id);
    } else {
      // remove from new locations
      const idIdx = newLocations.findIndex(l => l === id);
      newLocations.splice(idIdx, 1);
    }

    setValues({ ...values, reservationSite: newLocations });
  };

  const handleCheckOther = e => {
    const checked = e.target.checked;
    let otherLocation = values.otherLocation;
    if (!checked) {
      // clear otherLocation
      otherLocation = '';
    }
    setValues({ ...values, checkOther: checked, otherLocation });
  };

  const [paramsModalOpen, setParamsModalOpen] = useState(false);
  const handleOpenParamsModal = () => setParamsModalOpen(true);
  const handleCloseParamsModal = () => setParamsModalOpen(false);

  useEffect(() => {
    async function fetchData() {
      await loadLocations();
    }
    fetchData();
  }, []);
  return (
    <React.Fragment>
      <Button
        className={classes.button}
        variant="contained"
        onClick={handleOpenParamsModal}
      >
        讀取模型參數
      </Button>
      <Dialog
        aria-labelledby="parameter-modal-title"
        aria-describedby="parameter-modal-description"
        open={paramsModalOpen}
        onClose={handleCloseParamsModal}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>模型參數設定</DialogTitle>
        <DialogContent>
          <form noValidate autoComplete="off">
            <TextField
              label="油錢(X 元/公里)"
              placeholder="X 元/公里"
              value={values.oilprice}
              onChange={handleChange('oilprice')}
              type="number"
              className={classes.textField}
              margin="normal"
              variant="outlined"
            />
            <TextField
              label="服務水準(X 分鐘)"
              placeholder="X 分鐘內抵達"
              value={values.serviceQuality}
              onChange={handleChange('serviceQuality')}
              type="number"
              className={classes.textField}
              margin="normal"
              variant="outlined"
            />
            <FormControl component="fieldset" className={classes.formControl}>
              <FormLabel>必須保留的據點</FormLabel>
              <FormGroup className={classes.horizontalFormGroup}>
                {locations.map(({ name }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={!!values.reservationSite.find(l => l === name)}
                        onChange={handleLocationChange(name)}
                        value={name}
                        color="primary"
                      />
                    }
                    label={name}
                  />
                ))}
              </FormGroup>
            </FormControl>
          </form>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseParamsModal}
            color="primary"
            variant="contained"
          >
            確認
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};

const withContext = () => (
  <PosContext.Consumer>
    {props => <ParameterStep {...props} />}
  </PosContext.Consumer>
);

export default withContext;
