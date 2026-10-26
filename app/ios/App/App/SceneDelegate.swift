import UIKit
import Capacitor

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }

        window = UIWindow(windowScene: windowScene)
        window?.rootViewController = AppViewController()
        window?.makeKeyAndVisible()

        SceneDelegateProxy.shared.scene(scene, willConnectTo: session, options: connectionOptions)
    }

    // The screen stays on while the app is open: a ride, a tour or the big map can go a while
    // without a touch, and iOS would dim and lock the phone in the middle of it.
    func sceneDidBecomeActive(_ scene: UIScene) {
        UIApplication.shared.isIdleTimerDisabled = true
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        SceneDelegateProxy.shared.scene(scene, openURLContexts: URLContexts)
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        SceneDelegateProxy.shared.scene(scene, continue: userActivity)
    }
}

// The game (a city's play/ page) needs a web view that stays put under the player's fingers, so
// capacitor.config.json turns scrolling off. The other pages, the city picker and the cities' About
// pages, are pages to scroll: they get it back whenever one of them is open.
class AppViewController: CAPBridgeViewController {
    private var urlWatch: NSKeyValueObservation?

    override func capacitorDidLoad() {
        urlWatch = webView?.observe(\.url, options: [.initial, .new]) { web, _ in
            let inGame = web.url?.path.contains("/play/") ?? false
            web.scrollView.isScrollEnabled = !inGame
            web.scrollView.bounces = !inGame
        }
    }
}
