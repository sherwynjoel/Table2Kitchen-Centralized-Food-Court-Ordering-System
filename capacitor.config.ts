import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.table2kitchen.app',
    appName: 'Table2Kitchen',
    webDir: 'public',
    server: {
        url: 'http://192.168.0.103:3000',
        cleartext: true
    }
};

export default config;
