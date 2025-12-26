import { colors } from "theme";

export interface BackgroundShapeProps {
  backgroundColor: keyof typeof colors.backgroundColors;
}

export interface BgMaskProps {
  id: string;
}
