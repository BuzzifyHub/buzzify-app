import UIKit
import React
import FirebaseCore
import FirebaseMessaging
import UserNotifications
import FBSDKCoreKit
import GoogleSignIn
import AVFoundation
import SafariServices
import AuthenticationServices

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate, UNUserNotificationCenterDelegate, MessagingDelegate {
  var window: UIWindow?
  var bridge: RCTBridge?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {
    // Firebase
    FirebaseApp.configure()

    // Set FCM messaging delegate
    Messaging.messaging().delegate = self

    // Set notification center delegate
    UNUserNotificationCenter.current().delegate = self

    // Note: Permission request is handled by React Native Firebase
    // Remote notification registration will be triggered by registerDeviceForRemoteMessages()

    // Facebook SDK
    ApplicationDelegate.shared.initializeSDK()

    // Audio (TTS / playback in silent)
    try? AVAudioSession.sharedInstance().setCategory(.playback, mode: .default)
    try? AVAudioSession.sharedInstance().setActive(true)

    // Create React bridge (legacy)
    let jsBundleURL: URL
  #if DEBUG
  guard let debugJSBundleURL = RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index") else {
  fatalError("❌ Could not find JS bundle URL in DEBUG mode")
  }
  jsBundleURL = debugJSBundleURL
  #else
  jsBundleURL = Bundle.main.url(forResource: "main", withExtension: "jsbundle")!
  #endif 


    let bridge = RCTBridge(bundleURL: jsBundleURL, moduleProvider: nil, launchOptions: launchOptions)
    self.bridge = bridge

    let rootView = RCTRootView(bridge: bridge!, moduleName: "Buzzify", initialProperties: nil)
    rootView.backgroundColor = UIColor.systemBackground

    window = UIWindow(frame: UIScreen.main.bounds)
    let rootViewController = UIViewController()
    rootViewController.view = rootView
    window?.rootViewController = rootViewController
    window?.makeKeyAndVisible()

    return true
  }

  // MARK: - APNS Token Registration
  func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
    // Pass APNS token to FCM
    Messaging.messaging().apnsToken = deviceToken
  }

  func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
    print("Failed to register for remote notifications: \(error.localizedDescription)")
  }

  // MARK: - MessagingDelegate
  func messaging(_ messaging: Messaging, didReceiveRegistrationToken fcmToken: String?) {
    print("FCM Registration Token: \(String(describing: fcmToken))")
    // Token is automatically handled by React Native Firebase
  }

  // MARK: - UNUserNotificationCenterDelegate
  // Handle notification when app is in foreground
  func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification, withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
    // Show notification even when app is in foreground
    completionHandler([[.banner, .badge, .sound]])
  }

  // Handle notification tap
  func userNotificationCenter(_ center: UNUserNotificationCenter, didReceive response: UNNotificationResponse, withCompletionHandler completionHandler: @escaping () -> Void) {
    completionHandler()
  }

  // Open URL handling (React + Google + Facebook)
  func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
    let handledByReact = RCTLinkingManager.application(app, open: url, options: options)
    let handledByGoogle = GIDSignIn.sharedInstance.handle(url)
    let handledByFacebook = ApplicationDelegate.shared.application(app, open: url, options: options)

    return handledByReact || handledByGoogle || handledByFacebook
  }

  // Universal links
  func application(_ application: UIApplication,
                   continue userActivity: NSUserActivity,
                   restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
    return RCTLinkingManager.application(application, continue: userActivity, restorationHandler: restorationHandler)
  }
}
