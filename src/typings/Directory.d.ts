interface Directory {
    rootPath: string;
    accessStatus: number;
}

interface BackupDirectory extends Directory {
    backups: BackupFileDetails[];
}

interface TransportDirectory extends Directory {
    doneTranporting: boolean;
}
