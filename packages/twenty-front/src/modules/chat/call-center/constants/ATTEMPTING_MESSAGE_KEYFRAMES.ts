export const ATTEMPTING_MESSAGE_KEYFRAMES = `
  animation: attempting-message 0.5s infinite alternate-reverse;
  animation-timing-function: cubic-bezier(0,.37,.08,.98);
  opacity: 0;
  @keyframes attempting-message {
    0% {
      opacity: 0.8;
    }
    100% {
      opacity: 1;
    }
  }
`;
