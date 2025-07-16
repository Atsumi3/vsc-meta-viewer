import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);
const statAsync = promisify(fs.stat);

export interface FileMetadata {
    filePath: string;
    fileName: string;
    fileSize: number;
    fileSizeFormatted: string;
    fileType: string;
    extension: string;
    createdAt: Date;
    modifiedAt: Date;
    lastAuthor?: string;
    lastCommitHash?: string;
    additionalInfo?: Record<string, any>;
}

export class MetadataProvider {
    async getMetadata(uri: vscode.Uri): Promise<FileMetadata> {
        const filePath = uri.fsPath;
        const stats = await statAsync(filePath);
        const fileName = path.basename(filePath);
        const extension = path.extname(filePath).toLowerCase();

        const metadata: FileMetadata = {
            filePath,
            fileName,
            fileSize: stats.size,
            fileSizeFormatted: this.formatFileSize(stats.size),
            fileType: this.getFileType(extension),
            extension,
            createdAt: stats.birthtime,
            modifiedAt: stats.mtime,
        };

        try {
            const gitInfo = await this.getGitInfo(filePath);
            metadata.lastAuthor = gitInfo.author;
            metadata.lastCommitHash = gitInfo.hash;
        } catch (error) {
            console.log('Git info not available:', error);
        }

        const additionalInfo = await this.getAdditionalInfo(filePath, extension);
        if (additionalInfo) {
            metadata.additionalInfo = additionalInfo;
        }

        return metadata;
    }

    private formatFileSize(bytes: number): string {
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        let size = bytes;
        let unitIndex = 0;

        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }

        return `${size.toFixed(2)} ${units[unitIndex]}`;
    }

    private getFileType(extension: string): string {
        const fileTypes: Record<string, string> = {
            '.ts': 'TypeScript',
            '.js': 'JavaScript',
            '.json': 'JSON',
            '.html': 'HTML',
            '.css': 'CSS',
            '.md': 'Markdown',
            '.py': 'Python',
            '.java': 'Java',
            '.cpp': 'C++',
            '.c': 'C',
            '.h': 'C/C++ Header',
            '.swift': 'Swift',
            '.m': 'Objective-C',
            '.mm': 'Objective-C++',
            '.kt': 'Kotlin',
            '.go': 'Go',
            '.rs': 'Rust',
            '.rb': 'Ruby',
            '.php': 'PHP',
            '.sh': 'Shell Script',
            '.bat': 'Batch File',
            '.xml': 'XML',
            '.yaml': 'YAML',
            '.yml': 'YAML',
            '.toml': 'TOML',
            '.ini': 'INI',
            '.plist': 'Property List',
            '.pbxproj': 'Xcode Project',
            '.xcworkspace': 'Xcode Workspace',
            '.xcodeproj': 'Xcode Project',
            '.ipa': 'iOS App',
            '.apk': 'Android App',
            '.aab': 'Android App Bundle',
            '.cer': 'Certificate',
            '.p12': 'Certificate',
            '.mobileprovision': 'iOS Provisioning Profile',
            '.jpg': 'JPEG Image',
            '.jpeg': 'JPEG Image',
            '.png': 'PNG Image',
            '.gif': 'GIF Image',
            '.svg': 'SVG Image',
            '.webp': 'WebP Image',
            '.bmp': 'Bitmap Image',
            '.ico': 'Icon',
            '.mp4': 'MP4 Video',
            '.mov': 'QuickTime Video',
            '.avi': 'AVI Video',
            '.mkv': 'Matroska Video',
            '.webm': 'WebM Video',
            '.mp3': 'MP3 Audio',
            '.wav': 'WAV Audio',
            '.flac': 'FLAC Audio',
            '.aac': 'AAC Audio',
            '.ogg': 'OGG Audio',
            '.m4a': 'M4A Audio',
            '.pdf': 'PDF Document',
            '.doc': 'Word Document',
            '.docx': 'Word Document',
            '.xls': 'Excel Spreadsheet',
            '.xlsx': 'Excel Spreadsheet',
            '.ppt': 'PowerPoint Presentation',
            '.pptx': 'PowerPoint Presentation',
            '.zip': 'ZIP Archive',
            '.tar': 'TAR Archive',
            '.gz': 'GZIP Archive',
            '.rar': 'RAR Archive',
            '.7z': '7-Zip Archive',
        };

        return fileTypes[extension] || 'Unknown';
    }

    private async getGitInfo(filePath: string): Promise<{ author: string; hash: string }> {
        const directory = path.dirname(filePath);
        
        try {
            const { stdout: authorOutput } = await execAsync(
                `git log -1 --format="%an" -- "${path.basename(filePath)}"`,
                { cwd: directory }
            );
            const { stdout: hashOutput } = await execAsync(
                `git log -1 --format="%h" -- "${path.basename(filePath)}"`,
                { cwd: directory }
            );

            return {
                author: authorOutput.trim(),
                hash: hashOutput.trim(),
            };
        } catch (error) {
            throw error;
        }
    }

    private async getAdditionalInfo(filePath: string, extension: string): Promise<Record<string, any> | null> {
        if (extension === '.mobileprovision') {
            return this.getProvisioningProfileInfo(filePath);
        } else if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(extension)) {
            return this.getImageInfo(filePath);
        } else if (['.mp4', '.mov', '.avi', '.mkv', '.webm'].includes(extension)) {
            return this.getVideoInfo(filePath);
        } else if (['.mp3', '.wav', '.flac', '.aac', '.ogg', '.m4a'].includes(extension)) {
            return this.getAudioInfo(filePath);
        }

        return null;
    }

    private async getProvisioningProfileInfo(filePath: string): Promise<Record<string, any> | null> {
        try {
            const { stdout } = await execAsync(
                `security cms -D -i "${filePath}" | plutil -extract DeveloperCertificates xml1 -o - - | xmllint --xpath "string(//data)" - | base64 --decode | openssl x509 -inform DER -noout -subject -dates`
            );
            
            const lines = stdout.split('\n');
            const info: Record<string, any> = {};

            for (const line of lines) {
                if (line.includes('notAfter=')) {
                    info.expirationDate = line.split('notAfter=')[1];
                }
            }

            const { stdout: plistOutput } = await execAsync(
                `security cms -D -i "${filePath}" | plutil -p -`
            );

            const teamIdMatch = plistOutput.match(/"TeamIdentifier"\s*=>\s*\[\s*"([^"]+)"\s*\]/);
            if (teamIdMatch) {
                info.teamId = teamIdMatch[1];
            }

            const nameMatch = plistOutput.match(/"Name"\s*=>\s*"([^"]+)"/);
            if (nameMatch) {
                info.profileName = nameMatch[1];
            }

            return info;
        } catch (error) {
            console.error('Error reading provisioning profile:', error);
            return null;
        }
    }

    private async getImageInfo(filePath: string): Promise<Record<string, any> | null> {
        try {
            const fileTypeModule = await import('file-type');
            const buffer = await fs.promises.readFile(filePath);
            const type = await fileTypeModule.fileTypeFromBuffer(buffer);
            
            const info: Record<string, any> = {
                mimeType: type?.mime,
                format: type?.ext,
            };

            try {
                const exifr = await import('exifr');
                const exifData = await exifr.parse(filePath);
                if (exifData) {
                    if (exifData.ImageWidth && exifData.ImageHeight) {
                        info.dimensions = `${exifData.ImageWidth} x ${exifData.ImageHeight}`;
                    }
                    if (exifData.Make || exifData.Model) {
                        info.camera = `${exifData.Make || ''} ${exifData.Model || ''}`.trim();
                    }
                }
            } catch (error) {
                console.log('EXIF data not available');
            }

            return info;
        } catch (error) {
            console.error('Error reading image info:', error);
            return null;
        }
    }

    private async getVideoInfo(filePath: string): Promise<Record<string, any> | null> {
        try {
            const fileTypeModule = await import('file-type');
            const buffer = await fs.promises.readFile(filePath).then(b => b.slice(0, 4096));
            const type = await fileTypeModule.fileTypeFromBuffer(buffer);
            
            return {
                mimeType: type?.mime,
                format: type?.ext,
            };
        } catch (error) {
            console.error('Error reading video info:', error);
            return null;
        }
    }

    private async getAudioInfo(filePath: string): Promise<Record<string, any> | null> {
        try {
            const fileTypeModule = await import('file-type');
            const buffer = await fs.promises.readFile(filePath).then(b => b.slice(0, 4096));
            const type = await fileTypeModule.fileTypeFromBuffer(buffer);
            
            return {
                mimeType: type?.mime,
                format: type?.ext,
            };
        } catch (error) {
            console.error('Error reading audio info:', error);
            return null;
        }
    }
}
