import { resolve } from "path";

const register = (rootPath: string) => (filename: string): BackupFile => ({
    filepath: resolve(rootPath, filename)
});

export const registerAll = (files: string[], rootPath: string): BackupFile[] =>
    files.length !== 0 ? files.map(register(rootPath)) : [];

const setState = (
    oldState: BackupFile | BackupFileDetails,
    newState: Partial<BackupFile | BackupFileDetails>
): BackupFile | BackupFileDetails => Object.assign(oldState, newState);
