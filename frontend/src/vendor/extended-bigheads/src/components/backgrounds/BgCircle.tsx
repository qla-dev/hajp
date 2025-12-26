import React from "react";
import { useTheme } from "../../themeContext";
import { BackgroundShapeProps } from "./types";

export const BgCircle = ({ backgroundColor }: BackgroundShapeProps) => {
  const { colors } = useTheme();

  const color = colors.backgroundColors[backgroundColor];

  return <circle cx="500" cy="630.1601" r="332.441995" fill={color} />;
};
