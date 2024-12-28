import React from "react";
import styled from "styled-components";

const ModalWrapper = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  width: 500px;
  max-height: 80vh; /* Limit the height to 80% of the viewport */
  overflow-y: auto; /* Allow scrolling if content exceeds max height */
/* 
  /* Custom scrollbar styling */
  ::-webkit-scrollbar {
    width: 8px; /* Width of the vertical scrollbar */
  }

  ::-webkit-scrollbar-track {
    background-color: #f1f1f1; /* Track background color */
    border-radius: 10px; /* Rounded corners for the scrollbar track */
  }

  ::-webkit-scrollbar-thumb {
    background-color: #888; /* Color of the scrollbar thumb */
    border-radius: 10px; /* Rounded corners for the thumb */
  }

  ::-webkit-scrollbar-thumb:hover {
    background-color: #555; /* Thumb color when hovered */
  } 
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: transparent;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #999;
  &:hover {
    color: #333;
  }
`;

const Modal = ({ onClose, children }) => {
  return (
    <>
      <Overlay onClick={onClose} />
      <ModalWrapper>
        <CloseButton onClick={onClose}>Close</CloseButton>
        {children}
      </ModalWrapper>
    </>
  );
};

export default Modal;