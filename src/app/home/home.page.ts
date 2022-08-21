import { Component } from '@angular/core';
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';

// Storage got renamed into Preferences
import { Preferences } from '@capacitor/preferences';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { HttpClient, HttpEventType } from '@angular/common/http';

const FILE_KEY = 'downloaded';

interface DownloadedFile {
  path: string;
  mimeType: string;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  downloadUrl = '';
  myFiles: DownloadedFile[] = [];
  downloadProgress = 0;

  // Proxied
  pdfUrl = '/storage/fe5467a6a163010b197fb20/2017/10/file-example_PDF_1MB.pdf';
  videoUrl =
    '/storage/fe5467a6a163010b197fb20/2017/04/file_example_MP4_640_3MG.mp4';
  imageUrl =
    '/storage/fe5467a6a163010b197fb20/2017/10/file_example_PNG_1MB.png';

  constructor(private http: HttpClient, private fileOpener: FileOpener) {
    this.requestPermissions();
    this.loadFiles();
  }

  async requestPermissions() {
    const permissions = await Filesystem.checkPermissions();

    if (permissions.publicStorage !== 'granted') {
      const requested = await Filesystem.requestPermissions();

      if (requested.publicStorage !== 'granted') {
        console.error('No permission to write/read files!!!');
      }
    }
  }

  async loadFiles() {
    const videoList = await Preferences.get({ key: FILE_KEY });
    this.myFiles = JSON.parse(videoList.value) || [];
    console.log(this.myFiles);
  }

  async openFile(file: DownloadedFile) {
    const { path, mimeType } = file;
    console.log('opening...', path);

    try {
      await this.fileOpener.open(path, mimeType);
    } catch (error) {
      // Possible errors:
      // - File not found
      // - Wrong mimeType
      console.error(
        `Failed to open file ${path} with mimeType ${mimeType}:`,
        error.message
      );
    }
  }

  downloadFile(url?: string) {
    // Set URL, if it has been passed
    this.downloadUrl = url ? url : this.downloadUrl;

    this.http
      .get(this.downloadUrl, {
        responseType: 'blob',
        reportProgress: true, // progress bar
        observe: 'events', // progress bar
      })
      .subscribe(async (event) => {
        // Our download has finished
        if (event.type === HttpEventType.Response) {
          const name = this.downloadUrl.slice(
            this.downloadUrl.lastIndexOf('/') + 1
          );
          const base64 = (await this.convertBlobToBase64(event.body)) as string;

          // Write to the File system
          const savedFile = await Filesystem.writeFile({
            path: `${Date.now()}` + name, // whatever.pdf
            data: base64,
            directory: Directory.Documents, // DOCUMENTS/whatever.pdf
          });

          const path = savedFile.uri;
          const mimeType = this.getMimeType(name);

          this.fileOpener
            .open(path, mimeType)
            .then(() => console.log('file is opened'))
            .catch((error) => console.log('Error opening file', error));

          this.myFiles.unshift({ path, mimeType });

          Preferences.set({
            key: FILE_KEY,
            value: JSON.stringify(this.myFiles),
          });
        }
      });
  }

  // Helper functions
  // Capacitor stores base64 files only
  private convertBlobToBase64 = (blob: Blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });

  private getMimeType(name: string) {
    if (name.indexOf('pdf') >= 0) {
      return 'application/pdf';
    } else if (name.indexOf('png') >= 0) {
      return 'image/png';
    } else if (name.indexOf('mp4') >= 0) {
      return 'video/mp4';
    }
  }
}
