
let timer: number | null = null;
let timeLeft = 0;

self.onmessage = (e: MessageEvent) => {
  const { command, value } = e.data;

  switch (command) {
    case 'start':
      if (timer) clearInterval(timer);
      timeLeft = value;
      timer = self.setInterval(() => {
        timeLeft--;
        self.postMessage({ type: 'tick', timeLeft });
        if (timeLeft === 0 && timer) {
          clearInterval(timer);
          timer = null;
          self.postMessage({ type: 'done' });
        }
      }, 1000);
      break;
    case 'pause':
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
      break;
    case 'reset':
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
      timeLeft = value;
      self.postMessage({ type: 'tick', timeLeft });
      break;
  }
};
