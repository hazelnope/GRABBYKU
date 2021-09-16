<?php

$name = $wsdata['arg2'];
$user_id = $wsdata['arg3'];
$driver_id = $wsdata['arg1'];

$sql1 = "UPDATE `booking` SET `driver_id` = $driver_id WHERE `user_id` = $user_id";
$sql2 = "UPDATE `driver` SET `status` = 2 WHERE `driver_id` = $driver_id";

if($conn->query($sql1) == TRUE && $conn->query($sql2) == TRUE) {
    echo json_encode([
        "message"=> true
    ]);
} else {
    echo json_encode([
        "message"=> false
    ]);
}

$statement = "SELECT * FROM booking WHERE user_id = '$user_id'";

//$result = mysqli_query($statement); 
$data = [];

if ($result = $conn->query($statement)) {
    if ($result->num_rows == 1) {
        $row = $result->fetch_assoc();
        $data['booking_id'] =  $row['booking_id'];
        $booking_id = $row['booking_id'];
        $data['driver_id'] = $row['driver_id'];
        $driver_id = $row['driver_id'];
        $data['user_id'] = $row['user_id'];
        $user_id = $row['user_id'];
        $data['lng_user'] = $row['lng_user'];
        $lng_user = $row['lng_user'];
        $data['lat_user'] = $row['lat_user'];
        $lat_user = $row['lat_user'];
        $data['lng_des'] = $row['lng_des'];
        $lng_des = $row['lng_des'];
        $data['lat_des'] = $row['lat_des'];
        $lat_des = $row['lat_des'];
        echo json_encode($data);
        $sql = "UPDATE 'booking' SET 'driver_id' = $driver_id WHERE 'user_id' = $user_id";
        $conn->query($sql);
        if ($data['driver_id'] != NULL) {
            $sql = "UPDATE `user` SET `status` = 2 WHERE `user_id` = $user_id";
            $conn->query($sql);
        }
    } else {
        echo "there are more than one booking for this user or there is no booking match";
    }
} else {
    echo "error";
}

$sql1 = "SELECT * FROM 'driver' WHERE 'driver_id' = $driver_id";
$result1 = $conn->query($sql1);
$driver = $result1->fetch_assoc();

$sql="SELECT connection_id FROM websocket WHERE name LIKE '$ReceiverName' and id = '$ReceiverID' and is_driver = '$is_driver'";
$result = $conn->query($sql);

while ($row = $result->fetch_assoc()) {
    $connection_id = $row['connection_id'];
    foreach ($this->clients as $client) {
        if ($client->resourceId == $connection_id) {
            // send message
            $client->send(json_encode([
                "message_code"=> $protocol,
                "driver"=> $driver
            ]));
            break;
        }
    }
}

$sql = "UPDATE websocket SET on_service = 1 WHERE name = '$name' AND id = '$driver_id' AND is_driver = 1";
$conn->query($sql);

require dirname(__DIR__) . "/src/deQueue.php";
require dirname(__DIR__) . "/src/Booking.php";