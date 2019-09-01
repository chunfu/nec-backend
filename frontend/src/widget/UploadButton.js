import React from 'react';
import Button from '@material-ui/core/Button';

const UploadButton = ({ id, label, inputClass, buttonClass, onChange }) => (
  <React.Fragment>
    <input
      accept=".csv"
      className={inputClass}
      id={id}
      type="file"
      onChange={onChange}
    />
    <label htmlFor={id}>
      <Button className={buttonClass} variant="contained" component="span">
        {label}
      </Button>
    </label>
  </React.Fragment>
);

export default UploadButton;
