import React, { useState } from 'react';

import StepsComp from '../../widget/StepsComp';
import DrivingTimeStep from './DrivingTimeStep';
import ParamterStep from './ParameterStep';
import FileStep from './FileStep';
import SLAStep from './SLAStep';
import ResultStep from './ResultStep';

export const PosContext = React.createContext({
  parameter: {},
  file: {},
});

const steps = [
  { label: '參數設定', comp: ParamterStep },
  { label: '讀取資料', comp: FileStep },
  { label: '車行時間', comp: DrivingTimeStep },
  { label: '調整SLA無法滿足之客戶', comp: SLAStep },
  { label: '輸出結果', comp: ResultStep },
];

const Pos = props => {
  const [values, setValues] = useState({
    fuelCost: '',
    serviceQuality: '',
    locations: [],
    checkOther: false,
    otherLocation: '',
  });

  const [files, setFiles] = useState({});

  return (
    <PosContext.Provider
      value={{
        parameter: { values, setValues },
        file: { files, setFiles },
      }}
    >
      <StepsComp steps={steps} />
    </PosContext.Provider>
  );
};

export default Pos;
