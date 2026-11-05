<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/svg+xml" href="/blog-icon.svg">
    <title>Blog API | Laravel</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            background-color: #0f172a;
            color: #f8fafc;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }
        .container {
            background-color: #1e293b;
            padding: 40px 50px;
            border-radius: 16px;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
            border: 1px solid #334155;
            text-align: center;
            max-width: 450px;
        }
        .logo {
            width: 80px;
            height: 80px;
            margin-bottom: 20px;
        }
        h1 {
            font-size: 22px;
            margin-bottom: 10px;
            color: #60a5fa;
            font-weight: 600;
        }
        p {
            color: #94a3b8;
            font-size: 14px;
            margin-bottom: 25px;
            line-height: 1.6;
        }
        .status {
            display: inline-flex;
            align-items: center;
            background-color: rgba(16, 185, 129, 0.1);
            color: #34d399;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 600;
            border: 1px solid rgba(52, 211, 153, 0.2);
        }
        .dot {
            width: 8px;
            height: 8px;
            background-color: #34d399;
            border-radius: 50%;
            margin-right: 8px;
            animation: blink 1.5s infinite;
        }
        @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
        }
    </style>
</head>
<body>
    <div class="container">
        <svg class="logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
            <rect width="100" height="100" rx="20" fill="#3b82f6" />
            <text x="50" y="72" font-family="Franklin Gothic Medium, Arial, sans-serif" font-size="65" font-weight="bold" fill="white" text-anchor="middle">B</text>
        </svg>
        
        <h1>Backend API is Running</h1>
        <p>This is the Laravel server for the Blog Platform.<br>Make sure your React frontend is running on port 5173.</p>
        
        <div class="status">
            <span class="dot"></span> Server is active
        </div>
    </div>
</body>
</html>