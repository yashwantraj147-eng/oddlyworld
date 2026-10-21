export interface ICommand {
  description: string;
  execute(): void;
  undo(): void;
}

export class CommandManager {
  private undoStack: ICommand[] = [];
  private redoStack: ICommand[] = [];
  private maxHistory: number;

  public onHistoryChange?: () => void;

  constructor(maxHistory: number = 50) {
    this.maxHistory = maxHistory;
  }

  public execute(command: ICommand): void {
    command.execute();
    this.undoStack.push(command);
    if (this.undoStack.length > this.maxHistory) {
      this.undoStack.shift();
    }
    this.redoStack = []; // Clear redo stack on new command
    this.onHistoryChange?.();
  }

  public undo(): boolean {
    if (this.undoStack.length === 0) return false;
    const command = this.undoStack.pop()!;
    command.undo();
    this.redoStack.push(command);
    this.onHistoryChange?.();
    return true;
  }

  public redo(): boolean {
    if (this.redoStack.length === 0) return false;
    const command = this.redoStack.pop()!;
    command.execute();
    this.undoStack.push(command);
    this.onHistoryChange?.();
    return true;
  }

  public canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  public canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  public getUndoDescription(): string | null {
    return this.undoStack.length > 0 ? this.undoStack[this.undoStack.length - 1].description : null;
  }

  public getRedoDescription(): string | null {
    return this.redoStack.length > 0 ? this.redoStack[this.redoStack.length - 1].description : null;
  }

  public clear(): void {
    this.undoStack = [];
    this.redoStack = [];
    this.onHistoryChange?.();
  }
}
