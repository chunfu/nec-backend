import { useState } from 'react';

const useFetch = (url, defaultData, defaultOptions = {}) => {
  const [data, updateData] = useState(defaultData);

  const loadData = async (options = {}) => {
    const resp = await fetch(url, {
      headers: {
        'content-type': 'application/json'
      },
      ...defaultOptions,
      ...options,
    });
    const json = await resp.json();
    updateData(json);
  };

  return [data, loadData];
};

export default useFetch;