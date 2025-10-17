import { getCleanName } from '@/chat/call-center/utils/getCleanName';

import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { Avatar } from 'twenty-ui/display';

const StyledUserName = styled.p`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: 600;
  margin: 0;
  margin-bottom: ${({ theme }) => theme.spacing(1.5)};
`;

export const AvatarComponent = ({
  avatarUrl,
  senderName,
  animateDelay,
}: {
  avatarUrl: string;
  senderName: string;
  animateDelay: number;
}) => {
  return (
    <motion.div
      initial={{ translateY: 20, opacity: 0 }}
      animate={{
        translateY: 0,
        opacity: 1,
        transition: {
          delay: animateDelay,
          type: 'spring',
          stiffness: 300,
          damping: 20,
          mass: 0.8,
        },
      }}
    >
      <Avatar
        avatarUrl={avatarUrl}
        placeholder={senderName}
        placeholderColorSeed={senderName}
        type={'rounded'}
        size="lg"
      />
    </motion.div>
  );
};

export const UsernameComponent = ({ senderName }: { senderName: string }) => {
  return (
    <StyledUserName
      style={{
        margin: 0,
      }}
    >
      {getCleanName(senderName)}
    </StyledUserName>
  );
};
