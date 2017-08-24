import socketIO from 'socket.io-client';
import store from "./store"
import {
    setRoomList,
    addRoom,
    delRoom
} from "./actions/Actions";

let io = socketIO();
let socket = io.connect('https://140.123.175.95:8787');

// socket.on("setRoomList", list => {
//     if (list.length) {
//         store.dispatch(setRoomList(list));
//     }
// }).on("addRoom", room => {
//     store.dispatch(addRoom(room));
// }).on("delRoom", room => {
//     store.dispatch(delRoom(room));
// })

export default socket;