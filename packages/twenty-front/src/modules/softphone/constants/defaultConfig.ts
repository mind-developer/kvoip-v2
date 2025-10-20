/* @kvoip-woulz proprietary */
import { SipConfig } from '../types/sipConfig';
import { SIP_SERVER_CONFIG } from './sip';

const defaultConfig: SipConfig = {
  username: '',
  password: '',
  domain: SIP_SERVER_CONFIG.DOMAIN,
  proxy: SIP_SERVER_CONFIG.PROXY,
  protocol: SIP_SERVER_CONFIG.PROTOCOL,
  authorizationHa1: '',
};

export default defaultConfig;
