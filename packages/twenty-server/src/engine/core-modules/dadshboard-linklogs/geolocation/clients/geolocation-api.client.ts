import { Injectable, Logger } from '@nestjs/common';

import axios from 'axios';
import { NodeEnvironment } from 'src/engine/core-modules/twenty-config/interfaces/node-environment.interface';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

// TODO: Add full response from the API
export type GeolocationResponse = {
  country: string | null;
  regionName: string | null;
  city: string | null;
};

@Injectable()
export class GeolocationApiClient {
  private readonly logger = new Logger(GeolocationApiClient.name);

  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  async getLocationByIp(ip: string): Promise<GeolocationResponse> {
    try {
      const apiUrl = this.getApiUrl();

      if (!apiUrl) {
        this.logger.warn('Geolocation API URL is not configured');

        return {
          country: null,
          regionName: null,
          city: null,
        };
      }

      const response = await axios.get(`${apiUrl}/json/${ip}`);

      const data = response.data;

      if (data?.status === 'success') {
        return {
          country: data.country ?? null,
          regionName: data.regionName ?? null,
          city: data.city ?? null,
        };
      } else {
        this.logger.warn(`IP lookup failed for ${ip}: ${data?.message}`);

        return {
          country: null,
          regionName: null,
          city: null,
        };
      }
    } catch (error) {
      this.logger.error(
        `Error fetching IP info for ${ip}: ${error?.message || error}`,
      );

      return {
        country: null,
        regionName: null,
        city: null,
      };
    }
  }

  private getApiUrl(): string | undefined {
    const nodeEnv = this.twentyConfigService.get('NODE_ENV');
    const isSandbox = [
      NodeEnvironment.DEVELOPMENT,
      NodeEnvironment.TEST,
    ].includes(nodeEnv);

    if (isSandbox) {
      const testApiUrl = this.twentyConfigService.get(
        'GEOLOCATION_TEST_API_URL',
      );

      if (testApiUrl) {
        this.logger.debug(`Using test API URL: ${testApiUrl}`);

        return testApiUrl;
      }
    }

    return this.twentyConfigService.get('GEOLOCATION_API_URL');
  }
}
