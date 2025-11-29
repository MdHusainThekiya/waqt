import { useEffect, useState } from 'react';
import CompassHeading from 'react-native-compass-heading';

export const useCompass = () => {
  const [heading, setHeading] = useState<number>(0);

  useEffect(() => {
    const degree_update_rate = 3; // Update every 3 degrees

    CompassHeading.start(degree_update_rate, ({ heading: compassHeading }: { heading: number }) => {
      setHeading(compassHeading);
    });

    return () => {
      CompassHeading.stop();
    };
  }, []);

  return heading;
};
