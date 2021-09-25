<?php

$sql  = "SELECT user_id FROM booking WHERE driver_id is NULL ";
$result = $conn->query($sql);
$id = [];
$i = 0;

while ($row = $result->fetch_assoc()) {
    $id[$i] = $row['user_id'];
    $sql1 = "SELECT connection_id FROM websocket WHERE id = $id[$i] AND is_driver = 0 ";
    $result1 = $conn->query($sql1);
    if($result1->num_rows == 1){
        $row1 = $result1->fetch_assoc();
        foreach ($this->clients as $client) {
            if ($client->resourceId == $row1['connection_id']) {
                $client->send(json_encode([
                    "message_code" => "your booking order",
                    "booking_order" => $i + 1
                ]));
                break;
            }
        }
        $i++;
    }
}