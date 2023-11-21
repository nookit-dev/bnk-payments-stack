import {
  Shortcut,
  ShortcutCollection,
  ShortcutGroup,
  shortcut,
} from './schema';
import { shortcutFactory } from './shortcut-factory';

export const macCommonShortcuts: ShortcutCollection = {
  description: 'A collection of hotkeys',
  emoji: '🔥',
  id: 'hotkeyCollection',
  name: 'Hotkeys',
};

export const group: ShortcutGroup = {
  title: 'Hotkeys',
  description: 'Hotkeys for the Hotkeys app',
  emoji: '🔥',
  applicationId: macCommonShortcuts.id,
  id: 'hotkeyGroup',
};

const shortcutExample: Shortcut = {
  id: 'hotkey',
  keys: 'ctrl + shift + h',
  description: 'Open the Hotkeys app',
  groupId: group.id,
};

const commonMacCollection = shortcutFactory({
  description: 'A collection of hotkeys for Mac users',
  emoji: '🍎',
  name: 'Mac Common Shortcuts',
});

const commonGroup = commonMacCollection.createGroup({
  title: 'Clipboard/Document',
  description: 'Shortcuts for copying, pasting, and undoing',
  emoji: '📋',
});

commonGroup.addManyShortcuts([
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
]);

const actionsGroup = commonMacCollection.createGroup({
  title: 'Actions',
  description: 'Shortcuts for common actions',
  emoji: '✏️',
});

actionsGroup.addManyShortcuts([
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
]);

const windowGroup = commonMacCollection.createGroup({
  title: 'Window/Tab Management',
  description: 'Shortcuts for managing windows and tabs',
  emoji: '🪟',
});

windowGroup.addManyShortcuts([
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
]);

const viewGroup = commonMacCollection.createGroup({
  title: 'View/Navigation',
  description: 'Shortcuts for zooming and navigating',
  emoji: '🖼️',
});

viewGroup.addManyShortcuts([
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
]);
