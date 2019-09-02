import { resolve } from "path";
import { promisify } from "util";
import { access, readdir } from "fs";
import { createBackupFile, checkMeta, shouldDelete } from "./Backup";

export enum AccStatus {
    INIT = 0,
    OK = 200,
    INV = 300
}

export const register = (rootpath: string): Directory => ({
    rootPath: resolve(rootpath),
    accessStatus: AccStatus.INIT
});

export const checkAccess = (target: Directory): Promise<Directory> =>
    promisify(access)(target.rootPath)
        .then(() => ({ ...target, accessStatus: AccStatus.OK }))
        .catch(() => ({ ...target, accessStatus: AccStatus.INV }));
//

export const getBackups = (target: Directory): Promise<BackupDirectory> =>
    promisify(readdir)(target.rootPath)
        .then(files =>
            Object.assign<Directory, any>(target, {
                backups: createBackupFile(target.rootPath, files)
            })
        )
        .catch(() => ({ ...target, backups: [] }));
//
export const getMeta = (target: BackupDirectory): Promise<BackupDirectory> =>
    Promise.all(target.backups.map(checkMeta))
        .then(updated => ({
            ...target,
            backups: updated
        }))
        .catch(() => target);

//
export const cleanedJunk = (
    target: BackupDirectory
): Promise<BackupDirectory> =>
    Promise.all(target.backups.map(shouldDelete))
        .then(updated => ({
            ...target,
            backups: updated.filter(update => update.isDeleted === false)
        }))
        .catch(() => target);
