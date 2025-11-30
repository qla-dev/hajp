import React, { forwardRef, useState } from 'react';
import { TextInput } from 'react-native';
import { useTheme } from '../theme/darkMode';

// Shared input that applies a primary border when focused across all screens.
const FormTextInput = forwardRef(function FormTextInput(props, ref) {
  const { style, onFocus, onBlur, focusedStyle, placeholderTextColor, ...rest } = props;
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);

  const handleFocus = (e) => {
    setFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    setFocused(false);
    onBlur?.(e);
  };

  return (
    <TextInput
      ref={ref}
      {...rest}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholderTextColor={placeholderTextColor || colors.text_secondary}
      style={[style, focused && { borderColor: colors.primary }, focused && focusedStyle]}
    />
  );
});

export default FormTextInput;
