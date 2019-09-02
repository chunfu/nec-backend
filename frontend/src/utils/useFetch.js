import { useState } from 'react';

const useFetch = (url, defaultData, options = {}) => {
  const [data, updateData] = useState(defaultData);

  const loadData = async () => {
    const resp = await fetch(url, options);
    const json = await resp.json();
    updateData(json);
  };

  return [data, loadData];
};

export default useFetch;