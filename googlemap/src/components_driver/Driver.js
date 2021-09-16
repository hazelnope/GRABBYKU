import React from "react";
import './Driver.css'
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Marker,
} from "react-google-maps";

import Geocode from "react-geocode";
import axios from 'axios'
import QueueDriver from "./component/QueueDriver";
import leaveQueue from "./component/LeaveQueue";
import UserInfo from "./component/userInfo";
import { socketUrl, Url } from '../LinkToBackend';
import 'react-notifications/lib/notifications.css';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import { stack as Menu } from 'react-burger-menu'
import ChatDriver from "./component/ChatDriver";
import Receipt from "./component/Receipt";
import Popup from 'reactjs-popup';
import Penalty from "./component/Penalty";
import mapStyle from "../mapStyle"
import Countdown from "react-countdown"
import getCookie from "../getCookie";
Geocode.setApiKey("AIzaSyDrjHmzaE-oExXPRlnkij2Ko3svtUwy9p4");

// const conn = new WebSocket(`${socketUrl.LinkToWebSocket}`)
// conn.onopen = function(e) {
//   console.log("Connection established!");
// }

const timeCooldown=40000;
class Driver extends React.Component {
  
  state = {
    address: '',
    city: '',
    area: '',
    state: '',
    zoom: 15,
    height: 400,
    mapPosition: {
      lat: 13.84839475068859,
      lng: 100.56908802639256,
    },
    markerPosition: {
      lat: 0,
      lng: 0,
    },
    markerDestinationPosition:{
      lat:0, 
      lng:0,
    },
    locationList:[],
    queueDriverAppear:1,
    buttonAcceptCancelAppear:1,
    driverId:null,
    userId:null,
    userFname:null,
    userLname:null,
    loadingState:0,
    disableButton:false,
    cancelState:false,
    file:null,
  }
  queueDriver =null;
  buttonAcceptCancel = null;
  buttonDone = null;
  userInfo = null;
  fetchDriverIdInterval=null;
  driverTimeOut=0;
  chatDriver=null;
  countdown = null;
  driverFname = null;
  driverLname= null;
  cancelBackground=null;
  conn = new WebSocket(`${socketUrl.LinkToWebSocket}`)
  //--------------------------------------ทำหน้าที่ในการจัดการการอัพเดทเวลามีค่าต่างๆเปลี่ยนแปลง------
  handleForUpdate(startLat,startLng,DestinationLat,DestinationLng ,queuePageStatus, idUser, userFName, userLName,picture){
    clearTimeout(this.driverTimeOut)
    console.log(startLat,startLng)
    console.log(userFName,userLName)
    this.setState({
      markerPosition: {
        lat: startLat,
        lng: startLng,
      },
      markerDestinationPosition:{
        lat: DestinationLat, 
        lng: DestinationLng,
      },
      queueDriverAppear: queuePageStatus,
      userId: idUser,
      userFname: userFName,
      userLname: userLName,
      file:picture,
    });
  
  }
  
  
  // ------------------ เช็คว่า user cancel หรือยัง ------------------
  cancelIntervalId=0;

  
  cancelCase=()=>{
    if(this.state.queueDriverAppear!==2){
      leaveQueue(this.state.driverId,this.conn);
      NotificationManager.error('คำขอบริการถูกยกเลิก','Alert',10000);
      this.setState({
        queueDriverAppear:3,
        disableButton:true,
      })
      setTimeout(()=>{
        window.location.reload()
      },5000)
    }
  }

  // ------------------ driver กด ปฏิเสธไม่รับงาน ------------------
  driverCancel = () =>{
    console.log(parseInt(this.state.driverId));
    console.log(parseInt(this.state.userId));
    leaveQueue(this.state.driverId,this.conn);
    this.setState({
        queueDriverAppear:2,
    });
    // leaveQueue(this.state.driverId);
    // document.location.reload();
    //--------------------------------------------

  }

  // ------------------ driver กด ยอมรับงาน ------------------
  driverAccept = () =>{
    this.conn.send(JSON.stringify({
      protocol: "driver-accepted", // protocol
      DriverID: this.state.driverId, 
      Name: `${this.state.userFname} ${this.state.userLname}`,
      UserID: `${this.state.userId}`,
      
  }));
  this.setState({
    buttonAcceptCancelAppear: null,
  });
  leaveQueue(this.state.driverId,this.conn);
    
  }
  
  // ------------------ นับถอยหลังกดรับงาน ------------------
  PenaltyTimeOut=()=>{
    this.driverTimeOut=setTimeout(()=>{
      this.setState({queueDriverAppear:2})
      // NotificationManager.error('ขออภัยในความไม่สะดวก','kokkak',1000);
      leaveQueue(this.state.driverId,this.conn);
    },timeCooldown)
    if(!!!this.state.buttonAcceptCancelAppear){
      clearTimeout(this.driverTimeOut);
    }
  }

  componentWillMount(){
    this.conn.onopen = function(e) {
      console.log("Connection established!");
    }
    this.conn.onmessage = function(e) {
      let Message = JSON.parse(e.data)
      console.log(Message)
      console.log('----------2');
      // console.log(Message.message_code);
    };
  }
  // ------------------ เอา driver id ไปใช้ในที่อื่นๆ ------------------
  componentDidMount(){
    // window.onbeforeunload =()=>{
    //   conn.send(JSON.stringify({
    //     protocol: "out",
    //   }))
    // }
    // console.log('ooooooo',getCookie('token'))
    //----------------------------------------------------
    axios.get( Url.LinkToBackend +"backend/api/bomb")
    this.fetchDriverIdInterval =setInterval(()=>{
    axios.post(Url.LinkToBackend+"backend/api/postdriver",{
        // JWT :`${getCookie('token')}` 
        username : this.props.username
      })
      .then((res)=>{
        //---------------------------------------------
          
          clearInterval(this.fetchDriverIdInterval);
          // console.log('[[[[[[',res.data);
          this.setState({
            driverId: parseInt(res.data[0].driver_id),
            
          })
          console.log(res.data[0].fname, res.data[0].lname)
          
          this.conn.send(JSON.stringify({
            protocol: "in", // protocol
            Name: `${res.data[0].fname} ${res.data[0].lname}`, // name
            Mode: "1",
            ID: `${res.data[0].driver_id}`,
          }));
          this.driverFname = res.data[0].fname;
          this.driverLname = res.data[0].lname;
        
        
      })
      .then(()=>{
        this.setState({
          loadingState:1,
        })
      })
      .catch(err=>{
        NotificationManager.error('ขออภัยในความไม่สะดวก','การเชื่อมต่อมีปัญหา',1000);
        
        console.log(typeof(this.state.driverId));
        
      })
    },1000)


  }
  

  render() {
        if(this.state.queueDriverAppear === 1){
          clearTimeout(this.driverTimeOut)
          clearInterval(this.cancelIntervalId);
          this.queueDriver= <QueueDriver handleForUpdate = {this.handleForUpdate.bind(this)} driverId={this.state.driverId} conn={this.conn} cancelCase={this.cancelCase}/>
          this.userInfo = null;
        }
        else if(this.state.queueDriverAppear === 2){
          clearInterval(this.cancelIntervalId);
          this.userInfo = null;
          this.queueDriver = <Penalty/>
          this.countdown = null;
          setTimeout(() => {
            this.setState({
              queueDriverAppear:1
            })
          }, 10500);
        }
        else if(this.state.queueDriverAppear===0)
        {
          this.queueDriver= null;
          clearTimeout(this.driverTimeOut)
          clearInterval(this.cancelIntervalId)
          this.PenaltyTimeOut();
          this.userInfo = <UserInfo userFname={this.state.userFname} userLname={this.state.userLname} />;
          this.countdown= <Countdown date={Date.now() + timeCooldown} renderer={({seconds, completed }) => {
            
              return (
                <span id="accept-time">
                  <b id="should-black">กรุณาตอบรับภายใน</b> &nbsp;
                  {seconds} วินาที
                </span>
              );
            
          }}> </Countdown>;
          
        }
        else if(this.state.queueDriverAppear===3){
          clearTimeout(this.driverTimeOut)
          clearInterval(this.cancelIntervalId);
          this.queueDriver=null;
          this.countdown=null;
          
        }
        if(!!this.state.buttonAcceptCancelAppear){
          
          this.buttonAcceptCancel = <div className="button-accept-cancel-done">
                                      <button className="accept-button" disabled={this.state.disableButton} onClick={this.driverAccept}> ยอมรับ </button>
                                      <button className="cancel-button" disabled={this.state.disableButton} onClick={this.driverCancel}> ปฏิเสธ </button>
                                    </div>
          this.buttonDone=null;
          this.chatDriver=null; 
        }
        else if(this.state.queueDriverAppear===3 && !!!this.state.buttonAcceptCancelAppear){
          this.chatDriver=null;
          this.buttonDone = <div className="button-accept-cancel-done">
                              <Receipt disableButton={this.state.disableButton} driverFname={this.driverFname} driverLname={this.driverLname} driverId={this.state.driverId} 
                              userFname={this.state.userFname} userLname={this.state.userLname} userId={this.state.userId} conn={this.conn}/>
                            </div>
        }
        else{
          
          this.buttonAcceptCancel=null;
          this.buttonDone = <div className="button-accept-cancel-done">
                              <Receipt disableButton={this.state.disableButton} driverFname={this.driverFname} driverLname={this.driverLname} driverId={this.state.driverId} 
                              userFname={this.state.userFname} userLname={this.state.userLname} userId={this.state.userId} conn={this.conn}/>
                            </div>
          this.chatDriver=<ChatDriver conn={this.conn} userId={this.state.userId}  userFname={this.state.userFname} userLname={this.state.userLname} file={this.state.file} cancelCase={this.cancelCase}/>
          this.countdown = null;
        }
        
        //-----------------codeสำหรับสร้าง component ทุกอย่างที่เป็นของ googlemap ต้องเขียนใน tag Googlemap------------
        const MapWithAMarker = withScriptjs(withGoogleMap(props =>
          <GoogleMap
          // ------------------ set default map KA(ค่ะ) ------------------
          defaultZoom={15}
          defaultCenter={{ lat:this.state.mapPosition.lat, lng: this.state.mapPosition.lng }}
          defaultOptions={{
            
            zoomControl:true,
            scrollwheel:true,
            streetViewControl: false,
            draggable:true,
            minZoom:15,
            // maxZoom:16,
            mapTypeControl:false,
            restriction:{
              latLngBounds:{
                north: this.state.mapPosition.lat+ 0.012,
                south: this.state.mapPosition.lat - 0.012,
                east: this.state.mapPosition.lng + 0.012,
                west: this.state.mapPosition.lng - 0.012,
              },
              strictBounds: false,
            },
            styles: mapStyle,
          }}
          
          >
        {/* ----------componentของmarkerตำแหน่งที่ต้องไปรับ(สีเขียว) ----------*/}
        <Marker
          draggable={false}
          // onDragEnd={this.onMarkerDragEnd}
          position={{ lat: this.state.markerPosition.lat, lng: this.state.markerPosition.lng }}
          icon={{
            url:"/pictures/markgreen.png",
            scaledSize:{height: 40 , width: 25},
          }}

        >
        </Marker>

        {/*--------- componentของmarkerตำแหน่งปลายทาง(สีแดง) -------*/}
        <Marker 
            icon={{
              url:"/pictures/markred.png",
              scaledSize:{height: 40 , width: 25},
            }}
            
            position={{ lat: this.state.markerDestinationPosition.lat, lng: this.state.markerDestinationPosition.lng }}
            
            >  
          </Marker>

      </GoogleMap>
    ));

    
    if (this.state.loadingState===0){
      console.log("here")
      return <img id="loading" src="../pictures/logo512.gif"/>
    }
    else{

    return (

      <section className="app-section">
        <Menu right>
          {/* <Menu customBurgerIcon={ <img src="" /> } right> */}
            <a id="home" className="menu-item" href="/"><i class="far fa-user"></i> ข้อมูลผู้ใช้</a>
            <a id="contact" className="menu-item" href="/contact"><i class="fas fa-phone"></i> ติดต่อ</a>
            <a onClick={ this.showSettings } className="menu-item--small" href=""><i class="fas fa-cog"></i> ตั้งค่า</a>
            <a id="contact" className="menu-item" id="signout" onClick={()=>{ localStorage.clear() ; window.location.reload()}}><i class="fas fa-sign-out"></i>ออกจากระบบ</a>
              
             
              
        </Menu>  
        
        <div class ="detail-map"style={{ padding: '1rem', margin: '0 auto', maxWidth: 560 , maxHeight: 900 }}>
          <div key={this.state.driverId} className="driver-detail-driv">
            {this.queueDriver }
            {/* <h1 className="head-detail">Driver</h1> */}
            <div className="detail">{this.userInfo}</div>
          </div>
          {/* <div className="pin-info"> */}
            <div className="pin-green"></div>
            <div className="pin-green-info">ตำแหน่งของลูกค้า</div>

            <div className="pin-red"></div>
            <div className="pin-red-info">ตำแหน่งปลายทาง</div>


          {/* </div> */}
         
          <MapWithAMarker
                googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyDrjHmzaE-oExXPRlnkij2Ko3svtUwy9p4&v=3.exp&libraries=geometry,drawing,places"
                loadingElement={<div style={{ height: `100%` }} />}
                containerElement={<div id="map"  />}
                mapElement={<div style={{ height: `100%` }} />}
                // key={this.state.mapPosition.lat}
              /> 
          
        </div>
        {this.alertPopup}
        {this.buttonAcceptCancel}
        {this.buttonDone}
        {this.chatDriver}
        {this.countdown}
        <NotificationContainer />
        
      </section>

    );
    }
  }
}


export default Driver;