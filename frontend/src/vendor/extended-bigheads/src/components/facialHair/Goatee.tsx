import React from "react";
import { useTheme } from "../../themeContext";
import { FacialHairProps } from "./types";

export const Goatee = ({ color }: FacialHairProps) => {
  const { colors } = useTheme();
  const { base } = colors.hair[color];

  return (
    <>
      <path
        d="M463 737L499.5 808L536 737H463Z"
        fill={base}
        stroke={colors.outline}
        strokeWidth="12"
        strokeLinejoin="round"
      />
    </>
  );
};
