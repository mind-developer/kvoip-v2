/* @kvoip-woulz proprietary */
import { useEffect, useState } from 'react';

import { SipConfig } from '../types/sipConfig';

export const useSipConfig = (telephonyExtension: any) => {
  const [config, setConfig] = useState<SipConfig>();

  useEffect(() => {
    if (telephonyExtension) {
      setConfig({
        domain: 'suite.pabx.digital',
        proxy: 'webrtc.dazsoft.com:8080',
        protocol: 'wss://',
        authorizationHa1: '',
        username: telephonyExtension.usuario_autenticacao,
        password: telephonyExtension.senha_sip,
      });
    }
  }, [telephonyExtension]);

  return { config, setConfig };
};
