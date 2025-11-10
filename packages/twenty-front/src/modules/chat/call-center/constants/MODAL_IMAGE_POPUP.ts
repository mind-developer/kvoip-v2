export const MODAL_IMAGE_POPUP = `
  animation: modal-image-popup 0.5s;
  animation-timing-function: cubic-bezier(0,.37,.08,.98);
  @keyframes modal-image-popup {
    0% {
      transform: translateY(100px);
      opacity: 0;
    }
    100% {
      transform: translateY(0px);
      opacity: 1;
    }
  }
`;
