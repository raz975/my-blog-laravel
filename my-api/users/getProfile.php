<?php
require_once "../config/init.php";

try {
    $targetId = (int)($_GET["id"] ?? 0);

    if ($targetId <= 0) {
        jsonError("Invalid user id", 400);
    }

    $stmt = $pdo->prepare("SELECT id, name, email, role, is_blocked, created_at FROM users WHERE id = ?");
    $stmt->execute([$targetId]);
    $target = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$target) {
        jsonError("User not found", 404);
    }

    $currentUserId = isset($_SESSION["user_id"]) ? (int)$_SESSION["user_id"] : 0;

    $stmt = $pdo->prepare("SELECT COUNT(*) AS cnt FROM subscriptions WHERE following_id = ?");
    $stmt->execute([$targetId]);
    $followers = (int)$stmt->fetch(PDO::FETCH_ASSOC)["cnt"];

    $stmt = $pdo->prepare("SELECT COUNT(*) AS cnt FROM subscriptions WHERE follower_id = ?");
    $stmt->execute([$targetId]);
    $following = (int)$stmt->fetch(PDO::FETCH_ASSOC)["cnt"];

    $stmt = $pdo->prepare("
        SELECT COUNT(*) AS cnt FROM post_likes pl
        JOIN posts p ON p.id = pl.post_id
        WHERE p.user_id = ?
    ");
    $stmt->execute([$targetId]);
    $likesReceived = (int)$stmt->fetch(PDO::FETCH_ASSOC)["cnt"];

    $stmt = $pdo->prepare("
        SELECT
            p.id,
            p.title,
            p.content,
            p.created_at,
            (SELECT file_name FROM post_images WHERE post_id = p.id ORDER BY id DESC LIMIT 1) AS image_file,
            (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) AS likes,
            " . ($currentUserId > 0
                ? "(SELECT COUNT(*) FROM post_likes WHERE post_id = p.id AND user_id = " . $currentUserId . ") AS liked_by_me"
                : "0 AS liked_by_me") . "
        FROM posts p
        WHERE p.user_id = ?
        ORDER BY p.id DESC
    ");
    $stmt->execute([$targetId]);
    $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($posts as &$post) {
        $post["id"] = (int)$post["id"];
        $post["image_url"] = $post["image_file"] ? "/uploads/" . $post["image_file"] : null;
        $post["likes"] = (int)$post["likes"];
        $post["liked_by_me"] = (int)$post["liked_by_me"];
        unset($post["image_file"]);
    }
    unset($post);

    $isSubscribed = false;
    if ($currentUserId > 0) {
        $stmt = $pdo->prepare("SELECT id FROM subscriptions WHERE follower_id = ? AND following_id = ?");
        $stmt->execute([$currentUserId, $targetId]);
        $isSubscribed = (bool)$stmt->fetch();
    }

    echo json_encode([
        "success" => true,
        "profile" => [
            "id" => (int)$target["id"],
            "name" => $target["name"],
            "email" => $target["email"],
            "role" => $target["role"],
            "created_at" => $target["created_at"],
            "followers" => $followers,
            "following" => $following,
            "likes_received" => $likesReceived,
            "posts" => $posts,
            "is_subscribed" => $isSubscribed
        ]
    ]);

} catch (PDOException $e) {
    error_log("getProfile.php error: " . $e->getMessage());
    jsonError("Database error occurred", 500);
}