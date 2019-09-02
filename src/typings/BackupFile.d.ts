interface BackupFile {
    id: string;
    filepath: string;
}

interface BackupFileDetails extends BackupFile {
    isExpired: boolean;
    isZero: boolean;
    isDeleted: boolean;
}
