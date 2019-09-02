import { resolve } from "path";
import { Stats, stat, unlink } from "fs";
import { promisify } from "util";
import uniqid from "uniqid";

const filterBackup = (filename: string) => /^backup_/g.test(filename);
const beforeRegister = (files: string[]) => files.filter(filterBackup);
const register = (rootpath: string) => (file: string): BackupFile => ({
    filepath: resolve(rootpath, file),
    id: uniqid()
});

const registerAll = (files: string[], rootPath: string): BackupFile[] =>
    files.map(register(rootPath));

const isBackupExist = (files: string[]) => files.length !== 0;

export const createBackupFile = (
    rootPath: string,
    files: string[]
): BackupFile[] =>
    isBackupExist(files)
        ? isBackupExist(beforeRegister(files))
            ? registerAll(files, rootPath)
            : []
        : [];

const setState = <T>(oldState: T, newState: Partial<T>): T =>
    Object.assign(oldState, newState);

const current = () => new Date().valueOf() - 1000 * 60 * 60 * 2;
const willExpired = (stats: Stats) => stats.mtime.valueOf() < current();
const hasZero = (stats: Stats) => stats.size === 0;

export const checkExpired = (stats: Stats) => (
    backup: BackupFileDetails
): BackupFileDetails =>
    setState<BackupFileDetails>(backup, { isExpired: willExpired(stats) });

export const checkZero = (stats: Stats) => (backup: BackupFileDetails) =>
    setState<BackupFileDetails>(backup, { isZero: hasZero(stats) });

export const checkDeleted = (backup: BackupFileDetails) =>
    setState<BackupFileDetails>(backup, { isDeleted: true });

export const checkMeta = (backup: BackupFileDetails) =>
    promisify(stat)(backup.filepath)
        .then(stats => ({ stats, payload: checkExpired(stats)(backup) }))
        .then(next => ({
            ...next,
            payload: checkZero(next.stats)(next.payload)
        }))
        .then(next => next.payload)
        .catch(err => backup);
//

export const shouldDelete = (backup: BackupFileDetails) =>
    Promise.resolve([backup.isExpired, backup.isZero].includes(true))
        .then(condition =>
            condition
                ? promisify(unlink)(backup.filepath).then(() =>
                      setState<BackupFileDetails>(backup, { isDeleted: true })
                  )
                : backup
        )
        .then(next => next)
        .catch(err => backup);
