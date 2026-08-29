import type { MenuProps } from 'antd';

export type MenuItem = Required<MenuProps>['items'][number];

export const getItem = (
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: (MenuItem | null)[],
): MenuItem | null => {
  return {
    key,
    icon,
    children: children
      ? children.filter((child): child is MenuItem => child !== null)
      : undefined,
    label,
  } as MenuItem;
};
