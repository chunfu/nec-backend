import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

import { PosContext } from '.';
import UploadButton from '../../widget/UploadButton';
import useStyles from '../../utils/useStyles';

const FileStep = props => {
  const classes = useStyles()();
  const [fileModalOpen, setFileModalOpen] = useState(false);
  const handleOpenFileModal = () => setFileModalOpen(true);
  const handleCloseFileModal = () => setFileModalOpen(false);

  const {
    file: { files, setFiles },
  } = props;
  const onFileChange = name => e => {
    setFiles({
      ...files,
      [name]: e.target.files[0],
    });
  };

  return (
    <React.Fragment>
      <Button
        className={classes.button}
        variant="contained"
        onClick={handleOpenFileModal}
      >
        讀取資料
      </Button>
      <Dialog
        aria-labelledby="file-modal-title"
        aria-describedby="file-modal-description"
        open={fileModalOpen}
        onClose={handleCloseFileModal}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>讀取資料</DialogTitle>
        <DialogContent>
          <form noValidate autoComplete="off">
            <UploadButton
              id="siteInfo"
              label="各據點成本限制"
              inputClass={classes.input}
              buttonClass={classes.button}
              onChange={onFileChange('siteInfo')}
              selectedFile={files['siteInfo']}
            />
            <UploadButton
              id="historyCalls"
              label="各據點歷年員工數與服務次數"
              inputClass={classes.input}
              buttonClass={classes.button}
              onChange={onFileChange('historyCalls')}
              selectedFile={files['historyCalls']}
            />
            <UploadButton
              id="expectedCalls"
              label="各客戶預期未來年服務次數"
              inputClass={classes.input}
              buttonClass={classes.button}
              onChange={onFileChange('expectedCalls')}
              selectedFile={files['expectedCalls']}
            />
          </form>
          <p>
            1. 各據點成本資訊：包含據點名稱、前進據點成本、固定據點成本、每人年成本、最大容納人數四個欄位，檔名為siteInfo.xlsx。據點名稱排序要跟車行時間表的排序相同。
          </p>
          <p>
            2. 各據點歷年員工數與服務次數：包含年份、據點名稱、員工數、服務次數三個欄位，不同年份直接往下填加即可，檔名為historyCalls.xlsx。
          </p>
          <p>
            3. 各客戶預期未來年服務次數：包含客戶ID及客戶預期服務次數兩個欄位，檔名為expectedCalls.xlsx。客戶ID排序要跟車行時間表的排序相同。
          </p>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseFileModal}
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
  <PosContext.Consumer>{props => <FileStep {...props} />}</PosContext.Consumer>
);

export default withContext;
