import { uuid } from 'bnkit';
import {
  Shortcut,
  ShortcutCollection,
  ShortcutGroup,
  shortcut,
} from './schema';

export const shortcutFactory = (config: {
  name: string;
  emoji: string;
  description: string;
}) => {
  const collection: ShortcutCollection = {
    id: uuid.v7(),
    name: config.name,
    emoji: config.emoji,
    description: config.description,
  };

  const groups: Record<string, ShortcutGroup> = {};

  const createGroup = (groupConfig: {
    title: string;
    description: string;
    emoji: string;
  }) => {
    const group: ShortcutGroup = {
      id: uuid.v7(),
      title: groupConfig.title,
      description: groupConfig.description,
      emoji: groupConfig.emoji,
      applicationId: collection.id,
    };
    groups[group.id] = group;

    return {
      addManyShortcuts: (
        shortcutConfigs: {
          keys: string;
          description: string;
        }[]
      ) => {
        const shortcuts = shortcutConfigs.map((shortcutConfig) => ({
          id: uuid.v7(),
          keys: shortcutConfig.keys,
          description: shortcutConfig.description,
          groupId: group.id,
        }));
      },
      addShortcut: (shortcutConfig: { keys: string; description: string }) => {
        const shortcutData: Shortcut = {
          id: uuid.v7(),
          keys: shortcutConfig.keys,
          description: shortcutConfig.description,
          groupId: group.id,
        };

        shortcut.create(shortcutData);
      },
      updateShortcut: (
        shortcutId: string,
        updatedConfig: { keys?: string; description?: string }
      ) => {
        return shortcut.update(shortcutId, updatedConfig);
      },
      removeShortcut: (shortcutId: string) => {
        return shortcut.deleteById(shortcutId);
      },
    };
  };

  return {
    collection,
    createGroup,
  };
};
