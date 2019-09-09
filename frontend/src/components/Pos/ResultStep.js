import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';
import Dialog from '@material-ui/core/Dialog';
import MaterialTable from 'material-table';
import useFetch from '../../utils/useFetch';
import useStyles from '../../utils/useStyles';

const ResultStep = props => {
  const classes = useStyles()();
  const [data, loadData] = useFetch('/api/pos/optimal', {}, { method: 'POST' });

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const handleOpenDetailModal = () => setDetailModalOpen(true);
  const handleCloseDetailModal = () => setDetailModalOpen(false);

  const firstColAsLink = (col, idx) => {
    const { field } = col;
    const render =
      idx === 0 &&
      (rowData => (
        <Link onClick={handleOpenDetailModal} className={classes.link}>
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
    columns = data.columns.map(firstColAsLink);
  }

  return (
    <React.Fragment>
      <Button
        className={classes.button}
        variant="contained"
        color="primary"
        onClick={() => loadData()}
      >
        最佳化資源配置
      </Button>
      {data.columns && (
        <div className={classes.table}>
          <MaterialTable
            title="最佳化結果"
            columns={columns}
            data={data.rows}
          />
          <Dialog
            aria-labelledby="detail-modal-title"
            aria-describedby="detail-modal-description"
            open={detailModalOpen}
            onClose={handleCloseDetailModal}
            fullWidth
            maxWidth="lg"
          >
            <MaterialTable
              title="該據點客戶分配"
              columns={data.columns}
              data={data.rows}
              options={{ exportButton: true }}
            />
          </Dialog>
        </div>
      )}
    </React.Fragment>
  );
};

export default ResultStep;
