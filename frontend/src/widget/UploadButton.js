import React from 'react';
import Button from '@material-ui/core/Button';

const container = {
  display: 'inline-block',
};
const button = {
  display: 'flex',
  flexDirection: 'column',
};

const uploaded = {
  margin: '8px',
};
const warning = {
  color: 'red',
  margin: '8px',
};

const UploadButton = ({
  id,
  label,
  inputClass,
  buttonClass,
  onChange,
  selectedFile,
}) => {
  let message = '';
  let messageStyle = {};
  if (selectedFile) {
    message = selectedFile.name;
    messageStyle = uploaded;
  } else {
    message = '請上傳檔案';
    messageStyle = warning;
  }
  return (
    <div style={container}>
      <div style={button}>
        <input
          accept=".xlsx"
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
        <label style={messageStyle}>{message}</label>
      </div>
    </div>
  );
};

export default UploadButton;
