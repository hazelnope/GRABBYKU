<?php

// $routes["/backend/api/data"]["GET"] = "./data/test.php";
// $routes["/backend/api/testpost"]["POST"] = "./data/testPost.php";

$routes["/backend/api/register_user"]["POST"] = "./registerUser/register_user.php";
$routes["/backend/api/register_driver"]["POST"] = "./registerDriver/register_driver.php";

$routes["/backend/api/login_user"]["POST"] = "./login/user/login.php";
$routes["/backend/api/login_driver"]["POST"] = "./login/driver/login.php";
