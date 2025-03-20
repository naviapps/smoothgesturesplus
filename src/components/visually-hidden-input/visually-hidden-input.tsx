import React from 'react';

export type VisuallyHiddenProperties = React.InputHTMLAttributes<HTMLInputElement>;

export function VisuallyHiddenInput(properties: VisuallyHiddenProperties) {
  const { style, ...otherProperties } = properties;

  return (
    <input
      {...otherProperties}
      style={{
        clip: 'rect(0 0 0 0)',
        clipPath: 'inset(50%)',
        height: 1,
        overflow: 'hidden',
        position: 'absolute',
        bottom: 0,
        left: 0,
        whiteSpace: 'nowrap',
        width: 1,
        ...style,
      }}
    />
  );
}
