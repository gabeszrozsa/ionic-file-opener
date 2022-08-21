# File downloader & opener

## Packages

```shell
npm install @awesome-cordova-plugins/file-opener @capacitor/filesystem @capacitor/preferences cordova-plugin-androidx-adapter cordova-plugin-file-opener2 jetifier
```

## Useful links

- [Ionic File Opener](https://ionicframework.com/docs/native/file-opener)
- [pwlin / cordova-plugin-file-opener2](https://github.com/pwlin/cordova-plugin-file-opener2)

## Troubleshooting

- [AndroidX support](https://github.com/pwlin/cordova-plugin-file-opener2/issues/256#issuecomment-657574795)
- [FileProvider not found](https://github.com/pwlin/cordova-plugin-file-opener2/issues/326)

### Permissions

AndroidManifest.xml

```xml
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

## Proxy

### proxy.conf.json

```json
{
  "/storage": {
    "target": "https://file-examples.com/storage",
    "secure": true,
    "changeOrigin": true,
    "pathRewrite": {
      "^/storage": ""
    }
  }
}
```

### ionic.config.json

```json
{
  "name": "ionic-file-opener",
  "integrations": {
    "capacitor": {}
  },
  "type": "angular",
  "proxies": [
    {
      "path": "/storage",
      "proxyUrl": "https://file-examples.com/storage"
    }
  ]
}
```

### angular.json

```json
        "serve": {
          "builder": "@angular-devkit/build-angular:dev-server",
          "options": {
            "browserTarget": "app:build",
            "proxyConfig": "proxy.conf.json"
          },
          "configurations": {
            "production": {
              "browserTarget": "app:build:production"
            },
            "ci": {
              "progress": false
            }
          }
        },
```

### Usage

```typescript
// Proxied
pdfUrl = "/storage/fe5467a6a163010b197fb20/2017/10/file-example_PDF_1MB.pdf";
videoUrl =
  "/storage/fe5467a6a163010b197fb20/2017/04/file_example_MP4_640_3MG.mp4";
imageUrl = "/storage/fe5467a6a163010b197fb20/2017/10/file_example_PNG_1MB.png";
```
