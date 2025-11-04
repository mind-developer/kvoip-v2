/* @kvoip-woulz proprietary */
import { useEffect, useState } from 'react';

import { SIP_SERVER_CONFIG } from '../constants';
import { SipConfig } from '../types/sipConfig';

export const useSipConfig = (telephonyExtension: any) => {
  const [config, setConfig] = useState<SipConfig>();

  useEffect(() => {
    if (telephonyExtension) {
      setConfig({
        domain: SIP_SERVER_CONFIG.DOMAIN,
        proxy: SIP_SERVER_CONFIG.PROXY,
        protocol: SIP_SERVER_CONFIG.PROTOCOL,
        authorizationHa1: '',
        username: telephonyExtension.usuario_autenticacao,
        password: telephonyExtension.senha_sip,
      });
    }
  }, [telephonyExtension]);

  return { config, setConfig };
};
