<?php

$postData = json_decode(file_get_contents("php://input"));

$fname = $postData->fname; 
$lname = $postData->lname; 
$birth_date = $postData->birth_date; 
$age = $postData->age; 
$plate = $postData->plate;
$phone = $postData->phone; 
$id_no = $postData->id_no; 
$driver_no = $postData->driver_no; 
$win_name = $postData->win_name; 
$username = $postData->username; 
$password = $postData->password;
$imageData = $postData->image;
// file_put_contents("./registerUser/test.txt", $postData);

$sql = "INSERT INTO driver (fname, lname, birth_date, age, plate, phone, id_no, driver_no, win_name, username, password, imageData)
VALUES ('$fname','$lname','$birth_date','$age','$plate','$phone','$id_no','$driver_no','$win_name', '$username','$password', '$imageData')";

if ($conn->query($sql) === TRUE) {
    echo "New record created successfully";
} else {
    echo "Error: " . $conn->error;
}

// require dirname(__DIR__, 2) . "/testImage.php";