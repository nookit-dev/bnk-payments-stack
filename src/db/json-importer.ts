import {
  Shortcut,
  ShortcutCollection,
  ShortcutGroup,
  shortcut,
  shortcutCollection,
  shortcutGroup,
} from './schema';
import { addShortcut, shortcutFactory } from './shortcut-factory';

type JSONShortcut = Omit<Shortcut, 'id' | 'groupId'> & { group: string };
type JSONShortcutGroup = Omit<ShortcutGroup, 'id' | 'collectionId'>;
type JSONShortcutCollection = ShortcutCollection & {
  groups: JSONShortcutGroup[];
  shortcuts: JSONShortcut[];
};

/**
 * Reads, validates, and inserts a JSON file containing shortcut collections, groups, and shortcuts.
 *
 * @param filePath The path to the JSON file.
 */
export async function importJsonShortcutsToDb(filePath: string): Promise<void> {
  try {
    const file = Bun.file(filePath);
    const fileContents = await file.text();
    const jsonData: JSONShortcutCollection[] = JSON.parse(fileContents);

    jsonData.forEach((collectionData) => {
      const collection = shortcutFactory({
        id: collectionData.id,
        name: collectionData.name,
        emoji: collectionData.emoji,
        description: collectionData.description,
      });

      collection.initCollection();

      collectionData.groups.forEach((groupData) => {
        const group = collection.newGroup({
          name: groupData.name,
          description: groupData.description,
          emoji: groupData.emoji,
        });

        const shortcutsInGroup = collectionData.shortcuts.filter(
          (sc) => sc.group === groupData.name
        );
        shortcutsInGroup.forEach((shortcutData) => {
          addShortcut({
            ...shortcutData,
            group,
          });
        });
      });
    });
  } catch (error) {
    console.error('Error processing the JSON file:', error);
  }
}

type CollectionConfig = ShortcutCollection & {
  //   groups: Omit<ShortcutGroup, 'collectionId'> &
  groups: Array<
    ShortcutGroup & {
      shortcuts: Shortcut[];
    }
  >;
};

export const loadCollectionFromDb = (
  collectionId: string
): CollectionConfig => {
  const collectionData = shortcutCollection.readById(collectionId);

  const collectionGroups = shortcutGroup.readItemsWhere({
    collectionId: collectionId,
  });

  // load the shortcuts for each group
  const groups = collectionGroups.map((group) => {
    const shortcuts = shortcut.readItemsWhere({
      groupId: group.id,
    });

    return {
      group: group,
      shortcuts: shortcuts,
    };
  });

  return {
    description: collectionData.description,
    emoji: collectionData.emoji,
    id: collectionData.id,
    name: collectionData.name,
    groups: groups.map((group) => ({
      ...group.group,
      shortcuts: group.shortcuts,
    })),
  };

  // create map of group id to shortcuts, maintain typesafety
  //   const groupMap: Record<
  //     string,
  //     { shortcut: Shortcut[]; group: ShortcutGroup }
  //   > = {};

  //   groups.forEach((group) => {
  //     groupMap[group.group.id] = {
  //       group: group.group,
  //       shortcut: group.shortcuts,
  //     };
  //   });
};

export const writeCollectionToJsonFile = (
  collectionConfig: CollectionConfig,
  path: string
) => {
  const file = Bun.file(path);

  const writer = file.writer();

  writer.write(JSON.stringify(collectionConfig, null, 2));

  return writer.end();
};

export const collectionToMarkdown = (jsonExportConfig: CollectionConfig) => {
  return `
# ${jsonExportConfig.emoji} ${jsonExportConfig.name}
## 
### ${jsonExportConfig.description}

${jsonExportConfig.groups
  .map((group) => {
    return `
### ${group.emoji} ${group.name}
${group.description}

${group.shortcuts
  .map((shortcut) => {
    return `
#### ${shortcut.keys}
${shortcut.description}
`;
  })
  .join('\n')}
`;
  })
  .join('\n')}

`;
};

export const writeCollectionToMdFile = (
  collectionConfig: CollectionConfig,
  path: string
) => {
  const file = Bun.file(path);

  const writer = file.writer();

  writer.write(collectionToMarkdown(collectionConfig));

  return file
};
