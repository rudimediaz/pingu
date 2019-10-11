import _ from "highland";
import { resolve, join } from "path";
import { promisify } from "util";
import { access, readdir, stat, copyFile, unlink } from "fs";
import { W_OK } from "constants";
import { hostname } from "os";

const afterDelete = (backup: BkFile) =>
	promisify(unlink)(backup.filepath)
		.then<BkFile>(() => ({ ...backup, isDeleted: true }))
		.catch<BkFile>(() => ({ ...backup, isDeleted: false }));

export const _unlink = (backups: BkFile[]) =>
	_(backups)
		.filter(file => [file.isExpired, file.isZero].includes(true))
		.flatMap(file => _(afterDelete(file)))
		.filter(file => file.isDeleted === false)
		.otherwise(_(backups).filter(file => file.isExpired === false));

export const _copyFile = (target: Tsdir) =>
	_(afterCopy(target)).filter(tsDir => tsDir.isTransported === true);

const afterCopy = (target: Tsdir) =>
	promisify(copyFile)(
		target.backupFile.filepath,
		join(target.rootpath, `${hostname()}.sql`)
	)
		.then<Tsdir>(() => ({ ...target, isTransported: true }))
		.catch<Tsdir>(err => ({ ...target, isTransported: false }));

export const _stat = (file: BkFile) =>
	_(promisify(stat)(file.filepath)).map<BkFile>(stats => ({
		...file,
		isExpired: stats.mtimeMs < new Date().valueOf() - 1000 * 60 * 60 * 2,
		isZero: stats.size === 0
	}));

const afterAccess = (dir: DirAcs) =>
	promisify(access)(dir.rootpath, W_OK)
		.then<DirAcs>(() => ({ ...dir, accessStatus: true }))
		.catch<DirAcs>(err => ({ ...dir, accessStatus: false }));

export const _access = (dir: DirAcs) =>
	_(afterAccess(dir)).filter(dir => dir.accessStatus === true);

export const _readdir = (dir: Dir) =>
	_(promisify(readdir)(dir.rootpath))
		.flatten<string>()
		.filter(file => /^backup_/g.test(file))
		.map<BkFile>(file => ({
			filepath: resolve(dir.rootpath, file),
			isDeleted: false,
			isExpired: false,
			isZero: false
		}))
		.flatMap(file => _stat(file))
		.collect()
		.flatMap(files => _unlink(files))
		.last();

export const transport = (tsDir: string[], backupFile: BkFile) =>
	_(tsDir).map<Tsdir>(tsDir => ({
		rootpath: resolve(tsDir),
		accessStatus: false,
		backupFile: backupFile,
		isTransported: false
	}));

export const backupDirectories = ["D://", "E://", "I://"];
export const transportDirectories = ["F://", "G://", "H://", "I://", "J://"];
