export const wait = (n: number) => new Promise((r) => setTimeout(r, n));

export const waitUntil = (fn: () => Promise<any>, opts: { interval?: number; waitTotal?: number } = {}) => {
  const { interval, waitTotal } = { interval: 200, waitTotal: 10000, ...opts };

  return new Promise((resolve, reject) => {
    let waited = 0;
    const fnWrapped = () =>
      fn()
        .then(resolve)
        .catch((e) => {
          if (waited > waitTotal) {
            reject('waitUntil:: failed waiting with error' + e);
          } else {
            waited += interval;
            setTimeout(fnWrapped, interval);
          }
        });
    fnWrapped();
  });
};
