interface Directory {
    rootPath: string;
    accessStatus: number;
}

interface BackupDirectory extends Directory {
    backups: BackupFile[];
}

interface TransportDirectory extends Directory {
    doneTranporting: boolean;
}
