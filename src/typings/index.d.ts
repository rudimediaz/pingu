interface Dir {
	rootpath: string;
	accessStatus: boolean;
}

interface BkFile {
	filepath: string;
	isExpired: boolean;
	isZero: boolean;
	isDeleted: boolean;
}

interface BkDirState {
	backups: any[];
}

interface TsDirState {
	backupFile: BkFile;
	isTransported: boolean;
}

type Bkdir = Dir & BkDirState;
type Tsdir = Dir & TsDirState;
type DirAcs = Dir | Tsdir | Bkdir;
