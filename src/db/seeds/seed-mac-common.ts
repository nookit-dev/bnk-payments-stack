import { ShortcutCollection } from '../schema';
import { addShortcut, shortcutFactory } from '../shortcut-factory';

export const macCommonShortcuts: ShortcutCollection = {
  description: 'A collection of hotkeys',
  emoji: '🔥',
  id: 'macCommonShortcuts',
  name: 'Hotkeys',
};

const addManyShortcuts = (
  shortcuts: Omit<Parameters<typeof addShortcut>[number], 'group'>[],
  group: Parameters<typeof addShortcut>[number]['group']
) => {
  shortcuts.forEach((shortcut) => {
    addShortcut({
      ...shortcut,
      group,
    });
  });
};

try {
  const commonMacCollection = shortcutFactory({
    id: macCommonShortcuts.id,
    description: 'A collection of hotkeys for Mac users',
    emoji: '🍎',
    name: 'Mac Common Shortcuts',
  });

  commonMacCollection.initCollection();

  const clipboardDocumentGroup = commonMacCollection.newGroup({
    name: 'Clipboard and Documents',
    description: 'Shortcuts for copying, pasting, and undoing',
    emoji: '📋',
  });

  const actionsGroup = commonMacCollection.newGroup({
    name: 'Actions',
    description: 'Shortcuts for common actions',
    emoji: '✏️',
  });

  const windowGroup = commonMacCollection.newGroup({
    name: 'Window and Tab Management',
    description: 'Shortcuts for managing windows and tabs',
    emoji: '🪟',
  });

  const viewGroup = commonMacCollection.newGroup({
    name: 'View and Navigation',
    description: 'Shortcuts for zooming and navigating',
    emoji: '🖼️',
  });

  addManyShortcuts(
    [
      {
        description: 'Copy',
        keys: '⌘ + C',
      },
      {
        description: 'Paste',
        keys: '⌘ + V',
      },
      {
        description: 'Cut',
        keys: '⌘ + X',
      },
      {
        description: 'Undo',
        keys: '⌘ + Z',
      },
      {
        description: 'Redo',
        keys: '⌘ + ⇧ + Z',
      },
      {
        description: 'Find',
        keys: '⌘ + F',
      },
      {
        description: 'Select All',
        keys: '⌘ + A',
      },
    ],
    clipboardDocumentGroup
  );

  addManyShortcuts(
    [
      {
        description: 'Print/Command Palette (context-dependent)',
        keys: '⌘ + P',
      },
      {
        description: 'Save/Save As (context-dependent)',
        keys: '⌘ + S',
      },
      {
        description: 'Preferences/Settings',
        keys: '⌘ + ,',
      },
      {
        description: 'Refresh/Reload/Rename (context-dependent)',
        keys: '⌘ + R',
      },
      {
        description: 'Duplicate/Add to Favorites (context-dependent)',
        keys: '⌘ + D',
      },
      {
        description: 'Edit/Toggle Mode (context-dependent)',
        keys: '⌘ + E',
      },
      {
        description: 'Focus Address Bar/Command Bar (context-dependent)',
        keys: '⌘ + L',
      },
      {
        description: 'Open File/Other Vaults (context-dependent)',
        keys: '⌘ + ⇧ + O',
      },
    ],
    actionsGroup
  );

  addManyShortcuts(
    [
      {
        description: 'New (context-dependent)',
        keys: '⌘ + N',
      },
      {
        description: 'New Tab/Tool (context-dependent)',
        keys: '⌘ + T',
      },
      {
        description: 'Reopen Closed Tab/Item (context-dependent)',
        keys: '⌘ + ⇧ + T',
      },
      {
        description: 'New Window/Item (context-dependent)',
        keys: '⌘ + ⇧ + N',
      },
      {
        description: 'Close Tab/Window',
        keys: '⌘ + W',
      },
      {
        description: 'Quit Application',
        keys: '⌘ + Q',
      },
      {
        description: 'Command Palette/Other Functions (context-dependent)',
        keys: '⌘ + ⇧ + P',
      },
      {
        description: 'Clear/Clear Unpinned Tabs (context-dependent)',
        keys: '⌘ + ⇧ + K',
      },
    ],
    windowGroup
  );

  addManyShortcuts(
    [
      {
        description: 'Zoom In/Out',
        keys: '⌘ + + / -',
      },
      {
        description: 'Reset Zoom/Actual Size',
        keys: '⌘ + 0',
      },
      {
        description: 'Navigate Back/Forward (context-dependent)',
        keys: '⌘ + [ / ]',
      },
      {
        description: 'Toggle Full Screen/Library (context-dependent)',
        keys: '⌘ + ⇧ + L',
      },
    ],
    viewGroup
  );
} catch (error) {
  console.error(error);
}
