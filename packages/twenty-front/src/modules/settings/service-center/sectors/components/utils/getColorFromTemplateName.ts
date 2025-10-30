import { type TagColor } from 'twenty-ui/components';
import { MAIN_COLORS } from 'twenty-ui/theme';

export const getColorFromTemplateName = (templateName: string): TagColor => {
  const availableColors = Object.keys(MAIN_COLORS).filter(
    (color) => color !== 'gray',
  );

  let hash = 0;
  for (let i = 0; i < templateName.length; i++) {
    const char = templateName.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  const index = Math.abs(hash) % availableColors.length;

  return availableColors[index] as TagColor;
};
