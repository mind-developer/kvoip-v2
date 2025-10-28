import { Module } from '@nestjs/common';

import { GeolocationApiClient } from 'src/engine/core-modules/dadshboard-linklogs/geolocation/clients/geolocation-api.client';
import { GeolocationApiService } from 'src/engine/core-modules/dadshboard-linklogs/geolocation/services/geolocation-api.service';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';

@Module({
  imports: [TwentyConfigModule],
  providers: [GeolocationApiClient, GeolocationApiService],
  exports: [GeolocationApiService],
})
export class GeolocationApiModule {}
