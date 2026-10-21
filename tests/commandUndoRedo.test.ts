import { describe, it, expect } from 'vitest';
import { CommandManager, ICommand } from '../src/core/commands/CommandManager';

describe('CommandManager', () => {
  it('executes, undoes, and redoes commands properly', () => {
    const mgr = new CommandManager();
    let state = 0;

    const cmd: ICommand = {
      description: 'Add 10 to state',
      execute: () => { state += 10; },
      undo: () => { state -= 10; },
    };

    mgr.execute(cmd);
    expect(state).toBe(10);
    expect(mgr.canUndo()).toBe(true);
    expect(mgr.canRedo()).toBe(false);

    mgr.undo();
    expect(state).toBe(0);
    expect(mgr.canUndo()).toBe(false);
    expect(mgr.canRedo()).toBe(true);

    mgr.redo();
    expect(state).toBe(10);
  });
});
