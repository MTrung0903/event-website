import React from 'react';
import styled from 'styled-components';

const Loader = () => {
  return (
    <StyledWrapper>
      <div className="loader">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 66 66" height="100px" width="100px" className="spinner">
          <circle stroke="url(#gradient)" r={20} cy={33} cx={33} strokeWidth={1} fill="transparent" className="path" />
          <linearGradient id="gradient">
            <stop stopOpacity={1} stopColor="#fe0000" offset="0%" />
            <stop stopOpacity={0} stopColor="#af3dff" offset="100%" />
          </linearGradient>
        </svg> 
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .loader {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .spinner {
    width: 250px;
    height: 150px;
    position: relative;
    animation: rotation 0.75s linear infinite;
    border-radius: 100em;
  }

  .path {
    stroke-dasharray: 100;
    stroke-dashoffset: 20;
    stroke-linecap: round;
  }

  @keyframes rotation {
    to {
      transform: rotate(360deg);
    }
  }`;

export default Loader;
