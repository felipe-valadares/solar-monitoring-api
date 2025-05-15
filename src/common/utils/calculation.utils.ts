interface TimeseriesValue {
  value: number;
  date: Date;
}

interface EntityWithPower {
  power: TimeseriesValue[];
}

/**
 * Calcula a geração total de energia para entidades com séries temporais de potência
 * @param entitiesWithPower Array de entidades contendo séries temporais de potência
 * @returns Geração total de energia em kWh
 */
export function calcInvertersGeneration(entitiesWithPower: EntityWithPower[]): number {
  if (!entitiesWithPower || entitiesWithPower.length === 0) {
    return 0;
  }

  let totalGeneration = 0;

  for (const entity of entitiesWithPower) {
    if (!entity.power || entity.power.length < 2) {
      continue;
    }

    for (let i = 0; i < entity.power.length - 1; i++) {
      try {
        const currentPower = entity.power[i].value;
        const nextPower = entity.power[i + 1].value;

        if (
          currentPower < 0 ||
          nextPower < 0 ||
          isNaN(currentPower) ||
          isNaN(nextPower)
        ) {
          continue;
        }

        const currentDate = entity.power[i].date;
        const nextDate = entity.power[i + 1].date;

        if (!(currentDate instanceof Date) || !(nextDate instanceof Date)) {
          continue;
        }

        const timeDelta =
          (nextDate.getTime() - currentDate.getTime()) / (1000 * 3600);

        if (timeDelta <= 0 || timeDelta > 24) {
          continue;
        }

        const generation = ((nextPower + currentPower) / 2) * timeDelta;
        totalGeneration += generation;
      } catch (error) {
        continue;
      }
    }
  }

  return parseFloat(totalGeneration.toFixed(6));
}

/**
 * Calcula a potência máxima por dia para uma série temporal de potência
 * @param powerData Array de valores de potência com timestamps
 * @returns Objeto com datas como chaves e potência máxima como valores
 */
export function calculateMaxPowerPerDay(powerData: TimeseriesValue[]): Record<string, number> {
  if (!powerData || powerData.length === 0) {
    return {};
  }

  const maxPowerByDay: Record<string, number> = {};

  for (const data of powerData) {
    if (isNaN(data.value) || data.value < 0 || !(data.date instanceof Date)) {
      continue;
    }

    const dateString = data.date.toISOString().split('T')[0];
    
    if (!(dateString in maxPowerByDay) || data.value > maxPowerByDay[dateString]) {
      maxPowerByDay[dateString] = data.value;
    }
  }

  return maxPowerByDay;
}

/**
 * Calcula a temperatura média por dia para uma série temporal de temperatura
 * @param temperatureData Array de valores de temperatura com timestamps
 * @returns Objeto com datas como chaves e temperatura média como valores
 */
export function calculateAvgTemperaturePerDay(temperatureData: TimeseriesValue[]): Record<string, number> {
  if (!temperatureData || temperatureData.length === 0) {
    return {};
  }

  const temperatureSumByDay: Record<string, number> = {};
  const countByDay: Record<string, number> = {};

  for (const data of temperatureData) {
    if (isNaN(data.value) || !(data.date instanceof Date)) {
      continue;
    }

    const dateString = data.date.toISOString().split('T')[0];
    
    if (!(dateString in temperatureSumByDay)) {
      temperatureSumByDay[dateString] = 0;
      countByDay[dateString] = 0;
    }
    
    temperatureSumByDay[dateString] += data.value;
    countByDay[dateString]++;
  }

  const avgTemperatureByDay: Record<string, number> = {};
  
  for (const date in temperatureSumByDay) {
    avgTemperatureByDay[date] = parseFloat((temperatureSumByDay[date] / countByDay[date]).toFixed(2));
  }

  return avgTemperatureByDay;
} 