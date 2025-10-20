/* @kvoip-woulz proprietary */
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useGetUserSoftfone } from '@/settings/service-center/telephony/hooks/useGetUserSoftfone';
import { useRecoilValue } from 'recoil';
import { useGetTelephonyByMember } from '@/settings/service-center/telephony/hooks/useGetTelephonyByMember';

export const useTelephonyUserData = () => {
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  
  const { telephony } = useGetTelephonyByMember({
      memberId: currentWorkspaceMember?.id,
  });

  const { telephonyExtension } = useGetUserSoftfone({
      extNum: telephony?.numberExtension,
  });

  return {
    currentWorkspaceMember,
    telephony,
    telephonyExtension,
  };
};
