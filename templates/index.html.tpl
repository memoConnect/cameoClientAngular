<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>cameoClient</title>

    <link rel="stylesheet" href="css/bootstrap.min.css">
    <link rel="stylesheet" href="css/app.css">
    <link rel="stylesheet" href="css/font-awesome.css">

    <script data-main="base/main.js" src="vendor/requirejs/require.js"></script>
	<%= phonegapFiles %>
</head>
<body>
    <div id="cm-app">

        <div class="app-spinner">
            <i class="fa cm-rhino-positive shake-hard"></i>
        </div>

        <div cm-language-select></div>
        <div cm-notify></div>
        <div cm-spinner></div>

        <div ng-view class="view-frame cm-content"></div>
    </div>
</body>
</html>