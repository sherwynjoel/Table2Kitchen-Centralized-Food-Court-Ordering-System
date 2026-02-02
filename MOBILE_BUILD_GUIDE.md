# How to Build the Table2Kitchen Mobile App (Android)

## Prerequisites
- You must have **Android Studio** installed on your computer.

## Step 1: Open the Project
1. Open your terminal in the `Table2Kitchen` folder.
2. Run the following command:
   ```bash
   npx cap open android
   ```
   *This will launch Android Studio with your project loaded.*

## Step 2: Build the APK (Installer)
1. In Android Studio, wait for the project to finish "Syncing" (look at the bottom status bar).
2. Go to the top menu bar: **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
3. Wait for the build to complete.
4. A popup will appear in the bottom right corner saying "APK(s) generated successfully".
5. Click **"locate"** in that popup.

## Step 3: Install
- Connect your phone to the PC.
- Copy the `app-debug.apk` file to your phone.
- Open it on your phone to install.

## Alternative: Run Directly
1. Connect your phone via USB (Enable USB Debugging in Developer Options).
2. In Android Studio, select your phone in the top toolbar.
3. Click the green **Play (▶)** button.
