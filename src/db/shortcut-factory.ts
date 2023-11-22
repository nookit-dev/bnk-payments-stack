import { uuid } from 'bnkit';
import {
  Shortcut,
  ShortcutCollection,
  shortcut,
  shortcutCollection,
  shortcutGroup,
} from './schema';

const CONSTRAINT_FAILED = 'constraint failed';

// Function to create a group
const createGroup = (
  groupConfig: {
    name: string;
    description: string;
    emoji: string;
  },
  collectionData: ShortcutCollection
) => {
  const initGroup = () => {
    try {
      let group: ReturnType<typeof shortcutGroup.infer> | null = null;
      console.log({ groupConfig });

      try {
        group = shortcutGroup.readItemByKey('name', groupConfig.name);
      } catch (e) {
        console.error(
          `Error reading group ${groupConfig.name} by key: ${groupConfig.name}`,
          e
        );
      }

      if (group) return group;

      if (!group) {
        console.info(`Group ${groupConfig.name} not found. Creating...`);
        group = {
          id: uuid.v7(),
          name: groupConfig.name,
          description: groupConfig.description,
          emoji: groupConfig.emoji,
          collectionId: collectionData.id,
        };

        try {
          shortcutGroup.create(group);
        } catch (e) {
          console.error(e);
          throw new Error('Error creating group');
        }
      }

      if (!group) {
        throw new Error('Group not found');
      }
    } catch (e) {
      throw `Error initializing group ${groupConfig.name}`;
    }
  };

  return {
    initGroup,
  };
};

// Function to add a shortcut
export const addShortcut = (config: {
  keys: string;
  description: string;
  group: ReturnType<ReturnType<typeof shortcutFactory>['newGroup']> | null;
}) => {
  const shortcutData: Shortcut = {
    id: uuid.v7(),
    keys: config.keys,
    description: config.description,
    groupId: config.group?.id || '',
  };

  return shortcut.create(shortcutData);
};

export const shortcutFactory = (config: {
  name: string;
  emoji: string;
  description: string;
  id: string;
}) => {
  const groupFactory = (groupConfig: {
    name: string;
    description: string;
    emoji: string;
  }) => {
    // lookup group by name
    // if exists, return group
    // else create group
    let groupFactory = createGroup(groupConfig, collectionData);

    return groupFactory.initGroup();

    // return {
    //   group,
    //   // addManyShortcuts: (
    //   //   shortcutConfigs: {
    //   //     keys: string;
    //   //     description: string;
    //   //   }[]
    //   // ) => {
    //   //   return shortcutConfigs.map((shortcutConfig) => {
    //   //     const shortcutEntry = {
    //   //       id: uuid.v7(),
    //   //       keys: shortcutConfig.keys,
    //   //       description: shortcutConfig.description,
    //   //       groupId: group?.id || '',
    //   //     };

    //   //     try {
    //   //       return shortcut.create(shortcutEntry);
    //   //     } catch (e) {
    //   //       console.error('Error creating shortcut', {
    //   //         errorMessage: e.message,
    //   //         shortcutEntry,
    //   //       });
    //   //       console.error(e);
    //   //     }
    //   //   });
    //   // },
    //   // addShortcut: (shortcutConfig: { keys: string; description: string }) => {
    //   //   try {
    //   //     return addShortcut(shortcutConfig, group);
    //   //   } catch (e) {

    //   //     console.log({
    //   //       group,
    //   //       groupid: group?.id,
    //   //     })
    //   //     // check if shortcut already exists
    //   //     const existingShort = shortcut.readItemsWhere({
    //   //       keys: shortcutConfig.keys,
    //   //       groupId: group?.id,
    //   //     });
    //   //     if (existingShort.length > 0) {
    //   //       console.info(`Shortcut ${shortcutConfig.keys} already exists. `);
    //   //       return null;
    //   //     }
    //   //     throw e;
    //   //   }
    //   // },
    //   // updateShortcut: (
    //   //   shortcutId: string,
    //   //   updatedConfig: { keys?: string; description?: string }
    //   // ) => {
    //   //   return shortcut.update(shortcutId, updatedConfig);
    //   // },
    //   // removeShortcut: (shortcutId: string) => {
    //   //   return shortcut.deleteById(shortcutId);
    //   // },
    // };
  };

  const collectionData: ShortcutCollection = {
    id: config.id || uuid.v7(),
    name: config.name,
    emoji: config.emoji,
    description: config.description,
  };

  return {
    collection: collectionData,
    initCollection: () => {
      try {
        return shortcutCollection.create(collectionData);
      } catch (e) {
        if (e.message === 'constraint failed') {
          console.info(
            `Collection ${collectionData.name} already exists. Skipping...`
          );

          return null;
        } else {
          throw e;
        }
      }
    },
    newGroup: groupFactory,
  };
};
