import React from "react";
import { useTheme } from "../../themeContext";
import { BackgroundShapeProps } from "./types";

export const BgSquare = ({ backgroundColor }: BackgroundShapeProps) => {
  const { colors } = useTheme();

  const color = colors.backgroundColors[backgroundColor];

  return (
    <path d="M832.442 297.718H167.558V962.602H832.442V297.718Z" fill={color} />
  );
};
