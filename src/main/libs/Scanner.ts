import { assign } from "lodash";
import { promisify } from "util";
import { copyFile } from "fs";
import { find } from "lodash";
import { AccStatus } from "./Directory";
enum Timed {
    normal = 2000,
    halt = 1000 * 60 * 60
}

const initScanner = (): Scanner => ({
    lastBackup: "",
    nextTimeout: Timed.normal
});

const setLastbackups = (id: string) => (scanner: Scanner): Scanner =>
    assign<Scanner, Partial<Scanner>>(scanner, { lastBackup: id });

const transport = (target: string, src: string) => (
    scanner: Scanner
): Promise<Scanner> =>
    promisify(copyFile)(src, target)
        .then(() => ({ ...scanner, nextTimeout: Timed.halt }))
        .catch(err => ({ ...scanner, nextTimeout: Timed.normal }));
