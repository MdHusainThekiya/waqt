import { useEffect, useState } from 'react';
import type { Dayjs } from 'dayjs';

import { formatCountdown } from '@/utils/time';

export const useCountdown = (target: Dayjs | null) => {
  const [value, setValue] = useState(formatCountdown(target ?? null));
  const memoKey = target?.valueOf();

  useEffect(() => {
    setValue(formatCountdown(target ?? null));

    if (!target) {
      return;
    }

    const timer = setInterval(() => {
      setValue(formatCountdown(target));
    }, 1000);

    return () => clearInterval(timer);
  }, [memoKey, target]);

  return value;
};

