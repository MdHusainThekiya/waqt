import {
  CalculationMethod,
  type CalculationParameters,
} from 'adhan';

import type { CalculationMethodId } from '@/types/prayer';

type MethodConfig = {
  id: CalculationMethodId;
  label: string;
  description: string;
  build: () => CalculationParameters;
};

export const CALCULATION_METHODS: Record<CalculationMethodId, MethodConfig> = {
  KARACHI: {
    id: 'KARACHI',
    label: 'Karachi (South Asia)',
    description: 'University of Islamic Sciences, ideal for India & Pakistan',
    build: CalculationMethod.Karachi,
  },
  MUSLIM_WORLD_LEAGUE: {
    id: 'MUSLIM_WORLD_LEAGUE',
    label: 'Muslim World League',
    description: 'Global default with 18°/17° angles',
    build: CalculationMethod.MuslimWorldLeague,
  },
  EGYPTIAN: {
    id: 'EGYPTIAN',
    label: 'Egyptian',
    description: 'Egyptian General Authority',
    build: CalculationMethod.Egyptian,
  },
  UMM_AL_QURA: {
    id: 'UMM_AL_QURA',
    label: 'Umm al-Qura',
    description: 'Makkah-centric timetable',
    build: CalculationMethod.UmmAlQura,
  },
  DUBAI: {
    id: 'DUBAI',
    label: 'Dubai',
    description: 'Official UAE standard',
    build: CalculationMethod.Dubai,
  },
};

export const DEFAULT_CALCULATION_METHOD: CalculationMethodId = 'KARACHI';

export const calculationMethodList = Object.values(CALCULATION_METHODS);

