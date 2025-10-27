import { Injectable, Logger } from '@nestjs/common';

import {
  GeolocationApiClient,
  GeolocationResponse,
} from 'src/engine/core-modules/dadshboard-linklogs/geolocation/clients/geolocation-api.client';
import { NodeEnvironment } from 'src/engine/core-modules/twenty-config/interfaces/node-environment.interface';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class GeolocationApiService {
  private readonly logger = new Logger(GeolocationApiService.name);

  constructor(
    private readonly geolocationApiClient: GeolocationApiClient,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async getLocationByIp(ip: string): Promise<GeolocationResponse> {
    // Check if it's a localhost IP
    if (this.isLocalhostIp(ip)) {
      return this.handleLocalhostIp(ip);
    }

    // Skip geolocation for private IPs
    if (this.isPrivateIp(ip)) {
      this.logger.debug(`Skipping geolocation for private IP: ${ip}`);

      return {
        country: null,
        regionName: null,
        city: null,
      };
    }

    // Public IP - call geolocation API
    return this.geolocationApiClient.getLocationByIp(ip);
  }

  private async handleLocalhostIp(ip: string): Promise<GeolocationResponse> {
    const nodeEnv = this.twentyConfigService.get('NODE_ENV');
    const isTestOrDev = [
      NodeEnvironment.DEVELOPMENT,
      NodeEnvironment.TEST,
    ].includes(nodeEnv);

    if (isTestOrDev) {
      const testIp = this.twentyConfigService.get('GEOLOCATION_TEST_IP');

      if (testIp) {
        this.logger.debug(
          `Using test IP ${testIp} instead of localhost IP ${ip}`,
        );

        return this.geolocationApiClient.getLocationByIp(testIp);
      }
    }

    this.logger.debug(`Skipping geolocation for localhost IP: ${ip}`);

    return {
      country: null,
      regionName: null,
      city: null,
    };
  }

  private isLocalhostIp(ip: string): boolean {
    if (!ip) return true;

    // IPv6 localhost
    if (ip === '::1' || ip === '::ffff:127.0.0.1') return true;

    // IPv4 localhost (127.0.0.0/8 range)
    if (ip === '127.0.0.1' || ip.startsWith('127.')) return true;

    return false;
  }

  private isPrivateIp(ip: string): boolean {
    if (!ip) return false;

    // Private IPv4 ranges (RFC 1918)
    // 192.168.0.0/16
    if (ip.startsWith('192.168.')) return true;

    // 10.0.0.0/8
    if (ip.startsWith('10.')) return true;

    // 172.16.0.0/12 (172.16.0.0 - 172.31.255.255)
    if (
      ip.startsWith('172.16.') ||
      ip.startsWith('172.17.') ||
      ip.startsWith('172.18.') ||
      ip.startsWith('172.19.') ||
      ip.startsWith('172.20.') ||
      ip.startsWith('172.21.') ||
      ip.startsWith('172.22.') ||
      ip.startsWith('172.23.') ||
      ip.startsWith('172.24.') ||
      ip.startsWith('172.25.') ||
      ip.startsWith('172.26.') ||
      ip.startsWith('172.27.') ||
      ip.startsWith('172.28.') ||
      ip.startsWith('172.29.') ||
      ip.startsWith('172.30.') ||
      ip.startsWith('172.31.')
    ) {
      return true;
    }

    return false;
  }

  isPublicIp(ip: string): boolean {
    return !this.isLocalhostIp(ip) && !this.isPrivateIp(ip);
  }
}
