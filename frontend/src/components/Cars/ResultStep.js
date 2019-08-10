import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';
import Dialog from '@material-ui/core/Dialog';
import MaterialTable from 'material-table';
import useFetch from '../../utils/useFetch';
import useStyles from '../../utils/useStyles';

const ResultStep = props => {
  const classes = useStyles()();
  const [data, loadData] = useFetch('/api/carModule', {});

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const handleOpenDetailModal = () => setDetailModalOpen(true);
  const handleCloseDetailModal = () => setDetailModalOpen(false);

  const [priceSensitiveModalOpen, setPriceSensitiveModalOpen] = useState(false);
  const handleOpenParamsModal = () => setPriceSensitiveModalOpen(true);
  const handleCloseParamsModal = () => setPriceSensitiveModalOpen(false);

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
        <React.Fragment>
          <Button
            className={classes.button}
            variant="contained"
            onClick={handleOpenParamsModal}
          >
            據點私車補貼價格敏感度分析表
          </Button>
          <div className={classes.table}>
            <MaterialTable
              title="年度社車供應成本表"
              columns={columns}
              data={data.rows}
              options={{ exportButton: true }}
            />
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
              title="年度社車供應日常分派結果成本表"
              columns={data.columns}
              data={data.rows}
              options={{ exportButton: true }}
            />
          </Dialog>
          <Dialog
            aria-labelledby="price-modal-title"
            aria-describedby="price-modal-description"
            open={priceSensitiveModalOpen}
            onClose={handleCloseParamsModal}
            fullWidth
            maxWidth="lg"
          >
            <MaterialTable
              title="據點私車補貼價格敏感度分析表"
              columns={data.columns}
              data={data.rows}
              options={{ exportButton: true }}
            />
          </Dialog>
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

export default ResultStep;
