import React, { useState, useEffect } from 'react';
import MaterialTable from 'material-table';
import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';
import Dialog from '@material-ui/core/Dialog';
import * as _ from 'lodash';

import { CarContext } from '.';
import useFetch from '../../utils/useFetch';
import useStyles from '../../utils/useStyles';
import tableConfig from '../../const/tableConfig';

const InfoStep = props => {
  const classes = useStyles()();
  const {
    parameter: { values },
    file: { files },
    prevData,
    setPrevData,
    showErrDialog,
    showLoading,
  } = props;
  const infoPrevData = prevData.infoStep || {};

  // show fake data for now
  const [data, loadData] = useFetch('/api/car/path', {}, { method: 'POST' });

  const onClickPathBtn = async () => {
    try {
      // request pathDist
      let formData = new FormData();
      Object.keys(values).forEach(valueName => {
        formData.append(valueName, values[valueName]);
      });
      ['mrData', 'workerData', 'officeAddress'].forEach(fileName => {
        if (files[fileName])
          formData.append(fileName, files[fileName], `${fileName}.xlsx`);
      });
      showLoading(true);
      const resp = await loadData({ headers: {}, body: formData });
      setPrevData({ ...prevData, infoStep: resp });
    } catch (e) {
      showErrDialog(e.message);
    }
    showLoading(false);
  };

  const [detail, loadDetail] = useFetch('/api/car/path', {});
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const handleOpenDetailModal = async pathId => {
    try {
      showLoading(true);
      setDetailModalOpen(true);
      await loadDetail({ params: pathId, query: { office: values.office } });
    } catch (e) {
      showErrDialog(e.message);
    }
    showLoading(false);
  };
  const handleCloseDetailModal = () => setDetailModalOpen(false);
  const thirdColAsLink = (col, idx) => {
    const { field } = col;
    const render =
      idx === 2 &&
      (rowData => (
        <Link
          onClick={() => handleOpenDetailModal(rowData[field])}
          className={classes.link}
        >
          {rowData[field]}
        </Link>
      ));
    return {
      ...col,
      ...(render && { render }),
    };
  };

  const renderedData = _.isEmpty(data) ? infoPrevData : data;
  let columns = [];
  if (renderedData.columns) {
    columns = renderedData.columns.map(thirdColAsLink);
  }

  return (
    <React.Fragment>
      <Button
        className={classes.button}
        variant="contained"
        color="primary"
        onClick={onClickPathBtn}
      >
        還原工作服務路徑
      </Button>
      <div className={classes.table}>
        {renderedData.columns && (
          <MaterialTable
            title="還原工作服務路徑"
            columns={columns}
            data={renderedData.rows}
            {...tableConfig}
          />
        )}
      </div>
      <Dialog
        aria-labelledby="detail-modal-title"
        aria-describedby="detail-modal-description"
        open={detailModalOpen}
        onClose={handleCloseDetailModal}
        fullWidth
        maxWidth="lg"
      >
        <MaterialTable
          title=""
          columns={detail.columns}
          data={detail.rows}
          {...tableConfig}
        />
      </Dialog>
    </React.Fragment>
  );
};

const withContext = () => (
  <CarContext.Consumer>{props => <InfoStep {...props} />}</CarContext.Consumer>
);

export default withContext;
