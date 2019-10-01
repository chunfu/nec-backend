import React, { useState, useEffect } from 'react';
import MaterialTable from 'material-table';
import Link from '@material-ui/core/Link';
import Dialog from '@material-ui/core/Dialog';

import { CarContext } from '.';
import useFetch from '../../utils/useFetch';
import useStyles from '../../utils/useStyles';
import tableConfig from '../../const/tableConfig';

const InfoStep = props => {
  const classes = useStyles()();
  const {
    parameter: { values },
    file: { files },
    showErrDialog,
    showLoading,
  } = props;
  // show fake data for now
  const [data, loadData] = useFetch('/api/car/path', {}, { method: 'POST' });
  useEffect(() => {
    async function fetchData() {
      try {
        // request pathDist
        let formData = new FormData();
        Object.keys(values).forEach(valueName => {
          formData.append(valueName, values[valueName]);
        });
        ['mrData', 'workerData', 'officeAddress'].forEach(fileName => {
          formData.append(fileName, files[fileName], `${fileName}.xlsx`);
        });
        showLoading(true);
        await loadData({ headers: {}, body: formData });
      } catch (e) {
        showErrDialog(e.message);
      }
      showLoading(false);
    }
    fetchData();
  }, []);

  const [detail, loadDetail] = useFetch('/api/car/path', {});
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const handleOpenDetailModal = async pathId => {
    try {
      showLoading(true);
      setDetailModalOpen(true);
      await loadDetail({ params: pathId });
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

  let columns = [];
  if (data.columns) {
    columns = data.columns.map(thirdColAsLink);
  }

  return (
    <React.Fragment>
      <div className={classes.table}>
        {data.columns && (
          <MaterialTable
            title="還原工作服務路徑"
            columns={columns}
            data={data.rows}
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
