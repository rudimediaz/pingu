import { resolve } from "path";
import { promisify } from "util";
import { access, readdir } from "fs";
import { registerAll } from "./Backup";

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
                backups: registerAll(files, target.rootPath)
            })
        )
        .catch(() => ({ ...target, backups: [] }));
